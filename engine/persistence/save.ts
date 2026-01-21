/**
 * SAVE/LOAD OPERATIONS
 * High-level game save management
 */

import {
  STORES,
  SaveRecord,
  RosterRecord,
  PlayerRecord,
  getRecord,
  getAllRecords,
  getRecordsByIndex,
  putRecord,
  putRecords,
  deleteRecord,
  deleteRecordsByIndex,
  openDatabase,
} from './db';
import { Roster } from '../team/roster';
import { Player } from '../player/types';

// ============================================
// SAVE TYPES
// ============================================

export interface GameSaveData {
  // Core game state (matches existing types.ts GameState)
  currentYear: number;
  currentPhase: string;
  coachName: string;
  currentTeam: {
    id: string;
    name: string;
    nickname: string;
    level: string;
    conference: string;
    prestige: number;
  };
  record: {
    wins: number;
    losses: number;
    championships: number;
    bowlWins: number;
    playoffAppearances: number;
  };
  careerStats: {
    totalWins: number;
    totalLosses: number;
    yearsCoached: number;
    teamsCoached: string[];
    championships: number;
    bowlWins: number;
  };
  jobSecurity: number;
  fanSupport: number;
  teamMorale: number;
  compressedContext: string;
  schedule?: unknown[];
  seed?: number;
}

export interface SaveHeader {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  coachName: string;
  teamId: string;
  teamName: string;
  season: number;
  record: { wins: number; losses: number };
  level: string;
}

export interface FullSaveData {
  header: SaveHeader;
  gameState: GameSaveData;
  rosters?: Map<string, Roster>;
}

// ============================================
// SAVE ID GENERATION
// ============================================

/**
 * Generate a unique save ID
 */
export const generateSaveId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `save_${timestamp}_${random}`;
};

// ============================================
// SAVE OPERATIONS
// ============================================

/**
 * Save a game to IndexedDB
 */
export const saveGame = async (
  saveId: string | null,
  saveName: string,
  gameState: GameSaveData,
  rosters?: Map<string, Roster>
): Promise<string> => {
  const id = saveId || generateSaveId();
  const now = Date.now();

  // Create save record
  const saveRecord: SaveRecord = {
    id,
    name: saveName,
    createdAt: saveId ? (await getRecord<SaveRecord>(STORES.SAVES, saveId))?.createdAt || now : now,
    updatedAt: now,
    gameState: JSON.stringify(gameState),
    metadata: {
      coachName: gameState.coachName,
      teamId: gameState.currentTeam.id,
      teamName: `${gameState.currentTeam.name} ${gameState.currentTeam.nickname}`,
      season: gameState.currentYear,
      record: {
        wins: gameState.record.wins,
        losses: gameState.record.losses,
      },
      level: gameState.currentTeam.level,
    },
  };

  // Save the main record
  await putRecord(STORES.SAVES, saveRecord);

  // Save rosters if provided
  if (rosters && rosters.size > 0) {
    // Delete old rosters for this save
    await deleteRecordsByIndex(STORES.ROSTERS, 'saveId', id);
    await deleteRecordsByIndex(STORES.PLAYERS, 'saveId', id);

    // Save new rosters and players
    const rosterRecords: RosterRecord[] = [];
    const playerRecords: PlayerRecord[] = [];

    for (const [teamId, roster] of rosters) {
      const rosterRecord: RosterRecord = {
        id: `${id}_roster_${teamId}_${roster.season}`,
        saveId: id,
        teamId,
        season: roster.season,
        players: roster.players.map(p => p.id),
        createdAt: roster.createdAt,
        updatedAt: now,
      };
      rosterRecords.push(rosterRecord);

      // Save individual players
      for (const player of roster.players) {
        playerRecords.push({
          id: `${id}_player_${player.id}`,
          saveId: id,
          data: JSON.stringify(player),
        });
      }
    }

    await putRecords(STORES.ROSTERS, rosterRecords);
    await putRecords(STORES.PLAYERS, playerRecords);
  }

  return id;
};

/**
 * Quick save (auto-save to last used slot)
 */
export const quickSave = async (
  gameState: GameSaveData,
  rosters?: Map<string, Roster>
): Promise<string> => {
  // Try to find most recent save to overwrite
  const saves = await listSaves();
  const autoSave = saves.find(s => s.name.startsWith('Auto Save'));

  const saveName = `Auto Save - ${gameState.currentTeam.nickname} ${gameState.currentYear}`;

  return saveGame(
    autoSave?.id || null,
    saveName,
    gameState,
    rosters
  );
};

// ============================================
// LOAD OPERATIONS
// ============================================

/**
 * Load a game from IndexedDB
 */
