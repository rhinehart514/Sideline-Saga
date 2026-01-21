/**
 * DEPTH CHART MANAGEMENT
 * Auto-assign starters and manage position depth
 */

import { Player, Position, PositionGroup, POSITION_TO_GROUP } from '../player/types';
import { Roster } from './roster';

// ============================================
// DEPTH CHART TYPES
// ============================================

export interface DepthChartEntry {
  position: Position;
  players: Player[]; // Ordered by depth (index 0 = starter)
}

export interface DepthChart {
  id: string;
  rosterId: string;
  teamId: string;
  season: number;
  offense: DepthChartEntry[];
  defense: DepthChartEntry[];
  specialTeams: DepthChartEntry[];
  updatedAt: number;
}

// Formation configurations
export interface FormationConfig {
  name: string;
  positions: Position[];
}

export const OFFENSIVE_FORMATIONS: Record<string, FormationConfig> = {
  standard: {
    name: 'Pro Style',
    positions: ['QB', 'RB', 'FB', 'WR', 'WR', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT'],
  },
  spread: {
    name: 'Spread',
    positions: ['QB', 'RB', 'WR', 'WR', 'WR', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT'],
  },
  proStyle: {
    name: 'Pro Style (2 RB)',
    positions: ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'TE', 'LT', 'LG', 'C', 'RG', 'RT'],
  },
};

export const DEFENSIVE_FORMATIONS: Record<string, FormationConfig> = {
  '4-3': {
    name: '4-3 Defense',
    positions: ['DE', 'DT', 'DT', 'DE', 'OLB', 'MLB', 'OLB', 'CB', 'CB', 'FS', 'SS'],
  },
  '3-4': {
    name: '3-4 Defense',
    positions: ['DE', 'NT', 'DE', 'OLB', 'ILB', 'ILB', 'OLB', 'CB', 'CB', 'FS', 'SS'],
  },
  nickel: {
    name: 'Nickel',
    positions: ['DE', 'DT', 'DT', 'DE', 'MLB', 'OLB', 'CB', 'CB', 'CB', 'FS', 'SS'],
  },
  dime: {
    name: 'Dime',
    positions: ['DE', 'DT', 'DT', 'DE', 'MLB', 'CB', 'CB', 'CB', 'CB', 'FS', 'SS'],
  },
};

export const SPECIAL_TEAMS_POSITIONS: Position[] = ['K', 'P', 'LS'];

// ============================================
// DEPTH CHART GENERATION
// ============================================

/**
 * Generate a depth chart from a roster (auto-assign starters)
 */
export const generateDepthChart = (roster: Roster): DepthChart => {
  const offense = generateOffensiveDepth(roster);
  const defense = generateDefensiveDepth(roster);
  const specialTeams = generateSpecialTeamsDepth(roster);

  return {
    id: `depth-${roster.teamId}-${roster.season}`,
    rosterId: roster.id,
    teamId: roster.teamId,
    season: roster.season,
    offense,
    defense,
    specialTeams,
    updatedAt: Date.now(),
  };
};

/**
 * Generate offensive depth chart
 */
const generateOffensiveDepth = (roster: Roster): DepthChartEntry[] => {
  const offensivePositions: Position[] = ['QB', 'RB', 'FB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT'];

  return offensivePositions.map(position => ({
    position,
    players: getPlayersForPosition(roster, position),
  }));
};

/**
 * Generate defensive depth chart
 */
const generateDefensiveDepth = (roster: Roster): DepthChartEntry[] => {
  const defensivePositions: Position[] = ['DE', 'DT', 'NT', 'OLB', 'MLB', 'ILB', 'CB', 'FS', 'SS'];

  return defensivePositions.map(position => ({
    position,
    players: getPlayersForPosition(roster, position),
  }));
};

/**
 * Generate special teams depth chart
 */
const generateSpecialTeamsDepth = (roster: Roster): DepthChartEntry[] => {
  return SPECIAL_TEAMS_POSITIONS.map(position => ({
    position,
    players: getPlayersForPosition(roster, position),
  }));
};

/**
 * Get players for a position, sorted by overall rating
 */
const getPlayersForPosition = (roster: Roster, position: Position): Player[] => {
  return roster.players
    .filter(p => p.position === position && !p.injured)
    .sort((a, b) => {
      // Primary sort: overall rating
      if (b.overall !== a.overall) return b.overall - a.overall;
      // Secondary sort: experience
      if (b.experience !== a.experience) return b.experience - a.experience;
      // Tertiary sort: potential (tiebreaker)
      return b.potential - a.potential;
    });
};

// ============================================
// DEPTH CHART MANAGEMENT
// ============================================

/**
 * Manually move a player up in the depth chart
 */
export const promotePlayer = (
  depthChart: DepthChart,
  position: Position,
  playerId: string
): DepthChart => {
  const updateEntry = (entry: DepthChartEntry): DepthChartEntry => {
    if (entry.position !== position) return entry;

    const playerIndex = entry.players.findIndex(p => p.id === playerId);
    if (playerIndex <= 0) return entry; // Already at top or not found

    const newPlayers = [...entry.players];
    [newPlayers[playerIndex - 1], newPlayers[playerIndex]] =
      [newPlayers[playerIndex], newPlayers[playerIndex - 1]];

    return { ...entry, players: newPlayers };
  };

  return {
    ...depthChart,
    offense: depthChart.offense.map(updateEntry),
    defense: depthChart.defense.map(updateEntry),
    specialTeams: depthChart.specialTeams.map(updateEntry),
    updatedAt: Date.now(),
  };
};

/**
 * Manually move a player down in the depth chart
 */
export const demotePlayer = (
  depthChart: DepthChart,
  position: Position,
  playerId: string
): DepthChart => {
  const updateEntry = (entry: DepthChartEntry): DepthChartEntry => {
    if (entry.position !== position) return entry;

    const playerIndex = entry.players.findIndex(p => p.id === playerId);
    if (playerIndex < 0 || playerIndex >= entry.players.length - 1) return entry;

    const newPlayers = [...entry.players];
    [newPlayers[playerIndex], newPlayers[playerIndex + 1]] =
      [newPlayers[playerIndex + 1], newPlayers[playerIndex]];

    return { ...entry, players: newPlayers };
  };

  return {
    ...depthChart,
    offense: depthChart.offense.map(updateEntry),
    defense: depthChart.defense.map(updateEntry),
    specialTeams: depthChart.specialTeams.map(updateEntry),
    updatedAt: Date.now(),
  };
};

/**
 * Set a specific player as the starter (move to position 0)
 */
export const setStarter = (
  depthChart: DepthChart,
  position: Position,
  playerId: string
): DepthChart => {
  const updateEntry = (entry: DepthChartEntry): DepthChartEntry => {
    if (entry.position !== position) return entry;

    const playerIndex = entry.players.findIndex(p => p.id === playerId);
    if (playerIndex <= 0) return entry; // Already starter or not found

    const player = entry.players[playerIndex];
    const newPlayers = [
      player,
      ...entry.players.slice(0, playerIndex),
      ...entry.players.slice(playerIndex + 1),
    ];

    return { ...entry, players: newPlayers };
  };

  return {
    ...depthChart,
    offense: depthChart.offense.map(updateEntry),
    defense: depthChart.defense.map(updateEntry),
    specialTeams: depthChart.specialTeams.map(updateEntry),
    updatedAt: Date.now(),
  };
};

// ============================================
// DEPTH CHART QUERIES
// ============================================

/**
 * Get the starter for a position
 */
export const getStarter = (depthChart: DepthChart, position: Position): Player | undefined => {
  const entry = [...depthChart.offense, ...depthChart.defense, ...depthChart.specialTeams]
    .find(e => e.position === position);

  return entry?.players[0];
};

/**
 * Get all starters
 */
export const getAllStarters = (depthChart: DepthChart): Player[] => {
  const allEntries = [
    ...depthChart.offense,
    ...depthChart.defense,
    ...depthChart.specialTeams,
  ];

  return allEntries
    .filter(entry => entry.players.length > 0)
    .map(entry => entry.players[0]);
};

/**
 * Get the backup for a position
 */
export const getBackup = (depthChart: DepthChart, position: Position): Player | undefined => {
  const entry = [...depthChart.offense, ...depthChart.defense, ...depthChart.specialTeams]
    .find(e => e.position === position);

  return entry?.players[1];
};

/**
 * Get depth at a position
 */
export const getPositionDepth = (depthChart: DepthChart, position: Position): Player[] => {
  const entry = [...depthChart.offense, ...depthChart.defense, ...depthChart.specialTeams]
    .find(e => e.position === position);

  return entry?.players || [];
};

/**
 * Get starting lineup for a formation
 */
export const getStartingLineup = (
  depthChart: DepthChart,
  offensiveFormation: string = 'standard',
  defensiveFormation: string = '4-3'
): { offense: Player[]; defense: Player[]; specialTeams: Player[] } => {
  const offForm = OFFENSIVE_FORMATIONS[offensiveFormation] || OFFENSIVE_FORMATIONS.standard;
  const defForm = DEFENSIVE_FORMATIONS[defensiveFormation] || DEFENSIVE_FORMATIONS['4-3'];

  const getStartersForFormation = (positions: Position[], entries: DepthChartEntry[]): Player[] => {
    const positionCounters: Record<Position, number> = {} as Record<Position, number>;

    return positions.map(pos => {
      const entry = entries.find(e => e.position === pos);
      if (!entry || entry.players.length === 0) return null;

      const index = positionCounters[pos] || 0;
      positionCounters[pos] = index + 1;

      return entry.players[index] || entry.players[0];
    }).filter((p): p is Player => p !== null);
  };

  return {
    offense: getStartersForFormation(offForm.positions, depthChart.offense),
    defense: getStartersForFormation(defForm.positions, depthChart.defense),
    specialTeams: depthChart.specialTeams
      .filter(entry => entry.players.length > 0)
      .map(entry => entry.players[0]),
  };
};

// ============================================
// DEPTH CHART ANALYSIS
// ============================================

/**
 * Analyze depth chart strength by position group
 */
export interface DepthAnalysis {
  position: Position;
  starterRating: number;
  backupRating: number;
  depth: number;
  depthQuality: 'elite' | 'good' | 'adequate' | 'thin' | 'critical';
}

export const analyzeDepth = (depthChart: DepthChart): DepthAnalysis[] => {
  const allEntries = [
    ...depthChart.offense,
    ...depthChart.defense,
    ...depthChart.specialTeams,
  ];

  return allEntries.map(entry => {
    const starterRating = entry.players[0]?.overall || 0;
    const backupRating = entry.players[1]?.overall || 0;
    const depth = entry.players.length;

    let depthQuality: DepthAnalysis['depthQuality'];
    if (depth >= 3 && backupRating >= 70) depthQuality = 'elite';
    else if (depth >= 2 && backupRating >= 60) depthQuality = 'good';
    else if (depth >= 2 && backupRating >= 50) depthQuality = 'adequate';
    else if (depth >= 1) depthQuality = 'thin';
    else depthQuality = 'critical';

    return {
      position: entry.position,
      starterRating,
      backupRating,
      depth,
      depthQuality,
    };
  });
};

/**
 * Find positions with weak depth
 */
export const findWeakDepth = (depthChart: DepthChart): Position[] => {
  const analysis = analyzeDepth(depthChart);
  return analysis
    .filter(a => a.depthQuality === 'thin' || a.depthQuality === 'critical')
    .map(a => a.position);
};

/**
 * Calculate overall starting lineup rating
 */
export const calculateStartingLineupRating = (depthChart: DepthChart): {
  offense: number;
  defense: number;
  specialTeams: number;
  overall: number;
} => {
  const avgRating = (entries: DepthChartEntry[]): number => {
    const starters = entries
      .filter(e => e.players.length > 0)
      .map(e => e.players[0].overall);

    if (starters.length === 0) return 50;
    return Math.round(starters.reduce((sum, r) => sum + r, 0) / starters.length);
  };

  const offense = avgRating(depthChart.offense);
  const defense = avgRating(depthChart.defense);
  const specialTeams = avgRating(depthChart.specialTeams);

  const overall = Math.round(offense * 0.45 + defense * 0.45 + specialTeams * 0.10);

  return { offense, defense, specialTeams, overall };
};

// ============================================
// INJURY MANAGEMENT
// ============================================

/**
 * Handle player injury - promotes backup
 */
export const handleInjury = (
  depthChart: DepthChart,
  playerId: string
): { depthChart: DepthChart; promotedPlayer: Player | undefined } => {
  let promotedPlayer: Player | undefined;

  const updateEntry = (entry: DepthChartEntry): DepthChartEntry => {
    const playerIndex = entry.players.findIndex(p => p.id === playerId);
    if (playerIndex < 0) return entry;

    // Mark player as injured
    const newPlayers = entry.players.map(p =>
      p.id === playerId ? { ...p, injured: true } : p
    );

    // If starter was injured, note the promoted player
    if (playerIndex === 0 && newPlayers.length > 1) {
      promotedPlayer = newPlayers[1];
    }

    // Remove injured player from active depth and move to end
    const injuredPlayer = newPlayers[playerIndex];
    const withoutInjured = newPlayers.filter(p => p.id !== playerId);

    return {
      ...entry,
      players: [...withoutInjured, injuredPlayer],
    };
  };

  return {
    depthChart: {
      ...depthChart,
      offense: depthChart.offense.map(updateEntry),
      defense: depthChart.defense.map(updateEntry),
      specialTeams: depthChart.specialTeams.map(updateEntry),
      updatedAt: Date.now(),
    },
    promotedPlayer,
  };
};

/**
 * Handle player return from injury
 */
export const handleReturn = (
  depthChart: DepthChart,
  playerId: string
): DepthChart => {
  const updateEntry = (entry: DepthChartEntry): DepthChartEntry => {
    const playerIndex = entry.players.findIndex(p => p.id === playerId);
    if (playerIndex < 0) return entry;

    // Mark player as healthy
    const updatedPlayers = entry.players.map(p =>
      p.id === playerId ? { ...p, injured: false } : p
    );

    // Re-sort by overall to place returning player appropriately
    const healthyPlayers = updatedPlayers.filter(p => !p.injured);
    const injuredPlayers = updatedPlayers.filter(p => p.injured);

    const sortedHealthy = healthyPlayers.sort((a, b) => b.overall - a.overall);

    return {
      ...entry,
      players: [...sortedHealthy, ...injuredPlayers],
    };
  };

  return {
    ...depthChart,
    offense: depthChart.offense.map(updateEntry),
    defense: depthChart.defense.map(updateEntry),
    specialTeams: depthChart.specialTeams.map(updateEntry),
    updatedAt: Date.now(),
  };
};

// ============================================
// EXPORT HELPERS
// ============================================

/**
 * Get a human-readable depth chart summary
 */
export const getDepthChartSummary = (depthChart: DepthChart): string => {
  const ratings = calculateStartingLineupRating(depthChart);
  const weakPositions = findWeakDepth(depthChart);

  let summary = `Team Overall: ${ratings.overall}\n`;
  summary += `Offense: ${ratings.offense} | Defense: ${ratings.defense} | Special Teams: ${ratings.specialTeams}\n`;

  if (weakPositions.length > 0) {
    summary += `Depth Concerns: ${weakPositions.join(', ')}`;
  } else {
    summary += `No major depth concerns`;
  }

  return summary;
};
