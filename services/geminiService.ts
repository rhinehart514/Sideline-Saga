/**
 * OPTIMIZED GEMINI SERVICE
 * 
 * Changes from original:
 * 1. Uses proxy (no exposed API key)
 * 2. Uses local game engine for deterministic logic
 * 3. Caches responses to reduce API calls
 * 4. Reduced token usage (2048 vs 8192)
 * 5. Slimmed system prompt
 */

import { TurnLog, JobOffer } from '../types';
import { SYSTEM_INSTRUCTION_SLIM } from '../constants';
import {
  calculatePhaseTransition,
  simulateGameBlock,
  applyTransition,
  buildMinimalContext,
  getYearFromDate,
  parseRecord,
  PhaseTransition,
  SimulateGameBlockOptions,
} from './gameEngine';
import { generateCacheKey, getCachedResponse, setCachedResponse } from './cache';
import {
  generateLocalNarrative,
  saveHeaderToGameContext,
  timelineToGamePhase,
  getTeamById,
  generateJobOpenings,
  teamToJobOffer,
  Team,
  NFLTeam,
} from '../engine';

// ============================================
// CONFIGURATION
// ============================================

// Set this to your Cloudflare Worker URL after deployment
// For local dev, falls back to direct API call
const PROXY_URL = import.meta.env.VITE_PROXY_URL || '';
const USE_PROXY = PROXY_URL.length > 0;

// Direct API fallback for local development only
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const DIRECT_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ============================================
// LOCAL-FIRST MODE CONFIGURATION
// ============================================

// When true, uses local narrative generation exclusively (no API calls)
// When false, uses AI for narrative with local fallback
let USE_LOCAL_FIRST = true; // Default to local - zero API calls

export const setLocalFirstMode = (enabled: boolean) => {
  USE_LOCAL_FIRST = enabled;
};

export const isLocalFirstMode = () => USE_LOCAL_FIRST;

// ============================================
// SCHEMA (Slimmed - only narrative fields for AI)
// ============================================

const narrativeSchema = {
  type: 'OBJECT',
  properties: {
    mediaHeadline: { type: 'STRING' },
    mediaBuzz: { type: 'STRING' },
    staffNotes: { type: 'STRING' },
    sceneDescription: { type: 'STRING' },
    resolution: { type: 'STRING' },
    openThreads: { 
      type: 'ARRAY', 
      items: { type: 'STRING' } 
    },
    choices: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          text: { type: 'STRING' },
          type: { type: 'STRING' },
        },
        required: ['id', 'text', 'type'],
      },
    },
    // Only for carousel phase
    jobOffers: {
      type: 'ARRAY',
      nullable: true,
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          team: { type: 'STRING' },
          role: { type: 'STRING' },
          conference: { type: 'STRING' },
          prestige: { type: 'STRING' },
          salary: { type: 'STRING' },
          contractLength: { type: 'STRING' },
          buyout: { type: 'STRING' },
          pitch: { type: 'STRING' },
          perks: { type: 'ARRAY', items: { type: 'STRING' } },
          status: { type: 'STRING' },
          adPatience: { type: 'STRING' }
        },
        required: ['id', 'team', 'role', 'pitch'],
      },
    },
    // Season summary for end of season
    seasonSummary: {
      type: 'OBJECT',
      nullable: true,
      properties: {
        year: { type: 'NUMBER' },
        finalRecord: { type: 'STRING' },
        accomplishment: { type: 'STRING' },
        keyStats: { type: 'ARRAY', items: { type: 'STRING' } },
        boardFeedback: { type: 'STRING' },
      },
    },
    gameOver: { type: 'BOOLEAN' },
  },
  required: ['sceneDescription', 'choices', 'gameOver'],
};