export const loadGame = async (saveId: string): Promise<FullSaveData | null> => {
  const saveRecord = await getRecord<SaveRecord>(STORES.SAVES, saveId);

  if (!saveRecord) {
    return null;
  }

  const gameState: GameSaveData = JSON.parse(saveRecord.gameState);

  const header: SaveHeader = {
    id: saveRecord.id,
    name: saveRecord.name,
    createdAt: saveRecord.createdAt,
    updatedAt: saveRecord.updatedAt,
    coachName: saveRecord.metadata.coachName,
    teamId: saveRecord.metadata.teamId,
    teamName: saveRecord.metadata.teamName,
    season: saveRecord.metadata.season,
    record: saveRecord.metadata.record,
    level: saveRecord.metadata.level,
  };

  // Load rosters
  const rosterRecords = await getRecordsByIndex<RosterRecord>(
    STORES.ROSTERS,
    'saveId',
    saveId
  );

  const rosters = new Map<string, Roster>();

  if (rosterRecords.length > 0) {
    // Load all players for this save
    const playerRecords = await getRecordsByIndex<PlayerRecord>(
      STORES.PLAYERS,
      'saveId',
      saveId
    );

    const playerMap = new Map<string, Player>();
    for (const record of playerRecords) {
      const player: Player = JSON.parse(record.data);
      playerMap.set(player.id, player);
    }

    // Reconstruct rosters
    for (const rosterRecord of rosterRecords) {
      const players: Player[] = rosterRecord.players
        .map(id => playerMap.get(id.replace(`${saveId}_player_`, '')))
        .filter((p): p is Player => p !== undefined);

      const roster: Roster = {
        id: rosterRecord.id,
        teamId: rosterRecord.teamId,
        season: rosterRecord.season,
        players,
        createdAt: rosterRecord.createdAt,
        updatedAt: rosterRecord.updatedAt,
      };

      rosters.set(rosterRecord.teamId, roster);
    }
  }

  return {
    header,
    gameState,
    rosters: rosters.size > 0 ? rosters : undefined,
  };
};

/**
 * Load only the game state (without rosters)
 */
export const loadGameState = async (saveId: string): Promise<GameSaveData | null> => {
  const saveRecord = await getRecord<SaveRecord>(STORES.SAVES, saveId);

  if (!saveRecord) {
    return null;
  }

  return JSON.parse(saveRecord.gameState);
};

// ============================================
// LIST AND MANAGE SAVES
// ============================================

/**
 * List all saves (headers only)
 */
export const listSaves = async (): Promise<SaveHeader[]> => {
  const records = await getAllRecords<SaveRecord>(STORES.SAVES);

  return records
    .map(record => ({
      id: record.id,
      name: record.name,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      coachName: record.metadata.coachName,
      teamId: record.metadata.teamId,
      teamName: record.metadata.teamName,
      season: record.metadata.season,
      record: record.metadata.record,
      level: record.metadata.level,
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
};

/**
 * Delete a save and all associated data
 */
export const deleteSave = async (saveId: string): Promise<void> => {
  // Delete associated rosters and players
  await deleteRecordsByIndex(STORES.ROSTERS, 'saveId', saveId);
  await deleteRecordsByIndex(STORES.PLAYERS, 'saveId', saveId);

  // Delete the save record
  await deleteRecord(STORES.SAVES, saveId);
};

/**
 * Rename a save
 */
export const renameSave = async (saveId: string, newName: string): Promise<void> => {
  const saveRecord = await getRecord<SaveRecord>(STORES.SAVES, saveId);

  if (!saveRecord) {
    throw new Error(`Save not found: ${saveId}`);
  }

  saveRecord.name = newName;
  saveRecord.updatedAt = Date.now();

  await putRecord(STORES.SAVES, saveRecord);
};

/**
 * Check if a save exists
 */
export const saveExists = async (saveId: string): Promise<boolean> => {
  const record = await getRecord<SaveRecord>(STORES.SAVES, saveId);
  return record !== undefined;
};

// ============================================
// EXPORT/IMPORT
// ============================================

/**
 * Export a save to a downloadable JSON file
 */
export const exportSave = async (saveId: string): Promise<string> => {
  const saveData = await loadGame(saveId);

  if (!saveData) {
    throw new Error(`Save not found: ${saveId}`);
  }

  const exportData = {
    version: 1,
    exportedAt: Date.now(),
    header: saveData.header,
    gameState: saveData.gameState,
    rosters: saveData.rosters ? Object.fromEntries(saveData.rosters) : undefined,
  };

  return JSON.stringify(exportData, null, 2);
};

/**
 * Import a save from JSON string
 */
export const importSave = async (jsonString: string): Promise<string> => {
  const importData = JSON.parse(jsonString);

  if (!importData.version || !importData.header || !importData.gameState) {
    throw new Error('Invalid save file format');
  }

  // Generate new ID to avoid conflicts
  const newId = generateSaveId();

  // Convert rosters back to Map if present
  let rosters: Map<string, Roster> | undefined;
  if (importData.rosters) {
    rosters = new Map(Object.entries(importData.rosters));
  }

  await saveGame(
    newId,
    `${importData.header.name} (Imported)`,
    importData.gameState,
    rosters
  );

  return newId;
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get total saves count
 */
export const getSavesCount = async (): Promise<number> => {
  const saves = await listSaves();
  return saves.length;
};

/**
 * Get most recent save
 */
export const getMostRecentSave = async (): Promise<SaveHeader | null> => {
  const saves = await listSaves();
  return saves[0] || null;
};

/**
 * Delete all saves
 */
export const deleteAllSaves = async (): Promise<void> => {
  const saves = await listSaves();
  for (const save of saves) {
    await deleteSave(save.id);
  }
};
