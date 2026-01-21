/**
 * PLAYER GENERATION ENGINE
 * Generates players with position-appropriate attributes
 */

import {
  Player,
  Position,
  PositionGroup,
  POSITION_TO_GROUP,
  PhysicalAttributes,
  MentalAttributes,
  PositionAttributes,
  QBAttributes,
  RBAttributes,
  WRAttributes,
  TEAttributes,
  OLAttributes,
  DLAttributes,
  LBAttributes,
  DBAttributes,
  KickerAttributes,
  PunterAttributes,
  DevelopmentTrait,
  RecruitStars,
  STAR_DISTRIBUTION,
  PHYSICAL_RANGES,
  CollegeYear,
  createEmptyStats,
} from './types';
import { calculateOverall } from './ratings';
import { generateName, SeededRandom } from '../../data/names';

// ============================================
// ATTRIBUTE GENERATION HELPERS
// ============================================

const generateAttribute = (
  rng: SeededRandom,
  baseMean: number,
  variance: number = 15
): number => {
  // Normal distribution approximation
  const u1 = rng.next();
  const u2 = rng.next();
  const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const value = baseMean + normal * (variance / 2);
  return Math.max(25, Math.min(99, Math.round(value)));
};

const tierToBaseMean = (tier: 1 | 2 | 3 | 4 | 5): number => {
  // Tier 5 = Elite (80+), Tier 1 = Depth (50-60)
  switch (tier) {
    case 5: return 82;
    case 4: return 72;
    case 3: return 62;
    case 2: return 52;
    case 1: return 45;
  }
};

const starsToTier = (stars: RecruitStars): 1 | 2 | 3 | 4 | 5 => {
  return stars as 1 | 2 | 3 | 4 | 5;
};

// ============================================
// PHYSICAL ATTRIBUTE GENERATION
// ============================================

const generatePhysicalAttributes = (
  rng: SeededRandom,
  position: Position,
  tier: number
): PhysicalAttributes => {
  const baseMean = tierToBaseMean(tier as 1 | 2 | 3 | 4 | 5);

  // Position-specific modifiers
  const group = POSITION_TO_GROUP[position];
  let speedMod = 0;
  let strengthMod = 0;
  let agilityMod = 0;

  switch (group) {
    case 'QB':
      speedMod = -5;
      break;
    case 'RB':
      speedMod = 5;
      agilityMod = 8;
      break;
    case 'WR':
      speedMod = 10;
      agilityMod = 5;
      break;
    case 'TE':
      strengthMod = 3;
      break;
    case 'OL':
      speedMod = -15;
      strengthMod = 12;
      agilityMod = -10;
      break;
    case 'DL':
      speedMod = -8;
      strengthMod = 10;
      break;
    case 'LB':
      strengthMod = 5;
      break;
    case 'DB':
      speedMod = 8;
      agilityMod = 8;
      break;
    case 'K':
    case 'P':
      speedMod = -10;
      break;
  }

  return {
    speed: generateAttribute(rng, baseMean + speedMod),
    acceleration: generateAttribute(rng, baseMean + speedMod * 0.5),
    strength: generateAttribute(rng, baseMean + strengthMod),
    agility: generateAttribute(rng, baseMean + agilityMod),
    jumping: generateAttribute(rng, baseMean),
    stamina: generateAttribute(rng, baseMean + 5), // Generally high
    injury: generateAttribute(rng, baseMean + 5), // Durability
    toughness: generateAttribute(rng, baseMean),
  };
};

const generateMentalAttributes = (
  rng: SeededRandom,
  tier: number
): MentalAttributes => {
  const baseMean = tierToBaseMean(tier as 1 | 2 | 3 | 4 | 5);

  return {
    awareness: generateAttribute(rng, baseMean),
    clutch: generateAttribute(rng, baseMean, 20), // More variance
    consistency: generateAttribute(rng, baseMean),
  };
};

