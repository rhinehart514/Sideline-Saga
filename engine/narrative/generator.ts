/**
 * LOCAL NARRATIVE GENERATOR
 * Generate complete narrative content without AI dependency
 */

import {
  selectHeadline,
  selectScene,
  selectChoiceSet,
  replaceTokens,
  GamePhase,
  SceneContext,
  HeadlineCategory,
  ChoiceContext,
  HeadlineTemplate,
  SceneTemplate,
  ChoiceSet,
  ChoiceTemplate,
} from '../../data/templates';
import {
  GameContext,
  buildTokensFromContext,
  describeRecord,
  describeWinStreak,
  describeLossStreak,
  describeJobSecurity,
  isOnHotSeat,
  buildSeasonSummary,
  buildGameResult,
  selectVariation,
  processInlineVariations,
} from './templateEngine';
import { Team, NFLTeam } from '../team/types';
import { Player } from '../player/types';
import { SeededRandom } from '../../data/names';

// ============================================
// GENERATED CONTENT TYPES
// ============================================

export interface GeneratedScene {
  title: string;
  description: string;
  tone: 'triumphant' | 'tense' | 'hopeful' | 'worried' | 'neutral';
  headlines: string[];
  choices?: GeneratedChoices;
}

export interface GeneratedChoices {
  situation: string;
  options: GeneratedChoice[];
}

export interface GeneratedChoice {
  id: string;
  text: string;
  description: string;
  riskLevel: 'safe' | 'moderate' | 'risky';
  effects: {
    security?: number;
    teamMorale?: number;
    recruiting?: number;
    development?: number;
    mediaPerception?: number;
    fanSupport?: number;
  };
}

export interface GeneratedGameBlock {
  phase: GamePhase;
  scene: GeneratedScene;
  tickerHeadlines: string[];
  breakingNews?: string;
}

// ============================================
// CONTEXT ANALYSIS
// ============================================

/**
 * Determine scene context from game state
 */
export const determineSceneContext = (context: GameContext): SceneContext => {
  const { record, streak, jobSecurity } = context;
  const winPct = record.wins + record.losses > 0
    ? record.wins / (record.wins + record.losses)
    : 0.5;

  // Hot seat takes precedence
  if (jobSecurity !== undefined && jobSecurity < 30) {
    return 'hot_seat';
  }

  // Check streaks
  if (streak) {
    if (streak.type === 'win' && streak.count >= 3) return 'winning';
    if (streak.type === 'loss' && streak.count >= 3) return 'losing';
  }

  // Check overall record
  if (winPct >= 0.7) return 'winning';
  if (winPct <= 0.3) return 'losing';

  return 'mixed';
};

/**
 * Determine appropriate headline category
 */
export const determineHeadlineCategory = (
  context: GameContext,
  gameResult?: 'win' | 'loss',
  wasUpset?: boolean,
  wasBlowout?: boolean
): HeadlineCategory => {
  const { streak, jobSecurity } = context;

  // Game result headlines
  if (gameResult) {
    if (gameResult === 'win') {
      if (wasUpset) return 'win_upset';
      if (wasBlowout) return 'win_blowout';
      if (streak?.type === 'win' && streak.count >= 3) return 'win_streak';
      return 'win_close';
    } else {
      if (wasUpset) return 'loss_upset';
      if (wasBlowout) return 'loss_blowout';
      if (streak?.type === 'loss' && streak.count >= 3) return 'loss_streak';
      return 'loss_close';
    }
  }

  // Job security headlines
  if (jobSecurity !== undefined) {
    if (jobSecurity < 20) return 'fired';
    if (jobSecurity < 40) return 'hot_seat';
    if (jobSecurity > 80) return 'job_security';
  }

  return 'general';
};

/**
 * Map phase to choice context
 */
