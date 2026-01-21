/**
 * NARRATIVE TEMPLATES INDEX
 * Unified template access for local narrative generation
 */

// Headlines
export {
  type HeadlineTemplate,
  type HeadlineCategory,
  allHeadlines,
  winHeadlines,
  lossHeadlines,
  jobSecurityHeadlines,
  recruitingHeadlines,
  injuryHeadlines,
  preseasonHeadlines,
  postseasonHeadlines,
  generalHeadlines,
  transferHeadlines,
  getHeadlinesByCategory,
  selectHeadline,
} from './headlines';

// Scenes
export {
  type SceneTemplate,
  type GamePhase,
  type SceneContext,
  allScenes,
  preseasonScenes,
  gameBlockScenes,
  carouselScenes,
  postseasonScenes,
  offseasonScenes,
  getScenesByPhase,
  getScenesByContext,
  selectScene,
} from './scenes';

// Choices
export {
  type ChoiceTemplate,
  type ChoiceEffects,
  type ChoiceContext,
  type ChoiceSet,
  allChoiceSets,
  gameManagementChoices,
  playerDisciplineChoices,
  mediaResponseChoices,
  recruitingChoices,
  hotSeatChoices,
  programChoices,
  getChoiceSetsByContext,
  selectChoiceSet,
  calculateChoiceImpact,
} from './choices';

// ============================================
// TEMPLATE TOKEN SYSTEM
// ============================================

export interface TemplateTokens {
  TEAM?: string;
  TEAM_FULL?: string;
  COACH?: string;
  COACH_LAST?: string;
  RECORD?: string;
  WINS?: string | number;
  LOSSES?: string | number;
  STREAK?: string | number;
  OPPONENT?: string;
  SCORE?: string;
  PLAYER?: string;
  POSITION?: string;
  RANKING?: string;
  CONFERENCE?: string;
  BOWL?: string;
  BOWL_CITY?: string;
  YEAR?: string | number;
  [key: string]: string | number | undefined;
}

/**
 * Replace tokens in a template string
 */
export const replaceTokens = (template: string, tokens: TemplateTokens): string => {
  let result = template;

  for (const [key, value] of Object.entries(tokens)) {
    if (value !== undefined) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, String(value));
    }
  }

  return result;
};

/**
 * Check if a template has unreplaced tokens
 */
export const hasUnreplacedTokens = (text: string): boolean => {
  return /\{[A-Z_]+\}/.test(text);
};

/**
 * Get list of tokens in a template
 */
export const getTemplateTokens = (template: string): string[] => {
  const matches = template.match(/\{([A-Z_]+)\}/g) || [];
  return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
};

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

import { selectHeadline } from './headlines';
import { selectScene } from './scenes';
import { selectChoiceSet } from './choices';

export interface GeneratedNarrativeBlock {
  headline: string;
  scene: {
    title: string;
    description: string;
    tone: string;
  };
  choices?: {
    situation: string;
    options: Array<{
      text: string;
      description?: string;
      riskLevel: string;
    }>;
  };
}

/**
 * Generate a complete narrative block for a game phase
 */
export const generateNarrativeBlock = (
  phase: import('./scenes').GamePhase,
  context: import('./scenes').SceneContext,
  tokens: TemplateTokens,
  includeChoices: boolean = true,
  seed?: number
): GeneratedNarrativeBlock | null => {
  // Select scene
  const scene = selectScene(phase, context, seed);
  if (!scene) return null;

  // Select appropriate headline based on context
  const headlineCategory = mapContextToHeadlineCategory(context);
  const headline = selectHeadline(headlineCategory, seed);

  // Select choices if needed
  const choiceContext = mapPhaseToChoiceContext(phase);
  const choiceSet = includeChoices && choiceContext
    ? selectChoiceSet(choiceContext, seed)
    : undefined;

  return {
    headline: headline ? replaceTokens(headline.text, tokens) : '',
    scene: {
      title: replaceTokens(scene.title, tokens),
      description: replaceTokens(scene.description, tokens),
      tone: scene.tone,
    },
    choices: choiceSet ? {
      situation: replaceTokens(choiceSet.situation, tokens),
      options: choiceSet.choices.map(c => ({
        text: replaceTokens(c.text, tokens),
        description: c.description ? replaceTokens(c.description, tokens) : undefined,
        riskLevel: c.riskLevel,
      })),
    } : undefined,
  };
};

/**
 * Map scene context to headline category
 */
const mapContextToHeadlineCategory = (
  context: import('./scenes').SceneContext
): import('./headlines').HeadlineCategory => {
  const mapping: Record<import('./scenes').SceneContext, import('./headlines').HeadlineCategory> = {
    winning: 'win_streak',
    losing: 'loss_streak',
    mixed: 'general',
    hot_seat: 'hot_seat',
    secure: 'job_security',
    new_job: 'hired',
    fired: 'fired',
    recruiting: 'recruiting',
    bowl_prep: 'bowl_selection',
    playoff_prep: 'playoff',
    championship: 'championship',
    early_season: 'general',
    late_season: 'general',
  };

  return mapping[context] || 'general';
};

/**
 * Map game phase to choice context
 */
const mapPhaseToChoiceContext = (
  phase: import('./scenes').GamePhase
): import('./choices').ChoiceContext | null => {
  const mapping: Partial<Record<import('./scenes').GamePhase, import('./choices').ChoiceContext>> = {
    game_block: 'game_management',
    carousel: 'hot_seat_response',
    offseason: 'recruiting_decision',
    preseason: 'program_direction',
  };

  return mapping[phase] || null;
};
