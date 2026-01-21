/**
 * MIGRATION UTILITIES
 * Migrate data from localStorage to IndexedDB
 */

import { saveGame, GameSaveData } from './save';
import { isIndexedDBAvailable, openDatabase } from './db';

// ============================================
// MIGRATION TYPES
// ============================================

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
}

export interface LegacySaveData {
  // Match the old localStorage format
  currentYear?: number;
  currentPhase?: string;
  coachName?: string;
  currentTeam?: {
    id?: string;
    name?: string;
    nickname?: string;
    level?: string;
    conference?: string;
    prestige?: number;
  };
  record?: {
    wins?: number;
    losses?: number;
    championships?: number;
    bowlWins?: number;
    playoffAppearances?: number;
  };
  careerStats?: {
    totalWins?: number;
    totalLosses?: number;
    yearsCoached?: number;
    teamsCoached?: string[];
    championships?: number;
    bowlWins?: number;
  };
  jobSecurity?: number;
  fanSupport?: number;
  teamMorale?: number;
  compressedContext?: string;
  schedule?: unknown[];
}

// ============================================
// LOCALSTORAGE KEYS
// ============================================

const LEGACY_KEYS = {
  GAME_STATE: 'sidelineSaga_gameState',
  SETTINGS: 'sidelineSaga_settings',
  SAVES: 'sidelineSaga_saves',
  MIGRATED_FLAG: 'sidelineSaga_migratedToIDB',
};

// ============================================
// MIGRATION FUNCTIONS
// ============================================

/**
 * Check if migration is needed
 */
export const needsMigration = (): boolean => {
  // Skip if already migrated
  if (localStorage.getItem(LEGACY_KEYS.MIGRATED_FLAG) === 'true') {
    return false;
  }

  // Check if there's any legacy data to migrate
  const hasGameState = localStorage.getItem(LEGACY_KEYS.GAME_STATE) !== null;
  const hasSaves = localStorage.getItem(LEGACY_KEYS.SAVES) !== null;

  return hasGameState || hasSaves;
};

/**
 * Migrate localStorage data to IndexedDB
 */
export const migrateToIndexedDB = async (): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: true,
    migratedCount: 0,
    errors: [],
  };

  // Check IndexedDB availability
  if (!isIndexedDBAvailable()) {
    result.success = false;
    result.errors.push('IndexedDB is not available in this browser');
    return result;
  }

  // Ensure database is open
  try {
    await openDatabase();
  } catch (error) {
    result.success = false;
    result.errors.push(`Failed to open database: ${error}`);
    return result;
  }

  // Migrate current game state
  try {
    const gameStateJson = localStorage.getItem(LEGACY_KEYS.GAME_STATE);
    if (gameStateJson) {
      const legacyState = JSON.parse(gameStateJson) as LegacySaveData;
      const modernState = convertLegacyToModern(legacyState);

      if (modernState) {
        const teamName = modernState.currentTeam?.nickname || 'Unknown';
        const year = modernState.currentYear || 2024;
        await saveGame(
          null,
          `Migrated Save - ${teamName} ${year}`,
          modernState
        );
        result.migratedCount++;
      }
    }
  } catch (error) {
    result.errors.push(`Failed to migrate game state: ${error}`);
  }

  // Migrate saved games list
  try {
    const savesJson = localStorage.getItem(LEGACY_KEYS.SAVES);
    if (savesJson) {
      const saves = JSON.parse(savesJson) as Array<{
        name?: string;
        data?: LegacySaveData;
        timestamp?: number;
      }>;

      for (const save of saves) {
        if (save.data) {
          const modernState = convertLegacyToModern(save.data);
          if (modernState) {
            await saveGame(
              null,
              save.name || `Legacy Save ${result.migratedCount + 1}`,
              modernState
            );
            result.migratedCount++;
          }
        }
      }
    }
  } catch (error) {
    result.errors.push(`Failed to migrate saves list: ${error}`);
  }

  // Mark migration as complete
  if (result.migratedCount > 0 || result.errors.length === 0) {
    localStorage.setItem(LEGACY_KEYS.MIGRATED_FLAG, 'true');
  }

  result.success = result.errors.length === 0;
  return result;
};

