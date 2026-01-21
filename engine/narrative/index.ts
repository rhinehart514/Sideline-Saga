/**
 * NARRATIVE ENGINE INDEX
 * Unified exports for local narrative generation
 */

// Template engine utilities
export {
  type GameContext,
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
  replaceTokens,
  hasUnreplacedTokens,
} from './templateEngine';

// Main generator
export {
  // Types
  type GeneratedScene,
  type GeneratedChoices,
  type GeneratedChoice,
  type GeneratedGameBlock,
  type LocalNarrativeOptions,
  // Context analysis
  determineSceneContext,
  determineHeadlineCategory,
  mapPhaseToChoiceContext,
  // Headline generation
  generateHeadlines,
  generateTickerHeadlines,
  // Scene generation
  generateScene,
  // Game block generation
  generateGameBlock,
  // Specialized generators
  generatePreseasonNarrative,
  generateGameResultNarrative,
  generateCarouselNarrative,
  generateBowlNarrative,
  generateOffseasonNarrative,
  // Main entry point
  generateLocalNarrative,
} from './generator';

// Re-export template types for convenience
export type {
  GamePhase,
  SceneContext,
  HeadlineCategory,
  ChoiceContext,
} from '../../data/templates';