// ============================================
// POSITION-SPECIFIC ATTRIBUTE GENERATION
// ============================================

const generateQBAttributes = (rng: SeededRandom, tier: number): QBAttributes => {
  const baseMean = tierToBaseMean(tier as 1 | 2 | 3 | 4 | 5);
  const isDualThreat = rng.next() < 0.35; // 35% are dual-threat

  const attrs: QBAttributes = {
    throwPower: generateAttribute(rng, baseMean),
    throwAccuracyShort: generateAttribute(rng, baseMean + 3),
    throwAccuracyMid: generateAttribute(rng, baseMean),
    throwAccuracyDeep: generateAttribute(rng, baseMean - 5),
    throwOnRun: generateAttribute(rng, baseMean - 3),
    playAction: generateAttribute(rng, baseMean),
    poise: generateAttribute(rng, baseMean),
    release: generateAttribute(rng, baseMean),
  };

  if (isDualThreat) {
    attrs.carrying = generateAttribute(rng, baseMean - 5);
    attrs.breakTackle = generateAttribute(rng, baseMean - 10);
  }

  return attrs;
};

const generateRBAttributes = (rng: SeededRandom, tier: number): RBAttributes => {
  const baseMean = tierToBaseMean(tier as 1 | 2 | 3 | 4 | 5);
  const isPowerBack = rng.next() < 0.4;

  return {
    carrying: generateAttribute(rng, baseMean + 5),
    breakTackle: generateAttribute(rng, baseMean + (isPowerBack ? 8 : 0)),
    trucking: generateAttribute(rng, baseMean + (isPowerBack ? 10 : -5)),
    elusiveness: generateAttribute(rng, baseMean + (isPowerBack ? -5 : 8)),
    spinMove: generateAttribute(rng, baseMean + (isPowerBack ? -3 : 5)),
    jukeMove: generateAttribute(rng, baseMean + (isPowerBack ? -3 : 5)),
    stiffArm: generateAttribute(rng, baseMean + (isPowerBack ? 5 : -3)),
    ballCarrierVision: generateAttribute(rng, baseMean),
    catching: generateAttribute(rng, baseMean - 5),
    passBlock: generateAttribute(rng, baseMean - 10),
  };
};

const generateWRAttributes = (rng: SeededRandom, tier: number): WRAttributes => {
  const baseMean = tierToBaseMean(tier as 1 | 2 | 3 | 4 | 5);
  const isDeepThreat = rng.next() < 0.3;
  const isSlotWR = rng.next() < 0.35;

  return {
    catching: generateAttribute(rng, baseMean + 3),
    catchInTraffic: generateAttribute(rng, baseMean + (isSlotWR ? 5 : -3)),
    spectacularCatch: generateAttribute(rng, baseMean - 5, 20),
    release: generateAttribute(rng, baseMean),
    routeRunning: generateAttribute(rng, baseMean),
    shortRoutes: generateAttribute(rng, baseMean + (isSlotWR ? 5 : 0)),
    mediumRoutes: generateAttribute(rng, baseMean),
    deepRoutes: generateAttribute(rng, baseMean + (isDeepThreat ? 8 : -3)),
  };
};

const generateTEAttributes = (rng: SeededRandom, tier: number): TEAttributes => {
  const baseMean = tierToBaseMean(tier as 1 | 2 | 3 | 4 | 5);
  const isReceivingTE = rng.next() < 0.5;

  return {
    catching: generateAttribute(rng, baseMean + (isReceivingTE ? 5 : -5)),
    catchInTraffic: generateAttribute(rng, baseMean + (isReceivingTE ? 3 : -3)),
    spectacularCatch: generateAttribute(rng, baseMean - 8),
    release: generateAttribute(rng, baseMean - 5),
    routeRunning: generateAttribute(rng, baseMean + (isReceivingTE ? 3 : -8)),
    runBlock: generateAttribute(rng, baseMean + (isReceivingTE ? -5 : 5)),
    passBlock: generateAttribute(rng, baseMean + (isReceivingTE ? -5 : 3)),
  };
};