export const mapPhaseToChoiceContext = (phase: GamePhase): ChoiceContext | null => {
  const mapping: Partial<Record<GamePhase, ChoiceContext>> = {
    game_block: 'game_management',
    carousel: 'hot_seat_response',
    offseason: 'recruiting_decision',
    preseason: 'program_direction',
  };
  return mapping[phase] || null;
};

// ============================================
// HEADLINE GENERATION
// ============================================

/**
 * Generate multiple unique headlines
 */
export const generateHeadlines = (
  category: HeadlineCategory,
  context: GameContext,
  count: number = 3,
  baseSeed?: number
): string[] => {
  const tokens = buildTokensFromContext(context);
  const headlines: string[] = [];
  const usedIds = new Set<string>();

  for (let i = 0; i < count * 2 && headlines.length < count; i++) {
    const seed = baseSeed !== undefined ? baseSeed + i * 100 : undefined;
    const headline = selectHeadline(category, seed);

    if (headline && !usedIds.has(headline.id)) {
      usedIds.add(headline.id);
      headlines.push(replaceTokens(headline.text, tokens));
    }
  }

  // Fallback to general headlines if we don't have enough
  if (headlines.length < count) {
    for (let i = 0; headlines.length < count; i++) {
      const seed = baseSeed !== undefined ? baseSeed + 1000 + i * 50 : undefined;
      const headline = selectHeadline('general', seed);
      if (headline && !usedIds.has(headline.id)) {
        usedIds.add(headline.id);
        headlines.push(replaceTokens(headline.text, tokens));
      }
      if (i > 10) break; // Safety limit
    }
  }

  return headlines;
};

/**
 * Generate ticker headlines (diverse categories)
 */
export const generateTickerHeadlines = (
  context: GameContext,
  count: number = 5,
  seed?: number
): string[] => {
  const categories: HeadlineCategory[] = [
    'general', 'recruiting', 'preseason', 'playoff', 'general'
  ];

  const headlines: string[] = [];
  const tokens = buildTokensFromContext(context);

  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length];
    const headlineSeed = seed !== undefined ? seed + i * 200 : undefined;
    const headline = selectHeadline(category, headlineSeed);

    if (headline) {
      headlines.push(replaceTokens(headline.text, tokens));
    }
  }

  return headlines;
};

// ============================================
// SCENE GENERATION
// ============================================

/**
 * Generate a complete scene
 */
export const generateScene = (
  phase: GamePhase,
  context: GameContext,
  includeChoices: boolean = true,
  seed?: number
): GeneratedScene => {
  const sceneContext = determineSceneContext(context);
  const tokens = buildTokensFromContext(context);

  // Select scene template
  const sceneTemplate = selectScene(phase, sceneContext, seed);

  // Generate headlines for the scene
  const headlineCategory = determineHeadlineCategory(context);
  const headlines = generateHeadlines(headlineCategory, context, 3, seed);

  // Build scene
  const scene: GeneratedScene = {
    title: sceneTemplate
      ? replaceTokens(sceneTemplate.title, tokens)
      : generateFallbackTitle(phase, sceneContext),
    description: sceneTemplate
      ? processInlineVariations(replaceTokens(sceneTemplate.description, tokens), seed)
      : generateFallbackDescription(phase, context),
    tone: sceneTemplate?.tone || 'neutral',
    headlines,
  };

  // Add choices if requested
  if (includeChoices) {
    const choiceContext = mapPhaseToChoiceContext(phase);
    if (choiceContext) {
      const choiceSet = selectChoiceSet(choiceContext, seed);
      if (choiceSet) {
        scene.choices = {
          situation: replaceTokens(choiceSet.situation, tokens),
          options: choiceSet.choices.map(c => ({
            id: c.id,
            text: replaceTokens(c.text, tokens),
            description: c.description ? replaceTokens(c.description, tokens) : '',
            riskLevel: c.riskLevel,
            effects: c.effects,
          })),
        };
      }
    }
  }

  return scene;
};

/**
 * Generate fallback title when no template matches
 */