// Full schema for initialization (needs all header fields)
const initSchema = {
  type: 'OBJECT',
  properties: {
    header: {
      type: 'OBJECT',
      properties: {
        date: { type: 'STRING' },
        age: { type: 'NUMBER' },
        team: { type: 'STRING' },
        conference: { type: 'STRING' },
        role: { type: 'STRING' },
        seasonRecord: { type: 'STRING' },
        legacyScore: { type: 'NUMBER' },
        fanSentiment: { type: 'NUMBER' },
        timelinePhase: { type: 'STRING' },
        schemeOffense: { type: 'STRING' },
        schemeDefense: { type: 'STRING' },
        qbSituation: { type: 'STRING' },
        reputationTags: { type: 'ARRAY', items: { type: 'STRING' } },
        jobSecurity: { type: 'STRING' },
        openThreads: { type: 'ARRAY', items: { type: 'STRING' } },
        network: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              name: { type: 'STRING' },
              relation: { type: 'STRING' },
              currentRole: { type: 'STRING' },
              loyalty: { type: 'STRING' },
            },
            required: ['name', 'relation', 'currentRole', 'loyalty']
          }
        },
        stats: {
          type: 'OBJECT',
          properties: {
            apRank: { type: 'STRING' },
            confStanding: { type: 'STRING' },
            offRank: { type: 'STRING' },
            defRank: { type: 'STRING' },
            prestige: { type: 'STRING' }
          },
          required: ['apRank', 'confStanding', 'offRank', 'defRank', 'prestige']
        },
        careerHistory: { type: 'ARRAY', items: { type: 'OBJECT' } }
      },
      required: ['date', 'age', 'team', 'role', 'seasonRecord', 'timelinePhase'],
    },
    mediaHeadline: { type: 'STRING' },
    mediaBuzz: { type: 'STRING' },
    staffNotes: { type: 'STRING' },
    sceneDescription: { type: 'STRING' },
    choices: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          text: { type: 'STRING' },
          type: { type: 'STRING' },
        },
        required: ['id', 'text', 'type'],
      },
    },
    gameOver: { type: 'BOOLEAN' },
  },
  required: ['header', 'sceneDescription', 'choices', 'gameOver'],
};

// ============================================
// API CALL HELPERS
// ============================================

async function callGeminiViaProxy(prompt: string, schema: object, systemInstruction: string): Promise<string> {
  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      systemInstruction,
      schema,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    if (response.status === 429) {
      const retryAfter = error.retryAfter || 60;
      throw new Error(`Rate limit: retry in ${retryAfter}s`);
    }
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  const data = await response.json();
  return data.text;
}

async function callGeminiDirect(prompt: string, schema: object, systemInstruction: string): Promise<string> {
  if (!API_KEY) {
    throw new Error('No API key configured. Set VITE_GEMINI_API_KEY in .env.local');
  }
  
  const response = await fetch(`${DIRECT_API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        maxOutputTokens: 2048, // REDUCED from 8192
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${errorText}`);
  }
  
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callGemini(prompt: string, schema: object, systemInstruction: string): Promise<string> {
  if (USE_PROXY) {
    return callGeminiViaProxy(prompt, schema, systemInstruction);
  }
  return callGeminiDirect(prompt, schema, systemInstruction);
}

// ============================================
// RETRY LOGIC
// ============================================

