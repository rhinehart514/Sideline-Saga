/**
 * LAST NAME DATABASE
 * Regional names for player generation
 */

export interface LastNameEntry {
  name: string;
  weight: number;        // Base frequency weight 1-10
  region?: string[];     // Regional associations
}

// ============================================
// COMMON AMERICAN LAST NAMES
// ============================================

export const commonLastNames: LastNameEntry[] = [
  { name: 'Smith', weight: 10 },
  { name: 'Johnson', weight: 10 },
  { name: 'Williams', weight: 10 },
  { name: 'Brown', weight: 10 },
  { name: 'Jones', weight: 10 },
  { name: 'Garcia', weight: 9 },
  { name: 'Miller', weight: 9 },
  { name: 'Davis', weight: 9 },
  { name: 'Rodriguez', weight: 8 },
  { name: 'Martinez', weight: 8 },
  { name: 'Hernandez', weight: 8 },
  { name: 'Lopez', weight: 7 },
  { name: 'Gonzalez', weight: 7 },
  { name: 'Wilson', weight: 9 },
  { name: 'Anderson', weight: 9 },
  { name: 'Thomas', weight: 9 },
  { name: 'Taylor', weight: 9 },
  { name: 'Moore', weight: 8 },
  { name: 'Jackson', weight: 9 },
  { name: 'Martin', weight: 8 },
  { name: 'Lee', weight: 8 },
  { name: 'Thompson', weight: 8 },
  { name: 'White', weight: 8 },
  { name: 'Harris', weight: 8 },
  { name: 'Lewis', weight: 8 },
  { name: 'Robinson', weight: 8 },
  { name: 'Clark', weight: 8 },
  { name: 'Walker', weight: 8 },
  { name: 'Hall', weight: 7 },
  { name: 'Allen', weight: 7 },
  { name: 'Young', weight: 7 },
  { name: 'King', weight: 7 },
  { name: 'Wright', weight: 7 },
  { name: 'Scott', weight: 7 },
  { name: 'Green', weight: 7 },
  { name: 'Adams', weight: 7 },
  { name: 'Baker', weight: 7 },
  { name: 'Nelson', weight: 7 },
  { name: 'Carter', weight: 7 },
  { name: 'Mitchell', weight: 7 },
  { name: 'Roberts', weight: 7 },
  { name: 'Turner', weight: 7 },
  { name: 'Phillips', weight: 6 },
  { name: 'Campbell', weight: 6 },
  { name: 'Parker', weight: 6 },
  { name: 'Evans', weight: 6 },
  { name: 'Edwards', weight: 6 },
  { name: 'Collins', weight: 6 },
  { name: 'Stewart', weight: 6 },
  { name: 'Morris', weight: 6 },
];

// ============================================
// SOUTHERN LAST NAMES
// ============================================

export const southernLastNames: LastNameEntry[] = [
  { name: 'Washington', weight: 7, region: ['Southeast'] },
  { name: 'Jefferson', weight: 5, region: ['Southeast'] },
  { name: 'Sanders', weight: 6, region: ['Southeast'] },
  { name: 'Jenkins', weight: 6, region: ['Southeast'] },
  { name: 'Bryant', weight: 6, region: ['Southeast'] },
  { name: 'Jordan', weight: 6, region: ['Southeast'] },
  { name: 'Hayes', weight: 5, region: ['Southeast'] },
  { name: 'Brooks', weight: 6, region: ['Southeast'] },
  { name: 'Howard', weight: 6, region: ['Southeast'] },
  { name: 'Ross', weight: 5, region: ['Southeast'] },
  { name: 'Reed', weight: 5, region: ['Southeast'] },
  { name: 'Cook', weight: 5, region: ['Southeast'] },
  { name: 'Bell', weight: 5, region: ['Southeast'] },
  { name: 'Bailey', weight: 5, region: ['Southeast'] },
  { name: 'Coleman', weight: 6, region: ['Southeast'] },
  { name: 'Cooper', weight: 6, region: ['Southeast'] },
  { name: 'Richardson', weight: 6, region: ['Southeast'] },
  { name: 'Cox', weight: 5, region: ['Southeast'] },
  { name: 'Ward', weight: 5, region: ['Southeast'] },
  { name: 'Brooks', weight: 5, region: ['Southeast'] },
  { name: 'Gray', weight: 5, region: ['Southeast'] },
  { name: 'Freeman', weight: 5, region: ['Southeast'] },
  { name: 'Patterson', weight: 5, region: ['Southeast'] },
  { name: 'Simmons', weight: 5, region: ['Southeast'] },
  { name: 'Foster', weight: 5, region: ['Southeast'] },
  { name: 'Marshall', weight: 5, region: ['Southeast'] },
  { name: 'Beasley', weight: 4, region: ['Southeast'] },
  { name: 'Mack', weight: 4, region: ['Southeast'] },
  { name: 'Dixon', weight: 4, region: ['Southeast'] },
  { name: 'Gordon', weight: 5, region: ['Southeast'] },
  { name: 'Graham', weight: 5, region: ['Southeast'] },
];

