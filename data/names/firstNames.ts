/**
 * FIRST NAME DATABASE
 * Era-weighted names for player generation
 */

export interface NameEntry {
  name: string;
  weight: number;        // Base frequency weight 1-10
  eraStart?: number;     // Year this name became popular
  eraEnd?: number;       // Year this name faded
  region?: string[];     // Regional associations
}

// ============================================
// CLASSIC NAMES (1995-2025)
// ============================================

export const classicFirstNames: NameEntry[] = [
  // Timeless names (high weight throughout)
  { name: 'Michael', weight: 10 },
  { name: 'James', weight: 10 },
  { name: 'David', weight: 9 },
  { name: 'John', weight: 9 },
  { name: 'Robert', weight: 8 },
  { name: 'William', weight: 8 },
  { name: 'Joseph', weight: 8 },
  { name: 'Thomas', weight: 7 },
  { name: 'Daniel', weight: 9 },
  { name: 'Matthew', weight: 9 },
  { name: 'Anthony', weight: 8 },
  { name: 'Mark', weight: 7, eraEnd: 2010 },
  { name: 'Christopher', weight: 9 },
  { name: 'Steven', weight: 7, eraEnd: 2010 },
  { name: 'Brian', weight: 8, eraEnd: 2005 },
  { name: 'Kevin', weight: 8, eraEnd: 2010 },
  { name: 'Eric', weight: 7, eraEnd: 2005 },
  { name: 'Ryan', weight: 9 },
  { name: 'Jason', weight: 8, eraEnd: 2005 },
  { name: 'Justin', weight: 9, eraStart: 1995, eraEnd: 2015 },
  { name: 'Brandon', weight: 9, eraStart: 1995, eraEnd: 2015 },
  { name: 'Tyler', weight: 8, eraStart: 1995, eraEnd: 2015 },
  { name: 'Kyle', weight: 8, eraStart: 1995, eraEnd: 2015 },
  { name: 'Andrew', weight: 9 },
  { name: 'Joshua', weight: 9, eraEnd: 2015 },
  { name: 'Aaron', weight: 8 },
  { name: 'Adam', weight: 7, eraEnd: 2010 },
  { name: 'Nathan', weight: 7 },
  { name: 'Patrick', weight: 7 },
  { name: 'Timothy', weight: 6, eraEnd: 2005 },
];

// ============================================
// SOUTHERN/REGIONAL NAMES
// ============================================

export const southernFirstNames: NameEntry[] = [
  { name: 'Dwayne', weight: 6, region: ['Southeast', 'Southwest'] },
  { name: 'DeShawn', weight: 7, region: ['Southeast'], eraStart: 1995 },
  { name: 'Terrell', weight: 7, region: ['Southeast'] },
  { name: 'Jamal', weight: 7, region: ['Southeast'] },
  { name: 'Marcus', weight: 8, region: ['Southeast'] },
  { name: 'Andre', weight: 7, region: ['Southeast'] },
  { name: 'Reggie', weight: 6, region: ['Southeast'] },
  { name: 'Devin', weight: 8, region: ['Southeast'] },
  { name: 'Malik', weight: 8, region: ['Southeast'], eraStart: 2000 },
  { name: 'Corey', weight: 7, region: ['Southeast'], eraEnd: 2010 },
  { name: 'Travis', weight: 7, region: ['Southeast', 'Southwest'] },
  { name: 'Derrick', weight: 7, region: ['Southeast'], eraEnd: 2010 },
  { name: 'Cedric', weight: 6, region: ['Southeast'] },
  { name: 'Clinton', weight: 5, region: ['Southeast'], eraEnd: 2005 },
  { name: 'Lamar', weight: 7, region: ['Southeast'] },
  { name: 'Trey', weight: 7, region: ['Southeast', 'Southwest'], eraStart: 2000 },
  { name: 'Colt', weight: 5, region: ['Southwest'], eraStart: 2000 },
  { name: 'Bo', weight: 5, region: ['Southeast'] },
  { name: 'Bubba', weight: 3, region: ['Southeast'] },
  { name: 'Tyrone', weight: 6, region: ['Southeast'], eraEnd: 2010 },
];

// ============================================
// MODERN NAMES (2005+)
// ============================================

