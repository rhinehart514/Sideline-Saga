/**
 * PERSISTENCE ENGINE INDEX
 * Unified exports for save/load functionality
 */

// Database operations
export {
  // Constants
  DB_NAME,
  DB_VERSION,
  STORES,
  // Types
  type StoreName,
  type SaveRecord,
  type RosterRecord,
  type PlayerRecord,
  type SettingsRecord,
  // Connection
  openDatabase,
  closeDatabase,
  // CRUD operations
  getRecord,
  getAllRecords,
  getRecordsByIndex,
  putRecord,
  putRecords,
  deleteRecord,
  deleteRecordsByIndex,
  clearStore,
  countRecords,
  // Utilities
  isIndexedDBAvailable,
  deleteDatabase,
  getStorageEstimate,
} from './db';

// Save/Load operations
export {
  // Types
  type GameSaveData,
  type SaveHeader,
  type FullSaveData,
  // ID generation
  generateSaveId,
  // Save operations
  saveGame,
  quickSave,
  // Load operations
  loadGame,
  loadGameState,
  // List and manage
  listSaves,
  deleteSave,
  renameSave,
  saveExists,
  // Export/Import
  exportSave,
  importSave,
  // Utilities
  getSavesCount,
  getMostRecentSave,
  deleteAllSaves,
} from './save';

// Migration
export {
  // Types
  type MigrationResult,
  type LegacySaveData,
  // Migration functions
  needsMigration,
  migrateToIndexedDB,
  autoMigrate,
  // Cleanup
  clearLegacyData,
  resetMigrationFlag,
  // Backup
  backupLocalStorage,
  restoreFromBackup,
} from './migrate';
