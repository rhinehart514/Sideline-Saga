/**
 * PLAYER TYPE SYSTEM
 * Position-specific attributes and player structure for Sideline Saga
 */

// ============================================
// POSITION DEFINITIONS
// ============================================

export type OffensivePosition = 'QB' | 'RB' | 'FB' | 'WR' | 'TE' | 'LT' | 'LG' | 'C' | 'RG' | 'RT';
export type DefensivePosition = 'DE' | 'DT' | 'NT' | 'OLB' | 'ILB' | 'MLB' | 'CB' | 'FS' | 'SS';
export type SpecialTeamsPosition = 'K' | 'P' | 'LS';
export type Position = OffensivePosition | DefensivePosition | SpecialTeamsPosition;

export type PositionGroup =
  | 'QB' | 'RB' | 'WR' | 'TE' | 'OL'
  | 'DL' | 'LB' | 'DB'
  | 'K' | 'P';

export const POSITION_TO_GROUP: Record<Position, PositionGroup> = {
  QB: 'QB', RB: 'RB', FB: 'RB', WR: 'WR', TE: 'TE',
  LT: 'OL', LG: 'OL', C: 'OL', RG: 'OL', RT: 'OL',
  DE: 'DL', DT: 'DL', NT: 'DL',
  OLB: 'LB', ILB: 'LB', MLB: 'LB',
  CB: 'DB', FS: 'DB', SS: 'DB',
  K: 'K', P: 'P', LS: 'K',
};

// ============================================
// COLLEGE ELIGIBILITY
// ============================================

export type CollegeYear = 'FR' | 'RS-FR' | 'SO' | 'RS-SO' | 'JR' | 'RS-JR' | 'SR' | 'RS-SR';
export type PlayerYear = CollegeYear | number; // number for NFL years

export const COLLEGE_YEAR_ORDER: CollegeYear[] = [
  'FR', 'RS-FR', 'SO', 'RS-SO', 'JR', 'RS-JR', 'SR', 'RS-SR'
];

// ============================================
// UNIVERSAL ATTRIBUTES
// ============================================

export interface PhysicalAttributes {
  speed: number;           // 1-99: 40-yard dash equivalent
  acceleration: number;    // 1-99: 0-10 yard burst
  strength: number;        // 1-99: Overall power
  agility: number;         // 1-99: Change of direction
  jumping: number;         // 1-99: Vertical leap
  stamina: number;         // 1-99: Endurance
  injury: number;          // 1-99: Injury resistance (durability)
  toughness: number;       // 1-99: Playing through pain
}

export interface MentalAttributes {
  awareness: number;       // 1-99: Football IQ, recognition
  clutch: number;          // 1-99: Performance in big moments
  consistency: number;     // 1-99: Game-to-game reliability
}

// ============================================
// POSITION-SPECIFIC ATTRIBUTES
// ============================================

export interface QBAttributes {
  throwPower: number;
  throwAccuracyShort: number;
  throwAccuracyMid: number;
  throwAccuracyDeep: number;
  throwOnRun: number;
  playAction: number;
  poise: number;           // Pocket composure under pressure
  release: number;         // Throwing motion speed
  // Dual-threat optional
  carrying?: number;
  breakTackle?: number;
}

export interface RBAttributes {
  carrying: number;        // Ball security
  breakTackle: number;
  trucking: number;        // Power running
  elusiveness: number;     // Juke/spin move effectiveness
  spinMove: number;
  jukeMove: number;
  stiffArm: number;
  ballCarrierVision: number;
  catching: number;
  passBlock: number;
}

export interface WRAttributes {
  catching: number;
  catchInTraffic: number;
  spectacularCatch: number;
  release: number;         // Off the line
  routeRunning: number;    // Overall route precision
  shortRoutes: number;
  mediumRoutes: number;
  deepRoutes: number;
}

export interface TEAttributes {
  catching: number;
  catchInTraffic: number;
  spectacularCatch: number;
  release: number;
  routeRunning: number;
  runBlock: number;
  passBlock: number;
}

export interface OLAttributes {
  runBlock: number;
  runBlockPower: number;
  runBlockFinesse: number;
  passBlock: number;
  passBlockPower: number;
  passBlockFinesse: number;
  leadBlock: number;
  impactBlocking: number;
}

export interface DLAttributes {
  tackling: number;
  hitPower: number;
  blockShedding: number;
  powerMoves: number;
  finesseMoves: number;
  pursuit: number;
  playRecognition: number;
}

export interface LBAttributes {
  tackling: number;
  hitPower: number;
  pursuit: number;
  playRecognition: number;
  zoneCoverage: number;
  manCoverage: number;
  blockShedding: number;
  // OLB rush specialist optional
  powerMoves?: number;
  finesseMoves?: number;
}

export interface DBAttributes {
  tackling: number;
  hitPower: number;
  manCoverage: number;
  zoneCoverage: number;
  press: number;
  playRecognition: number;
  pursuit: number;
  catching: number;        // Ball skills for interceptions
}

