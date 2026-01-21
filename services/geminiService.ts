import { GoogleGenAI, Type, GenerateContentResponse, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { TurnLog, JobOffer } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema definition for Structured Output
const gameStateSchema = {
  type: Type.OBJECT,
  properties: {
    header: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING },
        age: { type: Type.NUMBER },
        team: { type: Type.STRING },
        conference: { type: Type.STRING },
        role: { type: Type.STRING },
        seasonRecord: { type: Type.STRING },
        legacyScore: { type: Type.NUMBER },
        fanSentiment: { type: Type.NUMBER },
        timelinePhase: { type: Type.STRING, enum: ['Preseason', 'Regular Season', 'Postseason', 'Carousel', 'Offseason'] },
        schemeOffense: { type: Type.STRING },
        schemeDefense: { type: Type.STRING },
        qbSituation: { type: Type.STRING },
        reputationTags: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING } 
        },
        jobSecurity: { type: Type.STRING },
        openThreads: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING } 
        },
        network: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              relation: { type: Type.STRING },
              currentRole: { type: Type.STRING },
              loyalty: { type: Type.STRING, enum: ['High', 'Medium', 'Low', 'Rival'] },
            },
            required: ["name", "relation", "currentRole", "loyalty"]
          }
        },
        stats: {
          type: Type.OBJECT,
          properties: {
             apRank: { type: Type.STRING },
             confStanding: { type: Type.STRING },
             offRank: { type: Type.STRING },
             defRank: { type: Type.STRING },
             prestige: { type: Type.STRING }
          },
          required: ["apRank", "confStanding", "offRank", "defRank", "prestige"]
        },
        careerHistory: {
          type: Type.ARRAY, 
          items: {
            type: Type.OBJECT,
            properties: {
              year: { type: Type.NUMBER },
              team: { type: Type.STRING },
              role: { type: Type.STRING },
              record: { type: Type.STRING },
              result: { type: Type.STRING }
            },
            required: ["year", "team", "role", "record", "result"]
          }
        }
      },
      required: ["date", "age", "team", "conference", "role", "seasonRecord", "legacyScore", "fanSentiment", "timelinePhase", "schemeOffense", "schemeDefense", "qbSituation", "reputationTags", "jobSecurity", "openThreads", "network", "stats", "careerHistory"],
    },
    mediaHeadline: { type: Type.STRING },
    mediaBuzz: { type: Type.STRING },
    staffNotes: { type: Type.STRING },
    seasonSummary: {
      type: Type.OBJECT,
      nullable: true,
      properties: {
        year: { type: Type.NUMBER },
        finalRecord: { type: Type.STRING },
        accomplishment: { type: Type.STRING },
        keyStats: { type: Type.ARRAY, items: { type: Type.STRING } },
        boardFeedback: { type: Type.STRING },
      },
      required: ["year", "finalRecord", "accomplishment", "keyStats", "boardFeedback"]
    },
    jobOffers: {
      type: Type.ARRAY,
      nullable: true,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          team: { type: Type.STRING },
          role: { type: Type.STRING },
          conference: { type: Type.STRING },
          prestige: { type: Type.STRING },
          salary: { type: Type.STRING },
          contractLength: { type: Type.STRING },
          buyout: { type: Type.STRING },
          pitch: { type: Type.STRING },
          perks: { type: Type.ARRAY, items: { type: Type.STRING } },
          status: { type: Type.STRING, enum: ["New", "Negotiating", "Final Offer", "Rescinded"] },
          adPatience: { type: Type.STRING, enum: ["High", "Medium", "Low", "Zero"] }
        },
        required: ["id", "team", "role", "conference", "prestige", "salary", "contractLength", "buyout", "pitch", "perks", "status", "adPatience"],
      },
    },
    resolution: { type: Type.STRING },
    sceneDescription: { type: Type.STRING },
    choices: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING },
          type: { type: Type.STRING },
        },
        required: ["id", "text", "type"],
      },
    },
    gameOver: { type: Type.BOOLEAN },
  },
  required: ["header", "mediaHeadline", "mediaBuzz", "staffNotes", "sceneDescription", "choices", "gameOver"],
};

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

// Updated to compliant model
const MODEL_NAME = 'gemini-3-flash-preview'; 

