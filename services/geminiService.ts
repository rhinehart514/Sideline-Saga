
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TurnLog, SaveHeader, CareerLog, Connection, TeamStats, JobOffer, RosterDNA, BlackBookEntry, StaffState, CoachingPhilosophy, CoachingCapital, EarnedTrait } from '../types';
import { SYSTEM_INSTRUCTION as BASE_SYSTEM_INSTRUCTION, CONFERENCES_BY_ERA, getPostseasonFormat, TACTICAL_META } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview'; 

// --- 1. OPTIMIZED SYSTEM INSTRUCTION ---
// Condensed for token efficiency without losing nuance.
const REALISM_INSTRUCTION = `
${BASE_SYSTEM_INSTRUCTION}
**REALISM RULES (STRICT):**
1. **CAROUSEL:** Good record != Big Job. Blue Blood jobs are scarce. "Trap Jobs" exist (High Prestige + Toxic Culture). Relegation is real (P5 HC -> G5 Coordinator).
2. **STAFF:** Success = Poaching. If OC/DC shines, they leave.
3. **PRESSURE:** Blue Bloods fire for 9-3. G5 accepts 6-6. Year 1 safe, Year 3 critical.
4. **SCARCITY:** Sometimes NO offers exist.
`;

// --- 2. MODULAR SCHEMAS ---

// A. Complex Sub-Schemas
const mediaContentSchema = {
  type: Type.OBJECT,
  properties: {
    headline: { type: Type.STRING },
    source: { type: Type.STRING, enum: ['National TV', 'Local Beat', 'Tactical Blog', 'Tabloid', 'Campus Paper'] },
    mediaNarrative: { type: Type.STRING, enum: ['The Hero', 'The Villain', 'The Hot Seat', 'The Genius', 'The Underdog', 'The Fraud'] },
    narrativeMood: { type: Type.STRING, enum: ['Crisis', 'Euphoria', 'Skepticism', 'Apathy', 'Tension', 'Stability'] },
    beatWriterAnalysis: { type: Type.STRING },
    fanReactions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          source: { type: Type.STRING, enum: ['Twitter', 'MessageBoard', 'RadioCall', 'NewspaperLetter'] },
          author: { type: Type.STRING },
          content: { type: Type.STRING },
          sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] }
        },
        required: ["source", "author", "content", "sentiment"]
      }
    },
    interviewQuote: {
      type: Type.OBJECT,
      nullable: true,
      properties: {
        speaker: { type: Type.STRING },
        context: { type: Type.STRING },
        quote: { type: Type.STRING }
      },
      required: ["speaker", "context", "quote"]
    }
  },
  required: ["headline", "source", "mediaNarrative", "narrativeMood", "beatWriterAnalysis", "fanReactions"]
};

const jobOffersSchema = {
  type: Type.ARRAY,
  nullable: true,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      type: { type: Type.STRING, enum: ['Direct Offer', 'Interview', 'Rumor'] },
      team: { type: Type.STRING },
      role: { type: Type.STRING },
      conference: { type: Type.STRING },
      prestige: { type: Type.STRING },
      adminCompetence: { type: Type.STRING, enum: ['Inept', 'Average', 'Clever', 'Ruthless'] },
      salary: { type: Type.STRING },
      contractLength: { type: Type.STRING },
      buyout: { type: Type.STRING },
      pitch: { type: Type.STRING },
      perks: { type: Type.ARRAY, items: { type: Type.STRING } },
      status: { type: Type.STRING, enum: ["New", "Negotiating", "Final Offer", "Rescinded", "Interviewing"] },
      adPatience: { type: Type.STRING, enum: ["High", "Medium", "Low", "Zero"] },
      staffPerception: { type: Type.STRING, enum: ['Safe Pair of Hands', 'High Upside Gamble', 'System Fit', 'Cheap Option', 'Desperation Hire'] },
      fanPerception: { type: Type.STRING, enum: ['Home Run', 'Solid Choice', 'Underwhelming', 'Who?', 'Outrage'] },
      rosterSnapshot: {
          type: Type.OBJECT,
          properties: {
              talentLevel: { type: Type.STRING, enum: ['Elite', 'Good', 'Average', 'Depleted'] },
              cultureHealth: { type: Type.STRING, enum: ['Strong', 'Fragile', 'Toxic'] },
              primaryNeed: { type: Type.STRING }
          },
          required: ["talentLevel", "cultureHealth", "primaryNeed"]
      },
      marketBuzz: { type: Type.STRING }
    },
    required: ["id", "type", "team", "role", "conference", "prestige", "adminCompetence", "salary", "contractLength", "buyout", "pitch", "perks", "status", "adPatience", "staffPerception", "fanPerception", "rosterSnapshot", "marketBuzz"],
  },
};

