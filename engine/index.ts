/**
 * SIDELINE SAGA ENGINE
 * Unified exports for the local game engine
 *
 * This module integrates all engine components:
 * - Player generation and ratings
 * - Team databases and roster management
 * - Local narrative generation
 * - IndexedDB persistence
 */

// ============================================
// PLAYER MODULE
// ============================================

export * from './player';

// ============================================
// TEAM MODULE
// ============================================

export * from './team';

// ============================================
// NARRATIVE MODULE
// ============================================

export * from './narrative';

// ============================================
// PERSISTENCE MODULE
// ============================================

export * from './persistence';

// ============================================
// RE-EXPORT DATA MODULES
// ============================================

// Teams database
export {
  getTeamById,
  getTeamsByLevel,
  getTeamsByConference,
  getConferenceTeamsInYear,
  allTeams,
  nflTeams,
  generateJobOpenings,
} from '../data/teams';

// Name generation
export {
  generateName,
  generateNameBatch,
  generateCoachName,
  generateNickname,
  SeededRandom,
} from '../data/names';

// Templates
export {
  selectHeadline,
  selectScene,
  selectChoiceSet,
  replaceTokens,
  generateNarrativeBlock,
} from '../data/templates';

// ============================================
// INTEGRATION HELPERS
// ============================================

import { Team, NFLTeam, Level } from './team/types';
import { generateRoster, Roster, generateRecruitingClass } from './team/roster';
import { generateDepthChart, DepthChart } from './team/depthChart';
import { generateLocalNarrative, GeneratedGameBlock } from './narrative/generator';
import { GameContext } from './narrative/templateEngine';
import { getTeamById } from '../data/teams';
import { generateCoachName } from '../data/names';
import { saveGame, loadGame, quickSave, autoMigrate, GameSaveData } from './persistence';
import { SaveHeader, TimelinePhase, JobOffer } from '../types';

/**
 * Initialize a new game with a team
 */
export interface NewGameOptions {
  coachFirstName: string;
  coachLastName: string;
  teamId: string;
  startYear?: number;
  seed?: number;
}

export interface InitializedGame {
  coachName: string;
  team: Team | NFLTeam;
  level: Level;
  roster: Roster;
  depthChart: DepthChart;
  season: number;
  seed: number;
}

export const initializeNewGame = (options: NewGameOptions): InitializedGame => {
  const { coachFirstName, coachLastName, teamId, startYear = 2024, seed = Date.now() } = options;

  const team = getTeamById(teamId);
  if (!team) {
    throw new Error(`Team not found: ${teamId}`);
  }

  const level = team.level;
  const roster = generateRoster({
    team,
    level,
    season: startYear,
    seed,
  });
  const depthChart = generateDepthChart(roster);

  return {
    coachName: `${coachFirstName} ${coachLastName}`,
    team,
    level,
    roster,
    depthChart,
    season: startYear,
    seed,
  };
};

/**
 * Convert existing SaveHeader to GameContext for narrative generation
 */