const generateOLAttributes = (rng: SeededRandom, tier: number): OLAttributes => {
  const baseMean = tierToBaseMean(tier as 1 | 2 | 3 | 4 | 5);
  const isPowerBlocker = rng.next() < 0.5;

  return {
    runBlock: generateAttribute(rng, baseMean + 3),
    runBlockPower: generateAttribute(rng, baseMean + (isPowerBlocker ? 8 : -3)),
    runBlockFinesse: generateAttribute(rng, baseMean + (isPowerBlocker ? -3 : 8)),
    passBlock: generateAttribute(rng, baseMean + 3),
    passBlockPower: generateAttribute(rng, baseMean + (isPowerBlocker ? 5 : -3)),
    passBlockFinesse: generateAttribute(rng, baseMean + (isPowerBlocker ? -3 : 5)),
    leadBlock: generateAttribute(rng, baseMean - 5),
    impactBlocking: generateAttribute(rng, baseMean),
  };
};

const generateDLAttributes = (rng: SeededRandom, tier: number): DLAttributes => {
  const baseMean = tierToBaseMean(tier as 1 | 2 | 3 | 4 | 5);
  const isPassRusher = rng.next() < 0.5;

  return {
    tackling: generateAttribute(rng, baseMean),
    hitPower: generateAttribute(rng, baseMean + 3),
    blockShedding: generateAttribute(rng, baseMean + 3),
    powerMoves: generateAttribute(rng, baseMean + (isPassRusher ? 5 : 0)),
    finesseMoves: generateAttribute(rng, baseMean + (isPassRusher ? 3 : -3)),
    pursuit: generateAttribute(rng, baseMean),
    playRecognition: generateAttribute(rng, baseMean - 3),
  };
};

const generateLBAttributes = (rng: SeededRandom, tier: number): LBAttributes => {
  const baseMean = tierToBaseMean(tier as 1 | 2 | 3 | 4 | 5);
  const isCoverageLB = rng.next() < 0.35;

  const attrs: LBAttributes = {
    tackling: generateAttribute(rng, baseMean + 3),
    hitPower: generateAttribute(rng, baseMean + (isCoverageLB ? -3 : 5)),
    pursuit: generateAttribute(rng, baseMean + 3),
    playRecognition: generateAttribute(rng, baseMean),
    zoneCoverage: generateAttribute(rng, baseMean + (isCoverageLB ? 5 : -5)),
    manCoverage: generateAttribute(rng, baseMean + (isCoverageLB ? 3 : -8)),
    blockShedding: generateAttribute(rng, baseMean),
  };

  // OLB pass rush specialist
  if (!isCoverageLB && rng.next() < 0.4) {
    attrs.powerMoves = generateAttribute(rng, baseMean);
    attrs.finesseMoves = generateAttribute(rng, baseMean);
  }

  return attrs;
};

const generateDBAttributes = (rng: SeededRandom, tier: number): DBAttributes => {
  const baseMean = tierToBaseMean(tier as 1 | 2 | 3 | 4 | 5);
  const isBallHawk = rng.next() < 0.3;

  return {
    tackling: generateAttribute(rng, baseMean - 5),
    hitPower: generateAttribute(rng, baseMean - 8),
    manCoverage: generateAttribute(rng, baseMean + 3),
    zoneCoverage: generateAttribute(rng, baseMean + 3),
    press: generateAttribute(rng, baseMean),
    playRecognition: generateAttribute(rng, baseMean),
    pursuit: generateAttribute(rng, baseMean),
    catching: generateAttribute(rng, baseMean + (isBallHawk ? 8 : -5)),
  };
};

