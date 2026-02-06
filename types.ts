
export type TimelinePhase = 'Preseason' | 'Regular Season' | 'Postseason' | 'Carousel' | 'Offseason';
export type AdminCompetence = 'Inept' | 'Average' | 'Clever' | 'Ruthless';
export type OfferType = 'Direct Offer' | 'Interview' | 'Rumor';

export interface Choice {
  id: string;
  text: string;
  type: 'action' | 'dialogue' | 'strategy';
}

export interface Coordinator {
  name: string;
  age: number;
  role: 'OC' | 'DC';
  playcalling: number; // 0-100
  recruiting: number; // 0-100
  style: string; // e.g., "Air Raid", "4-3 Zone", "Wishbone"
  loyalty: 'High' | 'Medium' | 'Low';
  ambition: 'High' | 'Medium' | 'Low';
  yearsWithTeam: number;
  status: 'Active' | 'Poached' | 'Fired' | 'Retiring';
}

export interface StaffState {
  oc: Coordinator | null;
  dc: Coordinator | null;
  staffChemistry: number; // 0-100
}

export interface RosterSnapshot {
  talentLevel: 'Elite' | 'Good' | 'Average' | 'Depleted';
  cultureHealth: 'Strong' | 'Fragile' | 'Toxic';
  primaryNeed: string;
}

export interface JobOffer {
  id: string;
  type: OfferType;
  team: string;
  role: string;
  conference: string;
  prestige: string;
  adminCompetence: AdminCompetence;
  salary: string;
  contractLength: string;
  buyout: string;
  pitch: string;
  perks: string[];
  status: 'New' | 'Negotiating' | 'Final Offer' | 'Rescinded' | 'Interviewing';
  adPatience?: 'High' | 'Medium' | 'Low' | 'Zero';
  staffPerception: 'Safe Pair of Hands' | 'High Upside Gamble' | 'System Fit' | 'Cheap Option' | 'Desperation Hire'; 
  fanPerception: 'Home Run' | 'Solid Choice' | 'Underwhelming' | 'Who?' | 'Outrage';
  rosterSnapshot: RosterSnapshot;
  marketBuzz: string;
}

export interface TeamStats {
  apRank: string;
  confStanding: string;
  offRank: string;
  defRank: string;
  prestige: string;
}

export interface CareerLog {
  year: number;
  team: string;
  role: string;
  record: string;
  result: string;
  statsSnapshot?: TeamStats;
}

export interface Connection {
  name: string;
  relation: string;
  currentRole: string;
  loyalty: 'High' | 'Medium' | 'Low' | 'Rival';
}

export interface BlackBookEntry {
  id: string;
  name: string;
  role: 'Player' | 'Coach' | 'Admin' | 'Booster' | 'Media';
  currentTeam: string; 
  lastSeenYear: number;
  history: string; 
  status: 'Active' | 'Retired' | 'Deceased';
  relationshipScore: number; // 0-100 scale
}

export interface Promise {
  id: string;
  type: 'Board Mandate' | 'Recruit Promise' | 'Staff Deal' | 'Media Guarantee';
  description: string;
  status: 'Active' | 'Fulfilled' | 'Broken' | 'Void';
  consequence: string;
}

export interface RosterDNA {
  style: 'Developer' | 'Mercenary' | 'Recruiter' | 'Tactician';
  score: number;
}

export interface Financials {
  salary: string;
  contractYears: number;
  buyout: string;
  careerEarnings: number;
}

export interface FanReaction {
  source: 'Twitter' | 'MessageBoard' | 'RadioCall' | 'NewspaperLetter';
  author: string;
  content: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
}

export interface MediaContent {
  headline: string;
  source: 'National TV' | 'Local Beat' | 'Tactical Blog' | 'Tabloid' | 'Campus Paper';
  mediaNarrative: 'The Hero' | 'The Villain' | 'The Hot Seat' | 'The Genius' | 'The Underdog' | 'The Fraud'; 
  narrativeMood: 'Crisis' | 'Euphoria' | 'Skepticism' | 'Apathy' | 'Tension' | 'Stability';
  beatWriterAnalysis: string;
  fanReactions: FanReaction[];
  interviewQuote?: {
    speaker: string;
    context: string;
    quote: string;
  };
}

// --- REALISM TYPES (Replaces RPG) ---

export interface CoachingPhilosophy {
    aggression: number; // 0 (Conservative) - 100 (Risky)
    discipline: number; // 0 (Player's Coach) - 100 (Authoritarian)
    adaptability: number; // 0 (System Purist) - 100 (Flexible)
    mediaSavvy: number; // 0 (Recluse) - 100 (Celebrity)
}

export interface EarnedTrait {
    id: string;
    label: string;
    description: string;
    type: 'Positive' | 'Negative' | 'Neutral';
    icon: string; // Lucide icon name hint
}

export interface CoachingCapital {
    political: number; // 0-100 (Influence with Board/Admin)
    social: number; // 0-100 (Influence with Recruiters/Media)
}

export interface SaveHeader {
  date: string;
  age: number;
  team: string;
  conference: string;
  role: string;
  seasonRecord: string;
  careerRecord: string;
  adminCompetence: AdminCompetence;
  legacyScore: number;
  fanSentiment: number;
  timelinePhase: TimelinePhase;
  phaseTurn: number;
  financials: Financials;
  schemeOffense: string;
  schemeDefense: string;
  qbSituation: string;
  reputationTags: string[];
  jobSecurity: string;
  openThreads: string[];
  network: Connection[];
  blackBook: BlackBookEntry[]; 
  activePromises: Promise[]; 
  rosterDNA: RosterDNA;
  stats: TeamStats;
  staff: StaffState;
  careerHistory: CareerLog[];
  
  // NEW REALISM FIELDS
  philosophy: CoachingPhilosophy;
  capital: CoachingCapital;
  traits: EarnedTrait[];
}

export interface SeasonSummary {
  year: number;
  finalRecord: string;
  accomplishment: string;
  keyStats: string[];
  boardFeedback: string;
  recruitingClassRank: string;
  topSignee: string;
}

export interface TurnLog {
  turnId: number;
  header: SaveHeader;
  mediaContent: MediaContent;
  staffNotes: string;
  seasonSummary?: SeasonSummary;
  jobOffers?: JobOffer[];
  sceneDescription: string;
  resolution?: string; 
  choices: Choice[];
  gameOver: boolean;
}

export interface GameState {
  currentTurn: TurnLog;
  history: TurnLog[];
  gameOver: boolean;
}
