/**
 * ROSTER MANAGEMENT
 * Generate and manage team rosters by level
 */

import {
  Player,
  Position,
  OffensivePosition,
  DefensivePosition,
  SpecialTeamsPosition,
} from '../player/types';
import { generatePlayer, generateRecruit, PlayerGenerationOptions } from '../player/generate';
import { Team, NFLTeam, Level } from './types';
import { SeededRandom } from '../../data/names';

// ============================================
// ROSTER CONFIGURATION
// ============================================

export interface RosterLimits {
  total: number;
  scholarship?: number;
  walkOn?: number;
  practiceSquad?: number;
}

export const ROSTER_LIMITS: Record<Level, RosterLimits> = {
  'fbs-p5': { total: 85, scholarship: 85, walkOn: 30 },
  'fbs-g5': { total: 85, scholarship: 85, walkOn: 25 },
  'fcs': { total: 63, scholarship: 63, walkOn: 20 },
  'nfl': { total: 53, practiceSquad: 16 },
};

// Position counts for a typical roster
export interface PositionCounts {
  QB: number;
  RB: number;
  FB: number;
  WR: number;
  TE: number;
  LT: number;
  LG: number;
  C: number;
  RG: number;
  RT: number;
  DE: number;
  DT: number;
  NT: number;
  OLB: number;
  MLB: number;
  ILB: number;
  CB: number;
  FS: number;
  SS: number;
  K: number;
  P: number;
  LS: number;
}

export const FBS_POSITION_COUNTS: PositionCounts = {
  QB: 4,
  RB: 5,
  FB: 1,
  WR: 10,
  TE: 4,
  LT: 3,
  LG: 3,
  C: 3,
  RG: 3,
  RT: 3,
  DE: 5,
  DT: 4,
  NT: 2,
  OLB: 5,
  MLB: 4,
  ILB: 4,
  CB: 7,
  FS: 3,
  SS: 3,
  K: 2,
  P: 2,
  LS: 1,
};

export const FCS_POSITION_COUNTS: PositionCounts = {
  QB: 3,
  RB: 4,
  FB: 1,
  WR: 7,
  TE: 3,
  LT: 2,
  LG: 2,
  C: 2,
  RG: 2,
  RT: 2,
  DE: 4,
  DT: 3,
  NT: 1,
  OLB: 4,
  MLB: 3,
  ILB: 3,
  CB: 5,
  FS: 2,
  SS: 2,
  K: 1,
  P: 1,
  LS: 1,
};

export const NFL_POSITION_COUNTS: PositionCounts = {
  QB: 2,
  RB: 4,
  FB: 1,
  WR: 6,
  TE: 3,
  LT: 2,
  LG: 2,
  C: 2,
  RG: 2,
  RT: 2,
  DE: 4,
  DT: 3,
  NT: 1,
  OLB: 4,
  MLB: 2,
  ILB: 2,
  CB: 5,
  FS: 2,
  SS: 2,
  K: 1,
  P: 1,
  LS: 1,
};

// ============================================
// ROSTER INTERFACE
// ============================================

export interface Roster {
  id: string;
  teamId: string;
  season: number;
  players: Player[];
  createdAt: number;
  updatedAt: number;
}

export interface RosterGenerationOptions {
  team: Team | NFLTeam;
  level: Level;
  season: number;
  seed?: number;
}

// ============================================
// ROSTER GENERATION
// ============================================

/**
 * Generate a full roster for a team
 */
