/**
 * TEAM ENGINE INDEX
 * Unified exports for team management
 */

// Types
export * from './types';

// Roster management
export {
  // Types
  type RosterLimits,
  type PositionCounts,
  type Roster,
  type RosterGenerationOptions,
  type RosterStrength,
  type RecruitingClass,
  // Constants
  ROSTER_LIMITS,
  FBS_POSITION_COUNTS,
  FCS_POSITION_COUNTS,
  NFL_POSITION_COUNTS,
  // Generation
  generateRoster,
  generateRecruitingClass,
  // Management
  addPlayerToRoster,
  removePlayerFromRoster,
  getPlayersByPosition,
  getOffensivePlayers,
  getDefensivePlayers,
  getSpecialTeamsPlayers,
  // Analysis
  analyzeRosterStrength,
  findRosterNeeds,
  // Season progression
  progressRosterYear,
  developRoster,
} from './roster';

// Depth chart management
export {
  // Types
  type DepthChartEntry,
  type DepthChart,
  type FormationConfig,
  type DepthAnalysis,
  // Constants
  OFFENSIVE_FORMATIONS,
  DEFENSIVE_FORMATIONS,
  SPECIAL_TEAMS_POSITIONS,
  // Generation
  generateDepthChart,
  // Management
  promotePlayer,
  demotePlayer,
  setStarter,
  // Queries
  getStarter,
  getAllStarters,
  getBackup,
  getPositionDepth,
  getStartingLineup,
  // Analysis
  analyzeDepth,
  findWeakDepth,
  calculateStartingLineupRating,
  // Injury management
  handleInjury,
  handleReturn,
  // Helpers
  getDepthChartSummary,
} from './depthChart';