// B. Base Properties (Common to all phases)
const baseSchemaProperties = {
    sceneDescription: { type: Type.STRING },
    mediaContent: mediaContentSchema,
    headerUpdates: {
        type: Type.OBJECT,
        properties: {
            adminCompetence: { type: Type.STRING, enum: ['Inept', 'Average', 'Clever', 'Ruthless'] },
            fanSentiment: { type: Type.NUMBER },
            jobSecurity: { type: Type.STRING },
            legacyScore: { type: Type.NUMBER },
            reputationTags: { type: Type.ARRAY, items: { type: Type.STRING } },
            openThreads: { type: Type.ARRAY, items: { type: Type.STRING } },
            seasonRecord: { type: Type.STRING },
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
            rosterDNA: {
                type: Type.OBJECT,
                properties: {
                    style: { type: Type.STRING, enum: ['Developer', 'Mercenary', 'Recruiter', 'Tactician'] },
                    score: { type: Type.NUMBER }
                },
                required: ["style", "score"]
            },
            philosophy: {
                type: Type.OBJECT,
                properties: {
                    aggression: { type: Type.NUMBER },
                    discipline: { type: Type.NUMBER },
                    adaptability: { type: Type.NUMBER },
                    mediaSavvy: { type: Type.NUMBER }
                }
            },
            capital: {
                type: Type.OBJECT,
                properties: {
                    political: { type: Type.NUMBER },
                    social: { type: Type.NUMBER }
                }
            },
            newTraits: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        label: { type: Type.STRING },
                        description: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] },
                        icon: { type: Type.STRING }
                    },
                    required: ["id", "label", "description", "type", "icon"]
                }
            },
            staff: {
               type: Type.OBJECT,
               properties: {
                   staffChemistry: { type: Type.NUMBER },
                   oc: { 
                       type: Type.OBJECT, 
                       nullable: true, 
                       properties: {
                            name: { type: Type.STRING },
                            age: { type: Type.NUMBER },
                            role: { type: Type.STRING },
                            playcalling: { type: Type.NUMBER },
                            recruiting: { type: Type.NUMBER },
                            style: { type: Type.STRING },
                            loyalty: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                            ambition: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                            yearsWithTeam: { type: Type.NUMBER },
                            status: { type: Type.STRING, enum: ['Active', 'Poached', 'Fired', 'Retiring'] }
                       },
                       required: ["name", "playcalling", "style", "status"]
                   },
                   dc: { 
                        type: Type.OBJECT, 
                        nullable: true, 
                        properties: {
                             name: { type: Type.STRING },
                             age: { type: Type.NUMBER },
                             role: { type: Type.STRING },
                             playcalling: { type: Type.NUMBER },
                             recruiting: { type: Type.NUMBER },
                             style: { type: Type.STRING },
                             loyalty: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                             ambition: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                             yearsWithTeam: { type: Type.NUMBER },
                             status: { type: Type.STRING, enum: ['Active', 'Poached', 'Fired', 'Retiring'] }
                        },
                        required: ["name", "playcalling", "style", "status"]
                   }
               }
            },
            networkUpdates: {
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
            blackBookUpdates: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        role: { type: Type.STRING, enum: ['Player', 'Coach', 'Admin', 'Booster', 'Media'] },
                        currentTeam: { type: Type.STRING },
                        lastSeenYear: { type: Type.NUMBER },
                        history: { type: Type.STRING },
                        status: { type: Type.STRING, enum: ['Active', 'Retired', 'Deceased'] },
                        relationshipScore: { type: Type.NUMBER },
                    },
                    required: ["id", "name", "role", "currentTeam", "lastSeenYear", "history", "status", "relationshipScore"]
                }
            },
            activePromises: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['Board Mandate', 'Recruit Promise', 'Staff Deal', 'Media Guarantee'] },
                        description: { type: Type.STRING },
                        status: { type: Type.STRING, enum: ['Active', 'Fulfilled', 'Broken', 'Void'] },
                        consequence: { type: Type.STRING },
                    },
                    required: ["id", "type", "description", "status", "consequence"]
                }
            }
        },
        required: ["fanSentiment", "jobSecurity", "stats", "seasonRecord"]
    },
    staffNotes: { type: Type.STRING },
    seasonSummary: {
      type: Type.OBJECT,
      nullable: true,
      properties: {
        finalRecord: { type: Type.STRING },
        accomplishment: { type: Type.STRING },
        keyStats: { type: Type.ARRAY, items: { type: Type.STRING } },
        boardFeedback: { type: Type.STRING },
        recruitingClassRank: { type: Type.STRING },
        topSignee: { type: Type.STRING }
      },
      required: ["finalRecord", "accomplishment", "keyStats", "boardFeedback", "recruitingClassRank", "topSignee"]
    },
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
};

