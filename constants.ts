
export const INITIAL_PROMPT = "Initialize simulation. Start Year: 1995 (May). Character: Jacob Rhinehart (Age 22). \n**CRITICAL STARTING CONDITION:** The user is a fresh graduate and currently **UNEMPLOYED**. \n1. Set `header.team` = 'Free Agent'. \n2. Set `header.role` = 'Job Seeker'. \n3. Set `header.timelinePhase` = 'Carousel'. \n4. Generate 3-4 starting opportunities in `jobOffers`. **IMPORTANT:** For a fresh graduate, HC jobs are IMPOSSIBLE. Offers should be GA, Quality Control, Positional Coach (D2/D3), or High School Coordinator. Some should be 'Direct Offer' (low prestige), others 'Interview' (mid prestige). \n5. Set `header.blackBook` to empty array []. \n6. Set `header.rosterDNA` to { style: 'Developer', score: 0 }. \n7. Do NOT assign a team yet. The first turn MUST be the user choosing a job. \nTone: Realistic, Professional, Immersive 1990s Football.";

export const SYSTEM_INSTRUCTION = `
You are the Game Master for "Sideline Saga".
**ROLE:** Realistic Football Simulation Engine (1995-Present).
**TONE:** Objective, Nuanced, Market-Driven. NO RPG SLANG (No "Level Up", No "XP", No "+5 Stats"). Use professional football terminology.

**CRITICAL RULE: CHARACTER NAME**
The protagonist's name is **Jacob Rhinehart**. 
- NEVER use "[Coach Name]", "[User]", or any other placeholder. 
- Always refer to him as Jacob, Rhinehart, or Coach Rhinehart.

**CORE LOGIC: THE COACHING STAFF**
A Head Coach is only as good as his coordinators.
- You must simulate the performance of the OC (Offensive Coordinator) and DC (Defensive Coordinator).
- **Competence:** A low-rated OC (Playcalling < 50) MUST result in poor offensive stats, even if the user picks good dialogue options.
- **Poaching:** If a Coordinator performs too well (Playcalling > 85), they should likely accept a Head Coaching job elsewhere during the Carousel phase.
- **Chemistry:** Staff Chemistry impacts "Job Security".

**CORE LOGIC: CAREER VOLATILITY (PROMOTION & RELEGATION)**
Success is not linear. One bad season can destroy a career.
- **The Ladder is Slippery:** If a user fails at a high level (e.g., fired as SEC HC), their next offer might be a "Relegation":
  1. **Tier Drop:** SEC HC -> MAC HC -> FCS Coordinator -> High School HC.
  2. **Role Drop:** NFL HC -> NCAA Coordinator -> NCAA Analyst -> Positional Coach.

**CAUSALITY ENGINE (NARRATIVE -> LOGIC):**
- **Narrative MUST impact State:** If you write a scene about a "bad loss" or "scandal", you **MUST** return 'headerUpdates' that lower 'fanSentiment' or 'jobSecurity'.
- **Consequences:**
  - Bad Press -> Lowers 'social' capital.
  - Losing Streak -> Lowers 'political' capital and 'jobSecurity'.
  - Broken Promise -> marks Promise as 'Broken' and lowers 'adminCompetence' (Trust).
  - Big Upset Win -> Raises 'political' capital and 'rosterDNA.score'.

**LIVING WORLD ENGINE:**
- **Rivals & Allies:** They do not pause when the user leaves.
- **DIRECTIVE:** During 'Carousel' or 'Offseason' phases, you **MUST** update 1-2 existing Black Book entries to reflect their career moves.

**SEASON STRUCTURE:**
- Preseason -> Regular (3 blocks) -> Postseason -> Carousel -> Offseason.
- **IMPORTANT:** Offseason (Feb) leads to Preseason (Aug) of the **SAME YEAR**.

**OUTPUT:** JSON ONLY.
`;