export const generateRoster = (options: RosterGenerationOptions): Roster => {
  const { team, level, season, seed } = options;
  const rng = new SeededRandom(seed || Date.now());

  const positionCounts = getPositionCounts(level);
  const players: Player[] = [];

  let playerIndex = 0;

  for (const [positionStr, count] of Object.entries(positionCounts)) {
    const position = positionStr as Position;

    for (let i = 0; i < count; i++) {
      const tier = determinePlayerTier(i, team.prestige, level, rng);
      const age = determinePlayerAge(i, level, rng);
      const playerSeed = seed !== undefined ? seed + playerIndex * 1000 : undefined;

      const player = generatePlayer({
        position,
        tier,
        age,
        year: season,
        teamId: team.id,
        region: getTeamRegion(team),
        seed: playerSeed,
      });

      players.push(player);
      playerIndex++;
    }
  }

  return {
    id: `roster-${team.id}-${season}`,
    teamId: team.id,
    season,
    players,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

/**
 * Get position counts based on level
 */
const getPositionCounts = (level: Level): PositionCounts => {
  switch (level) {
    case 'fbs-p5':
    case 'fbs-g5':
      return FBS_POSITION_COUNTS;
    case 'fcs':
      return FCS_POSITION_COUNTS;
    case 'nfl':
      return NFL_POSITION_COUNTS;
    default:
      return FBS_POSITION_COUNTS;
  }
};

/**
 * Determine player tier based on depth chart position and team prestige
 */
const determinePlayerTier = (
  depthPosition: number,
  prestige: number,
  level: Level,
  rng: SeededRandom
): 1 | 2 | 3 | 4 | 5 => {
  // NFL has higher baseline quality
  if (level === 'nfl') {
    if (depthPosition === 0) return rng.next() < 0.3 ? 5 : 4;
    return rng.next() < 0.5 ? 4 : 3;
  }

  // College - prestige affects talent distribution
  const prestigeBonus = prestige * 0.1; // 0.1 to 0.5 bonus

  if (depthPosition === 0) {
    // Starters
    const roll = rng.next() + prestigeBonus;
    if (roll > 1.2) return 5;
    if (roll > 0.9) return 4;
    if (roll > 0.6) return 3;
    return 2;
  } else if (depthPosition === 1) {
    // Backups
    const roll = rng.next() + prestigeBonus * 0.5;
    if (roll > 1.1) return 4;
    if (roll > 0.8) return 3;
    if (roll > 0.5) return 2;
    return 1;
  } else {
    // Deep depth
    const roll = rng.next() + prestigeBonus * 0.3;
    if (roll > 1.0) return 3;
    if (roll > 0.7) return 2;
    return 1;
  }
};

/**
 * Determine player age based on depth position and level
 */
const determinePlayerAge = (
  depthPosition: number,
  level: Level,
  rng: SeededRandom
): number => {
  if (level === 'nfl') {
    // NFL: 22-35 range, starters tend to be prime age
    if (depthPosition === 0) {
      return rng.nextInt(24, 30); // Prime years for starters
    }
    return rng.nextInt(22, 32);
  }

  // College: 18-22, with upperclassmen more likely to start
  if (depthPosition === 0) {
    return rng.nextInt(20, 22); // Jr/Sr starters
  } else if (depthPosition === 1) {
    return rng.nextInt(19, 21); // So/Jr backups
  }
  return rng.nextInt(18, 20); // Fr/So depth
};

/**
 * Get region from team location
 */
const getTeamRegion = (team: Team | NFLTeam): string | undefined => {
  // Handle Location object
  if (typeof team.location === 'object' && team.location !== null) {
    return team.location.region;
  }

  // Fallback for string location
  const locationStr = String(team.location).toLowerCase();

  // Southeast
  if (['alabama', 'georgia', 'florida', 'tennessee', 'south carolina',
       'north carolina', 'mississippi', 'louisiana', 'arkansas', 'kentucky'].some(s => locationStr.includes(s))) {
    return 'Southeast';
  }

  // Southwest
  if (['texas', 'arizona', 'new mexico', 'oklahoma'].some(s => locationStr.includes(s))) {
    return 'Southwest';
  }

  // Midwest
  if (['ohio', 'michigan', 'indiana', 'illinois', 'wisconsin', 'iowa',
       'minnesota', 'nebraska', 'kansas', 'missouri'].some(s => locationStr.includes(s))) {
    return 'Midwest';
  }

  // Pacific
  if (['california', 'washington', 'oregon', 'hawaii', 'nevada'].some(s => locationStr.includes(s))) {
    return 'Pacific';
  }

  // Northeast
  if (['new york', 'pennsylvania', 'new jersey', 'massachusetts', 'connecticut',
       'maine', 'new hampshire', 'vermont', 'rhode island', 'maryland'].some(s => locationStr.includes(s))) {
    return 'Northeast';
  }

  return undefined;
};

// ============================================
// ROSTER MANAGEMENT
// ============================================

/**
 * Add a player to the roster
 */
export const addPlayerToRoster = (roster: Roster, player: Player): Roster => {
  return {
    ...roster,
    players: [...roster.players, player],
    updatedAt: Date.now(),
  };
};

/**
 * Remove a player from the roster
 */
export const removePlayerFromRoster = (roster: Roster, playerId: string): Roster => {
  return {
    ...roster,
    players: roster.players.filter(p => p.id !== playerId),
    updatedAt: Date.now(),
  };
};

/**
 * Get players by position
 */
export const getPlayersByPosition = (roster: Roster, position: Position): Player[] => {
  return roster.players
    .filter(p => p.position === position)
    .sort((a, b) => b.overall - a.overall);
};

/**
 * Get all offensive players
 */
export const getOffensivePlayers = (roster: Roster): Player[] => {
  const offensivePositions: Position[] = ['QB', 'RB', 'FB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT'];
  return roster.players.filter(p => offensivePositions.includes(p.position));
};

/**
 * Get all defensive players
 */
export const getDefensivePlayers = (roster: Roster): Player[] => {
  const defensivePositions: Position[] = ['DE', 'DT', 'NT', 'OLB', 'MLB', 'ILB', 'CB', 'FS', 'SS'];
  return roster.players.filter(p => defensivePositions.includes(p.position));
};

/**
 * Get all special teams players
 */
export const getSpecialTeamsPlayers = (roster: Roster): Player[] => {
  const specialTeamsPositions: Position[] = ['K', 'P', 'LS'];
  return roster.players.filter(p => specialTeamsPositions.includes(p.position));
};

// ============================================
// ROSTER ANALYSIS
// ============================================

/**
 * Get roster strength by position group
 */
export interface RosterStrength {
  qb: number;
  rb: number;
  wr: number;
  te: number;
  ol: number;
  dl: number;
  lb: number;
  db: number;
  specialTeams: number;
  overall: number;
}

export const analyzeRosterStrength = (roster: Roster): RosterStrength => {
  const avgByPositions = (positions: Position[]): number => {
    const players = roster.players.filter(p => positions.includes(p.position));
    if (players.length === 0) return 50;
    // Weight starters more heavily (top 2-3 at each position)
    const sorted = players.sort((a, b) => b.overall - a.overall);
    const starters = sorted.slice(0, Math.min(3, sorted.length));
    return Math.round(starters.reduce((sum, p) => sum + p.overall, 0) / starters.length);
  };

  const qb = avgByPositions(['QB']);
  const rb = avgByPositions(['RB', 'FB']);
  const wr = avgByPositions(['WR']);
  const te = avgByPositions(['TE']);
  const ol = avgByPositions(['LT', 'LG', 'C', 'RG', 'RT']);
  const dl = avgByPositions(['DE', 'DT', 'NT']);
  const lb = avgByPositions(['OLB', 'MLB', 'ILB']);
  const db = avgByPositions(['CB', 'FS', 'SS']);
  const specialTeams = avgByPositions(['K', 'P']);

  // Overall weighted by importance
  const overall = Math.round(
    qb * 0.15 +
    rb * 0.10 +
    wr * 0.12 +
    te * 0.05 +
    ol * 0.15 +
    dl * 0.12 +
    lb * 0.12 +
    db * 0.12 +
    specialTeams * 0.07
  );

  return { qb, rb, wr, te, ol, dl, lb, db, specialTeams, overall };
};

/**
 * Find roster needs (weak positions)
 */
export const findRosterNeeds = (roster: Roster, threshold: number = 70): Position[] => {
  const needs: Position[] = [];
  const positionGroups: Position[][] = [
    ['QB'],
    ['RB'],
    ['WR'],
    ['TE'],
    ['LT', 'LG', 'C', 'RG', 'RT'],
    ['DE', 'DT'],
    ['OLB', 'MLB', 'ILB'],
    ['CB', 'FS', 'SS'],
  ];

  for (const group of positionGroups) {
    const players = roster.players.filter(p => group.includes(p.position));
    if (players.length === 0) {
      needs.push(group[0]);
      continue;
    }

    const topPlayer = players.reduce((best, p) => p.overall > best.overall ? p : best);
    if (topPlayer.overall < threshold) {
      needs.push(topPlayer.position);
    }
  }

  return needs;
};

// ============================================
// RECRUITING CLASS
// ============================================

export interface RecruitingClass {
  season: number;
  teamId: string;
  recruits: Player[];
  ranking?: number;
  averageRating: number;
}

/**
 * Generate a recruiting class for a team
 */
export const generateRecruitingClass = (
  team: Team,
  level: Level,
  season: number,
  classSize: number = 25,
  seed?: number
): RecruitingClass => {
  const rng = new SeededRandom(seed || Date.now());
  const recruits: Player[] = [];

  // Distribute recruits across positions
  const positionDistribution: [Position, number][] = [
    ['QB', 1],
    ['RB', 2],
    ['WR', 4],
    ['TE', 1],
    ['LT', 1], ['LG', 1], ['C', 1], ['RG', 1], ['RT', 1],
    ['DE', 2],
    ['DT', 2],
    ['OLB', 2],
    ['MLB', 1],
    ['ILB', 1],
    ['CB', 2],
    ['FS', 1],
    ['SS', 1],
  ];

  let recruitIndex = 0;

  for (const [position, count] of positionDistribution) {
    if (recruitIndex >= classSize) break;

    const actualCount = Math.min(count, classSize - recruitIndex);
    for (let i = 0; i < actualCount; i++) {
      const starRating = determineRecruitStarRating(team.prestige, rng);
      const recruitSeed = seed !== undefined ? seed + recruitIndex * 500 : undefined;

      const recruit = generateRecruit({
        position,
        starRating,
        year: season,
        teamId: team.id,
        region: getTeamRegion(team),
        seed: recruitSeed,
      });

      recruits.push(recruit);
      recruitIndex++;
    }
  }

  const averageRating = recruits.reduce((sum, r) => sum + r.overall, 0) / recruits.length;

  return {
    season,
    teamId: team.id,
    recruits,
    averageRating: Math.round(averageRating * 10) / 10,
  };
};

/**
 * Determine recruit star rating based on team prestige
 */
const determineRecruitStarRating = (
  prestige: number,
  rng: SeededRandom
): 1 | 2 | 3 | 4 | 5 => {
  const roll = rng.next();
  const prestigeBonus = prestige * 0.08; // 0.08 to 0.4 bonus
  const adjustedRoll = roll + prestigeBonus;

  // Distribution: 5★: 1%, 4★: 10%, 3★: 30%, 2★: 40%, 1★: 19%
  if (adjustedRoll > 1.35) return 5; // Only top prestige teams reliably get 5-stars
  if (adjustedRoll > 1.10) return 4;
  if (adjustedRoll > 0.70) return 3;
  if (adjustedRoll > 0.30) return 2;
  return 1;
};

// ============================================
// SEASON PROGRESSION
// ============================================

/**
 * Age roster by one year (for offseason)
 */
export const progressRosterYear = (
  roster: Roster,
  level: Level
): { roster: Roster; graduated: Player[]; declaredForDraft: Player[] } => {
  const graduated: Player[] = [];
  const declaredForDraft: Player[] = [];
  const remainingPlayers: Player[] = [];

  for (const player of roster.players) {
    const newAge = player.age + 1;

    if (level === 'nfl') {
      // NFL: retirement based on age
      if (newAge > 38 || (newAge > 32 && Math.random() < 0.2)) {
        graduated.push(player); // "retired"
      } else {
        remainingPlayers.push({ ...player, age: newAge, experience: player.experience + 1 });
      }
    } else {
      // College: graduation and early declaration
      if (newAge > 22) {
        graduated.push(player);
      } else if (newAge >= 21 && player.overall >= 80 && Math.random() < 0.3) {
        // Early declaration for high-rated juniors
        declaredForDraft.push(player);
      } else {
        remainingPlayers.push({ ...player, age: newAge, experience: player.experience + 1 });
      }
    }
  }

  return {
    roster: {
      ...roster,
      players: remainingPlayers,
      season: roster.season + 1,
      updatedAt: Date.now(),
    },
    graduated,
    declaredForDraft,
  };
};

/**
 * Apply development to all players in roster
 */
export const developRoster = (roster: Roster): Roster => {
  const developedPlayers = roster.players.map(player => {
    const developmentGain = calculateDevelopmentGain(player);
    const newOverall = Math.min(99, player.overall + developmentGain);

    return {
      ...player,
      overall: newOverall,
    };
  });

  return {
    ...roster,
    players: developedPlayers,
    updatedAt: Date.now(),
  };
};

/**
 * Calculate development gain for a player
 */
const calculateDevelopmentGain = (player: Player): number => {
  const potentialRoom = player.potential - player.overall;
  if (potentialRoom <= 0) return 0;

  // Development rate based on trait
  const rateMultiplier = {
    slow: 0.5,
    normal: 1.0,
    star: 1.5,
    superstar: 2.0,
  }[player.development];

  // Younger players develop faster
  const ageMultiplier = player.age <= 20 ? 1.2 : player.age <= 22 ? 1.0 : 0.7;

  // Base development: 1-4 points per year
  const baseDev = Math.random() * 3 + 1;

  return Math.min(
    potentialRoom,
    Math.round(baseDev * rateMultiplier * ageMultiplier)
  );
};
