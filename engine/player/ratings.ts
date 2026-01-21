/**
 * PLAYER RATINGS CALCULATIONS
 * Overall calculation with position-specific weights
 */

import {
  Player,
  Position,
  PositionGroup,
  POSITION_TO_GROUP,
  POSITION_WEIGHTS,
  OVR_TIERS,
  getOvrTier,
  QBAttributes,
  RBAttributes,
  WRAttributes,
  TEAttributes,
  OLAttributes,
  DLAttributes,
  LBAttributes,
  DBAttributes,
  KickerAttributes,
  PunterAttributes,
} from './types';

// ============================================
// OVERALL CALCULATION
// ============================================

export const calculateOverall = (player: Player, position?: Position): number => {
  const pos = position || player.position;
  const group = POSITION_TO_GROUP[pos];
  const weights = POSITION_WEIGHTS[group];

  if (!weights) {
    console.warn(`No weights defined for position group: ${group}`);
    return 50;
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (const [attr, weight] of Object.entries(weights)) {
    let value: number | undefined;

    // Check physical attributes
    if (attr in player.physical) {
      value = player.physical[attr as keyof typeof player.physical];
    }
    // Check mental attributes
    else if (attr in player.mental) {
      value = player.mental[attr as keyof typeof player.mental];
    }
    // Check position-specific attributes
    else if (player.positionAttributes && attr in player.positionAttributes) {
      value = (player.positionAttributes as unknown as Record<string, number>)[attr];
    }

    if (value !== undefined && typeof value === 'number') {
      weightedSum += value * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) return 50;

  const rawOvr = weightedSum / totalWeight;
  return Math.max(40, Math.min(99, Math.round(rawOvr)));
};

// ============================================
// POSITION-SPECIFIC RATING FUNCTIONS
// ============================================

export const calculateQBRating = (player: Player): {
  throwing: number;
  mobility: number;
  awareness: number;
} => {
  const attrs = player.positionAttributes as QBAttributes;

  const throwing = Math.round(
    (attrs.throwPower * 0.15 +
     attrs.throwAccuracyShort * 0.25 +
     attrs.throwAccuracyMid * 0.25 +
     attrs.throwAccuracyDeep * 0.15 +
     attrs.release * 0.10 +
     attrs.throwOnRun * 0.10)
  );

  const mobility = attrs.carrying
    ? Math.round((player.physical.speed * 0.4 + player.physical.agility * 0.3 + (attrs.carrying || 50) * 0.3))
    : Math.round((player.physical.speed * 0.5 + player.physical.agility * 0.5));

  const awareness = Math.round(
    (player.mental.awareness * 0.4 + attrs.poise * 0.4 + attrs.playAction * 0.2)
  );

  return { throwing, mobility, awareness };
};

export const calculateRBRating = (player: Player): {
  rushing: number;
  receiving: number;
  blocking: number;
} => {
  const attrs = player.positionAttributes as RBAttributes;

  const rushing = Math.round(
    (player.physical.speed * 0.15 +
     attrs.carrying * 0.20 +
     attrs.breakTackle * 0.15 +
     attrs.elusiveness * 0.15 +
     attrs.ballCarrierVision * 0.20 +
     player.physical.agility * 0.15)
  );

  const receiving = Math.round(
    (attrs.catching * 0.60 + player.physical.speed * 0.20 + player.physical.agility * 0.20)
  );

  const blocking = Math.round(attrs.passBlock);

  return { rushing, receiving, blocking };
};

export const calculateWRRating = (player: Player): {
  speed: number;
  catching: number;
  routeRunning: number;
} => {
  const attrs = player.positionAttributes as WRAttributes;

  const speed = Math.round(
    (player.physical.speed * 0.6 + player.physical.acceleration * 0.4)
  );

  const catching = Math.round(
    (attrs.catching * 0.5 + attrs.catchInTraffic * 0.3 + attrs.spectacularCatch * 0.2)
  );

  const routeRunning = Math.round(
    (attrs.routeRunning * 0.4 + attrs.shortRoutes * 0.2 + attrs.mediumRoutes * 0.2 + attrs.deepRoutes * 0.2)
  );

  return { speed, catching, routeRunning };
};

export const calculateOLRating = (player: Player): {
  runBlocking: number;
  passBlocking: number;
  strength: number;
} => {
  const attrs = player.positionAttributes as OLAttributes;

  const runBlocking = Math.round(
    (attrs.runBlock * 0.4 + attrs.runBlockPower * 0.3 + attrs.runBlockFinesse * 0.3)
  );

  const passBlocking = Math.round(
    (attrs.passBlock * 0.4 + attrs.passBlockPower * 0.3 + attrs.passBlockFinesse * 0.3)
  );

  const strength = player.physical.strength;

  return { runBlocking, passBlocking, strength };
};

export const calculateDLRating = (player: Player): {
  passRush: number;
  runDefense: number;
  pursuit: number;
} => {
  const attrs = player.positionAttributes as DLAttributes;

  const passRush = Math.round(
    (attrs.powerMoves * 0.4 + attrs.finesseMoves * 0.4 + player.physical.speed * 0.2)
  );

  const runDefense = Math.round(
    (attrs.blockShedding * 0.4 + attrs.tackling * 0.3 + player.physical.strength * 0.3)
  );

  const pursuit = Math.round(attrs.pursuit);

  return { passRush, runDefense, pursuit };
};

export const calculateLBRating = (player: Player): {
  tackling: number;
  coverage: number;
  passRush: number;
} => {
  const attrs = player.positionAttributes as LBAttributes;

  const tackling = Math.round(
    (attrs.tackling * 0.5 + attrs.hitPower * 0.25 + attrs.pursuit * 0.25)
  );

  const coverage = Math.round(
    (attrs.zoneCoverage * 0.5 + attrs.manCoverage * 0.3 + player.physical.speed * 0.2)
  );

  const passRush = attrs.powerMoves
    ? Math.round((attrs.powerMoves * 0.5 + (attrs.finesseMoves || 50) * 0.5))
    : Math.round((attrs.blockShedding * 0.6 + player.physical.strength * 0.4));

  return { tackling, coverage, passRush };
};

export const calculateDBRating = (player: Player): {
  coverage: number;
  tackling: number;
  ballSkills: number;
} => {
  const attrs = player.positionAttributes as DBAttributes;

  const coverage = Math.round(
    (attrs.manCoverage * 0.4 + attrs.zoneCoverage * 0.3 + player.physical.speed * 0.3)
  );

  const tackling = Math.round(
    (attrs.tackling * 0.6 + attrs.hitPower * 0.2 + attrs.pursuit * 0.2)
  );

  const ballSkills = Math.round(
    (attrs.catching * 0.5 + attrs.playRecognition * 0.5)
  );

  return { coverage, tackling, ballSkills };
};

export const calculateKickerRating = (player: Player): {
  power: number;
  accuracy: number;
} => {
  const attrs = player.positionAttributes as KickerAttributes;

  return {
    power: attrs.kickPower,
    accuracy: attrs.kickAccuracy,
  };
};

// ============================================
// COMPOSITE TEAM RATINGS
// ============================================

export interface TeamRatings {
  offense: number;
  defense: number;
  specialTeams: number;
  overall: number;
}

export const calculateTeamRatings = (players: Player[]): TeamRatings => {
  const starters = getTopPlayersByPosition(players);

  // Offense rating (weighted by position importance)
  const qb = starters.QB?.[0];
  const rbs = starters.RB || [];
  const wrs = starters.WR || [];
  const tes = starters.TE || [];
  const ols = starters.OL || [];

  const offenseSum =
    (qb?.overall || 50) * 0.25 +
    (avgOverall(rbs) || 50) * 0.15 +
    (avgOverall(wrs) || 50) * 0.20 +
    (avgOverall(tes) || 50) * 0.10 +
    (avgOverall(ols) || 50) * 0.30;

  // Defense rating
  const dls = starters.DL || [];
  const lbs = starters.LB || [];
  const dbs = starters.DB || [];

  const defenseSum =
    (avgOverall(dls) || 50) * 0.30 +
    (avgOverall(lbs) || 50) * 0.35 +
    (avgOverall(dbs) || 50) * 0.35;

  // Special teams
  const k = starters.K?.[0];
  const p = starters.P?.[0];

  const specialTeamsSum = ((k?.overall || 50) + (p?.overall || 50)) / 2;

  // Overall team rating
  const overall = offenseSum * 0.45 + defenseSum * 0.45 + specialTeamsSum * 0.10;

  return {
    offense: Math.round(offenseSum),
    defense: Math.round(defenseSum),
    specialTeams: Math.round(specialTeamsSum),
    overall: Math.round(overall),
  };
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const avgOverall = (players: Player[]): number => {
  if (players.length === 0) return 0;
  return players.reduce((sum, p) => sum + p.overall, 0) / players.length;
};

const getTopPlayersByPosition = (players: Player[]): Record<PositionGroup, Player[]> => {
  const groups: Record<PositionGroup, Player[]> = {
    QB: [],
    RB: [],
    WR: [],
    TE: [],
    OL: [],
    DL: [],
    LB: [],
    DB: [],
    K: [],
    P: [],
  };

  for (const player of players) {
    if (player.injured) continue;
    const group = POSITION_TO_GROUP[player.position];
    groups[group].push(player);
  }

  // Sort each group by overall and take starters
  const starterCounts: Record<PositionGroup, number> = {
    QB: 1, RB: 2, WR: 4, TE: 2, OL: 5,
    DL: 4, LB: 3, DB: 4,
    K: 1, P: 1,
  };

  for (const group of Object.keys(groups) as PositionGroup[]) {
    groups[group] = groups[group]
      .sort((a, b) => b.overall - a.overall)
      .slice(0, starterCounts[group]);
  }

  return groups;
};

// ============================================
// PLAYER COMPARISON
// ============================================

export interface PlayerComparison {
  better: string[];
  worse: string[];
  similar: string[];
}

export const comparePlayers = (player1: Player, player2: Player): PlayerComparison => {
  if (POSITION_TO_GROUP[player1.position] !== POSITION_TO_GROUP[player2.position]) {
    return { better: [], worse: [], similar: [] };
  }

  const group = POSITION_TO_GROUP[player1.position];
  const weights = POSITION_WEIGHTS[group];
  const attrs = Object.keys(weights);

  const better: string[] = [];
  const worse: string[] = [];
  const similar: string[] = [];

  for (const attr of attrs) {
    const val1 = getAttributeValue(player1, attr);
    const val2 = getAttributeValue(player2, attr);

    if (val1 === undefined || val2 === undefined) continue;

    const diff = val1 - val2;
    if (diff >= 5) better.push(attr);
    else if (diff <= -5) worse.push(attr);
    else similar.push(attr);
  }

  return { better, worse, similar };
};

const getAttributeValue = (player: Player, attr: string): number | undefined => {
  if (attr in player.physical) {
    return player.physical[attr as keyof typeof player.physical];
  }
  if (attr in player.mental) {
    return player.mental[attr as keyof typeof player.mental];
  }
  if (player.positionAttributes && attr in player.positionAttributes) {
    return (player.positionAttributes as unknown as Record<string, number>)[attr];
  }
  return undefined;
};

// ============================================
// OVR DISPLAY HELPERS
// ============================================

export const getOvrColor = (ovr: number): string => {
  if (ovr >= OVR_TIERS.ELITE) return '#FFD700'; // Gold
  if (ovr >= OVR_TIERS.STARTER) return '#00FF00'; // Green
  if (ovr >= OVR_TIERS.ROTATION) return '#90EE90'; // Light green
  if (ovr >= OVR_TIERS.DEPTH) return '#FFFF00'; // Yellow
  if (ovr >= OVR_TIERS.PROJECT) return '#FFA500'; // Orange
  return '#FF6347'; // Red
};

export const formatPlayerRating = (player: Player): string => {
  const tier = getOvrTier(player.overall);
  return `${player.overall} ${tier}`;
};

// ============================================
// EXPORTS
// ============================================

export {
  getOvrTier,
  OVR_TIERS,
};
