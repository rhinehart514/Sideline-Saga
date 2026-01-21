/**
 * NAME GENERATION INDEX
 * Unified name generation for players
 */

import { selectFirstName, allFirstNames } from './firstNames';
import { selectLastName, allLastNames } from './lastNames';

// ============================================
// SEEDED RANDOM NUMBER GENERATOR
// ============================================

export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

// ============================================
// NAME GENERATION
// ============================================

export interface GeneratedName {
  firstName: string;
  lastName: string;
  fullName: string;
}

export const generateName = (
  year: number,
  region?: string,
  seed?: number
): GeneratedName => {
  // Use seed to generate consistent names
  const firstNameSeed = seed !== undefined ? seed * 31 : undefined;
  const lastNameSeed = seed !== undefined ? seed * 17 : undefined;

  const firstName = selectFirstName(year, region, firstNameSeed);
  const lastName = selectLastName(region, lastNameSeed);

  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
  };
};

export const generateNameBatch = (
  count: number,
  year: number,
  region?: string,
  baseSeed?: number
): GeneratedName[] => {
  const names: GeneratedName[] = [];
  const usedCombinations = new Set<string>();

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let name: GeneratedName;

    // Avoid duplicate names
    do {
      const seed = baseSeed !== undefined ? baseSeed + i + attempts * 1000 : undefined;
      name = generateName(year, region, seed);
      attempts++;
    } while (usedCombinations.has(name.fullName) && attempts < 10);

    usedCombinations.add(name.fullName);
    names.push(name);
  }

  return names;
};

// ============================================
// NICKNAME GENERATION
// ============================================

const NICKNAMES = [
  // Performance based
  'Flash', 'Beast', 'Tank', 'Jet', 'Rocket', 'Freight Train',
  'The Freak', 'Air', 'Prime Time', 'Money', 'Mr. Big',
  // Size based
  'Big', 'Little', 'Slim', 'Tiny', 'Giant',
  // Personality based
  'Ice', 'Hollywood', 'Showtime', 'Silent', 'Quiet Storm',
  // Location based
  'Philly', 'Chi-Town', 'Texas', 'Cali', 'Motor City',
  // Initials
  'J-Train', 'D-Will', 'T-Mac', 'A-Rod', 'K-Will',
];

export const generateNickname = (
  firstName: string,
  lastName: string,
  seed?: number
): string | undefined => {
  // Only some players get nicknames
  const hasNickname = seed !== undefined
    ? (seed % 5) === 0 // 20% chance with seed
    : Math.random() < 0.2;

  if (!hasNickname) return undefined;

  const index = seed !== undefined
    ? Math.abs(seed) % NICKNAMES.length
    : Math.floor(Math.random() * NICKNAMES.length);

  return NICKNAMES[index];
};

// ============================================
// COACH NAME GENERATION
// ============================================

const COACH_FIRST_NAMES = [
  'Bill', 'Bob', 'Jim', 'Joe', 'Mike', 'Tom', 'Dan', 'Dave', 'John', 'Steve',
  'Nick', 'Brian', 'Gary', 'Pete', 'Ron', 'Andy', 'Sean', 'Kyle', 'Matt', 'Dabo',
  'Kirby', 'Lincoln', 'Ryan', 'James', 'Mark', 'Urban', 'Lane', 'Jimbo', 'Les', 'Lou',
];

const COACH_LAST_NAMES = [
  'Saban', 'Belichick', 'Meyer', 'Bowden', 'Osborne', 'Bryant', 'Hayes', 'Paterno',
  'Carroll', 'Fisher', 'Reid', 'Shanahan', 'Coughlin', 'Harbaugh', 'Tomlin', 'Payton',
  'McVay', 'LaFleur', 'Kingsbury', 'Smart', 'Day', 'Riley', 'Franklin', 'Norvell',
  'Swinney', 'Stoops', 'Gundy', 'Campbell', 'Fickell', 'Patterson', 'Leach', 'Spurrier',
];

export const generateCoachName = (seed?: number): GeneratedName => {
  const firstIndex = seed !== undefined
    ? Math.abs(seed) % COACH_FIRST_NAMES.length
    : Math.floor(Math.random() * COACH_FIRST_NAMES.length);

  const lastIndex = seed !== undefined
    ? Math.abs(seed * 31) % COACH_LAST_NAMES.length
    : Math.floor(Math.random() * COACH_LAST_NAMES.length);

  const firstName = COACH_FIRST_NAMES[firstIndex];
  const lastName = COACH_LAST_NAMES[lastIndex];

  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
  };
};

// ============================================
// RE-EXPORTS
// ============================================

export { selectFirstName, selectLastName, allFirstNames, allLastNames };