// C. Dynamic Schema Generator
// This significantly reduces input tokens by removing the massive 'jobOffers' definition
// from turns where it is completely irrelevant (Regular Season).
const getResponseSchema = (includeOffers: boolean): Schema => {
    const props = { ...baseSchemaProperties } as any;
    
    if (includeOffers) {
        props.jobOffers = jobOffersSchema;
    }

    return {
        type: Type.OBJECT,
        properties: props,
        required: ["headerUpdates", "mediaContent", "staffNotes", "sceneDescription", "choices", "gameOver"]
    };
};

// --- 2. BACKEND LOGIC (DETERMINISTIC) ---

const DEFAULT_STATS: TeamStats = {
    apRank: 'NR',
    confStanding: 'N/A',
    offRank: 'NR',
    defRank: 'NR',
    prestige: 'D'
};

const DEFAULT_ROSTER_DNA: RosterDNA = {
    style: 'Developer',
    score: 0
};

const DEFAULT_STAFF: StaffState = {
    oc: null,
    dc: null,
    staffChemistry: 50
};

const DEFAULT_PHILOSOPHY: CoachingPhilosophy = {
    aggression: 50,
    discipline: 50,
    adaptability: 50,
    mediaSavvy: 50
};

const DEFAULT_CAPITAL: CoachingCapital = {
    political: 20, 
    social: 20
};