const generateFallbackTitle = (phase: GamePhase, context: SceneContext): string => {
  const titles: Record<GamePhase, string> = {
    preseason: 'Fall Camp',
    game_block: 'Game Week',
    midseason: 'Midseason Review',
    postseason: 'Postseason',
    bowl: 'Bowl Season',
    playoff: 'Playoff Push',
    offseason: 'Offseason',
    carousel: 'Coaching Carousel',
  };
  return titles[phase] || 'The Journey Continues';
};

/**
 * Generate fallback description when no template matches
 */
const generateFallbackDescription = (phase: GamePhase, context: GameContext): string => {
  const tokens = buildTokensFromContext(context);
  const summary = buildSeasonSummary(context);

  const phaseDescriptions: Record<GamePhase, string> = {
    preseason: `A new season begins for the ${tokens.TEAM}. The work done this summer will determine the fate of the fall.`,
    game_block: `${summary} Each game brings new challenges and opportunities.`,
    midseason: `${summary} The season has reached its midpoint. What happens next is still unwritten.`,
    postseason: `${summary} The regular season is over. Now comes the reward - or the reckoning.`,
    bowl: `Bowl season arrives. A chance to end the year on a high note.`,
    playoff: `The stakes have never been higher. Win and advance. Lose and go home.`,
    offseason: `The season is over, but the work never stops. Next year's team is being built right now.`,
    carousel: `Change is in the air. Coaching decisions will shape the program's future.`,
  };

  return phaseDescriptions[phase] || summary;
};

// ============================================
// GAME BLOCK GENERATION
// ============================================

/**
 * Generate a complete game block narrative
 */
export const generateGameBlock = (
  phase: GamePhase,
  context: GameContext,
  seed?: number
): GeneratedGameBlock => {
  // Generate main scene
  const scene = generateScene(phase, context, true, seed);

  // Generate ticker headlines
  const tickerHeadlines = generateTickerHeadlines(context, 5, seed);

  // Potentially generate breaking news
  let breakingNews: string | undefined;
  if (context.jobSecurity !== undefined && context.jobSecurity < 25) {
    const newsHeadline = selectHeadline('hot_seat', seed);
    if (newsHeadline) {
      breakingNews = replaceTokens(newsHeadline.text, buildTokensFromContext(context));
    }
  }

  return {
    phase,
    scene,
    tickerHeadlines,
    breakingNews,
  };
};

// ============================================
// SPECIALIZED GENERATORS
// ============================================

/**
 * Generate preseason narrative
 */
export const generatePreseasonNarrative = (
  context: GameContext,
  seed?: number
): GeneratedGameBlock => {
  // Adjust context for preseason
  const preseasonContext: GameContext = {
    ...context,
    record: { wins: 0, losses: 0 },
    streak: undefined,
  };

  return generateGameBlock('preseason', preseasonContext, seed);
};

/**
 * Generate game result narrative
 */
export const generateGameResultNarrative = (
  context: GameContext,
  isWin: boolean,
  score: { team: number; opponent: number },
  opponent: Team | NFLTeam,
  seed?: number
): GeneratedGameBlock => {
  const wasBlowout = Math.abs(score.team - score.opponent) >= 21;
  const wasClose = Math.abs(score.team - score.opponent) <= 7;
  const wasUpset = (!isWin && context.ranking && context.ranking <= 10) ||
                   (isWin && opponent.prestige - context.team.prestige >= 2);

  const gameContext: GameContext = {
    ...context,
    opponent,
    score,
  };

  const headlineCategory = determineHeadlineCategory(
    gameContext,
    isWin ? 'win' : 'loss',
    wasUpset,
    wasBlowout
  );

  const tokens = buildTokensFromContext(gameContext);
  const headlines = generateHeadlines(headlineCategory, gameContext, 3, seed);

  // Generate game-specific scene
  const sceneContext: SceneContext = isWin ? 'winning' : 'losing';
  const scene = generateScene('game_block', gameContext, true, seed);

  // Add game result to description
  const gameResultText = buildGameResult(gameContext, isWin, wasClose);
  scene.description = gameResultText + '\n\n' + scene.description;
  scene.headlines = headlines;

  return {
    phase: 'game_block',
    scene,
    tickerHeadlines: generateTickerHeadlines(gameContext, 5, seed),
    breakingNews: wasUpset ? headlines[0] : undefined,
  };
};