export const ARCHETYPES = [
  {
    id: 'offense_guru',
    label: 'The Offensive Whiz Kid',
    description: 'A young prodigy obsessed with the West Coast Offense and passing concepts.',
    promptContext: 'Background: Former backup QB turned film junkie. Obsessed with Steve Spurrier and Bill Walsh. Strengths: Scheme, QB Development. Weakness: Defense, Physicality. Starting Role Preference: Offensive GA or QB Coach.'
  },
  {
    id: 'defense_beast',
    label: 'The Iron Curtain',
    description: 'A gritty linebacker turned coach who believes in pain and discipline.',
    promptContext: 'Background: Former walk-on Linebacker. Disciple of the 4-6 Bear defense. Believes in hitting hard and stopping the run. Strengths: Defense, Discipline. Weakness: Modern Offense, Player Relations. Starting Role Preference: Defensive GA or LB Coach.'
  },
  {
    id: 'legacy_son',
    label: 'The Legacy Hire',
    description: 'Son of a legendary coach. Doors open easily, but expectations are crushing.',
    promptContext: 'Background: Son of a College Football Hall of Fame coach. Grew up on the sidelines. Knows the politics but lacks experience. Strengths: Connections, Recruiting. Weakness: "Silver Spoon" perception, immense pressure. Starting Role Preference: QC or Analyst at Blue Blood.'
  },
  {
    id: 'analytics_nerd',
    label: 'The Moneyball Pioneer',
    description: 'A math major who never played, trying to bring data to 1995 football.',
    promptContext: 'Background: Economics major, never played a down. Uses spreadsheets to call plays. Viewed as an alien by old-school coaches. Strengths: Efficiency, Game Management. Weakness: "Football Guy" credibility, Recruiting. Starting Role Preference: QC or Assistant.'
  },
  {
    id: 'culture_guy',
    label: 'The Locker Room Leader',
    description: 'High energy motivator. It is not about Xs and Os, it is about hearts.',
    promptContext: 'Background: High energy special teams ace. Master motivator. Believes culture eats strategy for breakfast. Strengths: Morale, Recruiting, Media. Weakness: X\'s and O\'s, Adjustments. Starting Role Preference: Special Teams GA or Recruiting Coordinator.'
  }
];

// --- HARDCODED REALISM DATA ---

export const TACTICAL_META = (year: number) => {
    if (year < 2000) return "META: I-Formation, Wishbone, West Coast Offense (Short Passing). Defense: 4-3 Base, 4-6 Bear. Spread is considered 'gimmicky'. Mobile QBs are rare.";
    if (year < 2008) return "META: The Spread Option (Urban Meyer) is taking over. Pro Style is still dominant in NFL. Defense: 4-3, Tampa 2. Speed is beginning to kill size.";
    if (year < 2014) return "META: HUNH (Hurry Up No Huddle). Read Option is peak meta. Defense: 3-4, Nickel packages becoming base. The TE position is evolving into a big WR.";
    if (year < 2020) return "META: RPO (Run Pass Option). Air Raid is mainstream. Defense: 3-3-5 Stack, Pattern Match Coverage to stop RPO. Positionless football begins.";
    return "META: Wide Zone, Simulated Pressures, Positionless Defense. NIL/Portal means depth is bought, not built. Quarterbacks must be dual-threat.";
};