export interface KickerAttributes {
  kickPower: number;
  kickAccuracy: number;
}

export interface PunterAttributes {
  kickPower: number;
  kickAccuracy: number;
}

export type PositionAttributes =
  | QBAttributes
  | RBAttributes
  | WRAttributes
  | TEAttributes
  | OLAttributes
  | DLAttributes
  | LBAttributes
  | DBAttributes
  | KickerAttributes
  | PunterAttributes;

// ============================================
// DEVELOPMENT TRAITS
// ============================================

export type DevelopmentTrait = 'slow' | 'normal' | 'star' | 'superstar';

export const DEVELOPMENT_BASE_GAIN: Record<DevelopmentTrait, number> = {
  slow: 1,
  normal: 2,
  star: 3,
  superstar: 4,
};

// ============================================
// RECRUITING STARS
// ============================================

export type RecruitStars = 1 | 2 | 3 | 4 | 5;

// Star distribution: 5-star (1%), 4-star (10%), 3-star (30%), 2-star (40%), 1-star (19%)
export const STAR_DISTRIBUTION: Record<RecruitStars, number> = {
  5: 0.01,
  4: 0.10,
  3: 0.30,
  2: 0.40,
  1: 0.19,
};

// ============================================
// PLAYER INTERFACE
// ============================================

export interface Player {
  id: string;
  firstName: string;
  lastName: string;

  // Physical profile
  age: number;
  height: number;        // inches
  weight: number;        // lbs

  // Position & eligibility
  position: Position;
  year: PlayerYear;
  eligibilityRemaining: number;  // College: 0-4, NFL: N/A

  // Ratings
  overall: number;       // 1-99, calculated from attributes
  potential: number;     // Ceiling OVR
  development: DevelopmentTrait;

  // Universal attributes
  physical: PhysicalAttributes;
  mental: MentalAttributes;

  // Position-specific attributes
  positionAttributes: PositionAttributes;

  // Status flags
  injured: boolean;
  injuryWeeksRemaining: number;
  injuryType?: string;
  redshirted: boolean;
  hasUsedRedshirt: boolean;
  transferPortal: boolean;
  nflDeclared: boolean;

  // Career tracking
  teamId: string;
  experience: number;         // Years played at current level
  careerStats: PlayerStats;
  seasonStats: PlayerStats;
  awards: string[];

  // Recruiting (college players only)
  recruitStars?: RecruitStars;
  homeState?: string;

  // Generated metadata
  createdYear: number;
  seed?: number;         // For deterministic regeneration
}

// ============================================
// PLAYER STATS
// ============================================

export interface PlayerStats {
  // Passing
  passAttempts: number;
  passCompletions: number;
  passYards: number;
  passTDs: number;
  interceptions: number;

  // Rushing
  rushAttempts: number;
  rushYards: number;
  rushTDs: number;
  fumbles: number;

  // Receiving
  receptions: number;
  receivingYards: number;
  receivingTDs: number;

  // Defense
  tackles: number;
  tacklesForLoss: number;
  sacks: number;
  forcedFumbles: number;
  fumblesRecovered: number;
  interceptionsDefense: number;
  passesDefended: number;

  // Kicking
  fgAttempts: number;
  fgMade: number;
  fgLong: number;
  xpAttempts: number;
  xpMade: number;

  // Punting
  punts: number;
  puntYards: number;
  puntLong: number;
  puntsInside20: number;

  // Games
  gamesPlayed: number;
  gamesStarted: number;
}

export const createEmptyStats = (): PlayerStats => ({
  passAttempts: 0,
  passCompletions: 0,
  passYards: 0,
  passTDs: 0,
  interceptions: 0,
  rushAttempts: 0,
  rushYards: 0,
  rushTDs: 0,
  fumbles: 0,
  receptions: 0,
  receivingYards: 0,
  receivingTDs: 0,
  tackles: 0,
  tacklesForLoss: 0,
  sacks: 0,
  forcedFumbles: 0,
  fumblesRecovered: 0,
  interceptionsDefense: 0,
  passesDefended: 0,
  fgAttempts: 0,
  fgMade: 0,
  fgLong: 0,
  xpAttempts: 0,
  xpMade: 0,
  punts: 0,
  puntYards: 0,
  puntLong: 0,
  puntsInside20: 0,
  gamesPlayed: 0,
  gamesStarted: 0,
});

// ============================================
// OVR CALCULATION WEIGHTS
// ============================================

