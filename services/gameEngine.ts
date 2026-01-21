/**
 * LOCAL GAME ENGINE
 * Handles all deterministic logic client-side to reduce API calls.
 * Only narrative generation goes to Gemini.
 */

import { TurnLog, SaveHeader, TimelinePhase, JobOffer, SeasonSummary, CareerLog } from '../types';
import {
  getTeamById,
  getTeamsByLevel,
  getConferenceTeamsInYear,
  allTeams,
  Team,
  Level,
  PrestigeTier,
  PRESTIGE_NAMES,
  PRESTIGE_WIN_EXPECTATIONS,
  SeededRandom,
} from '../engine';

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const GAMES_PER_SEASON = 12;
const BOWL_ELIGIBLE_WINS = 6;

// Era-adjusted salary ranges (in thousands)
const SALARY_BY_ERA: Record<number, { hc: [number, number], coord: [number, number], pos: [number, number] }> = {
  1995: { hc: [150, 500], coord: [75, 200], pos: [40, 100] },
  2000: { hc: [300, 1200], coord: [150, 400], pos: [75, 200] },
  2005: { hc: [500, 2500], coord: [250, 800], pos: [100, 350] },
  2010: { hc: [800, 4000], coord: [400, 1500], pos: [150, 500] },
  2015: { hc: [1200, 6000], coord: [600, 2500], pos: [200, 800] },
  2020: { hc: [2000, 10000], coord: [1000, 4000], pos: [300, 1200] },
  2025: { hc: [2500, 12000], coord: [1500, 5000], pos: [400, 1500] },
};

const PRESTIGE_TIERS = ['Blue Blood', 'Power Program', 'Solid Mid-Major', 'Rebuild Project', 'Bottom Feeder'] as const;

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const getYearFromDate = (dateStr: string): number => {
  const match = dateStr.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : 1995;
};

export const parseRecord = (record: string): { wins: number; losses: number; ties: number } => {
  if (!record || record === '0-0') return { wins: 0, losses: 0, ties: 0 };
  const parts = record.split(/[-–]/).map(s => parseInt(s.trim(), 10));
  return {
    wins: isNaN(parts[0]) ? 0 : parts[0],
    losses: isNaN(parts[1]) ? 0 : parts[1],
    ties: parts.length > 2 && !isNaN(parts[2]) ? parts[2] : 0,
  };
};

export const getGamesPlayed = (record: string): number => {
  const { wins, losses, ties } = parseRecord(record);
  return wins + losses + ties;
};