// ============================================
// MIDWEST LAST NAMES
// ============================================

export const midwestLastNames: LastNameEntry[] = [
  { name: 'Schmidt', weight: 5, region: ['Midwest'] },
  { name: 'Schneider', weight: 4, region: ['Midwest'] },
  { name: 'Weber', weight: 4, region: ['Midwest'] },
  { name: 'Meyer', weight: 5, region: ['Midwest'] },
  { name: 'Schultz', weight: 4, region: ['Midwest'] },
  { name: 'Wagner', weight: 4, region: ['Midwest'] },
  { name: 'Fischer', weight: 4, region: ['Midwest'] },
  { name: 'Bauer', weight: 3, region: ['Midwest'] },
  { name: 'Olson', weight: 5, region: ['Midwest'] },
  { name: 'Larson', weight: 5, region: ['Midwest'] },
  { name: 'Peterson', weight: 6, region: ['Midwest'] },
  { name: 'Carlson', weight: 4, region: ['Midwest'] },
  { name: 'Hanson', weight: 4, region: ['Midwest'] },
  { name: 'Jensen', weight: 4, region: ['Midwest'] },
  { name: 'Nelson', weight: 6, region: ['Midwest'] },
  { name: 'Swanson', weight: 4, region: ['Midwest'] },
  { name: 'Erickson', weight: 4, region: ['Midwest'] },
  { name: 'Lindstrom', weight: 3, region: ['Midwest'] },
  { name: 'Johnson', weight: 8, region: ['Midwest'] },
  { name: 'Anderson', weight: 7, region: ['Midwest'] },
  { name: 'Mueller', weight: 3, region: ['Midwest'] },
  { name: 'Kramer', weight: 4, region: ['Midwest'] },
  { name: 'Keller', weight: 3, region: ['Midwest'] },
  { name: 'Hoffman', weight: 4, region: ['Midwest'] },
  { name: 'Becker', weight: 3, region: ['Midwest'] },
];

// ============================================
// SOUTHWEST/TEXAS LAST NAMES
// ============================================

export const southwestLastNames: LastNameEntry[] = [
  { name: 'Ramirez', weight: 7, region: ['Southwest'] },
  { name: 'Sanchez', weight: 7, region: ['Southwest'] },
  { name: 'Torres', weight: 6, region: ['Southwest'] },
  { name: 'Flores', weight: 6, region: ['Southwest'] },
  { name: 'Rivera', weight: 6, region: ['Southwest'] },
  { name: 'Morales', weight: 5, region: ['Southwest'] },
  { name: 'Reyes', weight: 5, region: ['Southwest'] },
  { name: 'Cruz', weight: 5, region: ['Southwest'] },
  { name: 'Gutierrez', weight: 5, region: ['Southwest'] },
  { name: 'Ortiz', weight: 5, region: ['Southwest'] },
  { name: 'Ramos', weight: 5, region: ['Southwest'] },
  { name: 'Medina', weight: 4, region: ['Southwest'] },
  { name: 'Aguilar', weight: 4, region: ['Southwest'] },
  { name: 'Castillo', weight: 5, region: ['Southwest'] },
  { name: 'Diaz', weight: 5, region: ['Southwest'] },
  { name: 'Perez', weight: 6, region: ['Southwest'] },
  { name: 'Mendez', weight: 4, region: ['Southwest'] },
  { name: 'Vargas', weight: 4, region: ['Southwest'] },
  { name: 'Chavez', weight: 5, region: ['Southwest'] },
  { name: 'Fernandez', weight: 4, region: ['Southwest'] },
  { name: 'Vasquez', weight: 4, region: ['Southwest'] },
  { name: 'Ruiz', weight: 5, region: ['Southwest'] },
  { name: 'Jimenez', weight: 4, region: ['Southwest'] },
  { name: 'Salazar', weight: 4, region: ['Southwest'] },
  { name: 'Garza', weight: 5, region: ['Southwest'] },
];

// ============================================
// PACIFIC/WEST COAST LAST NAMES
// ============================================

export const pacificLastNames: LastNameEntry[] = [
  { name: 'Kim', weight: 5, region: ['Pacific'] },
  { name: 'Lee', weight: 6, region: ['Pacific'] },
  { name: 'Park', weight: 4, region: ['Pacific'] },
  { name: 'Chen', weight: 5, region: ['Pacific'] },
  { name: 'Wang', weight: 4, region: ['Pacific'] },
  { name: 'Nguyen', weight: 6, region: ['Pacific'] },
  { name: 'Tran', weight: 4, region: ['Pacific'] },
  { name: 'Pham', weight: 3, region: ['Pacific'] },
  { name: 'Tanaka', weight: 3, region: ['Pacific'] },
  { name: 'Yamamoto', weight: 3, region: ['Pacific'] },
  { name: 'Nakamura', weight: 3, region: ['Pacific'] },
  { name: 'Tui', weight: 3, region: ['Pacific'] },
  { name: 'Taufa', weight: 2, region: ['Pacific'] },
  { name: 'Sitake', weight: 2, region: ['Pacific'] },
  { name: 'Lotulelei', weight: 2, region: ['Pacific'] },
  { name: 'Tuiasosopo', weight: 2, region: ['Pacific'] },
  { name: 'Pouha', weight: 2, region: ['Pacific'] },
  { name: 'Niumatalolo', weight: 2, region: ['Pacific'] },
  { name: 'Polamalu', weight: 2, region: ['Pacific'] },
];