export const POSITION_WEIGHTS: Record<PositionGroup, Record<string, number>> = {
  QB: {
    throwPower: 0.08,
    throwAccuracyShort: 0.15,
    throwAccuracyMid: 0.15,
    throwAccuracyDeep: 0.10,
    throwOnRun: 0.08,
    playAction: 0.05,
    poise: 0.12,
    release: 0.08,
    speed: 0.04,
    awareness: 0.15,
  },
  RB: {
    speed: 0.12,
    acceleration: 0.10,
    agility: 0.08,
    carrying: 0.12,
    breakTackle: 0.10,
    trucking: 0.05,
    elusiveness: 0.10,
    ballCarrierVision: 0.12,
    catching: 0.08,
    awareness: 0.08,
    stamina: 0.05,
  },
  WR: {
    speed: 0.15,
    acceleration: 0.08,
    catching: 0.18,
    catchInTraffic: 0.10,
    routeRunning: 0.15,
    shortRoutes: 0.08,
    mediumRoutes: 0.08,
    deepRoutes: 0.06,
    release: 0.07,
    awareness: 0.05,
  },
  TE: {
    catching: 0.15,
    catchInTraffic: 0.10,
    routeRunning: 0.12,
    runBlock: 0.18,
    passBlock: 0.10,
    speed: 0.10,
    strength: 0.10,
    awareness: 0.10,
    stamina: 0.05,
  },
  OL: {
    runBlock: 0.18,
    runBlockPower: 0.10,
    runBlockFinesse: 0.08,
    passBlock: 0.18,
    passBlockPower: 0.10,
    passBlockFinesse: 0.08,
    strength: 0.12,
    awareness: 0.10,
    stamina: 0.06,
  },
  DL: {
    tackling: 0.10,
    blockShedding: 0.15,
    powerMoves: 0.15,
    finesseMoves: 0.12,
    pursuit: 0.10,
    playRecognition: 0.12,
    strength: 0.12,
    speed: 0.06,
    stamina: 0.08,
  },
  LB: {
    tackling: 0.15,
    pursuit: 0.12,
    playRecognition: 0.15,
    zoneCoverage: 0.12,
    manCoverage: 0.08,
    blockShedding: 0.10,
    speed: 0.10,
    hitPower: 0.08,
    awareness: 0.10,
  },
  DB: {
    manCoverage: 0.18,
    zoneCoverage: 0.15,
    press: 0.10,
    playRecognition: 0.12,
    speed: 0.15,
    tackling: 0.10,
    catching: 0.10,
    awareness: 0.10,
  },
  K: {
    kickPower: 0.35,
    kickAccuracy: 0.55,
    awareness: 0.10,
  },
  P: {
    kickPower: 0.40,
    kickAccuracy: 0.50,
    awareness: 0.10,
  },
};

// ============================================
// PHYSICAL RANGES BY POSITION
// ============================================

export interface PhysicalRange {
  height: [number, number];  // min, max inches
  weight: [number, number];  // min, max lbs
}

export const PHYSICAL_RANGES: Record<Position, PhysicalRange> = {
  QB: { height: [72, 78], weight: [195, 245] },
  RB: { height: [67, 73], weight: [185, 235] },
  FB: { height: [70, 75], weight: [230, 260] },
  WR: { height: [69, 77], weight: [170, 220] },
  TE: { height: [74, 79], weight: [235, 270] },
  LT: { height: [76, 80], weight: [295, 340] },
  LG: { height: [74, 79], weight: [300, 345] },
  C: { height: [73, 78], weight: [290, 320] },
  RG: { height: [74, 79], weight: [300, 345] },
  RT: { height: [76, 80], weight: [295, 340] },
  DE: { height: [74, 79], weight: [250, 290] },
  DT: { height: [73, 78], weight: [285, 340] },
  NT: { height: [72, 76], weight: [310, 360] },
  OLB: { height: [73, 77], weight: [225, 260] },
  ILB: { height: [72, 76], weight: [230, 255] },
  MLB: { height: [72, 76], weight: [235, 260] },
  CB: { height: [69, 75], weight: [175, 210] },
  FS: { height: [70, 75], weight: [185, 215] },
  SS: { height: [71, 76], weight: [195, 225] },
  K: { height: [69, 75], weight: [175, 210] },
  P: { height: [71, 77], weight: [195, 225] },
  LS: { height: [73, 77], weight: [235, 260] },
};

// ============================================
// OVR TIER THRESHOLDS
// ============================================

export const OVR_TIERS = {
  ELITE: 90,        // All-American, Pro Bowl, All-Pro
  STARTER: 80,      // Solid starter, above average
  ROTATION: 70,     // Spot starter, key backup
  DEPTH: 60,        // Special teams, emergency
  PROJECT: 50,      // Raw, developmental
  ROSTER_FILL: 0,   // Walk-on level
} as const;

export type OvrTierName = 'Elite' | 'Starter' | 'Rotation' | 'Depth' | 'Project' | 'RosterFill';

export const getOvrTier = (ovr: number): OvrTierName => {
  if (ovr >= OVR_TIERS.ELITE) return 'Elite';
  if (ovr >= OVR_TIERS.STARTER) return 'Starter';
  if (ovr >= OVR_TIERS.ROTATION) return 'Rotation';
  if (ovr >= OVR_TIERS.DEPTH) return 'Depth';
  if (ovr >= OVR_TIERS.PROJECT) return 'Project';
  return 'RosterFill';
};