const generateKickerAttributes = (rng: SeededRandom, tier: number): KickerAttributes => {
  const baseMean = tierToBaseMean(tier as 1 | 2 | 3 | 4 | 5);

  return {
    kickPower: generateAttribute(rng, baseMean + 5),
    kickAccuracy: generateAttribute(rng, baseMean + 5),
  };
};

const generatePunterAttributes = (rng: SeededRandom, tier: number): PunterAttributes => {
  const baseMean = tierToBaseMean(tier as 1 | 2 | 3 | 4 | 5);

  return {
    kickPower: generateAttribute(rng, baseMean + 5),
    kickAccuracy: generateAttribute(rng, baseMean),
  };
};

const generatePositionAttributes = (
  rng: SeededRandom,
  position: Position,
  tier: number
): PositionAttributes => {
  const group = POSITION_TO_GROUP[position];

  switch (group) {
    case 'QB': return generateQBAttributes(rng, tier);
    case 'RB': return generateRBAttributes(rng, tier);
    case 'WR': return generateWRAttributes(rng, tier);
    case 'TE': return generateTEAttributes(rng, tier);
    case 'OL': return generateOLAttributes(rng, tier);
    case 'DL': return generateDLAttributes(rng, tier);
    case 'LB': return generateLBAttributes(rng, tier);
    case 'DB': return generateDBAttributes(rng, tier);
    case 'K': return generateKickerAttributes(rng, tier);
    case 'P': return generatePunterAttributes(rng, tier);
  }
};

// ============================================
// DEVELOPMENT TRAIT GENERATION
// ============================================

const generateDevelopment = (rng: SeededRandom, tier: number): DevelopmentTrait => {
  const roll = rng.next();

  // Higher tier = better chance of good development
  const superstarThreshold = 0.02 + (tier - 1) * 0.03;
  const starThreshold = superstarThreshold + 0.08 + (tier - 1) * 0.05;
  const normalThreshold = starThreshold + 0.40;

  if (roll < superstarThreshold) return 'superstar';
  if (roll < starThreshold) return 'star';
  if (roll < normalThreshold) return 'normal';
  return 'slow';
};

// ============================================
// PHYSICAL MEASUREMENTS
// ============================================

const generatePhysicalMeasurements = (
  rng: SeededRandom,
  position: Position
): { height: number; weight: number } => {
  const ranges = PHYSICAL_RANGES[position];

  const height = rng.nextInt(ranges.height[0], ranges.height[1]);
  const weight = rng.nextInt(ranges.weight[0], ranges.weight[1]);

  return { height, weight };
};

// ============================================
// MAIN PLAYER GENERATION
// ============================================

export interface PlayerGenerationOptions {
  position: Position;
  tier: 1 | 2 | 3 | 4 | 5;
  age: number;
  year: number;
  teamId: string;
  region?: string;
  seed?: number;
}