const StateEngine = {
  getYear: (dateStr: string) => parseInt(dateStr.match(/\d{4}/)?.[0] || '1995'),
  
  parseSalary: (salaryStr: string) => {
    const clean = salaryStr.replace(/[$,\s]/g, '').toLowerCase();
    let mult = 1;
    if (clean.includes('k')) mult = 1000;
    if (clean.includes('m')) mult = 1000000;
    const num = parseFloat(clean.replace(/[km]/g, ''));
    return isNaN(num) ? 0 : num * mult;
  },

  advancePhase: (currentHeader: SaveHeader, decisionId: string): Partial<SaveHeader> => {
    const { timelinePhase, phaseTurn, date } = currentHeader;
    let newPhase = timelinePhase;
    let newTurn = phaseTurn + 1;
    let newDate = date;
    let year = StateEngine.getYear(date);

    const PHASE_LIMITS = {
        'Preseason': 1,      
        'Regular Season': 3, 
        'Postseason': 1,     
        'Carousel': 4,       
        'Offseason': 1       
    };

    let limit = PHASE_LIMITS[timelinePhase] || 1;
    let shouldAdvance = newTurn > limit;

    if (!shouldAdvance) {
        if (timelinePhase === 'Regular Season') {
             if (newTurn === 2) newDate = `October ${year}`;
             if (newTurn === 3) newDate = `November ${year}`;
        }
        if (timelinePhase === 'Carousel') {
             const baseMonth = date.split(' ')[0]; 
             const baseDate = date.split('(')[0].trim();
             newDate = `${baseMonth} ${year} (Week ${newTurn})`;
        }
        return { phaseTurn: newTurn, date: newDate };
    }

    if (shouldAdvance) {
        newTurn = 1;
        switch (timelinePhase) {
            case 'Preseason': 
                newPhase = 'Regular Season'; 
                newDate = `September ${year}`;
                break;
            case 'Regular Season': 
                newPhase = 'Postseason'; 
                newDate = `December ${year}`; 
                break;
            case 'Postseason': 
                newPhase = 'Carousel'; 
                newDate = `January ${year + 1} (Week 1)`; 
                break;
            case 'Carousel': 
                newPhase = 'Offseason'; 
                newDate = `February ${year}`; 
                if (date.includes('May')) {
                     newPhase = 'Preseason';
                     newDate = `August ${year}`;
                }
                break;
            case 'Offseason': 
                newPhase = 'Preseason'; 
                newDate = `August ${year}`; 
                break;
        }
    }

    return { timelinePhase: newPhase, phaseTurn: newTurn, date: newDate };
  },

  processFinancials: (currentHeader: SaveHeader, isNewYear: boolean): Partial<SaveHeader> => {
      const updates: any = {};
      if (isNewYear) {
          updates.age = currentHeader.age + 1;
          const salary = StateEngine.parseSalary(currentHeader.financials.salary);
          updates.financials = {
              ...currentHeader.financials,
              contractYears: Math.max(0, currentHeader.financials.contractYears - 1),
              careerEarnings: currentHeader.financials.careerEarnings + salary
          };
          if (currentHeader.staff.oc) {
              const prevOc = currentHeader.staff.oc;
              updates.staff = { ...currentHeader.staff, oc: { ...prevOc, yearsWithTeam: (prevOc.yearsWithTeam || 0) + 1 } };
          }
           if (currentHeader.staff.dc) {
              const prevDc = currentHeader.staff.dc;
              updates.staff = { ...(updates.staff || currentHeader.staff), dc: { ...prevDc, yearsWithTeam: (prevDc.yearsWithTeam || 0) + 1 } };
          }
      }
      return updates;
  },

  archiveSeason: (currentHeader: SaveHeader): CareerLog | null => {
      // Don't log "Free Agent" as a career season unless specifically desired.
      // For now, we allow it for "The Wilderness Years" continuity, but maybe flag it?
      return {
          year: StateEngine.getYear(currentHeader.date),
          team: currentHeader.team,
          role: currentHeader.role,
          record: currentHeader.seasonRecord,
          result: "Season Ended", 
          statsSnapshot: currentHeader.stats
      };
  },

  // OPTIMIZED SERIALIZATION: Compact string representation to save tokens
  serializeState: (header: SaveHeader): string => {
      const oc = header.staff.oc;
      const dc = header.staff.dc;
      const ocStr = oc ? `${oc.name}(${oc.style},${oc.playcalling})` : "Vacant";
      const dcStr = dc ? `${dc.name}(${dc.style},${dc.playcalling})` : "Vacant";
      const traitsStr = header.traits.map(t => t.label).join(",") || "None";
      const ph = header.philosophy;
      const cap = header.capital;

      return `STATE: Team:${header.team}(${header.conference}) Role:${header.role} Rec:${header.seasonRecord} Pres:${header.stats.prestige} Sent:${header.fanSentiment}% Sec:${header.jobSecurity}
Admin:${header.adminCompetence} Roster:${header.rosterDNA.style}(${header.rosterDNA.score})
OC:${ocStr} DC:${dcStr} Chem:${header.staff.staffChemistry}
Promises:${header.activePromises.length} Net:${header.network.length} BB:${header.blackBook.length}
Phil(0-100): Aggr${ph.aggression} Disc${ph.discipline} Adapt${ph.adaptability}
Cap(0-100): Pol${cap.political} Soc${cap.social}
Traits:${traitsStr}`;
  }
};

// --- 3. API INTERACTION ---

