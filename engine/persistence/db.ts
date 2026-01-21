/**
 * INDEXEDDB DATABASE SCHEMA
 * Core database operations for Sideline Saga
 */

// ============================================
// DATABASE CONFIGURATION
// ============================================

export const DB_NAME = 'SidelineSagaDB';
export const DB_VERSION = 1;

export const STORES = {
  SAVES: 'saves',
  ROSTERS: 'rosters',
  PLAYERS: 'players',
  SETTINGS: 'settings',
} as const;

export type StoreName = typeof STORES[keyof typeof STORES];

// ============================================
// SCHEMA TYPES
// ============================================

export interface SaveRecord {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  gameState: string; // JSON stringified game state
  metadata: {
    coachName: string;
    teamId: string;
    teamName: string;
    season: number;
    record: { wins: number; losses: number };
    level: string;
  };
}

export interface RosterRecord {
  id: string;
  saveId: string;
  teamId: string;
  season: number;
  players: string[]; // Player IDs
  createdAt: number;
  updatedAt: number;
}

export interface PlayerRecord {
  id: string;
  saveId: string;
  data: string; // JSON stringified player data
}

export interface SettingsRecord {
  id: string;
  value: unknown;
}

// ============================================
// DATABASE CONNECTION
// ============================================

let dbInstance: IDBDatabase | null = null;

/**
 * Open the database connection
 */
export const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`Failed to open database: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      dbInstance = request.result;

      // Handle connection loss
      dbInstance.onclose = () => {
        dbInstance = null;
      };

      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      createStores(db);
    };
  });
};

/**
 * Create object stores during upgrade
 */
const createStores = (db: IDBDatabase): void => {
  // Saves store
  if (!db.objectStoreNames.contains(STORES.SAVES)) {
    const savesStore = db.createObjectStore(STORES.SAVES, { keyPath: 'id' });
    savesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
    savesStore.createIndex('name', 'name', { unique: false });
  }

  // Rosters store
  if (!db.objectStoreNames.contains(STORES.ROSTERS)) {
    const rostersStore = db.createObjectStore(STORES.ROSTERS, { keyPath: 'id' });
    rostersStore.createIndex('saveId', 'saveId', { unique: false });
    rostersStore.createIndex('teamId', 'teamId', { unique: false });
    rostersStore.createIndex('saveId_teamId', ['saveId', 'teamId'], { unique: false });
  }

  // Players store
  if (!db.objectStoreNames.contains(STORES.PLAYERS)) {
    const playersStore = db.createObjectStore(STORES.PLAYERS, { keyPath: 'id' });
    playersStore.createIndex('saveId', 'saveId', { unique: false });
  }

  // Settings store
  if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
    db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
  }
};

/**
 * Close the database connection
 */
export const closeDatabase = (): void => {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
};

// ============================================
// GENERIC CRUD OPERATIONS
// ============================================

/**
 * Get a record by ID
 */
export const getRecord = <T>(storeName: StoreName, id: string): Promise<T | undefined> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result as T | undefined);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get record: ${request.error?.message}`));
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get all records from a store
 */
export const getAllRecords = <T>(storeName: StoreName): Promise<T[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as T[]);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get all records: ${request.error?.message}`));
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get records by index
 */
export const getRecordsByIndex = <T>(
  storeName: StoreName,
  indexName: string,
  value: IDBValidKey | IDBKeyRange
): Promise<T[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => {
        resolve(request.result as T[]);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get records by index: ${request.error?.message}`));
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Put (create or update) a record
 */
export const putRecord = <T>(storeName: StoreName, record: T): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(record);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to put record: ${request.error?.message}`));
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Put multiple records in a single transaction
 */
export const putRecords = <T>(storeName: StoreName, records: T[]): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      for (const record of records) {
        store.put(record);
      }

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(new Error(`Failed to put records: ${transaction.error?.message}`));
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Delete a record by ID
 */
export const deleteRecord = (storeName: StoreName, id: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to delete record: ${request.error?.message}`));
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Delete records by index value
 */
export const deleteRecordsByIndex = (
  storeName: StoreName,
  indexName: string,
  value: IDBValidKey
): Promise<number> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.openCursor(value);
      let deletedCount = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        }
      };

      transaction.oncomplete = () => {
        resolve(deletedCount);
      };

      transaction.onerror = () => {
        reject(new Error(`Failed to delete records: ${transaction.error?.message}`));
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Clear all records from a store
 */
export const clearStore = (storeName: StoreName): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to clear store: ${request.error?.message}`));
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Count records in a store
 */
export const countRecords = (storeName: StoreName): Promise<number> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error(`Failed to count records: ${request.error?.message}`));
      };
    } catch (error) {
      reject(error);
    }
  });
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if IndexedDB is available
 */
export const isIndexedDBAvailable = (): boolean => {
  try {
    return 'indexedDB' in window && window.indexedDB !== null;
  } catch {
    return false;
  }
};

/**
 * Delete the entire database
 */
export const deleteDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    closeDatabase();

    const request = indexedDB.deleteDatabase(DB_NAME);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to delete database: ${request.error?.message}`));
    };

    request.onblocked = () => {
      reject(new Error('Database deletion blocked - close all connections'));
    };
  });
};

/**
 * Get database storage estimate
 */
export const getStorageEstimate = async (): Promise<{ usage: number; quota: number } | null> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
    };
  }
  return null;
};