export const generatePlayer = (options: PlayerGenerationOptions): Player => {
  const { position, tier, age, year, teamId, region, seed } = options;

  const rng = new SeededRandom(seed ?? Date.now() + Math.random() * 10000);

  // Generate name
  const name = generateName(year - age + 18, region, seed);

  // Generate physical measurements
  const { height, weight } = generatePhysicalMeasurements(rng, position);

  // Generate attributes
  const physical = generatePhysicalAttributes(rng, position, tier);
  const mental = generateMentalAttributes(rng, tier);
  const positionAttributes = generatePositionAttributes(rng, position, tier);

  // Generate development trait
  const development = generateDevelopment(rng, tier);

  // Calculate potential (ceiling)
  const potentialBonus = development === 'superstar' ? 12
    : development === 'star' ? 8
    : development === 'normal' ? 4
    : 2;

  const tempOverall = calculateOverall(
    { position, physical, mental, positionAttributes } as any,
    position
  );

  const potential = Math.min(99, tempOverall + rng.nextInt(5, 10 + potentialBonus));

  // Determine college year based on age
  let collegeYear: CollegeYear = 'FR';
  if (age >= 22) collegeYear = 'SR';
  else if (age >= 21) collegeYear = 'JR';
  else if (age >= 20) collegeYear = 'SO';
  else if (age >= 19) collegeYear = rng.next() < 0.3 ? 'RS-FR' : 'FR';

  const eligibilityRemaining = 4 - (['FR', 'RS-FR'].includes(collegeYear) ? 0
    : ['SO', 'RS-SO'].includes(collegeYear) ? 1
    : ['JR', 'RS-JR'].includes(collegeYear) ? 2
    : 3);

  const player: Player = {
    id: `player-${seed ?? Date.now()}-${rng.nextInt(1000, 9999)}`,
    firstName: name.firstName,
    lastName: name.lastName,
    age,
    height,
    weight,
    position,
    year: collegeYear,
    eligibilityRemaining,
    overall: tempOverall,
    potential,
    development,
    physical,
    mental,
    positionAttributes,
    injured: false,
    injuryWeeksRemaining: 0,
    redshirted: false,
    hasUsedRedshirt: false,
    transferPortal: false,
    nflDeclared: false,
    teamId,
    experience: 0,
    careerStats: createEmptyStats(),
    seasonStats: createEmptyStats(),
    awards: [],
    createdYear: year,
    seed,
  };

  // Recalculate overall with full player object
  player.overall = calculateOverall(player, position);

  return player;
};

// ============================================
// RECRUIT GENERATION
// ============================================

export interface RecruitGenerationOptions {
  position?: Position;
  starRating?: RecruitStars;
  year: number;
  teamId?: string;
  region?: string;
  forceStars?: RecruitStars;
  seed?: number;
}

export const generateRecruit = (options: RecruitGenerationOptions): Player => {
  const { position: optPosition, starRating, year, teamId, region, forceStars, seed } = options;

  const rng = new SeededRandom(seed ?? Date.now() + Math.random() * 10000);

  // Determine star rating
  let stars: RecruitStars;
  if (starRating) {
    stars = starRating;
  } else if (forceStars) {
    stars = forceStars;
  } else {
    const roll = rng.next();
    let cumulative = 0;
    stars = 1;
    for (const [s, prob] of Object.entries(STAR_DISTRIBUTION) as [string, number][]) {
      cumulative += prob;
      if (roll < cumulative) {
        stars = parseInt(s) as RecruitStars;
        break;
      }
    }
  }

  // Determine position
  let position: Position;
  if (optPosition) {
    position = optPosition;
  } else {
    const positions: Position[] = [
      'QB', 'RB', 'WR', 'WR', 'WR', 'TE',
      'LT', 'LG', 'C', 'RG', 'RT',
      'DE', 'DE', 'DT',
      'OLB', 'OLB', 'MLB',
      'CB', 'CB', 'FS', 'SS',
      'K', 'P'
    ];
    position = positions[rng.nextInt(0, positions.length - 1)];
  }

  const tier = starsToTier(stars);
  const player = generatePlayer({
    position,
    tier,
    age: 18,
    year,
    teamId: teamId || '', // Not assigned yet
    region,
    seed: seed !== undefined ? seed + 1 : undefined,
  });

  // Add recruit-specific fields
  player.recruitStars = stars;
  player.homeState = region; // Simplified - would be a specific state

  return player;
};

// ============================================
// BATCH GENERATION
// ============================================

export const generateRecruitingClass = (
  year: number,
  count: number,
  baseSeed?: number
): Player[] => {
  const recruits: Player[] = [];

  // Calculate expected counts per star rating
  for (let i = 0; i < count; i++) {
    const seed = baseSeed !== undefined ? baseSeed + i : undefined;
    const recruit = generateRecruit({ year, seed });
    recruits.push(recruit);
  }

  // Sort by star rating (descending)
  return recruits.sort((a, b) => (b.recruitStars || 0) - (a.recruitStars || 0));
};