async function withRetry<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const initializeGame = async (prompt: string): Promise<TurnLog> => {
  return withRetry(async () => {
    const initPrompt = `${prompt} \n\nINITIALIZATION RULE: Set \`header.phaseTurn\` to 1.`;
    
    // Always use full schema for initialization to ensure clean starting offers
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: initPrompt,
      config: {
        systemInstruction: REALISM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: getResponseSchema(true), 
        temperature: 0.9,
      },
    });

    if (!response.text) throw new Error("No text returned from Gemini.");
    const rawData = JSON.parse(response.text);

    const fullHeader: SaveHeader = {
        date: "May 1995",
        age: 22,
        team: "Free Agent",
        conference: "N/A",
        role: "Job Seeker",
        seasonRecord: "0-0",
        careerRecord: "0-0",
        careerHistory: [],
        financials: { salary: "$0", contractYears: 0, buyout: "$0", careerEarnings: 0 },
        timelinePhase: 'Carousel',
        phaseTurn: 1,
        schemeOffense: "Undecided",
        schemeDefense: "Undecided",
        qbSituation: "N/A",
        jobSecurity: "Stable",
        legacyScore: 0,
        fanSentiment: 50,
        adminCompetence: "Average",
        ...rawData.headerUpdates,
        stats: rawData.headerUpdates?.stats || DEFAULT_STATS,
        rosterDNA: rawData.headerUpdates?.rosterDNA || DEFAULT_ROSTER_DNA,
        staff: rawData.headerUpdates?.staff || DEFAULT_STAFF,
        network: rawData.headerUpdates?.networkUpdates || [],
        blackBook: rawData.headerUpdates?.blackBookUpdates || [],
        activePromises: rawData.headerUpdates?.activePromises || [],
        openThreads: rawData.headerUpdates?.openThreads || [],
        reputationTags: rawData.headerUpdates?.reputationTags || [],
        philosophy: DEFAULT_PHILOSOPHY,
        capital: DEFAULT_CAPITAL,
        traits: []
    };

    return {
        turnId: 0,
        header: fullHeader,
        mediaContent: rawData.mediaContent,
        staffNotes: rawData.staffNotes,
        sceneDescription: rawData.sceneDescription,
        choices: rawData.choices,
        gameOver: rawData.gameOver,
        jobOffers: rawData.jobOffers,
        seasonSummary: rawData.seasonSummary,
        resolution: rawData.resolution
    };
  });
};

