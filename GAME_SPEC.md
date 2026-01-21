# Sideline Saga — Complete Game Specification

**Version**: 2.0
**Last Updated**: January 2026
**Status**: Design Lock

---

## Table of Contents

1. [Game Overview](#1-game-overview)
2. [Core Loop](#2-core-loop)
3. [Era System](#3-era-system)
4. [League Structure](#4-league-structure)
5. [Roster & Player System](#5-roster--player-system)
6. [Coaching Staff System](#6-coaching-staff-system)
7. [Recruiting Engine (College)](#7-recruiting-engine-college)
8. [Draft & Free Agency (NFL)](#8-draft--free-agency-nfl)
9. [Game Simulation](#9-game-simulation)
10. [Career Progression](#10-career-progression)
11. [Reputation System](#11-reputation-system)
12. [Relationships & Network](#12-relationships--network)
13. [Financial System](#13-financial-system)
14. [Narrative Engine](#14-narrative-engine)
15. [Save System](#15-save-system)
16. [Technical Architecture](#16-technical-architecture)

---

## 1. Game Overview

### 1.1 Concept

**Sideline Saga** is a football coaching career simulator spanning 1995 to 2035+. Players experience the full arc of a coaching career—from graduate assistant to legendary head coach (or cautionary tale)—across college football (FCS, G5, P5) and the NFL.

### 1.2 Core Fantasy

> "Live the career you'd have if you chose the sideline over the stands."

The game captures:
- The grind of climbing the coaching ladder
- Political navigation (ADs, owners, boosters, media)
- Building programs vs. inheriting talent
- Dynasty creation and legacy
- Career implosion, redemption arcs, comebacks
- Era-authentic football culture (1995 feels different than 2024)

### 1.3 Design Pillars

| Pillar | Description |
|--------|-------------|
| **Authenticity** | Real career dynamics, era-accurate rules/culture |
| **Consequence** | Every decision ripples through your career |
| **Emergence** | No two careers play the same |
| **Drama** | Sports media narrative, scandals, rivalries |
| **Depth** | Full roster management, not abstracted |

### 1.4 Platform & Constraints

- **Platform**: Web browser (desktop-first, mobile-responsive)
- **Backend**: None. Fully client-side.
- **AI**: Local LLM via WebLLM (zero API cost)
- **Persistence**: IndexedDB / localStorage
- **Session Length**: 5-15 minutes per "turn"

---

## 2. Core Loop

### 2.1 Annual Cycle

```
┌─────────────────────────────────────────────────────────────────┐
│                        ANNUAL CYCLE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   OFFSEASON ──▶ PRESEASON ──▶ REGULAR SEASON ──▶ POSTSEASON   │
│       │                                               │         │
│       │                                               ▼         │
│       ◀─────────────────── CAROUSEL ◀────────────────┘         │
│       │                       │                                 │
│       │                       ▼                                 │
│       │              [STAY / MOVE / FIRED]                     │
│       │                       │                                 │
│       ◀───────────────────────┘                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Phase Details

#### OFFSEASON (February - July)
**Duration**: 3-5 decision points

| Activity | College | NFL |
|----------|---------|-----|
| Roster Building | Signing Day, Portal | Draft, Free Agency |
| Staff Management | Hire/fire coordinators | Coaching staff changes |
| Scheme Installation | Spring practice | OTAs, minicamp |
| Facilities/Program | Fundraising, upgrades | N/A |
| Contract Negotiation | Extension talks | Contract restructures |

**Key Decisions**:
- Staff hires (promote internal vs. outside hire)
- Scheme changes (risk vs. continuity)
- Roster priorities (need vs. best available)
- Program investments (recruiting vs. facilities)

#### PRESEASON (August)
**Duration**: 2-3 decision points

| Activity | College | NFL |
|----------|---------|-----|
| Camp | Fall camp, scrimmages | Training camp, preseason games |
| Depth Chart | Position battles, starters | Roster cuts (90→53) |
| Expectations | Media days, predictions | Over/under, playoff odds |
| Injuries | Camp casualties | Preseason injuries |

**Key Decisions**:
- Depth chart battles (veteran vs. talented freshman)
- Scheme tweaks based on personnel
- Managing expectations (hype vs. reality)
- Redshirt decisions (college only)

#### REGULAR SEASON (September - November/December)
**Duration**: 3 game blocks (4 games each for college, variable for NFL)

| Week Block | Focus |
|------------|-------|
| Early Season | Non-conference, identity formation |
| Mid Season | Conference play begins, bye weeks |
| Late Season | Rivalry games, playoff push |

**Key Decisions**:
- Game planning (scheme adjustments)
- Personnel changes (benching starters)
- Injury management (play through vs. sit)
- In-season recruiting (college)
- Media management (pressers, narratives)
- Handling adversity (losing streaks)

#### POSTSEASON (December - January)
**Duration**: 1-3 decision points (based on qualification)

| Outcome | College | NFL |
|---------|---------|-----|
| Miss | No bowl (< 6 wins) | Season over |
| Low Tier | Minor bowl | Wild card round |
| Mid Tier | NY6 bowl | Divisional round |
| Elite | CFP / Championship | Conference / Super Bowl |

**Key Decisions**:
- Bowl preparation vs. recruiting balance
- Opt-outs (players skipping for draft)
- Championship pressure moments
- Legacy-defining decisions

#### CAROUSEL (December - February)
**Duration**: Variable (1-10+ decision points)

The coaching carousel is where careers are made and destroyed.

| Scenario | What Happens |
|----------|--------------|
| You're Hot | Receive multiple offers, negotiate |
| You're Stable | Stay or explore quietly |
| You're on Hot Seat | Fight to keep job or seek exit |
| You're Fired | Scramble for any job, take a step back |

**Key Decisions**:
- Accept/decline/negotiate offers
- Loyalty vs. ambition
- Timing (early commitment vs. waiting)
- Bridge burning (how you leave matters)

### 2.3 Turn Structure

Each "turn" within a phase:

```
1. CONTEXT PRESENTATION
   - Current state summary
   - Recent events/news
   - Pending decisions

2. DECISION POINT
   - 2-4 choices presented
   - Optional custom action input
   - Consequences hinted (not guaranteed)

3. RESOLUTION
   - Outcome narrated
   - State changes applied
   - Ripple effects noted

4. TRANSITION
   - Move to next decision point or phase
```

---

## 3. Era System

### 3.1 Era Definitions

The game world changes over time. Not just salaries—rules, culture, technology.

| Era | Years | Defining Features |
|-----|-------|-------------------|
| **Pre-BCS** | 1995-1997 | Bowl Alliance, poll chaos, early free agency |
| **BCS Era** | 1998-2013 | Computer rankings, SEC dominance, coaching salary explosion |
| **Early CFP** | 2014-2020 | 4-team playoff, transfer sit-out year, recruiting arms race |
| **NIL Era** | 2021-2025 | NIL deals, transfer portal chaos, super conferences |
| **Modern Era** | 2026+ | 12+ team playoff, conference consolidation, projected trends |

### 3.2 Era State Variables

```typescript
interface EraState {
  year: number;

  // College-specific
  playoffFormat: '4-team' | '12-team' | 'none';
  transferRules: 'sit-year' | 'one-free' | 'portal-chaos';
  nilStatus: 'illegal' | 'legal' | 'wild-west';
  scholarshipLimit: number;
  oversigningRules: 'loose' | 'strict';

  // NFL-specific
  salaryCap: number;
  rookieWageScale: boolean;
  franchiseTagRules: 'original' | 'modern';

  // Universal
  socialMediaPresence: 'none' | 'emerging' | 'dominant';
  analyticsAdoption: 'minimal' | 'growing' | 'standard';
  mediaLandscape: 'traditional' | 'espn-era' | 'streaming';

  // Conference structure (changes over time)
  conferences: ConferenceConfig[];
}
```

### 3.3 Era Transitions

Era changes are not just cosmetic. They trigger:

1. **Rule Changes**: Announced during offseason, affect next season
2. **Conference Realignment**: Teams move, super conferences form
3. **Economic Shifts**: Salary expectations, TV money distribution
4. **Cultural Shifts**: NIL introduction, transfer portal evolution
5. **Technology Changes**: Analytics adoption, social media impact

Example era event:
```
YEAR: 2014
EVENT: College Football Playoff Introduced

The BCS is dead. A 4-team playoff will determine the national champion.
Your path to glory just got clearer—and harder.

- Top 4 teams make playoff
- Selection Committee replaces computers
- Conference championships matter more
- NY6 bowls remain prestigious
```

### 3.4 Historical Accuracy

The game tracks real-world historical beats:

| Year | Event | Impact |
|------|-------|--------|
| 1998 | BCS begins | Championship game format |
| 2006 | NFL rookie cap proposed | (Implemented 2011) |
| 2011 | Conference realignment wave | Nebraska to B1G, etc. |
| 2014 | CFP begins | 4-team playoff |
| 2021 | NIL legalized | Recruiting revolution |
| 2023 | Transfer portal explosion | Roster instability |
| 2024 | 12-team CFP | Expanded access |
| 2025+ | Projected: More realignment | Super conferences |

---

## 4. League Structure

### 4.1 College Football Hierarchy

```
┌─────────────────────────────────────────┐
│           FBS - POWER CONFERENCES       │
│  (SEC, Big Ten, Big 12, ACC, Pac-12*)   │
│         16-20 teams each                │
│      Blue Bloods + Power Programs       │
├─────────────────────────────────────────┤
│           FBS - GROUP OF FIVE           │
│  (AAC, MWC, Sun Belt, MAC, C-USA)      │
│         10-14 teams each                │
│    Stepping stones, occasional CFP      │
├─────────────────────────────────────────┤
│              FCS (Division I-AA)        │
│      Where many careers start           │
│      Smaller budgets, less pressure     │
├─────────────────────────────────────────┤
│           DIVISION II / III             │
│      Lowest coaching jobs               │
│      "The Wilderness" fallback          │
└─────────────────────────────────────────┘

* Pac-12 dissolves in 2024+ era
```

### 4.2 NFL Structure

```
┌─────────────────────────────────────────┐
│            NFL - 32 TEAMS               │
├─────────────────────────────────────────┤
│  AFC                    NFC             │
│  ├── East               ├── East        │
│  ├── North              ├── North       │
│  ├── South              ├── South       │
│  └── West               └── West        │
├─────────────────────────────────────────┤
│  17-game season + playoffs              │
│  Salary cap environment                 │
│  Win-now pressure (shorter leash)       │
└─────────────────────────────────────────┘
```

### 4.3 Team Database Schema

```typescript
interface Team {
  id: string;
  name: string;
  nickname: string;
  abbreviation: string;

  // Classification
  league: 'ncaa' | 'nfl';
  level: 'fbs-p5' | 'fbs-g5' | 'fcs' | 'nfl';
  conference: string;
  division?: string;

  // Identity
  primaryColor: string;
  secondaryColor: string;
  stadium: string;
  stadiumCapacity: number;
  location: { city: string; state: string };

  // Program status (changes over time)
  prestige: 1 | 2 | 3 | 4 | 5; // 5 = Blue Blood
  facilities: 1 | 2 | 3 | 4 | 5;
  budget: number;
  fanbasePassion: number; // 1-100
  expectations: 'rebuild' | 'bowl' | 'contend' | 'championship';

  // Rivals
  primaryRival?: string;
  secondaryRivals: string[];

  // Historical context
  nationalChampionships: number;
  conferenceChampionships: number;
  lastChampionshipYear?: number;
  notableCoaches: string[];

  // Current state
  currentRecord: { wins: number; losses: number };
  currentRanking?: number;
  currentCoach?: string;
  currentRoster: Roster;
}
```

### 4.4 Team Generation

At game start, generate ~200 college teams + 32 NFL teams.

**Blue Bloods** (8-10 programs):
- Fictional versions of elite programs
- 10+ national championships
- Top-tier facilities, huge budgets
- Expectation: championship or bust

**Power Programs** (25-30):
- Conference contenders
- Strong history, good resources
- Expectation: compete for conference, occasional playoff

**Solid Programs** (40-50):
- Bowl regulars
- Expectation: 6-8 wins, occasional breakout

**Rebuild Projects** (50+):
- Struggling programs
- Low expectations, long leash
- Good place to build a legacy

**Bottom Feeders** (30+):
- Perennial losers
- Desperation hires only
- Where careers go to die or restart

---

## 5. Roster & Player System

### 5.1 Player Attributes

Each player has position-specific attributes rated 1-99.

#### Universal Attributes

```typescript
interface PlayerBase {
  id: string;
  firstName: string;
  lastName: string;

  // Physical
  age: number;
  height: number; // inches
  weight: number; // lbs

  // Status
  position: Position;
  year: 'FR' | 'RS-FR' | 'SO' | 'RS-SO' | 'JR' | 'RS-JR' | 'SR' | 'RS-SR' | number; // college or NFL years
  eligibilityRemaining: number;

  // Ratings
  overall: number; // 1-99, calculated from attributes
  potential: number; // ceiling OVR
  development: 'slow' | 'normal' | 'star' | 'superstar';

  // Universal attributes
  speed: number;
  acceleration: number;
  strength: number;
  agility: number;
  awareness: number;
  stamina: number;
  injury: number; // injury resistance
  toughness: number;

  // Mental
  footballIQ: number;
  clutch: number;
  consistency: number;

  // Status flags
  injured: boolean;
  injuryWeeksRemaining: number;
  redshirted: boolean;
  transferPortal: boolean;
  nflDeclared: boolean;

  // Career tracking
  careerStats: Stats;
  seasonStats: Stats;
  awards: string[];
}
```

#### Position-Specific Attributes

**Quarterback**
```typescript
interface QBAttributes {
  throwPower: number;
  throwAccuracyShort: number;
  throwAccuracyMid: number;
  throwAccuracyDeep: number;
  throwOnRun: number;
  playAction: number;
  poise: number;
  release: number;
  // Optional rushing
  carrying?: number;
  breakTackle?: number;
}
```

**Running Back**
```typescript
interface RBAttributes {
  carrying: number;
  breakTackle: number;
  trucking: number;
  elusiveness: number;
  spinMove: number;
  jukeMove: number;
  stiffArm: number;
  ballCarrierVision: number;
  catching: number;
  passBlock: number;
}
```

**Wide Receiver / Tight End**
```typescript
interface ReceiverAttributes {
  catching: number;
  catchInTraffic: number;
  spectacularCatch: number;
  release: number;
  routeRunning: number;
  shortRoutes: number;
  mediumRoutes: number;
  deepRoutes: number;
  // TE specific
  runBlock?: number;
  passBlock?: number;
}
```

**Offensive Line**
```typescript
interface OLAttributes {
  runBlock: number;
  runBlockPower: number;
  runBlockFinesse: number;
  passBlock: number;
  passBlockPower: number;
  passBlockFinesse: number;
  leadBlock: number;
  impactBlocking: number;
}
```

**Defensive Line**
```typescript
interface DLAttributes {
  tackling: number;
  hitPower: number;
  blockShedding: number;
  powerMoves: number;
  finesseMoves: number;
  pursuit: number;
  playRecognition: number;
}
```

**Linebacker**
```typescript
interface LBAttributes {
  tackling: number;
  hitPower: number;
  pursuit: number;
  playRecognition: number;
  zoneCoverage: number;
  manCoverage: number;
  blockShedding: number;
  // OLB specific
  powerMoves?: number;
  finesseMoves?: number;
}
```

**Defensive Back**
```typescript
interface DBAttributes {
  tackling: number;
  hitPower: number;
  manCoverage: number;
  zoneCoverage: number;
  press: number;
  playRecognition: number;
  pursuit: number;
  catching: number;
}
```

**Specialists**
```typescript
interface KickerAttributes {
  kickPower: number;
  kickAccuracy: number;
  // Punter
  puntPower?: number;
  puntAccuracy?: number;
}
```

### 5.2 Overall Calculation

OVR is a weighted average of position-relevant attributes.

```typescript
function calculateOverall(player: Player): number {
  const weights = POSITION_WEIGHTS[player.position];
  let sum = 0;
  let totalWeight = 0;

  for (const [attr, weight] of Object.entries(weights)) {
    sum += player[attr] * weight;
    totalWeight += weight;
  }

  return Math.round(sum / totalWeight);
}
```

**OVR Tiers**:
| OVR Range | Tier | Description |
|-----------|------|-------------|
| 90-99 | Elite | All-American, Pro Bowl, All-Pro |
| 80-89 | Starter | Solid starter, above average |
| 70-79 | Rotation | Spot starter, key backup |
| 60-69 | Depth | Special teams, emergency |
| 50-59 | Project | Raw, developmental |
| < 50 | Roster Fill | Walk-on level |

### 5.3 Player Development

Players improve (or regress) based on:

1. **Age Curve**: Peak around 24-28, decline after 30+
2. **Development Trait**: Determines improvement speed
3. **Playing Time**: Starters develop faster
4. **Coaching Quality**: Better coaches = better development
5. **Scheme Fit**: Players in matching schemes develop faster

```typescript
function developPlayer(player: Player, context: DevelopmentContext): void {
  const baseGain = DEVELOPMENT_BASE[player.development]; // 1-4 points
  const ageModifier = getAgeCurveModifier(player.age);
  const playingTimeBonus = context.isStarter ? 1.5 : 1.0;
  const coachingBonus = context.coachDevelopmentRating / 100;
  const schemeFitBonus = context.schemeFit ? 1.2 : 0.8;

  const totalGain = baseGain * ageModifier * playingTimeBonus * coachingBonus * schemeFitBonus;

  // Apply to random attributes (weighted by position importance)
  distributeGains(player, totalGain);

  // Recalculate OVR
  player.overall = calculateOverall(player);

  // Check for regression (age 30+)
  if (player.age >= 30) {
    applyRegression(player);
  }
}
```

### 5.4 Player Generation

Generate realistic player pools with:

- **Name Generation**: Era-appropriate names, regional variations
- **Physical Traits**: Position-appropriate height/weight distributions
- **Attribute Curves**: Normal distribution with position-specific means
- **Star Distribution**: Follows recruiting star distribution

```typescript
function generateRecruitingClass(year: number, count: number): Recruit[] {
  const recruits: Recruit[] = [];

  // Star distribution: 5★ (1%), 4★ (10%), 3★ (30%), 2★ (40%), 1★ (19%)
  const starCounts = {
    5: Math.round(count * 0.01),
    4: Math.round(count * 0.10),
    3: Math.round(count * 0.30),
    2: Math.round(count * 0.40),
    1: Math.round(count * 0.19),
  };

  for (const [stars, num] of Object.entries(starCounts)) {
    for (let i = 0; i < num; i++) {
      recruits.push(generateRecruit(parseInt(stars), year));
    }
  }

  return recruits;
}
```

### 5.5 Roster Limits

| League | Limit | Notes |
|--------|-------|-------|
| FBS | 85 scholarship | + walk-ons (unlimited) |
| FCS | 63 scholarship | Lower budgets |
| NFL | 53 active | + practice squad (16) |

---

## 6. Coaching Staff System

### 6.1 Staff Positions

**College Staff**:
```
Head Coach
├── Offensive Coordinator
│   ├── QB Coach
│   ├── RB Coach
│   ├── WR Coach
│   ├── TE Coach
│   └── OL Coach
├── Defensive Coordinator
│   ├── DL Coach
│   ├── LB Coach
│   └── DB Coach
├── Special Teams Coordinator
├── Recruiting Coordinator
├── Strength & Conditioning
└── Analysts / Quality Control (unlimited)
```

**NFL Staff** (similar but no recruiting):
```
Head Coach
├── Offensive Coordinator
│   └── Position coaches
├── Defensive Coordinator
│   └── Position coaches
├── Special Teams Coordinator
└── Assistants
```

### 6.2 Coach Attributes

```typescript
interface CoachProfile {
  id: string;
  name: string;
  age: number;

  // Ratings (1-99)
  overall: number;
  recruiting: number; // college only
  playerDevelopment: number;
  gameManagement: number;
  playCalling: number;
  leadership: number;
  mediaRelations: number;

  // Scheme preferences
  offensiveScheme?: OffensiveScheme;
  defensiveScheme?: DefensiveScheme;

  // Reputation
  reputationTags: string[];
  notableStops: CareerStop[];

  // Career status
  yearsExperience: number;
  currentRole: string;
  contractYearsRemaining: number;
  salary: number;
}
```

### 6.3 Scheme System

**Offensive Schemes**:
| Scheme | Key Traits | Best For |
|--------|------------|----------|
| Pro Style | Balanced, under center | Pro-ready QB, balanced roster |
| Spread | Shotgun, tempo | Athletic QB, fast WRs |
| Air Raid | Pass-heavy, vertical | Strong-arm QB, deep threats |
| Run-Heavy | Ground & pound | Elite OL, power RB |
| RPO-Based | Read options | Dual-threat QB |
| West Coast | Short passing | Accurate QB, YAC receivers |

**Defensive Schemes**:
| Scheme | Key Traits | Best For |
|--------|------------|----------|
| 4-3 | Traditional, balanced | Versatile DL, rangy LBs |
| 3-4 | OLB rushers | Athletic OLBs, nose tackle |
| Nickel/Dime | Pass-heavy fronts | DBs, coverage LBs |
| 4-2-5 | Hybrid | Spread offense era |
| Aggressive | Blitz-heavy | Talented secondary |
| Zone | Coverage-first | Ball-hawking DBs |

### 6.4 Coaching Trees

Coaches have mentors. Being part of a famous tree matters.

```typescript
interface CoachingTree {
  mentor: string;
  relationship: 'disciple' | 'assistant' | 'colleague';
  yearsUnder: number;
  reputation: string; // "Saban Tree", "Reid Tree", etc.
}
```

Hiring from a respected tree gives credibility. Failing after coming from a tree can damage the tree's reputation.

---

## 7. Recruiting Engine (College)

### 7.1 Recruiting Calendar

```
February:     Signing Day (early period: December)
March-May:    Spring evaluation, unofficial visits
June:         Camp season, official visits begin
July:         Dead period
August:       Fall camp starts
September:    In-season recruiting begins
October:      Official visit weekends
November:     Late official visits, early commits
December:     Early Signing Period
January:      Final push
February:     National Signing Day
```

### 7.2 Recruit Attributes

```typescript
interface Recruit extends PlayerBase {
  // Recruiting-specific
  stars: 1 | 2 | 3 | 4 | 5;
  compositeRanking: number; // national rank
  stateRanking: number;
  positionRanking: number;

  // Preferences
  homeState: string;
  preferredDistance: 'close' | 'regional' | 'anywhere';
  priorities: RecruitPriority[]; // ordered list

  // Interest levels per school
  interestMap: Map<string, InterestLevel>;

  // Decision timeline
  committedTo?: string;
  commitDate?: Date;
  isHardCommit: boolean;
  decommitRisk: number;
  signingStatus: 'uncommitted' | 'committed' | 'signed';
}

type RecruitPriority =
  | 'playing-time'
  | 'championships'
  | 'nfl-development'
  | 'academics'
  | 'proximity-home'
  | 'facilities'
  | 'coach-stability'
  | 'nil-opportunity'  // Post-2021
  | 'culture-fit';
```

### 7.3 Recruiting Actions

| Action | Cost | Effect |
|--------|------|--------|
| Send Mail | Free | Minimal interest bump |
| Call | Time | Small interest bump |
| Home Visit | Time + Travel | Moderate interest bump |
| Official Visit | $$$ | Major interest bump (limited to 5/recruit) |
| Junior Day | Time | Evaluate multiple prospects |
| Camp Invite | $ | Evaluate + small bump |
| Social Media | Free | Era-dependent (post-2010) |
| NIL Pitch | $$$ | Post-2021 only |

### 7.4 Recruiting Budget

```typescript
interface RecruitingBudget {
  total: number;
  spent: number;
  remaining: number;

  // Category limits
  travelBudget: number;
  officialVisits: number; // max per year
  unofficialVisits: number;

  // Staff allocation
  recruitingCoordinators: number;
  areasOfFocus: string[]; // states/regions
}
```

### 7.5 Commitment Mechanics

Recruits decide based on weighted priorities:

```typescript
function calculateCommitProbability(
  recruit: Recruit,
  school: Team,
  context: RecruitingContext
): number {
  let score = 0;

  for (const priority of recruit.priorities) {
    const weight = getPriorityWeight(priority, recruit.priorities.indexOf(priority));
    const schoolScore = evaluateSchoolForPriority(school, priority, context);
    score += weight * schoolScore;
  }

  // Add relationship factor (coach rapport)
  score += context.coachRelationship * 0.15;

  // Add momentum factor (recent commits, wins)
  score += context.momentum * 0.10;

  // Normalize and return
  return Math.min(1, Math.max(0, score / 100));
}
```

### 7.6 Transfer Portal (Era-Dependent)

| Era | Rules |
|-----|-------|
| Pre-2018 | Must sit 1 year unless waiver |
| 2018-2020 | Waivers more common |
| 2021+ | One free transfer, immediate eligibility |
| 2023+ | Portal chaos, free-for-all |

```typescript
interface TransferPortalEntry {
  player: Player;
  enterDate: Date;
  reason: 'playing-time' | 'coaching-change' | 'nil' | 'personal' | 'grad-transfer';
  eligibilityStatus: 'immediate' | 'sit-year' | 'pending-waiver';
  interestList: Team[];
}
```

---

## 8. Draft & Free Agency (NFL)

### 8.1 NFL Draft

**Rounds**: 7
**Picks per Round**: 32 (+ compensatory)
**Player Eligibility**: 3 years from high school

```typescript
interface DraftProspect {
  player: Player;
  projectedRound: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'UDFA';
  combineResults?: CombineResults;
  proDay?: ProDayResults;
  medicalFlags: string[];
  characterConcerns: string[];

  // Scouting
  scoutGrade: number; // 1-100
  ceiling: string;
  floor: string;
  comparison: string; // "Pro comparison: Player X"
}
```

### 8.2 Draft Day

As a coach, you influence draft decisions:

1. **Big Board Input**: Rank prospects for your scheme
2. **Position Needs**: Communicate priorities to GM
3. **Trade Proposals**: Suggest moves up/down
4. **UDFA Targets**: Priority list for undrafted players

Your influence depends on:
- Years with team
- Recent success
- Owner/GM relationship

### 8.3 Free Agency

**Periods**:
- **Franchise Tag Deadline**: March (pre-FA)
- **Legal Tampering**: 2 days before FA opens
- **Free Agency Opens**: Mid-March
- **Post-Draft FA**: May-August

```typescript
interface FreeAgent {
  player: Player;
  previousTeam: string;
  askingPrice: number; // $/year
  yearsWanted: number;
  marketInterest: 'high' | 'moderate' | 'low';

  // Preferences
  wantsContender: boolean;
  wantsStartingRole: boolean;
  loyalToCoach?: string;
}
```

### 8.4 Salary Cap Management

```typescript
interface CapSituation {
  year: number;
  capNumber: number; // league-wide cap
  teamCap: number; // includes carryover

  // Spending
  playerSalaries: number;
  deadMoney: number;
  topContracts: ContractSummary[];

  // Space
  capSpace: number;
  projectedNextYear: number;
}
```

Cap management decisions:
- Restructure contracts (convert salary to bonus)
- Cut players (dead money implications)
- Extension timing
- Front-loaded vs. back-loaded deals

---

## 9. Game Simulation

### 9.1 Simulation Philosophy

Games are **simulated, not played**. The coach experience is:
1. Set game plan
2. Watch simulation results
3. Make halftime adjustments
4. React to key moments

### 9.2 Pre-Game Decisions

```typescript
interface GamePlan {
  // Offense
  offensiveEmphasis: 'run' | 'pass' | 'balanced';
  tempoSetting: 'fast' | 'normal' | 'slow';
  riskLevel: 'conservative' | 'normal' | 'aggressive';
  targetPlayer?: string; // feature a player

  // Defense
  defensiveEmphasis: 'run-stop' | 'pass-rush' | 'coverage';
  blitzFrequency: 'rare' | 'normal' | 'frequent';
  coverageBase: 'man' | 'zone' | 'mixed';

  // Special Teams
  kickoffStrategy: 'normal' | 'squib' | 'onside';
  puntStrategy: 'normal' | 'aggressive' | 'safe';

  // Personnel
  depthChartOverrides: DepthChartChange[];
}
```

### 9.3 Simulation Engine

Games simulate in "blocks" with key moments surfaced.

```typescript
interface GameBlock {
  quarter: 1 | 2 | 3 | 4 | 'OT';
  startTime: number;
  endTime: number;

  // Results
  playsRun: number;
  scoringPlays: ScoringPlay[];
  turnovers: Turnover[];
  injuries: InjuryEvent[];

  // Stats accumulated
  homeStats: QuarterStats;
  awayStats: QuarterStats;

  // Key moments (for narrative)
  keyMoments: GameMoment[];
}

interface GameMoment {
  type: 'big-play' | 'turnover' | 'injury' | 'momentum-shift' | 'controversy';
  description: string;
  impactOnGame: 'major' | 'moderate' | 'minor';
  playersInvolved: string[];
}
```

### 9.4 Win Probability Model

```typescript
function calculateWinProbability(
  home: Team,
  away: Team,
  context: GameContext
): number {
  // Team strength (roster OVR, depth)
  const homeStrength = calculateTeamStrength(home);
  const awayStrength = calculateTeamStrength(away);

  // Scheme matchup
  const schemeAdvantage = calculateSchemeMatchup(home, away);

  // Home field advantage (era-dependent)
  const hfa = context.isNeutral ? 0 : HOME_FIELD_ADVANTAGE[context.era];

  // Injuries impact
  const injuryAdjustment = calculateInjuryImpact(home, away);

  // Weather (if applicable)
  const weatherFactor = context.weather ? getWeatherImpact(context.weather, home, away) : 0;

  // Combine factors
  const rawDiff = homeStrength - awayStrength + schemeAdvantage + hfa + injuryAdjustment + weatherFactor;

  // Convert to probability (logistic function)
  return 1 / (1 + Math.exp(-rawDiff / 10));
}
```

### 9.5 Game Result Generation

```typescript
function simulateGame(home: Team, away: Team, context: GameContext): GameResult {
  const winProb = calculateWinProbability(home, away, context);

  // Determine winner
  const homeWins = Math.random() < winProb;

  // Generate realistic score
  const { homeScore, awayScore } = generateScore(homeWins, winProb, context);

  // Generate stat lines
  const homeStats = generateTeamStats(home, homeScore, context);
  const awayStats = generateTeamStats(away, awayScore, context);

  // Generate key moments
  const keyMoments = generateKeyMoments(home, away, homeScore, awayScore);

  // Individual performances
  const playerPerformances = generatePlayerStats(home, away, homeStats, awayStats);

  return {
    homeTeam: home.id,
    awayTeam: away.id,
    homeScore,
    awayScore,
    homeStats,
    awayStats,
    keyMoments,
    playerPerformances,
    gameNarrative: generateGameNarrative(/* ... */),
  };
}
```

### 9.6 Halftime Adjustments

Between halves, make adjustment decisions:

```typescript
interface HalftimeDecision {
  type: 'scheme' | 'personnel' | 'tempo' | 'motivation';

  // Options based on game state
  options: AdjustmentOption[];

  // Impact on second half
  impactOnWinProb: number; // -5% to +10% typically
}
```

---

## 10. Career Progression

### 10.1 Career Origins

At game start, choose an origin:

| Origin | Starting Role | Pros | Cons |
|--------|---------------|------|------|
| **Former Player (College)** | Position Coach (G5) | Fast track, respect | High expectations |
| **Former Player (NFL)** | Position Coach (NFL) | Skip college grind | Scrutiny if fail |
| **Graduate Assistant** | GA (Any level) | Flexible path | Long grind |
| **High School Legend** | OC/DC (FCS/G5) | Offensive/defensive rep | Unproven at level |
| **Coaching Tree Disciple** | Position Coach (P5) | Mentor connections | Live in shadow |
| **Analyst** | Analyst (P5/NFL) | Modern path | No on-field role initially |

### 10.2 Role Progression

```
┌──────────────────────────────────────────────────────────────┐
│                    COACHING LADDER                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  COLLEGE PATH                    NFL PATH                    │
│                                                              │
│  GA / Analyst ◄──────────────────► Quality Control          │
│       │                                  │                   │
│       ▼                                  ▼                   │
│  Position Coach ◄───────────────► Position Coach            │
│       │                                  │                   │
│       ▼                                  ▼                   │
│  Coordinator ◄──────────────────► Coordinator               │
│       │                                  │                   │
│       ▼                                  ▼                   │
│  Head Coach (G5) ─────────────┐         │                   │
│       │                       │         │                   │
│       ▼                       │         │                   │
│  Head Coach (P5) ─────────────┼────────►│                   │
│       │                       │         ▼                   │
│       │                       └──► Head Coach (NFL)         │
│       │                                  │                   │
│       ▼                                  ▼                   │
│  [LEGEND / HOF]              [LEGEND / HOF]                 │
│                                                              │
│  ───────────────────────────────────────────────────────    │
│  Lateral moves, demotions, and comebacks possible at all    │
│  levels. Career is non-linear.                              │
└──────────────────────────────────────────────────────────────┘
```

### 10.3 Job Security Calculation

```typescript
function calculateJobSecurity(context: JobContext): JobSecurityLevel {
  // Base expectation for role/program
  const expectation = getExpectation(context.team.prestige, context.role);

  // Performance vs expectation
  const performanceDelta = context.winPct - expectation.winPct;

  // Tenure (honeymoon period)
  const tenureBonus = context.yearsAtJob <= 2 ? 0.10 :
                      context.yearsAtJob <= 4 ? 0.05 : 0;

  // Political capital
  const politicalFactor = (context.adRelationship + context.fanSentiment) / 200;

  // Recent trajectory
  const trajectoryBonus = context.trendingUp ? 0.05 :
                          context.trendingDown ? -0.10 : 0;

  // Scandal/controversy penalty
  const controversyPenalty = context.activeScandals * -0.15;

  // Calculate final score
  const securityScore = performanceDelta + tenureBonus + politicalFactor +
                       trajectoryBonus + controversyPenalty;

  // Map to security level
  if (securityScore > 0.20) return 'extension-talks';
  if (securityScore > 0.10) return 'secure';
  if (securityScore > 0.00) return 'stable';
  if (securityScore > -0.10) return 'under-review';
  if (securityScore > -0.20) return 'hot-seat';
  return 'imminent-firing';
}
```

### 10.4 Contract System

```typescript
interface Contract {
  team: string;
  role: string;

  // Terms
  totalValue: number;
  yearsTotal: number;
  yearsRemaining: number;
  annualSalary: number;

  // Buyout
  buyoutIfFired: number;
  buyoutIfLeave: number;

  // Incentives
  incentives: Incentive[];

  // Clauses
  hasRollingExtension: boolean;
  autoExtensionTrigger?: string;
}

interface Incentive {
  type: 'wins' | 'division' | 'conference' | 'playoff' | 'championship' | 'awards';
  threshold: string;
  bonus: number;
}
```

### 10.5 Firing & Hiring

**Getting Fired**:
```typescript
interface FiringEvent {
  reason: 'performance' | 'scandal' | 'relationship' | 'new-ad';
  severanceOwed: number;
  mediaReaction: string;
  reputationImpact: string[];

  // Career impact
  cooldownPeriod: number; // months before hireable
  levelDrop: number; // may need to take lesser job
}
```

**Getting Hired**:
```typescript
interface HiringContext {
  availableJobs: JobOpening[];
  marketInterest: 'hot' | 'warm' | 'cold';

  // For each job
  fitScore: number;
  interviewPerformance: number;
  competingCandidates: string[];

  // Outcome
  offersReceived: JobOffer[];
}
```

---

## 11. Reputation System

### 11.1 Reputation Tags

Tags accumulate based on career events and persist.

**Positive Tags**:
```
[Program Builder]     - Turned around struggling program
[Offensive Genius]    - Top 10 offense multiple years
[Defensive Mastermind]- Top 10 defense multiple years
[Recruiter]          - Consistently lands top classes
[Developer]          - Players exceed projections
[Players' Coach]     - High player satisfaction
[Winner]             - Championship pedigree
[Innovator]          - Known for scheme innovations
[Clutch]             - Wins big games
[Loyalty]            - Stayed when could've left
[Quarterback Whisperer] - Develops NFL QBs
```

**Negative Tags**:
```
[Hot Head]           - Sideline blowups, media feuds
[Scandal Adjacent]   - NCAA issues, investigations
[Clock Mismanagement]- Loses games on decisions
[Can't Win Big One]  - Loses marquee matchups
[Job Hopper]         - Never stays long
[Recruiter Only]     - Can't develop talent
[System Coach]       - Only works with specific players
[Lost Locker Room]   - Player transfers, complaints
[NFL Bust]           - Failed at NFL level
[Overhyped]          - Didn't meet expectations
[Retread]            - Multiple failed HC stops
```

### 11.2 Tag Acquisition

```typescript
function evaluateTagAcquisition(coach: Coach, season: SeasonResult): string[] {
  const newTags: string[] = [];

  // Check each tag condition
  if (season.offenseRank <= 10 && coach.consecutiveTop10Offense >= 3) {
    if (!coach.tags.includes('offensive-genius')) {
      newTags.push('offensive-genius');
    }
  }

  if (season.winImprovement >= 5 && coach.yearsAtJob >= 3) {
    if (!coach.tags.includes('program-builder')) {
      newTags.push('program-builder');
    }
  }

  // Negative tags
  if (season.sidlineEjections >= 2 || season.mediaFeuds >= 1) {
    if (!coach.tags.includes('hot-head')) {
      newTags.push('hot-head');
    }
  }

  return newTags;
}
```

### 11.3 Tag Effects

Tags affect:
- Job offers (positive opens doors, negative closes them)
- Recruiting (players care about reputation)
- Media narrative (how you're discussed)
- Contract negotiations (leverage)
- Candidate pools (who wants to work for you)

```typescript
const TAG_EFFECTS: Record<string, TagEffect> = {
  'program-builder': {
    jobAppealToRebuilds: +20,
    recruitingBonus: +5,
    buyoutWillingness: +10,
  },
  'nfl-bust': {
    nflJobAppeal: -50,
    collegeJobAppeal: +10, // "coming home" narrative
    mediaScrutiny: +20,
  },
  // ...
};
```

---

## 12. Relationships & Network

### 12.1 Relationship Types

```typescript
interface Relationship {
  personId: string;
  personName: string;
  role: RelationshipRole;

  // Metrics
  trust: number; // -100 to 100
  loyalty: number; // -100 to 100
  respect: number; // -100 to 100

  // History
  sharedHistory: HistoryEvent[];
  yearsKnown: number;

  // Current status
  currentTeam?: string;
  canHelpWithJobs: boolean;
  canHurtYou: boolean;
}

type RelationshipRole =
  | 'boss-ad'
  | 'boss-owner'
  | 'boss-gm'
  | 'peer-coach'
  | 'subordinate-assistant'
  | 'former-player'
  | 'agent'
  | 'media-member'
  | 'booster'
  | 'mentor'
  | 'mentee';
```

### 12.2 AD/Owner Relationships

Your boss relationship is critical:

```typescript
interface BossRelationship extends Relationship {
  patienceRemaining: number; // 0-100
  communicationStyle: 'hands-off' | 'collaborative' | 'meddling';
  priorities: BossPriority[];

  // Triggers
  willFireAt: number; // patience threshold
  willExtendAt: number; // trust threshold
}

type BossPriority =
  | 'wins'
  | 'revenue'
  | 'graduation-rates'
  | 'no-scandals'
  | 'recruiting-rankings'
  | 'community-standing'
  | 'national-brand';
```

### 12.3 Coaching Tree Network

Track relationships through your tree:

```typescript
interface CoachingTreeNode {
  coach: Coach;
  mentor: string | null;
  mentees: string[];

  // Tree reputation
  treeName: string; // "Saban Tree", etc.
  treeSuccessRate: number;

  // Network benefits
  jobLeads: boolean;
  referenceStrength: number;
}
```

### 12.4 Agent System

Post-coordinator level, you have an agent:

```typescript
interface Agent {
  name: string;
  reputation: 'elite' | 'established' | 'up-and-coming';

  // Skills
  negotiationSkill: number;
  marketIntel: number;
  clientList: string[]; // notable clients

  // Relationship
  loyaltyToYou: number;
  takesPercentage: number;

  // Services
  canFindJobs: boolean;
  canNegotiateContracts: boolean;
  canManageMedia: boolean;
}
```

---

## 13. Financial System

### 13.1 Personal Finances

Track career earnings:

```typescript
interface PersonalFinances {
  careerEarnings: number;
  currentSalary: number;
  contractRemaining: number;

  // Wealth accumulation
  netWorth: number;
  investments: number;

  // Expenses
  lifestyle: 'modest' | 'comfortable' | 'lavish';
  agentFees: number;

  // Buyouts received/paid
  buyoutsReceived: number;
  buyoutsPaid: number;
}
```

### 13.2 Program Finances (College)

As HC, manage program budget:

```typescript
interface ProgramBudget {
  totalBudget: number;

  // Allocations
  coachingSalaries: number;
  recruiting: number;
  facilities: number;
  operations: number;
  nil: number; // Post-2021

  // Revenue
  tvRevenue: number;
  ticketRevenue: number;
  donations: number;
  merchandising: number;

  // Comparison
  conferenceRank: number;
  nationalRank: number;
}
```

### 13.3 Era-Adjusted Economics

Money values scale by era:

```typescript
const SALARY_MULTIPLIERS: Record<number, number> = {
  1995: 1.0,
  2000: 1.8,
  2005: 3.0,
  2010: 4.5,
  2015: 6.0,
  2020: 8.0,
  2025: 10.0,
};

function adjustForEra(baseValue: number, year: number): number {
  const era = Math.floor(year / 5) * 5;
  const multiplier = SALARY_MULTIPLIERS[era] || SALARY_MULTIPLIERS[2025];
  return Math.round(baseValue * multiplier);
}
```

---

## 14. Narrative Engine

### 14.1 Local LLM Integration

All narrative generation runs locally via WebLLM.

```typescript
interface NarrativeEngine {
  model: 'llama-3.2-3b' | 'phi-3-mini';

  // Generation functions
  generateSceneDescription(context: GameContext): Promise<string>;
  generateMediaHeadline(context: GameContext): Promise<string>;
  generateDialogue(character: Character, situation: Situation): Promise<string>;
  generateChoices(context: GameContext): Promise<Choice[]>;

  // Structured output
  generateWithSchema<T>(prompt: string, schema: JSONSchema): Promise<T>;
}
```

### 14.2 Prompt Templates

Optimized prompts for small models:

```typescript
const PROMPTS = {
  sceneDescription: `
CONTEXT:
Year: {year}
Team: {team} ({record})
Phase: {phase}
Recent: {recentEvents}
Coach Rep: {tags}

TASK: Write 2-3 sentences describing the current scene.
Tone: {tone}
Focus: {focus}

SCENE:`,

  mediaHeadline: `
Generate a sports media headline.
Team: {team}
Event: {event}
Tone: {positive|negative|neutral}

HEADLINE:`,

  // ... more templates
};
```

### 14.3 Context Window Management

Keep prompts small for fast local inference:

```typescript
function buildMinimalContext(state: GameState): string {
  return JSON.stringify({
    y: state.year,
    t: state.team.abbreviation,
    r: state.record,
    p: state.phase,
    s: state.jobSecurity,
    tags: state.reputationTags.slice(0, 3),
    recent: state.recentEvents.slice(0, 2),
  });
}
```

### 14.4 Narrative Templates (Fallback)

For instant response or low-end devices:

```typescript
const HEADLINE_TEMPLATES = {
  'big-win': [
    "{TEAM} stuns {OPPONENT} in instant classic",
    "{COACH} masterminds upset of {OPPONENT}",
    "Statement win: {TEAM} dominates {OPPONENT}",
  ],
  'close-loss': [
    "{TEAM} falls short in heartbreaker",
    "Controversial call costs {TEAM} against {OPPONENT}",
    "{TEAM} can't finish, loses to {OPPONENT}",
  ],
  // ...
};
```

---

## 15. Save System

### 15.1 Save Structure

```typescript
interface SaveGame {
  version: string;
  createdAt: Date;
  lastPlayed: Date;
  playTime: number; // minutes

  // Core state
  era: EraState;
  coach: CoachState;
  currentTeam: Team;

  // World state
  allTeams: Map<string, Team>;
  allCoaches: Map<string, Coach>;
  allPlayers: Map<string, Player>;

  // History
  careerHistory: CareerLog[];
  seasonHistory: SeasonLog[];
  gameHistory: GameLog[];

  // Relationships
  relationships: Map<string, Relationship>;

  // Current phase
  currentPhase: Phase;
  pendingDecisions: Decision[];

  // Meta
  settings: GameSettings;
  statistics: CareerStatistics;
}
```

### 15.2 Persistence

```typescript
// IndexedDB for large save files
const DB_NAME = 'sideline-saga';
const STORE_NAME = 'saves';

async function saveGame(save: SaveGame): Promise<void> {
  const db = await openDB(DB_NAME);
  await db.put(STORE_NAME, save, save.id);
}

async function loadGame(saveId: string): Promise<SaveGame> {
  const db = await openDB(DB_NAME);
  return db.get(STORE_NAME, saveId);
}

async function listSaves(): Promise<SaveSummary[]> {
  const db = await openDB(DB_NAME);
  const saves = await db.getAll(STORE_NAME);
  return saves.map(summarizeSave);
}
```

### 15.3 Autosave

```typescript
const AUTOSAVE_INTERVAL = 60_000; // 1 minute
const AUTOSAVE_KEY = 'autosave';

function startAutosave(save: SaveGame): void {
  setInterval(() => {
    saveGame({ ...save, id: AUTOSAVE_KEY });
  }, AUTOSAVE_INTERVAL);
}
```

---

## 16. Technical Architecture

### 16.0 ZenGM Integration Strategy

**Source**: [github.com/zengm-games/zengm](https://github.com/zengm-games/zengm)

ZenGM (Football GM) provides a battle-tested simulation engine. We adapt their systems for a coaching-focused experience.

#### What We Take From ZenGM

| ZenGM System | Our Usage | Modifications Needed |
|--------------|-----------|---------------------|
| **GameSim.football** | Game simulation engine | Add coaching decision hooks |
| **Player generation** | Roster/recruit creation | Add recruiting attributes |
| **Player ratings** | Attribute system | Use as-is, add development traits |
| **Draft system** | NFL draft mechanics | Wrap with coach influence layer |
| **Free agency** | NFL FA mechanics | Add coach input on priorities |
| **Contract logic** | Salary/cap management | Era-adjust, add college version |
| **Team composite ratings** | Team strength calc | Use directly |
| **Season/phase logic** | Calendar progression | Extend for coaching phases |

#### What We Build New

| System | Why Not ZenGM |
|--------|---------------|
| **Recruiting engine** | ZenGM is pro-focused, no recruiting |
| **Coaching career** | ZenGM is GM-focused, not coach |
| **Reputation/tags** | Unique to our game |
| **Relationships** | AD/owner/network dynamics |
| **Narrative layer** | LLM-driven drama |
| **Era system** | Rule/culture evolution |
| **Coaching decisions** | Scheme, adjustments, personnel |

#### Key Difference: Coach vs GM

```
ZenGM (GM Mode):              Sideline Saga (Coach Mode):
─────────────────             ───────────────────────────
You control roster            You influence roster
You make all trades           GM/AD approves trades
You set lineups               You set schemes/depth chart
You're never fired            Job security is core tension
No narrative                  Narrative is the game
```

#### Architecture Adaptation

```
ZenGM:
┌─────────────────────────────────────┐
│  UI (React)                         │
│      │                              │
│      ▼                              │
│  Shared Worker (Game Engine)        │
│      │                              │
│      ▼                              │
│  IndexedDB                          │
└─────────────────────────────────────┘

Sideline Saga:
┌─────────────────────────────────────┐
│  UI (React + Tailwind)              │
│      │                              │
│      ├──────────────────┐           │
│      ▼                  ▼           │
│  Game Engine         LLM Worker     │
│  (ZenGM-derived)     (WebLLM)       │
│      │                  │           │
│      └────────┬─────────┘           │
│               ▼                     │
│           IndexedDB                 │
└─────────────────────────────────────┘
```

#### License Consideration

ZenGM requires CLA for contributions. We can:
1. **Study patterns** - Learn from their approach
2. **Reimplement cleanly** - Build our own inspired by their design
3. **Fork for internal use** - If license permits non-commercial/personal

Recommend: **Clean-room reimplement** core sim logic, using ZenGM as reference architecture.

---

### 16.1 Tech Stack

| Layer | Technology |
|-------|------------|
| UI Framework | React 18 |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Build Tool | Vite |
| Local LLM | WebLLM |
| Persistence | IndexedDB |
| Simulation Reference | ZenGM patterns |
| Testing | Vitest + Playwright |

### 16.2 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Base UI components
│   ├── game/            # Game-specific components
│   └── screens/         # Full screen layouts
├── engine/              # Game logic (no React)
│   ├── simulation/      # Game/season simulation
│   ├── recruiting/      # Recruiting engine
│   ├── roster/          # Player management
│   ├── career/          # Career progression
│   ├── era/             # Era state machine
│   └── narrative/       # LLM integration
├── data/                # Static data
│   ├── teams/           # Team definitions
│   ├── names/           # Name generation
│   ├── templates/       # Narrative templates
│   └── eras/            # Era configurations
├── stores/              # Zustand stores
├── types/               # TypeScript types
├── utils/               # Utility functions
└── workers/             # Web Workers
    └── llm.worker.ts    # WebLLM inference
```

### 16.3 Performance Targets

| Metric | Target |
|--------|--------|
| Initial Load | < 3 seconds (without LLM) |
| LLM First Load | < 30 seconds (cached after) |
| Turn Resolution | < 5 seconds |
| Save/Load | < 1 second |
| Memory Usage | < 500MB (without LLM) |

### 16.4 Offline Support

Full offline capability after initial load:

```typescript
// Service worker for asset caching
// IndexedDB for save data
// WebLLM model cached in browser

const isOfflineCapable = await checkOfflineReady();
if (!isOfflineCapable) {
  showOfflineSetupPrompt();
}
```

---

## Appendix A: Position Depth Charts

### Offense (College)
```
QB:  1 starter, 2 backups
RB:  1-2 starters, 2 backups
WR:  3-4 starters, 4 backups
TE:  1-2 starters, 2 backups
OL:  5 starters, 5 backups (by position)
```

### Defense (4-3)
```
DE:  2 starters, 2 backups
DT:  2 starters, 2 backups
LB:  3 starters, 3 backups
CB:  2 starters, 2 backups
S:   2 starters, 2 backups
```

### Special Teams
```
K:   1 starter
P:   1 starter
LS:  1 starter
KR:  Usually position player
PR:  Usually position player
```

---

## Appendix B: Salary Tables by Era

### Head Coach Salaries (College P5)
| Era | Floor | Median | Ceiling |
|-----|-------|--------|---------|
| 1995 | $300K | $600K | $1.2M |
| 2000 | $500K | $1.2M | $2.5M |
| 2005 | $800K | $2.0M | $4.0M |
| 2010 | $1.5M | $3.0M | $6.0M |
| 2015 | $2.5M | $4.5M | $9.0M |
| 2020 | $4.0M | $6.0M | $12.0M |
| 2025 | $5.0M | $8.0M | $15.0M |

### NFL Head Coach Salaries
| Era | Floor | Median | Ceiling |
|-----|-------|--------|---------|
| 1995 | $800K | $1.2M | $2.5M |
| 2000 | $1.5M | $2.5M | $5.0M |
| 2005 | $2.5M | $4.0M | $7.0M |
| 2010 | $4.0M | $6.0M | $10.0M |
| 2015 | $5.0M | $7.0M | $12.0M |
| 2020 | $6.0M | $10.0M | $18.0M |
| 2025 | $8.0M | $15.0M | $25.0M |

---

## Appendix C: Win Expectations by Program Tier

| Tier | Expected Win % | "Good Season" | "Great Season" | "Failure" |
|------|----------------|---------------|----------------|-----------|
| Blue Blood | 75%+ | 10-2 | 12-0, CFP | < 9 wins |
| Power Program | 65-70% | 9-3 | 11-1, NY6 | < 7 wins |
| Solid Program | 55-60% | 8-4 | 10-2 | < 6 wins |
| Rebuild | 40-50% | 6-6 | 8-4 | < 4 wins |
| Bottom Feeder | 25-35% | 5-7 | 7-5 | < 3 wins |

---

## Appendix D: Conference Structure by Era

### 1995-2010
```
Big Ten: 11 teams (no divisions initially)
SEC: 12 teams (East/West)
Big 12: 12 teams (North/South)
Pac-10: 10 teams
ACC: 9 teams
Big East: Football members
```

### 2011-2023
```
Big Ten: 14 teams (East/West)
SEC: 14 teams (East/West)
Big 12: 10-14 teams
Pac-12: 12 teams (North/South)
ACC: 14-15 teams
```

### 2024+
```
Big Ten: 18 teams
SEC: 16 teams
Big 12: 16 teams
ACC: 17 teams (grant of rights issues)
Pac-12: Dissolved/reformed
```

---

---

## Appendix E: Implementation Phases

### Phase 1: Core Engine (MVP)

**Goal**: Playable career loop, one season, basic simulation

| Component | Priority | Effort |
|-----------|----------|--------|
| Player generation (basic) | P0 | Medium |
| Team generation (50 teams) | P0 | Medium |
| Game simulation (outcomes only) | P0 | Low |
| Season phase progression | P0 | Low |
| Career state machine | P0 | Medium |
| Job security calculation | P0 | Low |
| Basic UI (existing + tweaks) | P0 | Low |
| Save/load (localStorage) | P0 | Low |

**Deliverable**: Play one season, get hired/fired, move teams

---

### Phase 2: Depth & Polish

**Goal**: Full roster management, recruiting, multi-season

| Component | Priority | Effort |
|-----------|----------|--------|
| Full roster (85 players) | P1 | Medium |
| Player development | P1 | Medium |
| Recruiting engine (basic) | P1 | High |
| Depth chart management | P1 | Medium |
| Game sim (play-by-play) | P1 | High |
| Coordinator AI | P1 | Medium |
| Contract negotiations | P1 | Medium |
| IndexedDB migration | P1 | Low |

**Deliverable**: Multi-season careers, recruiting cycles

---

### Phase 3: NFL & Full Ladder

**Goal**: College → NFL pipeline, full career paths

| Component | Priority | Effort |
|-----------|----------|--------|
| NFL teams & structure | P2 | Medium |
| Draft system | P2 | Medium |
| Free agency | P2 | Medium |
| Salary cap logic | P2 | Medium |
| Cross-league career moves | P2 | Medium |
| GM/Owner relationships | P2 | Medium |

**Deliverable**: Full FCS → G5 → P5 → NFL career arcs

---

### Phase 4: Era & Narrative

**Goal**: Historical authenticity, rich storytelling

| Component | Priority | Effort |
|-----------|----------|--------|
| Era state machine | P3 | Medium |
| Rule changes over time | P3 | Medium |
| Conference realignment | P3 | High |
| WebLLM integration | P3 | High |
| Dynamic narrative generation | P3 | High |
| Reputation tag system | P3 | Medium |
| Relationship depth | P3 | Medium |

**Deliverable**: Authentic 1995-2030 experience with emergent stories

---

### Phase 5: Polish & Scale

**Goal**: Complete, polished product

| Component | Priority | Effort |
|-----------|----------|--------|
| Full 200+ team database | P4 | High |
| Historical rosters (optional) | P4 | High |
| Achievements/legacy | P4 | Medium |
| Career wiki/stats | P4 | Medium |
| Mobile optimization | P4 | Medium |
| Performance tuning | P4 | Medium |

**Deliverable**: Ship-ready product

---

## Appendix F: Data Requirements

### Team Data Needed

```typescript
// Per team, need:
{
  identity: { name, nickname, colors, stadium },
  classification: { level, conference, division },
  attributes: { prestige, facilities, budget, fanbase },
  history: { championships, notable_coaches },
  rivals: { primary, secondary[] },
  location: { city, state, region }
}
```

**Estimate**: ~200 college + 32 NFL = 232 teams

### Player Name Generation

Need name pools by:
- Era (1995 names differ from 2025)
- Region (Southern names, California names, etc.)
- Position tendencies (certain names cluster)

**Estimate**: 500+ first names, 1000+ last names

### Narrative Templates

For fallback/fast mode:
- 50+ headlines per scenario type
- 20+ scene descriptions per phase
- 30+ choice sets per context

**Estimate**: 500+ total templates

---

*End of Specification*