export const formatRecord = (wins: number, losses: number, ties: number = 0): string => {
  return ties > 0 ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`;
};

// ============================================
// PHASE TRANSITION LOGIC (100% CLIENT-SIDE)
// ============================================

export interface PhaseTransition {
  nextPhase: TimelinePhase;
  nextDate: string;
  nextAge: number;
  nextRecord: string;
  requiresNarrative: boolean;
  narrativeType: 'game_block' | 'bowl' | 'carousel' | 'offseason' | 'preseason' | 'none';
  gamesThisBlock?: number;
}

export const calculatePhaseTransition = (header: SaveHeader): PhaseTransition => {
  const currentYear = getYearFromDate(header.date);
  const gamesPlayed = getGamesPlayed(header.seasonRecord);
  const { wins } = parseRecord(header.seasonRecord);

  switch (header.timelinePhase) {
    case 'Offseason':
      return {
        nextPhase: 'Preseason',
        nextDate: `August ${currentYear}`,
        nextAge: header.age,
        nextRecord: '0-0',
        requiresNarrative: true,
        narrativeType: 'preseason',
      };

    case 'Preseason':
      return {
        nextPhase: 'Regular Season',
        nextDate: `September ${currentYear}`,
        nextAge: header.age,
        nextRecord: header.seasonRecord,
        requiresNarrative: true,
        narrativeType: 'game_block',
        gamesThisBlock: 4,
      };

    case 'Regular Season':
      if (gamesPlayed < 4) {
        return {
          nextPhase: 'Regular Season',
          nextDate: `September ${currentYear}`,
          nextAge: header.age,
          nextRecord: header.seasonRecord,
          requiresNarrative: true,
          narrativeType: 'game_block',
          gamesThisBlock: 4 - gamesPlayed,
        };
      } else if (gamesPlayed < 8) {
        return {
          nextPhase: 'Regular Season',
          nextDate: `October ${currentYear}`,
          nextAge: header.age,
          nextRecord: header.seasonRecord,
          requiresNarrative: true,
          narrativeType: 'game_block',
          gamesThisBlock: 4,
        };
      } else if (gamesPlayed < 12) {
        return {
          nextPhase: 'Regular Season',
          nextDate: `November ${currentYear}`,
          nextAge: header.age,
          nextRecord: header.seasonRecord,
          requiresNarrative: true,
          narrativeType: 'game_block',
          gamesThisBlock: 4,
        };
      } else {
        // Season complete
        if (wins >= BOWL_ELIGIBLE_WINS) {
          return {
            nextPhase: 'Postseason',
            nextDate: `December ${currentYear}`,
            nextAge: header.age,
            nextRecord: header.seasonRecord,
            requiresNarrative: true,
            narrativeType: 'bowl',
          };
        } else {
          return {
            nextPhase: 'Carousel',
            nextDate: `December ${currentYear}`,
            nextAge: header.age,
            nextRecord: header.seasonRecord,
            requiresNarrative: true,
            narrativeType: 'carousel',
          };
        }
      }

    case 'Postseason':
      return {
        nextPhase: 'Carousel',
        nextDate: `January ${currentYear + 1}`,
        nextAge: header.age + 1,
        nextRecord: header.seasonRecord,
        requiresNarrative: true,
        narrativeType: 'carousel',
      };

    case 'Carousel':
      return {
        nextPhase: 'Offseason',
        nextDate: `February ${currentYear}`,
        nextAge: header.age,
        nextRecord: '0-0',
        requiresNarrative: true,
        narrativeType: 'offseason',
      };

    default:
      return {
        nextPhase: header.timelinePhase,
        nextDate: header.date,
        nextAge: header.age,
        nextRecord: header.seasonRecord,
        requiresNarrative: false,
        narrativeType: 'none',
      };
  }
};

// ============================================
// GAME SIMULATION (LOCAL RANDOM)
// ============================================

export interface SimulatedGames {
  newRecord: string;
  results: Array<{ opponent: string; result: 'W' | 'L'; score: string }>;
}

// Get opponents from real team database
const getOpponentsForTeam = (
  teamId: string,
  level: Level,
  conference: string,
  year: number,
  seed?: number
): Team[] => {
  // Get conference opponents
  const conferenceTeams = getConferenceTeamsInYear(conference, year)
    .filter(t => t.id !== teamId);

  // Get some non-conference opponents from same level
  const levelTeams = getTeamsByLevel(level)
    .filter(t => t.id !== teamId && t.conference !== conference);

  // Shuffle using seed for reproducibility
  const rng = seed ? new SeededRandom(seed) : { next: () => Math.random() };
  const shuffled = [...levelTeams].sort(() => rng.next() - 0.5);
  const nonConf = shuffled.slice(0, 4);

  return [...conferenceTeams, ...nonConf];
};

export interface SimulateGameBlockOptions {
  currentRecord: string;
  gamesToPlay: number;
  prestige: string;
  fanSentiment: number;
  // New team-aware options
  teamId?: string;
  level?: Level;
  conference?: string;
  year?: number;
  seed?: number;
  gamesPlayedSoFar?: number;
}

export const simulateGameBlock = (
  currentRecord: string,
  gamesToPlay: number,
  prestige: string,
  fanSentiment: number,
  options?: Partial<SimulateGameBlockOptions>
): SimulatedGames => {
  const { wins: currentWins, losses: currentLosses } = parseRecord(currentRecord);
  const rng = options?.seed ? new SeededRandom(options.seed) : { next: () => Math.random() };

  // Get opponents from real team database if we have team context
  let availableOpponents: Team[] = [];
  if (options?.teamId && options?.level && options?.conference && options?.year) {
    availableOpponents = getOpponentsForTeam(
      options.teamId,
      options.level,
      options.conference,
      options.year,
      options.seed
    );
  }

  // Convert prestige string to tier for lookup
  const prestigeTier = Object.entries(PRESTIGE_NAMES).find(
    ([_, name]) => name === prestige
  )?.[0] as PrestigeTier | undefined;

  // Win probability based on prestige using real expectations
  let baseWinPct = prestigeTier
    ? PRESTIGE_WIN_EXPECTATIONS[Number(prestigeTier) as PrestigeTier]
    : 0.5;

  // Momentum adjustment
  const totalGames = currentWins + currentLosses;
  if (totalGames > 0) {
    const currentWinPct = currentWins / totalGames;
    baseWinPct = (baseWinPct + currentWinPct) / 2; // Blend
  }

  // Fan sentiment slight boost/penalty
  baseWinPct += (fanSentiment - 50) / 500;

  const results: SimulatedGames['results'] = [];
  let newWins = currentWins;
  let newLosses = currentLosses;

  const gamesAlreadyPlayed = options?.gamesPlayedSoFar ?? totalGames;

  for (let i = 0; i < gamesToPlay; i++) {
    // Get opponent from real database or generate name
    let opponentName: string;
    let opponentPrestige: PrestigeTier = 3;

    const gameIndex = gamesAlreadyPlayed + i;
    if (availableOpponents.length > 0) {
      const oppIndex = gameIndex % availableOpponents.length;
      const opp = availableOpponents[oppIndex];
      opponentName = opp.nickname;
      opponentPrestige = opp.prestige;
    } else {
      // Fallback to simple names
      const fallbackNames = [
        'State', 'Tech', 'A&M', 'Tigers', 'Bulldogs', 'Bears', 'Wildcats',
        'Spartans', 'Wolverines', 'Buckeyes', 'Longhorns', 'Sooners',
        'Ducks', 'Trojans', 'Irish', 'Seminoles', 'Hurricanes', 'Gators'
      ];
      opponentName = fallbackNames[Math.floor(rng.next() * fallbackNames.length)];
    }

    // Adjust win probability based on opponent prestige
    const prestigeDiff = (prestigeTier ? Number(prestigeTier) : 3) - opponentPrestige;
    const adjustedWinPct = Math.max(0.1, Math.min(0.9, baseWinPct + (prestigeDiff * 0.08)));

    const isWin = rng.next() < adjustedWinPct;

    // Score generation with era-aware ranges
    const year = options?.year ?? 2024;
    const eraScoreMod = year >= 2015 ? 1.15 : year >= 2005 ? 1.05 : 1.0; // Higher scoring in modern era

    const baseScore = Math.floor(rng.next() * 28 * eraScoreMod) + 14;
    const ourScore = Math.min(63, Math.max(7, Math.round(baseScore)));

    const theirScore = isWin
      ? Math.floor(rng.next() * (ourScore - 3)) + 7
      : ourScore + Math.floor(rng.next() * 14) + 3;

    if (isWin) newWins++;
    else newLosses++;

    results.push({
      opponent: opponentName,
      result: isWin ? 'W' : 'L',
      score: `${ourScore}-${theirScore}`,
    });
  }

  return {
    newRecord: formatRecord(newWins, newLosses),
    results,
  };
};

// ============================================
// JOB SECURITY CALCULATION (LOCAL)
// ============================================

export const calculateJobSecurity = (
  wins: number,
  losses: number,
  prestige: string,
  fanSentiment: number,
  yearsAtJob: number
): string => {
  const winPct = (wins + losses) > 0 ? wins / (wins + losses) : 0.5;

  // Convert prestige string to tier and use real expectations
  const prestigeTier = Object.entries(PRESTIGE_NAMES).find(
    ([_, name]) => name === prestige
  )?.[0] as PrestigeTier | undefined;

  const expectation = prestigeTier
    ? PRESTIGE_WIN_EXPECTATIONS[Number(prestigeTier) as PrestigeTier]
    : 0.5;

  const delta = winPct - expectation;
  const honeymoon = yearsAtJob <= 2 ? 0.1 : 0;
  const fanBonus = (fanSentiment - 50) / 200;

  const securityScore = delta + honeymoon + fanBonus;

  if (securityScore > 0.15) return 'Secure - Extension Talks';
  if (securityScore > 0.05) return 'Stable';
  if (securityScore > -0.10) return 'Under Review';
  if (securityScore > -0.20) return 'Hot Seat';
  return 'Imminent Firing';
};

// ============================================
// SALARY GENERATION (ERA-ADJUSTED)
// ============================================

export const generateSalary = (year: number, role: string, prestige: string): string => {
  // Find closest era
  const eras = Object.keys(SALARY_BY_ERA).map(Number).sort((a, b) => a - b);
  let era = eras[0];
  for (const e of eras) {
    if (year >= e) era = e;
  }
  
  const ranges = SALARY_BY_ERA[era];
  const roleKey = role.toLowerCase().includes('head') ? 'hc' 
    : (role.toLowerCase().includes('coord') || role.toLowerCase().includes('oc') || role.toLowerCase().includes('dc')) ? 'coord' 
    : 'pos';
  
  const [min, max] = ranges[roleKey];
  
  // Prestige multiplier
  let mult = 1.0;
  if (prestige === 'Blue Blood') mult = 1.5;
  else if (prestige === 'Power Program') mult = 1.2;
  else if (prestige === 'Rebuild Project') mult = 0.8;
  else if (prestige === 'Bottom Feeder') mult = 0.6;
  
  const salary = Math.round((min + Math.random() * (max - min)) * mult);
  
  if (salary >= 1000) {
    return `$${(salary / 1000).toFixed(1)}M/yr`;
  }
  return `$${salary}k/yr`;
};

// ============================================
// APPLY TRANSITION TO STATE (PURE FUNCTION)
// ============================================

export const applyTransition = (
  currentHeader: SaveHeader, 
  transition: PhaseTransition,
  gameResults?: SimulatedGames
): SaveHeader => {
  const newHeader = { ...currentHeader };
  
  newHeader.timelinePhase = transition.nextPhase;
  newHeader.date = transition.nextDate;
  newHeader.age = transition.nextAge;
  
  if (gameResults) {
    newHeader.seasonRecord = gameResults.newRecord;
  } else if (transition.nextRecord) {
    newHeader.seasonRecord = transition.nextRecord;
  }
  
  // Recalculate job security
  const { wins, losses } = parseRecord(newHeader.seasonRecord);
  newHeader.jobSecurity = calculateJobSecurity(
    wins, 
    losses, 
    newHeader.stats.prestige,
    newHeader.fanSentiment,
    1 // TODO: track years at job
  );
  
  // Clear job offers on leaving carousel
  if (transition.nextPhase === 'Offseason' || transition.nextPhase === 'Preseason') {
    // Keep team context but reset season data
  }
  
  return newHeader;
};

// ============================================
// CHECK IF NARRATIVE IS NEEDED
// ============================================

export const needsAINarrative = (actionId: string, phase: TimelinePhase): boolean => {
  // Quick actions that don't need full AI generation
  const localOnlyActions = ['retry_connection', 'retry_init'];
  if (localOnlyActions.includes(actionId)) return false;
  
  // Carousel negotiations need AI
  if (actionId.includes('negotiate')) return true;
  
  // Major story beats need AI
  return true;
};

// ============================================
// BUILD MINIMAL CONTEXT FOR AI CALL
// ============================================

export const buildMinimalContext = (turn: TurnLog): string => {
  const h = turn.header;
  return JSON.stringify({
    d: h.date,
    t: h.team,
    r: h.role,
    rec: h.seasonRecord,
    ph: h.timelinePhase,
    sec: h.jobSecurity,
    fan: h.fanSentiment,
    pres: h.stats.prestige,
    threads: h.openThreads.slice(0, 3), // Limit to 3
    tags: h.reputationTags.slice(0, 3),
    // Only include offers if in carousel
    ...(h.timelinePhase === 'Carousel' && turn.jobOffers ? { offers: turn.jobOffers.map(o => ({ t: o.team, s: o.status })) } : {}),
  });
};