export const sendDecision = async (decisionId: string, choiceText: string, currentTurn: TurnLog, customContext?: string): Promise<TurnLog> => {
  const currentHeader = currentTurn.header;
  const year = StateEngine.getYear(currentHeader.date);
  
  // 1. CALCULATE DETERMINISTIC STATE
  const nextHeader: SaveHeader = { ...currentHeader };

  // A. Phase Advance
  const nextPhaseState = StateEngine.advancePhase(currentHeader, decisionId);
  Object.assign(nextHeader, nextPhaseState);

  // B. Financial/Age Advance (Year Rollover)
  const isNewCalendarYear = nextHeader.timelinePhase === 'Carousel' && currentHeader.timelinePhase === 'Postseason';
  const nextFinancialState = StateEngine.processFinancials(currentHeader, !!isNewCalendarYear);
  Object.assign(nextHeader, nextFinancialState);
  if (nextFinancialState.financials) {
      Object.assign(nextHeader.financials, nextFinancialState.financials);
  }
  if (nextFinancialState.staff) {
       Object.assign(nextHeader.staff, nextFinancialState.staff);
  }

  // C. Handle Job Acceptance
  let dynamicContext = customContext || 'None';
  let isHired = false;
  let hiredOffer: JobOffer | undefined = undefined;

  if (decisionId.includes('offer_accept')) {
      const acceptedOfferId = decisionId.replace('offer_accept_', '');
      
      // Robust Finding: Try Exact Match first, then string match, then loose match
      if (currentTurn.jobOffers) {
        hiredOffer = currentTurn.jobOffers.find(o => String(o.id) === String(acceptedOfferId));
        if (!hiredOffer) hiredOffer = currentTurn.jobOffers.find(o => String(o.id).trim() === String(acceptedOfferId).trim());
        if (!hiredOffer) hiredOffer = currentTurn.jobOffers.find(o => choiceText.includes(o.team));
      }

      if (hiredOffer) {
          // --- CHANGED LOGIC: Immediate Resolution for Interviews ---
          // Previously, we paused to roleplay the interview. Now, we simulate the result immediately.
          if (hiredOffer.status === 'Interviewing' || hiredOffer.type === 'Interview') {
              // 80% Success Rate for interviews to keep gameplay moving, modified by 'adPatience' logic implied.
              const success = Math.random() > 0.20; 
              
              if (success) {
                   dynamicContext += `\n [SYSTEM OVERRIDE]: User attended the interview at ${hiredOffer.team} and SUCCEEDED. They are hired immediately. Write a scene about the successful meeting and handshake.`;
                   // Fall through to hiring logic below
              } else {
                   dynamicContext += `\n [SYSTEM OVERRIDE]: User attended the interview at ${hiredOffer.team} and FAILED. They were rejected. Write a scene about the rejection (e.g., questions they couldn't answer, bad fit). The user remains a Free Agent and must find another job.`;
                   hiredOffer = undefined; // Prevents the hire logic from running below
              }
          }
      }

      // If hiredOffer still exists (Direct Offer OR Successful Interview), process the hire
      if (hiredOffer) {
          isHired = true;
          
          // CRITICAL: Force Phase Transition to Offseason immediately to end the Carousel
          nextHeader.team = hiredOffer.team;
          nextHeader.role = hiredOffer.role;
          nextHeader.conference = hiredOffer.conference;
          nextHeader.financials.salary = hiredOffer.salary;
          nextHeader.financials.contractYears = parseInt(hiredOffer.contractLength) || 1;
          nextHeader.financials.buyout = hiredOffer.buyout;
          nextHeader.jobSecurity = "Stable"; 
          nextHeader.fanSentiment = 50; 
          nextHeader.adminCompetence = hiredOffer.adminCompetence;
          nextHeader.seasonRecord = "0-0"; 
          nextHeader.staff = { oc: null, dc: null, staffChemistry: 50 };
          nextHeader.timelinePhase = 'Offseason'; // SKIP REST OF CAROUSEL
          nextHeader.phaseTurn = 1;
          nextHeader.date = `February ${year}`; 
          
          dynamicContext += `\n [SYSTEM OVERRIDE - HIRED]: User is now officially HIRED at ${hiredOffer.team}. The Carousel Phase is ENDED. Fast forwarding to Offseason (February).`;
      } else if (!dynamicContext.includes('FAILED')) {
          // Fallback if ID lookup failed but it wasn't a rejection
          const match = choiceText.match(/from (.*)$/i);
          const fallbackTeam = match ? match[1].trim() : "Unknown Team";
           dynamicContext += `\n [SYSTEM WARNING]: User accepted offer but ID lookup failed. FORCING HIRE at ${fallbackTeam}.`;
           isHired = true;
           nextHeader.team = fallbackTeam;
           nextHeader.role = "Head Coach"; 
           nextHeader.timelinePhase = 'Offseason';
           nextHeader.phaseTurn = 1;
           nextHeader.date = `February ${year}`;
           nextHeader.seasonRecord = "0-0";
           nextHeader.staff = { oc: null, dc: null, staffChemistry: 50 };
      }
  }

  // D. History Archive
  let newHistoryLog: CareerLog | null = null;
  if (currentHeader.timelinePhase === 'Postseason' && nextHeader.timelinePhase === 'Carousel') {
      newHistoryLog = StateEngine.archiveSeason(currentHeader);
  }

  // 2. GENERATE PROMPT
  const stateSummary = StateEngine.serializeState(nextHeader);
  
  const systemUpdate = `
    SYSTEM UPDATE: Date:${nextHeader.date} Phase:${nextHeader.timelinePhase} Age:${nextHeader.age}
    ${isHired ? `**HIRED & PHASE JUMP:** User is now the ${nextHeader.role} at ${nextHeader.team}. The Carousel is CLOSED. We are now in OFFSEASON.` : ''}
    ${newHistoryLog ? `
    **SEASON ENDED (ARCHIVING):**
    - The season has officially concluded.
    - Logged Record: ${currentHeader.seasonRecord}
    - MANDATORY TASK: You MUST populate the 'seasonSummary' field in the JSON response with the final stats, accomplishments, and board feedback for this specific year.
    ` : ''}
  `;

  const previousTurnContext = `LAST SCENE: "${currentTurn.sceneDescription || 'Start'}"\nHEADLINE: "${currentTurn.mediaContent?.headline || 'N/A'}"`;
  const tacticalMeta = TACTICAL_META(year);
  const eraContext = `Era: ${year}. ${tacticalMeta}`;
  
  const isUnemployed = nextHeader.team === 'Free Agent' || nextHeader.team === 'Job Seeker' || nextHeader.team === 'Unemployed';
  
  // LOGIC: DETERMINE IF WE NEED THE HEAVY SCHEMA
  // We need job offers if we are in Carousel/Offseason OR if we are Unemployed.
  const needsJobOffers = (nextHeader.timelinePhase === 'Carousel' || nextHeader.timelinePhase === 'Offseason' || isUnemployed) && !isHired;

  let offerInstruction = "";
  if (needsJobOffers) {
      let wins = 0; 
      let losses = 0;
      if (currentHeader.seasonRecord) {
         const parts = currentHeader.seasonRecord.split(/[-–]/).map(s => parseInt(s));
         if (parts.length >= 2) { wins = parts[0]; losses = parts[1]; }
      }
      const winPct = (wins + losses) > 0 ? wins / (wins + losses) : 0.5;
      const isFired = nextHeader.jobSecurity.toLowerCase().includes('fired') || nextHeader.jobSecurity.toLowerCase().includes('terminated');
      const isBadSeason = winPct < 0.4 || isFired;

      if (isBadSeason) {
          offerInstruction = "User is struggling. GENERATE 2 OFFERS: 1. Rehab (Analyst/QC). 2. Reset (G5 Coord/FCS HC).";
      } else if (winPct > 0.85) {
          offerInstruction = "User is elite. GENERATE 1-2 OFFERS: P5 HC, NFL Coord, or big raise.";
      } else {
          offerInstruction = "User is average. GENERATE 1 OFFER (Lateral move) or NONE.";
      }
      
      if (isUnemployed) {
          offerInstruction = "User UNEMPLOYED. Offer 3 paths: Grind (D3 HC), Technician (Pos Coach), Suit (Analyst).";
      }
  } else {
      offerInstruction = "NO JOB OFFERS. 'jobOffers' must be null or empty.";
  }
  
  if (isHired) {
      offerInstruction = "USER IS HIRED. STOP CAROUSEL. DO NOT GENERATE JOB OFFERS.";
  }

  const prompt = `
    ${eraContext}
    ${previousTurnContext}
    ${stateSummary}
    ${systemUpdate}
    ${getPostseasonFormat(year).desc}
    
    ACTION: "${choiceText}"
    CTX: "${dynamicContext}"

    TASKS:
    1. Write scene.
    2. Update 'headerUpdates'.
    3. ${offerInstruction}
    4. If Preseason/Offseason, FILL MISSING STAFF.
    5. If Carousel, check POACHING logic.
  `;

  // 3. CALL AI WITH DYNAMIC SCHEMA
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: REALISM_INSTRUCTION, 
        responseMimeType: "application/json",
        // CRITICAL TOKEN SAVING: Only send the huge Offer schema when needed
        responseSchema: getResponseSchema(needsJobOffers), 
        temperature: 0.9,
      },
    });

    if (!response.text) throw new Error("No response from Gemini");
    const aiData = JSON.parse(response.text);

    // 4. FINAL STATE MERGE
    if (aiData.headerUpdates) {
        const updates = aiData.headerUpdates;
        
        // PROTECTION: If we just got hired, ignore AI attempts to revert Team/Role/Phase
        if (isHired) {
            delete updates.team;
            delete updates.role;
            delete updates.conference;
            delete updates.timelinePhase;
            delete updates.phaseTurn;
            delete updates.jobSecurity; // Reset to Stable in deterministic logic
        }

        if (updates.fanSentiment !== undefined) nextHeader.fanSentiment = updates.fanSentiment;
        if (updates.jobSecurity) nextHeader.jobSecurity = updates.jobSecurity;
        if (updates.adminCompetence) nextHeader.adminCompetence = updates.adminCompetence;
        if (updates.legacyScore) nextHeader.legacyScore = updates.legacyScore; 
        if (updates.seasonRecord) nextHeader.seasonRecord = updates.seasonRecord;
        if (updates.stats) nextHeader.stats = { ...nextHeader.stats, ...updates.stats };
        if (updates.rosterDNA) nextHeader.rosterDNA = updates.rosterDNA;
        if (updates.staff) nextHeader.staff = { ...nextHeader.staff, ...updates.staff };
        if (updates.philosophy) nextHeader.philosophy = { ...nextHeader.philosophy, ...updates.philosophy };
        if (updates.capital) nextHeader.capital = { ...nextHeader.capital, ...updates.capital };
        
        if (updates.newTraits && Array.isArray(updates.newTraits)) {
            const existingIds = new Set(nextHeader.traits.map(t => t.id));
            const distinctNew = updates.newTraits.filter((t: EarnedTrait) => !existingIds.has(t.id));
            nextHeader.traits = [...nextHeader.traits, ...distinctNew];
        }
        if (updates.reputationTags) nextHeader.reputationTags = updates.reputationTags; 
        if (updates.openThreads) nextHeader.openThreads = updates.openThreads;
        if (updates.networkUpdates) {
            const map = new Map(nextHeader.network.map(c => [c.name.trim(), c]));
            updates.networkUpdates.forEach((u: Connection) => map.set(u.name.trim(), u)); 
            nextHeader.network = Array.from(map.values());
        }
        if (updates.blackBookUpdates) {
             const idMap = new Map(nextHeader.blackBook.map(b => [String(b.id), b]));
             const nameMap = new Map(nextHeader.blackBook.map(b => [b.name.toLowerCase().trim(), b]));
             updates.blackBookUpdates.forEach((u: BlackBookEntry) => {
                const uId = String(u.id);
                const uName = u.name.toLowerCase().trim();
                if (idMap.has(uId)) {
                    idMap.set(uId, { ...idMap.get(uId)!, ...u });
                } else if (nameMap.has(uName)) {
                     const existing = nameMap.get(uName)!;
                     idMap.set(String(existing.id), { ...existing, ...u, id: existing.id });
                } else {
                    idMap.set(uId, u);
                }
            });
            nextHeader.blackBook = Array.from(idMap.values());
        }
        if (updates.activePromises) nextHeader.activePromises = updates.activePromises;
    }

    if (isHired) {
        // STRICT RE-ASSERTION: Prevent AI hallucinations from reverting the team
        if (hiredOffer) {
            nextHeader.team = hiredOffer.team;
            nextHeader.role = hiredOffer.role;
        }
        nextHeader.timelinePhase = 'Offseason'; 
        nextHeader.phaseTurn = 1;
        nextHeader.date = `February ${year}`;
    }

    if (newHistoryLog) {
        // LOCK DOWN HISTORY: Ensure no duplicates for the same year
        const alreadyLogged = nextHeader.careerHistory.some(h => h.year === newHistoryLog!.year);
        
        if (!alreadyLogged) {
            if (aiData.seasonSummary?.accomplishment) newHistoryLog.result = aiData.seasonSummary.accomplishment;
            if (aiData.seasonSummary?.finalRecord) newHistoryLog.record = aiData.seasonSummary.finalRecord;
            nextHeader.careerHistory = [...currentHeader.careerHistory, newHistoryLog];
        }
    }
    
    // Fallback: If AI returns offers when not requested (rare but possible), respect the logic constraint
    let finalJobOffers = aiData.jobOffers;
    if (isHired || !needsJobOffers) {
        finalJobOffers = [];
    }

    return {
        turnId: currentTurn.turnId + 1,
        header: nextHeader,
        mediaContent: aiData.mediaContent,
        staffNotes: aiData.staffNotes,
        sceneDescription: aiData.sceneDescription,
        choices: aiData.choices,
        gameOver: aiData.gameOver,
        seasonSummary: aiData.seasonSummary,
        jobOffers: finalJobOffers,
        resolution: aiData.resolution
    };
  });
};