export const saveHeaderToGameContext = (
  header: SaveHeader,
  teamData?: Team | NFLTeam
): GameContext => {
  const team: Team | NFLTeam = teamData || {
    id: 'unknown',
    name: header.team.split(' ')[0] || header.team,
    nickname: header.team.split(' ').slice(1).join(' ') || header.team,
    abbreviation: header.team.substring(0, 3).toUpperCase(),
    conference: header.conference as any,
    league: 'ncaa' as const,
    level: 'fbs-p5' as Level,
    prestige: (header.stats.prestige === 'Blue Blood' ? 5 : 3) as 1 | 2 | 3 | 4 | 5,
    facilities: 3 as 1 | 2 | 3 | 4 | 5,
    budget: 50000,
    fanbasePassion: 50,
    expectations: 'bowl' as const,
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    stadium: 'Stadium',
    stadiumCapacity: 60000,
    location: { city: 'Unknown', state: 'XX', region: 'Midwest' as const },
    secondaryRivals: [],
    nationalChampionships: 0,
    conferenceChampionships: 0,
    notableCoaches: [],
  };

  // Parse record
  const recordParts = header.seasonRecord.split('-').map(n => parseInt(n) || 0);
  const wins = recordParts[0] || 0;
  const losses = recordParts[1] || 0;

  // Calculate job security as number
  let jobSecurityNum = 50;
  if (header.jobSecurity.includes('Secure')) jobSecurityNum = 85;
  else if (header.jobSecurity.includes('Stable')) jobSecurityNum = 70;
  else if (header.jobSecurity.includes('Review')) jobSecurityNum = 45;
  else if (header.jobSecurity.includes('Hot')) jobSecurityNum = 25;
  else if (header.jobSecurity.includes('Firing')) jobSecurityNum = 10;

  // Parse coach name
  const nameParts = (header.role.replace('Head Coach', '').trim() || 'Coach Smith').split(' ');
  const coachFirst = nameParts[0] || 'Coach';
  const coachLast = nameParts.slice(1).join(' ') || 'Smith';

  // Generate a featured player for narrative variety
  // Use a simple hash of team name and season for consistent but varied names
  const year = parseInt(header.date.match(/\d{4}/)?.[0] || '2024');
  const playerFirstNames = ['Marcus', 'DeShawn', 'Tyler', 'Jordan', 'Cameron', 'Jaylen', 'Malik', 'Bryce', 'Jalen', 'Trey'];
  const playerLastNames = ['Williams', 'Johnson', 'Davis', 'Jackson', 'Smith', 'Jones', 'Brown', 'Wilson', 'Thomas', 'Anderson'];
  const positions = ['QB', 'RB', 'WR', 'LB', 'CB', 'DE'] as const;
  const hashVal = (header.team.length + wins + losses + year) % 10;
  const posIdx = hashVal % positions.length;

  return {
    team,
    coach: {
      firstName: coachFirst,
      lastName: coachLast,
      fullName: `${coachFirst} ${coachLast}`,
    },
    season: year,
    record: { wins, losses },
    jobSecurity: jobSecurityNum,
    featuredPlayer: {
      id: `player-${hashVal}`,
      firstName: playerFirstNames[hashVal],
      lastName: playerLastNames[(hashVal + 3) % 10],
      position: positions[posIdx],
      age: 20 + (hashVal % 3),
      year: (['Freshman', 'Sophomore', 'Junior', 'Senior'] as const)[(hashVal % 4)],
      overall: 75 + (hashVal * 2),
      potential: 80 + hashVal,
      attributes: {} as any,
      development: 'normal' as const,
      personality: 'leader' as const,
      status: 'active' as const,
    },
  };
};

/**
 * Map TimelinePhase to narrative GamePhase
 */
export const timelineToGamePhase = (
  phase: TimelinePhase
): import('./narrative').GamePhase => {
  const mapping: Record<TimelinePhase, import('./narrative').GamePhase> = {
    'Preseason': 'preseason',
    'Regular Season': 'game_block',
    'Postseason': 'bowl',
    'Carousel': 'carousel',
    'Offseason': 'offseason',
  };
  return mapping[phase] || 'game_block';
};

/**
 * Generate narrative for current game state
 */
export const generateNarrativeForState = (
  header: SaveHeader,
  team?: Team | NFLTeam,
  gameResult?: {
    isWin: boolean;
    score: { team: number; opponent: number };
    opponent: Team | NFLTeam;
  },
  seed?: number
): GeneratedGameBlock => {
  const context = saveHeaderToGameContext(header, team);
  const phase = timelineToGamePhase(header.timelinePhase);

  return generateLocalNarrative({
    phase,
    context,
    gameResult,
    seed,
  });
};

/**
 * Convert team database entry to JobOffer format
 */