// ============================================
// NORTHEAST LAST NAMES
// ============================================

export const northeastLastNames: LastNameEntry[] = [
  { name: 'Murphy', weight: 6, region: ['Northeast'] },
  { name: 'Kelly', weight: 6, region: ['Northeast'] },
  { name: 'O\'Brien', weight: 5, region: ['Northeast'] },
  { name: 'Ryan', weight: 5, region: ['Northeast'] },
  { name: 'Sullivan', weight: 5, region: ['Northeast'] },
  { name: 'Walsh', weight: 4, region: ['Northeast'] },
  { name: 'Kennedy', weight: 4, region: ['Northeast'] },
  { name: 'McCarthy', weight: 4, region: ['Northeast'] },
  { name: 'Brennan', weight: 4, region: ['Northeast'] },
  { name: 'Quinn', weight: 4, region: ['Northeast'] },
  { name: 'Gallagher', weight: 3, region: ['Northeast'] },
  { name: 'Fitzgerald', weight: 4, region: ['Northeast'] },
  { name: 'Donahue', weight: 3, region: ['Northeast'] },
  { name: 'Russo', weight: 4, region: ['Northeast'] },
  { name: 'Romano', weight: 3, region: ['Northeast'] },
  { name: 'Marino', weight: 4, region: ['Northeast'] },
  { name: 'DeLuca', weight: 3, region: ['Northeast'] },
  { name: 'Esposito', weight: 3, region: ['Northeast'] },
  { name: 'Rizzo', weight: 3, region: ['Northeast'] },
  { name: 'Lombardi', weight: 3, region: ['Northeast'] },
  { name: 'Caruso', weight: 3, region: ['Northeast'] },
  { name: 'Santoro', weight: 3, region: ['Northeast'] },
  { name: 'Kowalski', weight: 3, region: ['Northeast'] },
  { name: 'Nowak', weight: 3, region: ['Northeast'] },
  { name: 'Grabowski', weight: 3, region: ['Northeast'] },
];

// ============================================
// FOOTBALL-FAMOUS STYLE LAST NAMES
// ============================================

export const footballFamousLastNames: LastNameEntry[] = [
  { name: 'Manning', weight: 4 },
  { name: 'Moss', weight: 4 },
  { name: 'Rice', weight: 4 },
  { name: 'Favre', weight: 3 },
  { name: 'Montana', weight: 3 },
  { name: 'Brady', weight: 4 },
  { name: 'Brees', weight: 3 },
  { name: 'Payton', weight: 4 },
  { name: 'Sanders', weight: 5 },
  { name: 'Emmitt', weight: 2 },
  { name: 'Irvin', weight: 3 },
  { name: 'Aikman', weight: 3 },
  { name: 'Elway', weight: 3 },
  { name: 'Young', weight: 5 },
  { name: 'Warner', weight: 4 },
  { name: 'Rodgers', weight: 4 },
  { name: 'Mahomes', weight: 3 },
  { name: 'Kelce', weight: 3 },
  { name: 'Watt', weight: 4 },
  { name: 'Bosa', weight: 3 },
  { name: 'Donald', weight: 4 },
  { name: 'Garrett', weight: 5 },
  { name: 'Adams', weight: 6 },
  { name: 'Hill', weight: 6 },
  { name: 'Henry', weight: 6 },
  { name: 'McCaffrey', weight: 3 },
  { name: 'Chubb', weight: 3 },
  { name: 'Mixon', weight: 3 },
  { name: 'Chase', weight: 4 },
  { name: 'Jefferson', weight: 5 },
];

// ============================================
// COMBINED POOL
// ============================================

export const allLastNames: LastNameEntry[] = [
  ...commonLastNames,
  ...southernLastNames,
  ...midwestLastNames,
  ...southwestLastNames,
  ...pacificLastNames,
  ...northeastLastNames,
  ...footballFamousLastNames,
];

// ============================================
// NAME SELECTION HELPER
// ============================================

export const selectLastName = (
  region?: string,
  seed?: number
): string => {
  // Filter by region if specified
  let pool = region
    ? allLastNames.filter(entry => !entry.region || entry.region.includes(region))
    : allLastNames;

  if (pool.length === 0) pool = commonLastNames;

  // Create weighted pool
  const weightedPool: string[] = [];
  for (const entry of pool) {
    // Boost regional names when matching
    const weight = entry.region?.includes(region || '') ? entry.weight * 2 : entry.weight;
    for (let i = 0; i < weight; i++) {
      weightedPool.push(entry.name);
    }
  }

  // Select using seed or random
  const index = seed !== undefined
    ? Math.abs(seed) % weightedPool.length
    : Math.floor(Math.random() * weightedPool.length);

  return weightedPool[index];
};
