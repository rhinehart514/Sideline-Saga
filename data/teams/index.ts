/**
 * TEAM DATABASE INDEX
 * Unified lookup facade for all teams
 */

import { Team, NFLTeam, Level, getConferenceForYear } from '../../engine/team/types';
import { fbsP5Teams, getP5TeamById, getP5TeamsByConference, getBlueBloodTeams } from './fbs-p5';
import { fbsG5Teams, getG5TeamById, getG5TeamsByConference } from './fbs-g5';
import { fcsTeams, getFCSTeamById, getFCSTeamsByConference, getTopFCSPrograms } from './fcs';
import { nflTeams, getNFLTeamById, getNFLTeamsByConference, getNFLTeamsByDivision, getSuperBowlWinners } from './nfl';

// ============================================
// ALL TEAMS COMBINED
// ============================================

export const allCollegeTeams: Team[] = [...fbsP5Teams, ...fbsG5Teams, ...fcsTeams];
export const allTeams: Team[] = [...allCollegeTeams, ...nflTeams];

// ============================================
// TEAM COUNTS
// ============================================

export const TEAM_COUNTS = {
  fbsP5: fbsP5Teams.length,
  fbsG5: fbsG5Teams.length,
  fcs: fcsTeams.length,
  nfl: nflTeams.length,
  totalCollege: fbsP5Teams.length + fbsG5Teams.length + fcsTeams.length,
  total: fbsP5Teams.length + fbsG5Teams.length + fcsTeams.length + nflTeams.length,
} as const;

// ============================================
// UNIVERSAL LOOKUP
// ============================================

export const getTeamById = (id: string): Team | undefined => {
  return getP5TeamById(id)
    || getG5TeamById(id)
    || getFCSTeamById(id)
    || getNFLTeamById(id);
};

export const getTeamsByLevel = (level: Level): Team[] => {
  switch (level) {
    case 'fbs-p5': return fbsP5Teams;
    case 'fbs-g5': return fbsG5Teams;
    case 'fcs': return fcsTeams;
    case 'nfl': return nflTeams;
    default: return [];
  }
};

export const getTeamsByConference = (conference: string): Team[] => {
  return [
    ...getP5TeamsByConference(conference),
    ...getG5TeamsByConference(conference),
    ...getFCSTeamsByConference(conference),
    ...getNFLTeamsByConference(conference as 'AFC' | 'NFC'),
  ];
};

// ============================================
// FILTERED LOOKUPS
// ============================================

export const getTeamsByPrestige = (minPrestige: number, maxPrestige?: number): Team[] => {
  const max = maxPrestige ?? 5;
  return allTeams.filter(team => team.prestige >= minPrestige && team.prestige <= max);
};

export const getTeamsByRegion = (region: string): Team[] => {
  return allTeams.filter(team => team.location.region === region);
};

export const getTeamsByState = (state: string): Team[] => {
  return allTeams.filter(team => team.location.state === state);
};

export const getRivalTeams = (teamId: string): Team[] => {
  const team = getTeamById(teamId);
  if (!team) return [];

  const rivals: Team[] = [];
  if (team.primaryRival) {
    const primary = getTeamById(team.primaryRival);
    if (primary) rivals.push(primary);
  }
  for (const rivalId of team.secondaryRivals) {
    const secondary = getTeamById(rivalId);
    if (secondary) rivals.push(secondary);
  }
  return rivals;
};

// ============================================
// ERA-AWARE LOOKUPS
// ============================================

export const getTeamConferenceInYear = (teamId: string, year: number): string | undefined => {
  const team = getTeamById(teamId);
  if (!team) return undefined;
  return getConferenceForYear(team, year);
};

export const getConferenceTeamsInYear = (conference: string, year: number): Team[] => {
  return allCollegeTeams.filter(team => {
    const teamConf = getConferenceForYear(team, year);
    return teamConf === conference;
  });
};

