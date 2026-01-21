/**
 * RESPONSE CACHE
 * Caches AI responses to reduce duplicate API calls.
 * Uses localStorage for persistence across sessions.
 */

import { TurnLog } from '../types';

const CACHE_KEY = 'sideline_saga_cache';
const CACHE_VERSION = 1;
const MAX_CACHE_SIZE = 50; // Max cached responses
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  response: TurnLog;
  timestamp: number;
  hits: number;
}

interface CacheStore {
  version: number;
  entries: Record<string, CacheEntry>;
}

// ============================================
// CACHE KEY GENERATION
// ============================================

/**
 * Generate a deterministic cache key from game state + action.
 * We intentionally exclude some volatile fields to increase cache hits.
 */
export const generateCacheKey = (
  phase: string,
  record: string,
  actionId: string,
  prestige: string,
  role: string
): string => {
  // Create a simplified key that can match similar scenarios
  const keyParts = [
    phase.toLowerCase().replace(/\s/g, '_'),
    record,
    actionId,
    prestige.toLowerCase().replace(/\s/g, '_'),
    role.toLowerCase().includes('head') ? 'hc' : role.toLowerCase().includes('coord') ? 'coord' : 'staff',
  ];
  return keyParts.join('|');
};

// ============================================
// CACHE OPERATIONS
// ============================================

const loadCache = (): CacheStore => {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return { version: CACHE_VERSION, entries: {} };
    
    const parsed = JSON.parse(stored) as CacheStore;
    if (parsed.version !== CACHE_VERSION) {
      // Version mismatch, clear cache
      return { version: CACHE_VERSION, entries: {} };
    }
    return parsed;
  } catch {
    return { version: CACHE_VERSION, entries: {} };
  }
};

const saveCache = (cache: CacheStore): void => {
  try {
    // Prune old entries before saving
    const now = Date.now();
    const entries = Object.entries(cache.entries)
      .filter(([_, entry]) => now - entry.timestamp < CACHE_TTL_MS)
      .sort((a, b) => b[1].hits - a[1].hits) // Keep most hit entries
      .slice(0, MAX_CACHE_SIZE);
    
    cache.entries = Object.fromEntries(entries);
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage might be full, clear it
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {}
  }
};

// ============================================
// PUBLIC API
// ============================================

export const getCachedResponse = (key: string): TurnLog | null => {
  const cache = loadCache();
  const entry = cache.entries[key];
  
  if (!entry) return null;
  
  // Check TTL
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    delete cache.entries[key];
    saveCache(cache);
    return null;
  }
  
  // Update hit count
  entry.hits++;
  saveCache(cache);
  
  console.log(`[Cache] HIT for key: ${key.substring(0, 30)}...`);
  return entry.response;
};

export const setCachedResponse = (key: string, response: TurnLog): void => {
  const cache = loadCache();
  
  cache.entries[key] = {
    response,
    timestamp: Date.now(),
    hits: 1,
  };
  
  saveCache(cache);
  console.log(`[Cache] STORED key: ${key.substring(0, 30)}...`);
};

export const clearCache = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('[Cache] CLEARED');
  } catch {}
};

export const getCacheStats = (): { size: number; keys: string[] } => {
  const cache = loadCache();
  return {
    size: Object.keys(cache.entries).length,
    keys: Object.keys(cache.entries),
  };
};
