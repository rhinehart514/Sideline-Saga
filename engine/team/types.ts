/**
 * TEAM TYPE SYSTEM
 * Team schema with prestige, conference, facilities for Sideline Saga
 */

// ============================================
// LEAGUE & LEVEL DEFINITIONS
// ============================================

export type League = 'ncaa' | 'nfl';
export type Level = 'fbs-p5' | 'fbs-g5' | 'fcs' | 'nfl';

// ============================================
// CONFERENCE DEFINITIONS
// ============================================

// Power 5 (by era - changes over time)
export type P5Conference = 'SEC' | 'Big Ten' | 'Big 12' | 'ACC' | 'Pac-12' | 'Pac-10' | 'Big East';

// Group of 5
export type G5Conference = 'AAC' | 'Mountain West' | 'Sun Belt' | 'MAC' | 'C-USA' | 'WAC' | 'Big West';

// FCS
export type FCSConference = 'Big Sky' | 'CAA' | 'Missouri Valley' | 'SWAC' | 'MEAC' | 'Southland' | 'Ohio Valley' | 'Pioneer' | 'Ivy' | 'Patriot' | 'Northeast' | 'Southern' | 'Independent';

// NFL
export type NFLConference = 'AFC' | 'NFC';
export type NFLDivision = 'East' | 'West' | 'North' | 'South';

export type Conference = P5Conference | G5Conference | FCSConference | NFLConference;

// ============================================
// PRESTIGE TIERS
// ============================================

export type PrestigeTier = 1 | 2 | 3 | 4 | 5;

export const PRESTIGE_NAMES: Record<PrestigeTier, string> = {
  5: 'Blue Blood',
  4: 'Power Program',
  3: 'Solid Program',
  2: 'Rebuild Project',
  1: 'Bottom Feeder',
};

export const PRESTIGE_WIN_EXPECTATIONS: Record<PrestigeTier, number> = {
  5: 0.75,  // Blue Blood: 9+ wins expected
  4: 0.65,  // Power Program: 8+ wins
  3: 0.55,  // Solid Program: 7 wins
  2: 0.40,  // Rebuild: 5 wins acceptable
  1: 0.30,  // Bottom Feeder: 4 wins is progress
};

// ============================================
// FACILITY & BUDGET TIERS
// ============================================

export type FacilityTier = 1 | 2 | 3 | 4 | 5;

export const FACILITY_DESCRIPTIONS: Record<FacilityTier, string> = {
  5: 'Elite - State of the art everything',
  4: 'Excellent - Top 25 facilities',
  3: 'Good - Competitive facilities',
  2: 'Adequate - Functional but dated',
  1: 'Poor - Needs major upgrades',
};

// ============================================
// LOCATION
// ============================================

export interface Location {
  city: string;
  state: string;
  region: 'Northeast' | 'Southeast' | 'Midwest' | 'Southwest' | 'West' | 'Pacific';
}

export const STATE_TO_REGION: Record<string, Location['region']> = {
  // Northeast
  CT: 'Northeast', DE: 'Northeast', MA: 'Northeast', MD: 'Northeast', ME: 'Northeast',
  NH: 'Northeast', NJ: 'Northeast', NY: 'Northeast', PA: 'Northeast', RI: 'Northeast',
  VT: 'Northeast', DC: 'Northeast',
  // Southeast
  AL: 'Southeast', AR: 'Southeast', FL: 'Southeast', GA: 'Southeast', KY: 'Southeast',
  LA: 'Southeast', MS: 'Southeast', NC: 'Southeast', SC: 'Southeast', TN: 'Southeast',
  VA: 'Southeast', WV: 'Southeast',
  // Midwest
  IA: 'Midwest', IL: 'Midwest', IN: 'Midwest', KS: 'Midwest', MI: 'Midwest',
  MN: 'Midwest', MO: 'Midwest', ND: 'Midwest', NE: 'Midwest', OH: 'Midwest',
  SD: 'Midwest', WI: 'Midwest',
  // Southwest
  AZ: 'Southwest', NM: 'Southwest', OK: 'Southwest', TX: 'Southwest',
  // West
  CO: 'West', ID: 'West', MT: 'West', NV: 'West', UT: 'West', WY: 'West',
  // Pacific
  AK: 'Pacific', CA: 'Pacific', HI: 'Pacific', OR: 'Pacific', WA: 'Pacific',
};

// ============================================
// ERA CONFERENCE MAPPING
// ============================================