export const teamToJobOffer = (
  team: Team,
  year: number,
  role: string = 'Head Coach'
): JobOffer => {
  const prestigeMap: Record<number, string> = {
    5: 'Blue Blood',
    4: 'Power Program',
    3: 'Solid Mid-Major',
    2: 'Rebuild Project',
    1: 'Bottom Feeder',
  };

  // Generate salary based on prestige and year
  const baseSalary = [150, 300, 600, 1200, 2500, 4000][Math.min(5, Math.floor((year - 1995) / 5))];
  const multiplier = [0.6, 0.8, 1.0, 1.3, 1.6][team.prestige - 1];
  const salary = Math.round(baseSalary * multiplier);
  const salaryStr = salary >= 1000 ? `$${(salary / 1000).toFixed(1)}M/yr` : `$${salary}k/yr`;

  const pitches = [
    `We need someone to restore glory to ${team.nickname} football.`,
    `The ${team.nickname} faithful are hungry for a winner.`,
    `${team.name} is ready to compete at the highest level.`,
    `We believe you're the right fit for ${team.nickname} culture.`,
    `This is a chance to build something special here.`,
  ];

  return {
    id: `offer_${team.id}_${year}`,
    team: `${team.name} ${team.nickname}`,
    role,
    conference: team.conference,
    prestige: prestigeMap[team.prestige] || 'Solid Mid-Major',
    salary: salaryStr,
    contractLength: `${3 + team.prestige} Years`,
    buyout: `$${(salary * 0.5).toFixed(1)}M`,
    pitch: pitches[Math.floor(Math.random() * pitches.length)],
    perks: team.prestige >= 4
      ? ['Private Jet Access', 'Recruiting Budget Increase', 'Staff Salary Pool']
      : ['Base Perks'],
    status: 'New',
    adPatience: team.prestige >= 4 ? 'Low' : team.prestige >= 2 ? 'Medium' : 'High',
  };
};

/**
 * Create GameSaveData from current game state
 */
export const createSaveData = (
  header: SaveHeader,
  team: Team | NFLTeam,
  compressedContext: string = ''
): GameSaveData => {
  const recordParts = header.seasonRecord.split('-').map(n => parseInt(n) || 0);

  return {
    currentYear: parseInt(header.date.match(/\d{4}/)?.[0] || '2024'),
    currentPhase: header.timelinePhase,
    coachName: header.role.replace('Head Coach', '').trim() || 'Coach',
    currentTeam: {
      id: team.id,
      name: team.name,
      nickname: team.nickname,
      level: team.level,
      conference: team.conference,
      prestige: team.prestige,
    },
    record: {
      wins: recordParts[0] || 0,
      losses: recordParts[1] || 0,
      championships: 0,
      bowlWins: 0,
      playoffAppearances: 0,
    },
    careerStats: {
      totalWins: header.careerHistory.reduce((sum, c) => {
        const w = parseInt(c.record.split('-')[0]) || 0;
        return sum + w;
      }, 0),
      totalLosses: header.careerHistory.reduce((sum, c) => {
        const l = parseInt(c.record.split('-')[1]) || 0;
        return sum + l;
      }, 0),
      yearsCoached: header.careerHistory.length,
      teamsCoached: [...new Set(header.careerHistory.map(c => c.team))],
      championships: header.careerHistory.filter(c => c.result.includes('Champion')).length,
      bowlWins: header.careerHistory.filter(c => c.result.includes('Bowl Win')).length,
    },
    jobSecurity: header.fanSentiment,
    fanSupport: header.fanSentiment,
    teamMorale: 50,
    compressedContext,
    seed: Date.now(),
  };
};

// ============================================
// STARTUP HELPER
// ============================================

/**
 * Initialize the engine on app startup
 * - Opens database connection
 * - Runs migrations if needed
 */
export const initializeEngine = async (): Promise<{
  migrationResult: import('./persistence').MigrationResult | null;
}> => {
  // Run auto-migration
  const migrationResult = await autoMigrate();

  return { migrationResult };
};
