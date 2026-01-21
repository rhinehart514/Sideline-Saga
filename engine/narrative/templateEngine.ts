/**
 * TEMPLATE ENGINE
 * Token replacement and text generation utilities
 */

import { TemplateTokens, replaceTokens, hasUnreplacedTokens } from '../../data/templates';
import { Team, NFLTeam } from '../team/types';
import { Player } from '../player/types';
import { Roster } from '../team/roster';
import { SeededRandom } from '../../data/names';

// ============================================
// CONTEXT BUILDING
// ============================================

export interface GameContext {
  team: Team | NFLTeam;
  coach: {
    firstName: string;
    lastName: string;
    fullName: string;
  };
  season: number;
  week?: number;
  record: {
    wins: number;
    losses: number;
  };
  streak?: {
    type: 'win' | 'loss';
    count: number;
  };
  ranking?: number;
  opponent?: Team | NFLTeam;
  score?: {
    team: number;
    opponent: number;
  };
  roster?: Roster;
  featuredPlayer?: Player;
  bowl?: {
    name: string;
    city: string;
  };
  jobSecurity?: number; // 0-100
}

/**
 * Build template tokens from game context
 */
export const buildTokensFromContext = (context: GameContext): TemplateTokens => {
  const tokens: TemplateTokens = {
    TEAM: context.team.nickname,
    TEAM_FULL: `${context.team.name} ${context.team.nickname}`,
    COACH: context.coach.fullName,
    COACH_LAST: context.coach.lastName,
    RECORD: `${context.record.wins}-${context.record.losses}`,
    WINS: context.record.wins,
    LOSSES: context.record.losses,
    YEAR: context.season,
    CONFERENCE: context.team.conference,
  };

  if (context.streak) {
    tokens.STREAK = context.streak.count;
  }

  if (context.ranking) {
    tokens.RANKING = `#${context.ranking}`;
  }

  if (context.opponent) {
    tokens.OPPONENT = context.opponent.nickname;
  }

  if (context.score) {
    tokens.SCORE = `${context.score.team}-${context.score.opponent}`;
  }

  if (context.featuredPlayer) {
    tokens.PLAYER = `${context.featuredPlayer.firstName} ${context.featuredPlayer.lastName}`;
    tokens.POSITION = context.featuredPlayer.position;
  }

  if (context.bowl) {
    tokens.BOWL = context.bowl.name;
    tokens.BOWL_CITY = context.bowl.city;
  }

  return tokens;
};

// ============================================
// TEXT VARIATION
// ============================================

/**
 * Select a random variation from an array
 */
export const selectVariation = <T>(options: T[], seed?: number): T => {
  if (options.length === 0) {
    throw new Error('Cannot select from empty options array');
  }

  const index = seed !== undefined
    ? Math.abs(seed) % options.length
    : Math.floor(Math.random() * options.length);

  return options[index];
};

/**
 * Process inline variations in text: "The team {won|lost|tied} the game"
 */
export const processInlineVariations = (text: string, seed?: number): string => {
  const rng = seed !== undefined ? new SeededRandom(seed) : null;
  let variationIndex = 0;

  return text.replace(/\{([^{}]+\|[^{}]+)\}/g, (match, variations) => {
    const options = variations.split('|');
    const index = rng
      ? rng.nextInt(0, options.length - 1)
      : Math.floor(Math.random() * options.length);
    variationIndex++;
    return options[index];
  });
};

// ============================================
// CONDITIONAL TEXT
// ============================================

export interface ConditionalBlock {
  condition: (context: GameContext) => boolean;
  text: string;
}

/**
 * Select the first matching conditional text
 */
export const selectConditionalText = (
  blocks: ConditionalBlock[],
  context: GameContext,
  fallback: string = ''
): string => {
  for (const block of blocks) {
    if (block.condition(context)) {
      return block.text;
    }
  }
  return fallback;
};

// ============================================
// RECORD DESCRIPTIONS
// ============================================

/**
 * Get a description of the record (e.g., "winning record", "struggling")
 */
export const describeRecord = (wins: number, losses: number): string => {
  const total = wins + losses;
  if (total === 0) return 'early in the season';

  const winPct = wins / total;

  if (wins === total) return 'undefeated';
  if (losses === total) return 'winless';
  if (winPct >= 0.8) return 'dominant';
  if (winPct >= 0.6) return 'solid';
  if (winPct >= 0.5) return 'above .500';
  if (winPct >= 0.4) return 'below .500';
  if (winPct >= 0.2) return 'struggling';
  return 'in crisis';
};

/**
 * Get season context description
 */
export const describeSeasonContext = (
  wins: number,
  losses: number,
  week: number,
  totalWeeks: number = 12
): string => {
  const total = wins + losses;
  const remaining = totalWeeks - total;
  const winPct = total > 0 ? wins / total : 0.5;

  if (total <= 2) return 'early season';
  if (remaining <= 2) return 'season finale approaching';
  if (remaining <= 4) return 'down the stretch';
  if (winPct >= 0.75) return 'in contention';
  if (winPct <= 0.25) return 'facing a long season';
  return 'midseason';
};

// ============================================
// STREAK DESCRIPTIONS
// ============================================