export const modernFirstNames: NameEntry[] = [
  { name: 'Jayden', weight: 8, eraStart: 2005 },
  { name: 'Jalen', weight: 9, eraStart: 2005 },
  { name: 'Aiden', weight: 7, eraStart: 2008 },
  { name: 'Bryce', weight: 8, eraStart: 2005 },
  { name: 'Brock', weight: 6, eraStart: 2000 },
  { name: 'Trevor', weight: 7, eraStart: 2000 },
  { name: 'Caleb', weight: 8, eraStart: 2000 },
  { name: 'Cam', weight: 7, eraStart: 2005 },
  { name: 'Dak', weight: 5, eraStart: 2010 },
  { name: 'Kyler', weight: 6, eraStart: 2010 },
  { name: 'Tua', weight: 4, eraStart: 2015 },
  { name: 'Trevor', weight: 7, eraStart: 2000 },
  { name: 'Justin', weight: 8 },
  { name: 'Deshaun', weight: 7, eraStart: 2005 },
  { name: 'Lamar', weight: 7, eraStart: 2005 },
  { name: 'Burrow', weight: 3, eraStart: 2020 },
  { name: 'CJ', weight: 6, eraStart: 2005 },
  { name: 'DJ', weight: 6, eraStart: 2005 },
  { name: 'AJ', weight: 6, eraStart: 2005 },
  { name: 'TJ', weight: 5, eraStart: 2005 },
  { name: 'JJ', weight: 5, eraStart: 2010 },
  { name: 'Jaylen', weight: 7, eraStart: 2005 },
  { name: 'Micah', weight: 6, eraStart: 2008 },
  { name: 'Myles', weight: 6, eraStart: 2005 },
  { name: 'Saquon', weight: 4, eraStart: 2015 },
  { name: 'Najee', weight: 4, eraStart: 2015 },
  { name: 'Trevon', weight: 5, eraStart: 2005 },
  { name: 'Davante', weight: 5, eraStart: 2010 },
  { name: 'Stefon', weight: 5, eraStart: 2010 },
  { name: 'Diontae', weight: 4, eraStart: 2015 },
  { name: 'Ja\'Marr', weight: 4, eraStart: 2018 },
  { name: 'DeVonta', weight: 4, eraStart: 2015 },
];

// ============================================
// UNIQUE/DISTINCTIVE NAMES
// ============================================

export const uniqueFirstNames: NameEntry[] = [
  { name: 'Zeke', weight: 4 },
  { name: 'Taysom', weight: 3, eraStart: 2010 },
  { name: 'Mecole', weight: 3, eraStart: 2015 },
  { name: 'D\'Andre', weight: 5, eraStart: 2005 },
  { name: 'Jameson', weight: 5, eraStart: 2010 },
  { name: 'Breece', weight: 3, eraStart: 2018 },
  { name: 'Kenneth', weight: 6 },
  { name: 'Dalvin', weight: 4, eraStart: 2010 },
  { name: 'Alvin', weight: 5 },
  { name: 'Derwin', weight: 3, eraStart: 2010 },
  { name: 'Tyrann', weight: 3, eraStart: 2010 },
  { name: 'Jaire', weight: 3, eraStart: 2015 },
  { name: 'Xavien', weight: 3, eraStart: 2015 },
  { name: 'Jaylon', weight: 5, eraStart: 2010 },
  { name: 'Deion', weight: 6 },
  { name: 'Roquan', weight: 3, eraStart: 2015 },
  { name: 'Quinnen', weight: 3, eraStart: 2015 },
  { name: 'Quenton', weight: 4, eraStart: 2010 },
  { name: 'Minkah', weight: 3, eraStart: 2015 },
  { name: 'Denzel', weight: 5 },
  { name: 'Darius', weight: 6 },
  { name: 'Lavonte', weight: 4, eraStart: 2005 },
  { name: 'Von', weight: 4, eraStart: 2005 },
  { name: 'Za\'Darius', weight: 3, eraStart: 2015 },
  { name: 'Shaquil', weight: 4, eraStart: 2010 },
  { name: 'Shaq', weight: 5 },
  { name: 'Sauce', weight: 2, eraStart: 2020 },
];

// ============================================
// COMBINED POOL
// ============================================

export const allFirstNames: NameEntry[] = [
  ...classicFirstNames,
  ...southernFirstNames,
  ...modernFirstNames,
  ...uniqueFirstNames,
];

// ============================================
// NAME SELECTION HELPER
// ============================================

export const selectFirstName = (
  year: number,
  region?: string,
  seed?: number
): string => {
  // Filter names by era and optionally by region
  let pool = allFirstNames.filter(entry => {
    const afterStart = !entry.eraStart || year >= entry.eraStart - 18; // Players born 18 years before
    const beforeEnd = !entry.eraEnd || year <= entry.eraEnd + 5; // Some lingering popularity
    const regionMatch = !region || !entry.region || entry.region.includes(region);
    return afterStart && beforeEnd && regionMatch;
  });

  if (pool.length === 0) pool = classicFirstNames;

  // Create weighted pool
  const weightedPool: string[] = [];
  for (const entry of pool) {
    for (let i = 0; i < entry.weight; i++) {
      weightedPool.push(entry.name);
    }
  }

  // Select using seed or random
  const index = seed !== undefined
    ? Math.abs(seed) % weightedPool.length
    : Math.floor(Math.random() * weightedPool.length);

  return weightedPool[index];
};