export const HISTORICAL_EVENTS: Record<number, string> = {
    1995: "Nebraska dominates. The SWC is dissolving. The internet is barely a thing.",
    1996: "Florida wins the title in a rematch vs FSU. The Big 12 begins play.",
    1997: "Charles Woodson wins the Heisman. Michigan and Nebraska split the title.",
    1998: "The BCS Era begins. Tennessee wins the first BCS Championship.",
    1999: "Michael Vick and Virginia Tech reach the title game. FSU goes wire-to-wire.",
    2000: "Oklahoma wins the title under Bob Stoops. The Spread offense is still a novelty.",
    2001: "Miami (The U) fields the greatest roster of all time. 9/11 impacts the season schedule.",
    2002: "Ohio State shocks Miami in the Fiesta Bowl. Double overtime controversy.",
    2003: "LSU and USC split the title. The BCS is under fire.",
    2004: "USC and Oklahoma play for the title. Auburn goes undefeated but gets left out.",
    2005: "Texas vs USC. Vince Young. The greatest game ever played.",
    2006: "Boise State upsets Oklahoma. The SEC title game becomes the de-facto national semi-final.",
    2007: "The Year of Chaos. App State beats Michigan. 2-loss LSU wins the title.",
    2008: "Tim Tebow's 'The Promise'. Florida wins the title. The Spread Option is dominant.",
    2009: "Alabama beats Texas. The Nick Saban dynasty officially begins.",
    2010: "Cam Newton carries Auburn. Conference Realignment rumors explode (Nebraska to Big 10).",
    2011: "Alabama vs LSU rematch in the title game. Fans demand a Playoff.",
    2012: "Johnny Manziel wins the Heisman as a Freshman. Texas A&M and Mizzou join the SEC.",
    2013: "Auburn's 'Kick Six'. FSU ends the SEC streak.",
    2014: "The College Football Playoff (CFP) begins. Ohio State wins the first bracket.",
    2015: "Alabama vs Clemson Round 1. The rivalry begins.",
    2016: "Clemson beats Alabama. Deshaun Watson vs Jalen Hurts.",
    2017: "UCF claims a National Title. Alabama beats Georgia in OT (2nd & 26).",
    2018: "Trevor Lawrence destroys Alabama. The Transfer Portal launches (October).",
    2019: "Joe Burrow and LSU have the greatest offensive season in history.",
    2020: "COVID-19 Pandemic. Shortened seasons. Empty stadiums. Chaos.",
    2021: "NIL is legalized. Players can be paid. Georgia wins the title.",
    2022: "Georgia goes back-to-back. TCU makes a Cinderella run to the final.",
    2023: "Michigan wins the title amidst sign-stealing controversy. Pac-12 dissolves.",
    2024: "12-Team Playoff begins. Conference super-alignment (SEC/Big 10 dominant)."
};

export const CONFERENCES_BY_ERA = (year: number): string => {
    if (year < 1996) return "Valid Conferences: SEC, Big 8, SWC (Dissolving), Big Ten, Pac-10, ACC, Big East, WAC, Division I-AA (FCS).";
    if (year < 2011) return "Valid Conferences: SEC, Big 12, Big Ten, Pac-10, ACC, Big East, Mountain West, WAC, C-USA, FCS (I-AA), Division II, Division III.";
    if (year < 2024) return "Valid Conferences: SEC, Big 12, Big Ten, Pac-12, ACC, AAC, Mountain West, Sun Belt, MAC, C-USA, FCS, D2, D3, NAIA, High School (State Assoc).";
    return "Valid Conferences: SEC (Super League), Big Ten (Super League), Big 12, ACC, Mountain West, AAC, Sun Belt, MAC, UFL (Spring League), FCS, D2, D3. NOTE: Pac-12 is effectively dead/rebuilding.";
};

export const getPostseasonFormat = (year: number) => {
    const format = POSTSEASON_FORMATS.find(f => year >= f.start && year <= f.end);
    return format || POSTSEASON_FORMATS[0];
};

export const POSTSEASON_FORMATS = [
    { start: 1990, end: 1997, type: "Bowl Alliance", slots: 2, desc: "No true title game guaranteed. Polls decide #1 vs #2 based on Bowl ties." },
    { start: 1998, end: 2013, type: "BCS", slots: 2, desc: "#1 vs #2 guaranteed in BCS Championship Game. Computer rankings are king." },
    { start: 2014, end: 2023, type: "CFP (4-Team)", slots: 4, desc: "Selection Committee picks Top 4. Semi-finals at New Year's 6 Bowls." },
    { start: 2024, end: 2099, type: "CFP (12-Team)", slots: 12, desc: "12 Teams. Auto-bids for Top 5 Conf Champs. Home games for rounds 1-4." }
];