async function withRetry<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const isRateLimit = error.message?.includes('429') || error.status === 429;
    const isServerOverload = error.message?.includes('503') || error.status === 503;
    
    if (retries > 0 && (isRateLimit || isServerOverload)) {
      console.warn(`API Limit hit. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

const getRoleConstraints = (role: string): string => {
  const r = role.toLowerCase();
  if (r.includes('head coach') || r.includes('hc')) {
    return "ROLE: Head Coach. Control: Scheme, Staff, Big Picture.";
  } else if (r.includes('coordinator') || r.includes('oc') || r.includes('dc')) {
    return "ROLE: Coordinator. Control: Unit Play-calling. Constraint: Cannot fire staff/override HC.";
  } else if (r.includes('ga') || r.includes('qc') || r.includes('assistant') || r.includes('analyst')) {
    return "ROLE: Low-Level Staff (GA/QC). POWER: ZERO. Control: Grunt work, Recruiting specific players. You are surviving, not leading.";
  } else {
    return "ROLE: Position Coach. Control: Unit specific (e.g., WRs), Recruiting.";
  }
};

// --- STRICT TIME CALCULATION HELPERS ---

const getYearFromDate = (dateStr: string): number => {
  const match = dateStr.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : 1995;
};

const getRecordStats = (record: string): { games: number, wins: number } => {
  if (!record || record === '0-0') return { games: 0, wins: 0 };
  const parts = record.split(/[-–]/).map(s => parseInt(s.trim(), 10));
  const wins = isNaN(parts[0]) ? 0 : parts[0];
  const losses = isNaN(parts[1]) ? 0 : parts[1];
  const ties = (parts.length > 2 && !isNaN(parts[2])) ? parts[2] : 0;
  return { games: wins + losses + ties, wins };
};

// Check if any offer is currently being negotiated
const isNegotiating = (offers?: JobOffer[]): boolean => {
  if (!offers) return false;
  return offers.some(o => o.status === 'Negotiating');
};

// Generates STRICT constraints for the next turn to force the AI to stay on track
const getStrictStateDirectives = (lastTurn: TurnLog, currentActionId?: string): string => {
  const { timelinePhase, seasonRecord, date, age } = lastTurn.header;
  const currentYear = getYearFromDate(date);
  const { games: gamesPlayed, wins } = getRecordStats(seasonRecord);
  const negotiationsActive = isNegotiating(lastTurn.jobOffers);
  
  // Is the user actively negotiating right now?
  const userIsNegotiating = currentActionId?.includes('negotiate');
  const userIsRecovering = currentActionId === 'rock_bottom_recovery';

  // --- SPECIAL ACTION HANDLING ---

  // 1. Recovery Mode (Wilderness Years)
  if (userIsRecovering) {
     return `
     DIRECTIVE: CAREER RESCUE
     - Set 'header.timelinePhase' = "Offseason".
     - Set 'header.date' = "February ${currentYear}".
     - Set 'header.team' to a Low Prestige school or "High School".
     - Set 'header.role' to "GA", "QC", "Position Coach" or "HS Head Coach".
     - GENERATE a scene describing the humble new beginning.
     - FORCE 'gameOver' = false.
     `;
  }

  // 2. Active Negotiation Freeze
  // If we are already negotiating OR the user just clicked negotiate, FREEZE TIME.
  if (negotiationsActive || userIsNegotiating) {
    return `
    DIRECTIVE: ACTIVE NEGOTIATION
    - KEEP 'header.date' = "${date}".
    - KEEP 'header.timelinePhase' = "${timelinePhase}".
    - ACTION: Respond to user counter-offer. Update 'jobOffers' array with new terms or rejection.
    - DO NOT Simulate games. DO NOT Advance year.
    `;
  }

  // --- STANDARD TIMELINE PROGRESSION ---

  let instructions = "";

  // 1. Offseason -> Preseason (SAME YEAR)
  if (timelinePhase === 'Offseason') {
    // FIX: Offseason (Feb 1996) -> Preseason (Aug 1996)
    instructions = `
    DIRECTIVE: NEW SEASON START
    - Set 'header.date' = "August ${currentYear}".
    - Set 'header.age' = ${age}.
    - Set 'header.timelinePhase' = "Preseason".
    - Set 'header.seasonRecord' = "0-0".
    - Set 'header.stats.apRank' = "NR" (or realistic based on prestige).
    - CLEAR 'jobOffers'.
    `;
    return instructions;
  }

  // 2. Preseason -> Start (Sept)
  if (timelinePhase === 'Preseason') {
    instructions = `
    DIRECTIVE: KICKOFF
    - Set 'header.date' = "September ${currentYear}".
    - Set 'header.timelinePhase' = "Regular Season".
    - ACTION: Simulate Games 1-4.
    - UPDATE 'header.seasonRecord' to 4 games played.
    `;
    return instructions;
  }

  // 3. Regular Season Progression
  if (timelinePhase === 'Regular Season') {
    if (gamesPlayed < 4) {
      instructions = `
      DIRECTIVE: FIX RECORD
      - Set 'header.date' = "September ${currentYear}".
      - FORCE 'header.seasonRecord' to exactly 4 games.
      `;
    } 
    else if (gamesPlayed >= 4 && gamesPlayed < 8) {
      instructions = `
      DIRECTIVE: MID-SEASON
      - Set 'header.date' = "October ${currentYear}".
      - Keep 'header.timelinePhase' = "Regular Season".
      - ACTION: Simulate Games 5-8.
      - UPDATE 'header.seasonRecord' to 8 games played.
      `;
    }
    else if (gamesPlayed >= 8 && gamesPlayed < 12) {
      instructions = `
      DIRECTIVE: THE STRETCH
      - Set 'header.date' = "November ${currentYear}".
      - Keep 'header.timelinePhase' = "Regular Season".
      - ACTION: Simulate Games 9-12.
      - UPDATE 'header.seasonRecord' to 12 games played.
      `;
    }
    else {
      // End Regular Season
      if (wins < 6) {
        instructions = `
        DIRECTIVE: SEASON OVER (NO BOWL)
        - Set 'header.date' = "December ${currentYear}".
        - Set 'header.timelinePhase' = "Carousel".
        - GENERATE 'seasonSummary'.
        - GENERATE 'jobOffers' (Firing risk or Lateral moves).
        `;
      } else {
        instructions = `
        DIRECTIVE: POSTSEASON
        - Set 'header.date' = "December ${currentYear}".
        - Set 'header.timelinePhase' = "Postseason".
        - Narrative: Bowl Prep / Conf Title.
        `;
      }
    }
    return instructions;
  }

  // 4. Postseason -> Carousel (New Year)
  if (timelinePhase === 'Postseason') {
    instructions = `
    DIRECTIVE: BOWL RESULT & CAROUSEL START
    - Set 'header.date' = "January ${currentYear + 1}".
    - Set 'header.timelinePhase' = "Carousel".
    - ACTION: Simulate Bowl Result. Update 'seasonRecord'.
    - GENERATE 'seasonSummary'.
    - GENERATE 'jobOffers' array.
    `;
    return instructions;
  }

  // 5. Carousel -> Offseason
  if (timelinePhase === 'Carousel') {
    instructions = `
    DIRECTIVE: SIGNING DAY / OFFSEASON
    - IF Action is NEGOTIATE: STAY in Carousel.
    - IF User accepted job (Action ID contains 'accept'): Set 'header.date' = "February ${currentYear}". Set Phase "Offseason".
    - IF User declined all offers (Action ID contains 'decline'): 
         - If currently employed: Set 'header.date' = "February ${currentYear}". Set Phase "Offseason".
         - If unemployed: GAMEOVER.
    `;
    return instructions;
  }

  return "CONTINUE SIMULATION.";
};

// Fallback Mock Data Generator
const generateMockTurn = (turnId: number, lastTurn?: TurnLog): TurnLog => {
  if (lastTurn) {
    return {
      turnId,
      header: {
        ...lastTurn.header,
        date: lastTurn.header.date.includes('(Offline)') ? lastTurn.header.date : `${lastTurn.header.date} (Offline)`,
        openThreads: [...lastTurn.header.openThreads, "Network Connection Lost"],
      },
      mediaHeadline: "Connection Lost",
      mediaBuzz: "System: Attempting to reconnect...",
      staffNotes: "The AI Game Master is currently unreachable. Your career state has been preserved locally.",
      sceneDescription: `**OFFLINE MODE ACTIVE**\n\nThe game cannot reach the AI service to generate the next narrative scene.\n\n**Current Status:**\n- Team: ${lastTurn.header.team}\n- Record: ${lastTurn.header.seasonRecord}\n- Job Security: ${lastTurn.header.jobSecurity}\n\nYour game is paused. Please check your internet connection or API key and try again.`,
      resolution: "Simulated turn generated locally.",
      choices: [
        { id: "retry_connection", text: "Retry Connection", type: "strategy" }
      ],
      gameOver: false,
      seasonSummary: lastTurn.seasonSummary,
      jobOffers: lastTurn.jobOffers
    };
  }

  return {
    turnId,
    header: {
      date: "August 1995 (OFFLINE)",
      age: 22,
      team: "System Default",
      conference: "N/A",
      role: "Candidate",
      seasonRecord: "0-0",
      legacyScore: 0,
      fanSentiment: 50,
      timelinePhase: 'Preseason',
      schemeOffense: "Pro Style",
      schemeDefense: "4-3",
      qbSituation: "N/A",
      reputationTags: ["Offline"],
      jobSecurity: "Stable",
      openThreads: ["Connection Recovery"],
      network: [],
      stats: {
        apRank: "NR",
        confStanding: "N/A",
        offRank: "--",
        defRank: "--",
        prestige: "N/A"
      },
      careerHistory: []
    },
    mediaHeadline: "System Alert: API Connection Interrupted",
    mediaBuzz: "System: Please check configuration.",
    staffNotes: "Could not initialize AI Game Master.",
    sceneDescription: "Unable to start the simulation due to API connectivity issues.\n\nPlease check your API Key and Network.",
    choices: [
      { id: "retry_init", text: "Retry Initialization", type: "strategy" }
    ],
    gameOver: false
  };
};

export const initializeGame = async (initialPrompt: string): Promise<TurnLog> => {
  try {
    const response = await withRetry<GenerateContentResponse>(() => 
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: initialPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: gameStateSchema,
          maxOutputTokens: 8192,
          safetySettings: SAFETY_SETTINGS,
        }
      })
    );

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text);
    return { ...data, turnId: 0 };
  } catch (error) {
    console.error("Gemini API Fatal Error (Init), switching to Mock:", error);
    return generateMockTurn(0);
  }
};

export const sendDecision = async (choiceId: string, choiceText: string, lastTurn: TurnLog, customContext?: string): Promise<TurnLog> => {
  const strictDirectives = getStrictStateDirectives(lastTurn, choiceId);
  const roleConstraint = getRoleConstraints(lastTurn.header.role);
  const currentYear = getYearFromDate(lastTurn.header.date);

  // Optimized Context
  const minifiedContext = {
    header: lastTurn.header,
    summary: lastTurn.seasonSummary,
    offers: lastTurn.jobOffers
  };

  let prompt = `CURRENT STATE: ${JSON.stringify(minifiedContext)}\n`;
  prompt += `PLAYER ACTION: [${choiceId}] "${choiceText}"\n`;
  if (customContext?.trim()) prompt += `CONTEXT: "${customContext}"\n`;
  
  prompt += `\n**GAME MASTER DIRECTIVES (MUST FOLLOW)**\n`;
  prompt += `1. ECONOMICS: The year is ${currentYear}. Inflation adjustment is required. 
     - A "Great" HC salary in 1995 is $500k. In 2005 it's $2M. 
     - Do not use 2024 numbers (e.g. $10M) for 1990s years.
  2. LOGIC: ${strictDirectives}\n`;
  prompt += `3. AGENCY: ${roleConstraint}\n`;
  prompt += `4. PHASE BEHAVIOR: 
     - If Phase is 'Carousel', you MUST generate valid 'jobOffers' unless the user has already accepted one this turn.
     - If Status is 'Negotiating', respond to the specific negotiation request in 'sceneDescription' and update the offer terms.
  `;

  prompt += `\nGenerate JSON response.`;

  try {
    // Changed from Chat Session to One-shot generateContent because state is fully contained in prompt
    const response = await withRetry<GenerateContentResponse>(() => 
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: gameStateSchema,
          maxOutputTokens: 8192,
          safetySettings: SAFETY_SETTINGS,
        }
      })
    );

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text);
    return { ...data, turnId: lastTurn.turnId + 1 };
  } catch (error) {
    console.error("Gemini API Fatal Error (Turn), switching to Mock:", error);
    return generateMockTurn(lastTurn.turnId + 1, lastTurn);
  }
};