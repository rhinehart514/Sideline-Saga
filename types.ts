export type TimelinePhase = 'Preseason' | 'Regular Season' | 'Postseason' | 'Carousel' | 'Offseason';

export interface Choice {
  id: string;
  text: string;
  type: 'action' | 'dialogue' | 'strategy';
}

export interface JobOffer {
  id: string;
  team: string;
  role: string;
  conference: string;
  prestige: string; // e.g. "Blue Blood", "Rebuild", "Contender"
  salary: string;   // e.g. "$400k/yr"
  contractLength: string; // New: e.g. "4 Years"
  buyout: string;   // New: e.g. "$2.5M"
  pitch: string;    // The narrative reason they want you
  perks: string[];  // New: e.g. ["Country Club Membership", "Unlimited Staff Pool"]
  status: 'New' | 'Negotiating' | 'Final Offer' | 'Rescinded'; // New: Tracks state
  adPatience?: 'High' | 'Medium' | 'Low' | 'Zero'; // New: Tracks risk of offer being pulled
}

export interface TeamStats {
  apRank: string;      // e.g. "#4", "NR", "RV"
  confStanding: string; // e.g. "1st in West"
  offRank: string;     // e.g. "12th"
  defRank: string;     // e.g. "104th"
  prestige: string;    // e.g. "Blue Blood"
}

export interface CareerLog {
  year: number;
  team: string;
  role: string;
  record: string;
  result: string; // e.g. "Bowl Win", "Fired", "Promoted"
}

export interface Connection {
  name: string;
  relation: string; // e.g. "Former DC", "Mentor", "Rival", "Star QB"
  currentRole: string; // e.g. "HC at Florida"
  loyalty: 'High' | 'Medium' | 'Low' | 'Rival';
}

export interface SaveHeader {
  date: string;
  age: number;
  team: string;
  conference: string;
  role: string;
  seasonRecord: string;
  legacyScore: number;
  fanSentiment: number; // New: 0-100 Approval Rating
  timelinePhase: TimelinePhase;
  schemeOffense: string;
  schemeDefense: string;
  qbSituation: string;
  reputationTags: string[];
  jobSecurity: string;
  openThreads: string[];
  network: Connection[]; // New: The Coaching Tree / Contact List
  stats: TeamStats;
  careerHistory: CareerLog[];
}

export interface SeasonSummary {
  year: number;
  finalRecord: string;
  accomplishment: string;
  keyStats: string[];
  boardFeedback: string;
}

export interface TurnLog {
  turnId: number;
  header: SaveHeader;
  mediaHeadline: string;
  mediaBuzz?: string; // New: "Word on the street" (Radio/Papers)
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

export interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}