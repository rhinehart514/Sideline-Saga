/**
 * PLAYER ENGINE INDEX
 * Unified exports for player management
 */

// Types
export * from './types';

// Player generation
export {
  // Types
  type PlayerGenerationOptions,
  type RecruitGenerationOptions,
  // Generation functions
  generatePlayer,
  generateRecruit,
} from './generate';

// Ratings calculations
export {
  // Types
  type TeamRatings,
  type PlayerComparison,
  // Overall calculation
  calculateOverall,
  // Position-specific ratings
  calculateQBRating,
  calculateRBRating,
  calculateWRRating,
  calculateOLRating,
  calculateDLRating,
  calculateLBRating,
  calculateDBRating,
  calculateKickerRating,
  // Team ratings
  calculateTeamRatings,
  // Comparison
  comparePlayers,
  // Display helpers
  getOvrColor,
  formatPlayerRating,
  getOvrTier,
  OVR_TIERS,
} from './ratings';