// ============================================
// RANDOM TEAM SELECTION
// ============================================

export const getRandomTeam = (level?: Level): Team => {
  const pool = level ? getTeamsByLevel(level) : allTeams;
  return pool[Math.floor(Math.random() * pool.length)];
};

export const getRandomTeamByPrestige = (minPrestige: number, maxPrestige?: number): Team => {
  const pool = getTeamsByPrestige(minPrestige, maxPrestige);
  return pool[Math.floor(Math.random() * pool.length)];
};

export const getRandomOpponent = (teamId: string, preferRival: boolean = false): Team => {
  const team = getTeamById(teamId);
  if (!team) return getRandomTeam();

  // Same level opponents
  const sameLevel = getTeamsByLevel(team.level).filter(t => t.id !== teamId);

  if (preferRival && Math.random() < 0.3) {
    const rivals = getRivalTeams(teamId);
    if (rivals.length > 0) {
      return rivals[Math.floor(Math.random() * rivals.length)];
    }
  }

  // Same conference preferred
  const sameConference = sameLevel.filter(t => t.conference === team.conference);
  if (sameConference.length > 0 && Math.random() < 0.7) {
    return sameConference[Math.floor(Math.random() * sameConference.length)];
  }

  return sameLevel[Math.floor(Math.random() * sameLevel.length)];
};

// ============================================
// JOB MARKET HELPERS
// ============================================

export interface JobOpening {
  team: Team;
  role: 'Head Coach' | 'Offensive Coordinator' | 'Defensive Coordinator' | 'Position Coach';
  attractiveness: number; // 1-100
}

export const generateJobOpenings = (
  count: number,
  minLevel: Level = 'fcs',
  coachReputation: number = 50
): JobOpening[] => {
  const levelOrder: Level[] = ['fcs', 'fbs-g5', 'fbs-p5', 'nfl'];
  const minLevelIndex = levelOrder.indexOf(minLevel);
  const availableLevels = levelOrder.slice(0, Math.min(minLevelIndex + 2, levelOrder.length));

  // Filter accessible teams based on reputation
  let pool = allTeams.filter(team => {
    if (!availableLevels.includes(team.level)) return false;

    // Higher reputation unlocks better teams
    const prestigeThreshold = Math.floor(coachReputation / 25) + 1; // 1-4 based on rep
    return team.prestige <= prestigeThreshold + 1;
  });

  // Shuffle and take requested count
  pool = pool.sort(() => Math.random() - 0.5).slice(0, count * 3);

  const openings: JobOpening[] = [];
  const roles: JobOpening['role'][] = ['Head Coach', 'Offensive Coordinator', 'Defensive Coordinator', 'Position Coach'];

  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const team = pool[i];

    // Role based on prestige and reputation
    let roleIndex = 0;
    if (team.prestige >= 4 && coachReputation < 70) {
      roleIndex = Math.min(roles.length - 1, Math.floor(Math.random() * 3) + 1); // Coord or below
    } else if (coachReputation >= 80) {
      roleIndex = Math.floor(Math.random() * 2); // HC or OC/DC
    } else {
      roleIndex = Math.floor(Math.random() * roles.length);
    }

    const role = roles[roleIndex];

    // Calculate attractiveness
    let attractiveness = team.prestige * 15 + team.fanbasePassion * 0.2;
    if (role === 'Head Coach') attractiveness += 10;
    if (team.level === 'nfl') attractiveness += 15;
    attractiveness = Math.min(100, Math.max(1, Math.round(attractiveness)));

    openings.push({ team, role, attractiveness });
  }

  return openings.sort((a, b) => b.attractiveness - a.attractiveness);
};

// ============================================
// RE-EXPORTS
// ============================================

export {
  fbsP5Teams,
  fbsG5Teams,
  fcsTeams,
  nflTeams,
  getBlueBloodTeams,
  getTopFCSPrograms,
  getSuperBowlWinners,
  getNFLTeamsByDivision,
};