/**
 * Get a description of a winning streak
 */
export const describeWinStreak = (count: number): string => {
  if (count >= 10) return 'an incredible run';
  if (count >= 7) return 'a dominant stretch';
  if (count >= 5) return 'building momentum';
  if (count >= 3) return 'on a roll';
  return 'finding a rhythm';
};

/**
 * Get a description of a losing streak
 */
export const describeLossStreak = (count: number): string => {
  if (count >= 7) return 'in complete freefall';
  if (count >= 5) return 'spiraling out of control';
  if (count >= 4) return 'in crisis mode';
  if (count >= 3) return 'struggling to find answers';
  return 'trying to right the ship';
};

// ============================================
// JOB SECURITY DESCRIPTIONS
// ============================================

/**
 * Get job security description
 */
export const describeJobSecurity = (security: number): string => {
  if (security >= 90) return 'rock solid';
  if (security >= 75) return 'secure';
  if (security >= 60) return 'stable';
  if (security >= 45) return 'in question';
  if (security >= 30) return 'on thin ice';
  if (security >= 15) return 'hanging by a thread';
  return 'all but gone';
};

/**
 * Determine if coach is on hot seat
 */
export const isOnHotSeat = (security: number): boolean => {
  return security < 40;
};

// ============================================
// OPPONENT DESCRIPTIONS
// ============================================

/**
 * Describe an opponent matchup
 */
export const describeMatchup = (
  team: Team | NFLTeam,
  opponent: Team | NFLTeam
): string => {
  const prestigeDiff = team.prestige - opponent.prestige;

  if (prestigeDiff >= 2) return 'heavy favorites against';
  if (prestigeDiff === 1) return 'favored against';
  if (prestigeDiff === 0) return 'evenly matched with';
  if (prestigeDiff === -1) return 'slight underdogs against';
  return 'facing a tough test against';
};

/**
 * Check if game is a rivalry
 */
export const isRivalry = (team: Team | NFLTeam, opponent: Team | NFLTeam): boolean => {
  if ('primaryRival' in team && team.primaryRival === opponent.id) return true;
  if ('secondaryRivals' in team && team.secondaryRivals?.includes(opponent.id)) return true;
  return false;
};

// ============================================
// COMPOSITE TEXT BUILDERS
// ============================================

/**
 * Build a season summary sentence
 */
export const buildSeasonSummary = (context: GameContext): string => {
  const { team, record, streak, ranking } = context;
  const tokens = buildTokensFromContext(context);

  let summary = `The ${tokens.TEAM} stand at ${tokens.RECORD}`;

  if (ranking) {
    summary = `#${ranking} ${tokens.TEAM} stand at ${tokens.RECORD}`;
  }

  if (streak && streak.count >= 3) {
    if (streak.type === 'win') {
      summary += `, ${describeWinStreak(streak.count)} with ${streak.count} straight wins`;
    } else {
      summary += `, ${describeLossStreak(streak.count)} after ${streak.count} straight losses`;
    }
  }

  return summary + '.';
};

/**
 * Build a game result sentence
 */
export const buildGameResult = (
  context: GameContext,
  isWin: boolean,
  wasClose: boolean
): string => {
  const { team, opponent, score } = context;
  if (!opponent || !score) return '';

  const tokens = buildTokensFromContext(context);

  if (isWin) {
    if (wasClose) {
      return selectVariation([
        `${tokens.TEAM} survived a scare, edging ${tokens.OPPONENT} ${tokens.SCORE}.`,
        `${tokens.TEAM} held on for a nail-biting ${tokens.SCORE} victory over ${tokens.OPPONENT}.`,
        `It wasn't pretty, but ${tokens.TEAM} got the win ${tokens.SCORE} over ${tokens.OPPONENT}.`,
      ]);
    }
    return selectVariation([
      `${tokens.TEAM} cruised to a ${tokens.SCORE} victory over ${tokens.OPPONENT}.`,
      `${tokens.TEAM} dominated ${tokens.OPPONENT} ${tokens.SCORE}.`,
      `${tokens.TEAM} made a statement with a ${tokens.SCORE} win over ${tokens.OPPONENT}.`,
    ]);
  } else {
    if (wasClose) {
      return selectVariation([
        `${tokens.TEAM} fell just short, losing ${tokens.SCORE} to ${tokens.OPPONENT}.`,
        `${tokens.TEAM} couldn't finish, dropping a ${tokens.SCORE} heartbreaker to ${tokens.OPPONENT}.`,
        `Agony for ${tokens.TEAM} after a ${tokens.SCORE} loss to ${tokens.OPPONENT}.`,
      ]);
    }
    return selectVariation([
      `${tokens.TEAM} was overwhelmed in a ${tokens.SCORE} loss to ${tokens.OPPONENT}.`,
      `${tokens.TEAM} had no answers in a ${tokens.SCORE} defeat to ${tokens.OPPONENT}.`,
      `${tokens.OPPONENT} dominated ${tokens.TEAM} ${tokens.SCORE}.`,
    ]);
  }
};

// ============================================
// EXPORT UTILITIES
// ============================================

export {
  replaceTokens,
  hasUnreplacedTokens,
};