async function withRetry<T>(operation: () => Promise<T>, retries = 2, delay = 2000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const isRateLimit = error.message?.includes('Rate limit') || error.message?.includes('429');
    
    if (retries > 0 && isRateLimit) {
      console.warn(`Rate limited. Retrying in ${delay}ms... (${retries} left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

// ============================================
// LOCAL NARRATIVE GENERATION
// ============================================

interface LocalNarrativeContext {
  header: TurnLog['header'];
  teamData?: Team | NFLTeam;
  gameResults?: Array<{ opponent: string; result: 'W' | 'L'; score: string }>;
  seed?: number;
}

const generateLocalTurn = (
  turnId: number,
  context: LocalNarrativeContext,
  transition: PhaseTransition
): TurnLog => {
  const { header, teamData, gameResults, seed } = context;
  const gameContext = saveHeaderToGameContext(header, teamData);
  const phase = timelineToGamePhase(transition.nextPhase);

  // Build game result for narrative if we have results
  let narrativeGameResult = undefined;
  if (gameResults && gameResults.length > 0) {
    const lastGame = gameResults[gameResults.length - 1];
    const [teamScore, oppScore] = lastGame.score.split('-').map(s => parseInt(s.trim()));

    // Try to look up opponent team by name, otherwise create placeholder
    const opponentTeam: Team = {
      id: 'opp-' + lastGame.opponent.toLowerCase().replace(/\s+/g, '-'),
      name: lastGame.opponent,
      nickname: lastGame.opponent,
      abbreviation: lastGame.opponent.substring(0, 3).toUpperCase(),
      conference: 'Independent' as any,
      league: 'ncaa' as const,
      level: 'fbs-p5' as const,
      prestige: 3 as const,
      facilities: 3 as const,
      budget: 50000,
      fanbasePassion: 50,
      expectations: 'bowl' as const,
      primaryColor: '#333333',
      secondaryColor: '#666666',
      stadium: 'Stadium',
      stadiumCapacity: 50000,
      location: { city: 'Unknown', state: 'XX', region: 'Midwest' as const },
      secondaryRivals: [],
      nationalChampionships: 0,
      conferenceChampionships: 0,
      notableCoaches: [],
    };

    narrativeGameResult = {
      isWin: lastGame.result === 'W',
      score: { team: teamScore, opponent: oppScore },
      opponent: opponentTeam,
    };
  }

  // Generate narrative using local engine
  const narrative = generateLocalNarrative({
    phase,
    context: gameContext,
    gameResult: narrativeGameResult,
    seed,
  });

  // Generate job offers if in carousel phase
  let jobOffers: JobOffer[] | undefined;
  if (transition.nextPhase === 'Carousel') {
    const year = getYearFromDate(header.date);
    const openings = generateJobOpenings(year, 4, seed);
    jobOffers = openings.map(team => teamToJobOffer(team, year));
  }

  // Extract scene content - scene is an object with title, description, etc.
  const sceneText = narrative.scene?.description || 'The season continues.';
  const sceneTitle = narrative.scene?.title || '';
  const sceneHeadlines = narrative.scene?.headlines || [];

  // Convert GeneratedChoice[] to Choice[] format expected by UI
  const choices = narrative.scene?.choices?.options?.map(opt => ({
    id: opt.id,
    text: opt.text,
    type: opt.riskLevel === 'risky' ? 'aggressive' as const : 'strategy' as const,
  })) || [
    { id: 'continue', text: 'Continue', type: 'strategy' as const },
  ];

  return {
    turnId,
    header: { ...header, openThreads: sceneHeadlines.slice(0, 3) },
    mediaHeadline: sceneHeadlines[0] || sceneTitle || 'Season Update',
    mediaBuzz: narrative.tickerHeadlines?.[0] || sceneHeadlines[1],
    staffNotes: sceneTitle,
    sceneDescription: sceneText,
    resolution: narrative.breakingNews || '',
    choices,
    gameOver: false,
    jobOffers,
    seasonSummary: undefined,
  };
};

// ============================================
// FALLBACK MOCK DATA (for API errors)
// ============================================

const generateMockTurn = (turnId: number, lastTurn?: TurnLog): TurnLog => {
  if (lastTurn) {
    // Try to generate using local engine even in error case
    const transition = calculatePhaseTransition(lastTurn.header);
    try {
      return generateLocalTurn(turnId, { header: lastTurn.header }, transition);
    } catch {
      // Ultimate fallback if local engine fails
      return {
        turnId,
        header: { ...lastTurn.header },
        mediaHeadline: 'System Recovery',
        mediaBuzz: 'Game state preserved.',
        staffNotes: 'Continuing with local simulation.',
        sceneDescription: `The season continues.\n\nTeam: ${lastTurn.header.team}\nRecord: ${lastTurn.header.seasonRecord}`,
        resolution: 'Simulated locally.',
        choices: [
          { id: 'continue', text: 'Continue Season', type: 'strategy' },
          { id: 'review', text: 'Review Situation', type: 'passive' },
        ],
        gameOver: false,
      };
    }
  }

  return {
    turnId,
    header: {
      date: 'August 1995',
      age: 22,
      team: 'Select a Team',
      conference: 'N/A',
      role: 'Candidate',
      seasonRecord: '0-0',
      legacyScore: 0,
      fanSentiment: 50,
      timelinePhase: 'Preseason',
      schemeOffense: 'Pro Style',
      schemeDefense: '4-3',
      qbSituation: 'N/A',
      reputationTags: [],
      jobSecurity: 'Stable',
      openThreads: ['Career Beginning'],
      network: [],
      stats: { apRank: 'NR', confStanding: 'N/A', offRank: '--', defRank: '--', prestige: 'N/A' },
      careerHistory: [],
    },
    mediaHeadline: 'Your Journey Begins',
    mediaBuzz: 'A new coaching career awaits.',
    staffNotes: 'Ready to build a dynasty.',
    sceneDescription: 'You are about to embark on a 30-year coaching career. Select your starting position to begin.',
    choices: [
      { id: 'start_ga', text: 'Start as Graduate Assistant', type: 'strategy' },
      { id: 'start_pos', text: 'Start as Position Coach', type: 'strategy' },
    ],
    gameOver: false,
  };
};

// ============================================
// PUBLIC API
// ============================================

export interface LocalInitOptions {
  coachFirstName: string;
  coachLastName: string;
  teamId: string;
  startYear?: number;
  startingRole?: 'Head Coach' | 'Offensive Coordinator' | 'Defensive Coordinator' | 'Position Coach' | 'Graduate Assistant';
  seed?: number;
}

/**
 * Initialize game using local engine - zero API calls
 */
export const initializeGameLocal = async (options: LocalInitOptions): Promise<TurnLog> => {
  const { coachFirstName, coachLastName, teamId, startYear = 1995, startingRole = 'Head Coach', seed = Date.now() } = options;

  const team = getTeamById(teamId);
  if (!team) {
    throw new Error(`Team not found: ${teamId}`);
  }

  const gameContext = {
    team,
    coach: {
      firstName: coachFirstName,
      lastName: coachLastName,
      fullName: `${coachFirstName} ${coachLastName}`,
    },
    season: startYear,
    record: { wins: 0, losses: 0 },
    jobSecurity: 75, // Honeymoon period
  };

  const narrative = generateLocalNarrative({
    phase: 'preseason',
    context: gameContext,
    seed,
  });

  const prestigeNames: Record<number, string> = {
    5: 'Blue Blood',
    4: 'Power Program',
    3: 'Solid Mid-Major',
    2: 'Rebuild Project',
    1: 'Bottom Feeder',
  };

  // Extract scene content from narrative
  const sceneText = narrative.scene?.description || `Welcome to ${team.nickname} football. A new era begins.`;
  const sceneTitle = narrative.scene?.title || 'New Era Begins';
  const sceneHeadlines = narrative.scene?.headlines || [`${coachFirstName} ${coachLastName} named head coach at ${team.name}`];

  // Convert choices
  const choices = narrative.scene?.choices?.options?.map(opt => ({
    id: opt.id,
    text: opt.text,
    type: 'strategy' as const,
  })) || [
    { id: 'begin_camp', text: 'Begin Fall Camp', type: 'strategy' as const },
    { id: 'assess_roster', text: 'Assess the Roster', type: 'strategy' as const },
  ];

  const header: TurnLog['header'] = {
    date: `August ${startYear}`,
    age: startingRole === 'Graduate Assistant' ? 22 : startingRole === 'Position Coach' ? 28 : 35,
    team: `${team.name} ${team.nickname}`,
    conference: team.conference,
    role: startingRole,
    seasonRecord: '0-0',
    legacyScore: 0,
    fanSentiment: 50,
    timelinePhase: 'Preseason',
    schemeOffense: 'Pro Style',
    schemeDefense: '4-3',
    qbSituation: 'Developing',
    reputationTags: ['New Hire'],
    jobSecurity: 'Stable',
    openThreads: sceneHeadlines.slice(0, 3),
    network: [],
    stats: {
      apRank: 'NR',
      confStanding: 'Preseason',
      offRank: '--',
      defRank: '--',
      prestige: prestigeNames[team.prestige] || 'Solid Mid-Major',
    },
    careerHistory: [],
  };

  return {
    turnId: 0,
    header,
    mediaHeadline: sceneHeadlines[0] || sceneTitle,
    mediaBuzz: `${coachFirstName} ${coachLastName} takes the reins at ${team.name}.`,
    staffNotes: sceneTitle,
    sceneDescription: sceneText,
    resolution: narrative.breakingNews || '',
    choices,
    gameOver: false,
  };
};

/**
 * Initialize game using AI (original implementation)
 */
export const initializeGame = async (initialPrompt: string): Promise<TurnLog> => {
  // If local-first mode, use local initialization
  if (USE_LOCAL_FIRST) {
    // Parse coach name and team from prompt if possible, or use defaults
    // For now, return a starting state that lets user select team
    return generateMockTurn(0);
  }

  try {
    const text = await withRetry(() =>
      callGemini(initialPrompt, initSchema, SYSTEM_INSTRUCTION_SLIM)
    );

    if (!text) throw new Error('No response');

    const data = JSON.parse(text);

    // Ensure required fields have defaults
    if (!data.header.network) data.header.network = [];
    if (!data.header.stats) data.header.stats = { apRank: 'NR', confStanding: 'N/A', offRank: '--', defRank: '--', prestige: 'Mid-Major' };
    if (!data.header.careerHistory) data.header.careerHistory = [];
    if (!data.header.openThreads) data.header.openThreads = [];
    if (!data.header.reputationTags) data.header.reputationTags = [];

    return { ...data, turnId: 0 };
  } catch (error) {
    console.error('Init error:', error);
    return generateMockTurn(0);
  }
};

export interface SendDecisionOptions {
  teamId?: string;
  teamData?: Team | NFLTeam;
  seed?: number;
}

export const sendDecision = async (
  choiceId: string,
  choiceText: string,
  lastTurn: TurnLog,
  customContext?: string,
  options?: SendDecisionOptions
): Promise<TurnLog> => {
  const header = lastTurn.header;
  const currentYear = getYearFromDate(header.date);

  // ============================================
  // STEP 1: LOCAL PHASE TRANSITION
  // ============================================

  const transition = calculatePhaseTransition(header);

  // Get team data for simulation if available
  const teamData = options?.teamData || (options?.teamId ? getTeamById(options.teamId) : undefined);

  // Simulate games locally if needed
  let gameResults = undefined;
  if (transition.narrativeType === 'game_block' && transition.gamesThisBlock) {
    const simOptions: Partial<SimulateGameBlockOptions> = {
      teamId: options?.teamId,
      level: teamData?.level,
      conference: teamData?.conference,
      year: currentYear,
      seed: options?.seed,
      gamesPlayedSoFar: parseRecord(header.seasonRecord).wins + parseRecord(header.seasonRecord).losses,
    };

    gameResults = simulateGameBlock(
      header.seasonRecord,
      transition.gamesThisBlock,
      header.stats.prestige,
      header.fanSentiment,
      simOptions
    );
  }

  // Apply deterministic state changes
  const newHeader = applyTransition(header, transition, gameResults);

  // ============================================
  // STEP 2: LOCAL-FIRST MODE - Generate narrative locally
  // ============================================

  if (USE_LOCAL_FIRST) {
    const localTurn = generateLocalTurn(
      lastTurn.turnId + 1,
      {
        header: newHeader,
        teamData: teamData || undefined,
        gameResults: gameResults?.results,
        seed: options?.seed,
      },
      transition
    );
    return localTurn;
  }

  // ============================================
  // STEP 3: CHECK CACHE (AI mode only)
  // ============================================

  const cacheKey = generateCacheKey(
    transition.nextPhase,
    gameResults?.newRecord || header.seasonRecord,
    choiceId,
    header.stats.prestige,
    header.role
  );

  const cached = getCachedResponse(cacheKey);
  if (cached) {
    // Merge cached narrative with fresh local state
    return {
      ...cached,
      turnId: lastTurn.turnId + 1,
      header: { ...newHeader, openThreads: cached.header?.openThreads || newHeader.openThreads },
    };
  }

  // ============================================
  // STEP 4: BUILD MINIMAL PROMPT
  // ============================================

  const minContext = buildMinimalContext({ ...lastTurn, header: newHeader });

  let prompt = `STATE:${minContext}\n`;
  prompt += `ACTION:"${choiceText}"\n`;
  if (customContext) prompt += `DETAIL:"${customContext}"\n`;

  // Include game results for narrative
  if (gameResults) {
    const resultsStr = gameResults.results.map(r => `${r.result} vs ${r.opponent} (${r.score})`).join(', ');
    prompt += `GAMES:${resultsStr}\n`;
    prompt += `RECORD:${gameResults.newRecord}\n`;
  }

  prompt += `PHASE:${transition.nextPhase}\n`;
  prompt += `YEAR:${currentYear}\n`;

  // Special instructions per phase
  if (transition.narrativeType === 'carousel') {
    prompt += 'TASK:Generate job offers (2-4) and career narrative.\n';
  } else if (transition.narrativeType === 'bowl') {
    prompt += 'TASK:Generate bowl game narrative.\n';
  } else if (transition.narrativeType === 'preseason') {
    prompt += 'TASK:Generate preseason narrative with camp storylines.\n';
  }

  prompt += 'OUTPUT:JSON narrative only.\n';

  // ============================================
  // STEP 5: CALL AI FOR NARRATIVE (with local fallback)
  // ============================================

  try {
    const text = await withRetry(() =>
      callGemini(prompt, narrativeSchema, SYSTEM_INSTRUCTION_SLIM)
    );

    if (!text) throw new Error('No response');

    const narrativeData = JSON.parse(text);

    // Merge AI narrative with local state
    const fullTurn: TurnLog = {
      turnId: lastTurn.turnId + 1,
      header: {
        ...newHeader,
        openThreads: narrativeData.openThreads || newHeader.openThreads,
      },
      mediaHeadline: narrativeData.mediaHeadline || 'No headline',
      mediaBuzz: narrativeData.mediaBuzz,
      staffNotes: narrativeData.staffNotes || '',
      sceneDescription: narrativeData.sceneDescription,
      resolution: narrativeData.resolution,
      choices: narrativeData.choices || [],
      gameOver: narrativeData.gameOver || false,
      seasonSummary: narrativeData.seasonSummary,
      jobOffers: narrativeData.jobOffers,
    };

    // Cache successful response
    setCachedResponse(cacheKey, fullTurn);

    return fullTurn;

  } catch (error) {
    console.error('Turn error, falling back to local:', error);
    // Fall back to local generation
    return generateLocalTurn(
      lastTurn.turnId + 1,
      { header: newHeader, teamData: teamData || undefined, gameResults: gameResults?.results },
      transition
    );
  }
};