export interface EraConference {
  1995?: string;
  1996?: string;
  1999?: string;
  2000?: string;
  2001?: string;
  2002?: string;
  2004?: string;
  2005?: string;
  2010?: string;
  2011?: string;
  2012?: string;
  2013?: string;
  2014?: string;
  2015?: string;
  2018?: string;
  2020?: string;
  2023?: string;
  2024?: string;
  2025?: string;
}

// ============================================
// TEAM INTERFACE
// ============================================

export interface Team {
  id: string;
  name: string;             // "Alabama"
  nickname: string;         // "Crimson Tide"
  abbreviation: string;     // "ALA" or "BAMA"

  // Classification
  league: League;
  level: Level;
  conference: Conference;
  division?: string;        // SEC West, AFC North, etc.

  // Identity
  primaryColor: string;     // Hex color
  secondaryColor: string;   // Hex color
  stadium: string;          // "Bryant-Denny Stadium"
  stadiumCapacity: number;  // 101821
  location: Location;

  // Program status (can change over time)
  prestige: PrestigeTier;
  facilities: FacilityTier;
  budget: number;           // Annual budget in thousands
  fanbasePassion: number;   // 1-100 intensity
  expectations: 'rebuild' | 'bowl' | 'contend' | 'championship';

  // Rivals
  primaryRival?: string;    // Team ID
  secondaryRivals: string[]; // Team IDs

  // Historical context
  nationalChampionships: number;
  conferenceChampionships: number;
  lastChampionshipYear?: number;
  notableCoaches: string[];

  // Conference realignment tracking
  eraConference?: EraConference;

  // Current state (runtime)
  currentRecord?: { wins: number; losses: number };
  currentRanking?: number;
  currentCoachId?: string;
  rosterId?: string;
}

// ============================================
// NFL-SPECIFIC EXTENSIONS
// ============================================

export interface NFLTeam extends Team {
  league: 'nfl';
  level: 'nfl';
  conference: NFLConference;
  division: NFLDivision;
  salaryCap?: number;       // Current cap space
  superBowlWins: number;
  superBowlAppearances: number;
}

// ============================================
// TEAM DATABASE SCHEMA
// ============================================

export interface TeamDatabase {
  fbsP5: Team[];
  fbsG5: Team[];
  fcs: Team[];
  nfl: NFLTeam[];
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getPrestigeName = (prestige: PrestigeTier): string => {
  return PRESTIGE_NAMES[prestige];
};

export const getConferenceForYear = (team: Team, year: number): string => {
  if (!team.eraConference) return team.conference;

  // Find the most recent era that's <= the current year
  const eras = Object.keys(team.eraConference)
    .map(Number)
    .filter(e => e <= year)
    .sort((a, b) => b - a);

  if (eras.length === 0) return team.conference;

  const eraKey = eras[0] as keyof EraConference;
  return team.eraConference[eraKey] || team.conference;
};

export const isBlueBlood = (team: Team): boolean => {
  return team.prestige === 5;
};

export const isPowerProgram = (team: Team): boolean => {
  return team.prestige >= 4;
};

export const isP5Team = (team: Team): boolean => {
  return team.level === 'fbs-p5';
};

export const isG5Team = (team: Team): boolean => {
  return team.level === 'fbs-g5';
};

export const isNFLTeam = (team: Team): team is NFLTeam => {
  return team.league === 'nfl';
};

// ============================================
// ROSTER LIMITS
// ============================================

export const ROSTER_LIMITS: Record<Level, { scholarship: number; active: number; practiceSquad?: number }> = {
  'fbs-p5': { scholarship: 85, active: 85 },
  'fbs-g5': { scholarship: 85, active: 85 },
  'fcs': { scholarship: 63, active: 63 },
  'nfl': { scholarship: 53, active: 53, practiceSquad: 16 },
};

// ============================================
// DEPTH CHART STRUCTURE
// ============================================

export interface DepthChartEntry {
  position: string;
  playerId: string;
  depth: number;  // 1 = starter, 2 = backup, etc.
}

export interface DepthChart {
  teamId: string;
  season: number;
  offense: DepthChartEntry[];
  defense: DepthChartEntry[];
  specialTeams: DepthChartEntry[];
}

// ============================================
// ROSTER INTERFACE
// ============================================

export interface Roster {
  id: string;
  teamId: string;
  season: number;
  playerIds: string[];
  depthChart: DepthChart;
  scholarshipCount: number;
  walkOnCount: number;
}