/**
 * Convert legacy save data to modern format
 */
const convertLegacyToModern = (legacy: LegacySaveData): GameSaveData | null => {
  // Validate required fields
  if (!legacy.coachName || !legacy.currentTeam) {
    return null;
  }

  return {
    currentYear: legacy.currentYear || 2024,
    currentPhase: legacy.currentPhase || 'preseason',
    coachName: legacy.coachName,
    currentTeam: {
      id: legacy.currentTeam.id || 'unknown',
      name: legacy.currentTeam.name || 'Unknown',
      nickname: legacy.currentTeam.nickname || 'Team',
      level: legacy.currentTeam.level || 'fbs-p5',
      conference: legacy.currentTeam.conference || 'Unknown',
      prestige: legacy.currentTeam.prestige || 3,
    },
    record: {
      wins: legacy.record?.wins || 0,
      losses: legacy.record?.losses || 0,
      championships: legacy.record?.championships || 0,
      bowlWins: legacy.record?.bowlWins || 0,
      playoffAppearances: legacy.record?.playoffAppearances || 0,
    },
    careerStats: {
      totalWins: legacy.careerStats?.totalWins || 0,
      totalLosses: legacy.careerStats?.totalLosses || 0,
      yearsCoached: legacy.careerStats?.yearsCoached || 0,
      teamsCoached: legacy.careerStats?.teamsCoached || [],
      championships: legacy.careerStats?.championships || 0,
      bowlWins: legacy.careerStats?.bowlWins || 0,
    },
    jobSecurity: legacy.jobSecurity ?? 50,
    fanSupport: legacy.fanSupport ?? 50,
    teamMorale: legacy.teamMorale ?? 50,
    compressedContext: legacy.compressedContext || '',
    schedule: legacy.schedule,
    seed: Date.now(),
  };
};

// ============================================
// CLEANUP FUNCTIONS
// ============================================

/**
 * Clear legacy localStorage data after successful migration
 */
export const clearLegacyData = (): void => {
  localStorage.removeItem(LEGACY_KEYS.GAME_STATE);
  localStorage.removeItem(LEGACY_KEYS.SAVES);
  // Keep settings and migration flag
};

/**
 * Reset migration flag (for testing)
 */
export const resetMigrationFlag = (): void => {
  localStorage.removeItem(LEGACY_KEYS.MIGRATED_FLAG);
};

// ============================================
// BACKUP FUNCTIONS
// ============================================

/**
 * Create a backup of localStorage data before migration
 */
export const backupLocalStorage = (): string => {
  const backup: Record<string, string | null> = {};

  for (const key of Object.values(LEGACY_KEYS)) {
    backup[key] = localStorage.getItem(key);
  }

  return JSON.stringify(backup);
};

/**
 * Restore localStorage from backup
 */
export const restoreFromBackup = (backupJson: string): void => {
  const backup = JSON.parse(backupJson) as Record<string, string | null>;

  for (const [key, value] of Object.entries(backup)) {
    if (value !== null) {
      localStorage.setItem(key, value);
    }
  }
};

// ============================================
// AUTO-MIGRATION
// ============================================

/**
 * Automatically migrate if needed (call on app startup)
 */
export const autoMigrate = async (): Promise<MigrationResult | null> => {
  if (!needsMigration()) {
    return null;
  }

  console.log('[Migration] Starting automatic migration from localStorage to IndexedDB');

  // Create backup before migration
  const backup = backupLocalStorage();
  localStorage.setItem('sidelineSaga_backup', backup);

  const result = await migrateToIndexedDB();

  if (result.success && result.migratedCount > 0) {
    console.log(`[Migration] Successfully migrated ${result.migratedCount} save(s)`);
  } else if (result.errors.length > 0) {
    console.warn('[Migration] Migration completed with errors:', result.errors);
  }

  return result;
};