/**
 * Generate carousel (coaching change) narrative
 */
export const generateCarouselNarrative = (
  context: GameContext,
  isFired: boolean = false,
  seed?: number
): GeneratedGameBlock => {
  const carouselContext: GameContext = {
    ...context,
    jobSecurity: isFired ? 0 : context.jobSecurity,
  };

  const sceneContext: SceneContext = isFired ? 'fired' : 'hot_seat';
  const scene = generateScene('carousel', carouselContext, !isFired, seed);

  const headlineCategory: HeadlineCategory = isFired ? 'fired' : 'hot_seat';
  const headlines = generateHeadlines(headlineCategory, carouselContext, 3, seed);
  scene.headlines = headlines;

  return {
    phase: 'carousel',
    scene,
    tickerHeadlines: headlines,
    breakingNews: isFired ? headlines[0] : undefined,
  };
};

/**
 * Generate bowl/postseason narrative
 */
export const generateBowlNarrative = (
  context: GameContext,
  bowlName: string,
  bowlCity: string,
  opponent: Team | NFLTeam,
  seed?: number
): GeneratedGameBlock => {
  const bowlContext: GameContext = {
    ...context,
    bowl: { name: bowlName, city: bowlCity },
    opponent,
  };

  const scene = generateScene('bowl', bowlContext, true, seed);
  const headlines = generateHeadlines('bowl_selection', bowlContext, 3, seed);
  scene.headlines = headlines;

  return {
    phase: 'bowl',
    scene,
    tickerHeadlines: generateTickerHeadlines(bowlContext, 5, seed),
  };
};

/**
 * Generate offseason/recruiting narrative
 */
export const generateOffseasonNarrative = (
  context: GameContext,
  seed?: number
): GeneratedGameBlock => {
  const scene = generateScene('offseason', context, true, seed);
  const headlines = generateHeadlines('recruiting', context, 3, seed);
  scene.headlines = headlines;

  return {
    phase: 'offseason',
    scene,
    tickerHeadlines: generateTickerHeadlines(context, 5, seed),
  };
};

// ============================================
// MAIN ENTRY POINT
// ============================================

export interface LocalNarrativeOptions {
  phase: GamePhase;
  context: GameContext;
  gameResult?: {
    isWin: boolean;
    score: { team: number; opponent: number };
    opponent: Team | NFLTeam;
  };
  bowlInfo?: {
    name: string;
    city: string;
    opponent: Team | NFLTeam;
  };
  isFired?: boolean;
  seed?: number;
}

/**
 * Main entry point for local narrative generation
 */
export const generateLocalNarrative = (options: LocalNarrativeOptions): GeneratedGameBlock => {
  const { phase, context, gameResult, bowlInfo, isFired, seed } = options;

  // Use specialized generators for specific scenarios
  if (phase === 'preseason') {
    return generatePreseasonNarrative(context, seed);
  }

  if (phase === 'carousel') {
    return generateCarouselNarrative(context, isFired, seed);
  }

  if (phase === 'bowl' && bowlInfo) {
    return generateBowlNarrative(
      context,
      bowlInfo.name,
      bowlInfo.city,
      bowlInfo.opponent,
      seed
    );
  }

  if (gameResult) {
    return generateGameResultNarrative(
      context,
      gameResult.isWin,
      gameResult.score,
      gameResult.opponent,
      seed
    );
  }

  if (phase === 'offseason') {
    return generateOffseasonNarrative(context, seed);
  }

  // Default generation
  return generateGameBlock(phase, context, seed);
};
