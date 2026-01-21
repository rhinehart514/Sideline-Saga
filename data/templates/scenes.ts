/**
 * SCENE TEMPLATES
 * Narrative scenes by game phase
 */

// ============================================
// SCENE TYPES
// ============================================

export interface SceneTemplate {
  id: string;
  phase: GamePhase;
  context: SceneContext;
  title: string;
  description: string;
  tone: 'triumphant' | 'tense' | 'hopeful' | 'worried' | 'neutral';
  weight?: number;
}

export type GamePhase =
  | 'preseason'
  | 'game_block'
  | 'midseason'
  | 'postseason'
  | 'bowl'
  | 'playoff'
  | 'offseason'
  | 'carousel';

export type SceneContext =
  | 'winning'
  | 'losing'
  | 'mixed'
  | 'hot_seat'
  | 'secure'
  | 'new_job'
  | 'fired'
  | 'recruiting'
  | 'bowl_prep'
  | 'playoff_prep'
  | 'championship'
  | 'early_season'
  | 'late_season';

// ============================================
// PRESEASON SCENES
// ============================================

export const preseasonScenes: SceneTemplate[] = [
  {
    id: 'pre_high_1',
    phase: 'preseason',
    context: 'winning',
    title: 'Championship Expectations',
    description: 'The weight of preseason expectations hangs heavy over your program. Magazine covers, TV pundits, and recruiting analysts all agree: {TEAM} is a national title contender. Your players feel it. The fanbase expects it. Every practice, every meeting carries extra intensity.',
    tone: 'tense',
    weight: 8,
  },
  {
    id: 'pre_high_2',
    phase: 'preseason',
    context: 'winning',
    title: 'Media Day Buzz',
    description: 'Cameras flash as you take the podium at {CONFERENCE} Media Day. Questions come rapid-fire about your returning stars, your recruiting class, and whether this is finally the year. You project confidence, but privately wonder if your team can handle the spotlight.',
    tone: 'hopeful',
    weight: 7,
  },
  {
    id: 'pre_rebuild_1',
    phase: 'preseason',
    context: 'losing',
    title: 'Fresh Start',
    description: 'Last season\'s disappointments are behind you. New faces fill the roster. Young players who were buried on the depth chart now have their chance to shine. The program is in rebuilding mode, but there\'s something pure about low expectations and hungry players.',
    tone: 'hopeful',
    weight: 8,
  },
  {
    id: 'pre_rebuild_2',
    phase: 'preseason',
    context: 'losing',
    title: 'Quiet Confidence',
    description: 'Nobody\'s picking {TEAM} to do much this year. The preseason magazines barely mention your team. But walking through fall camp, you see something the pundits don\'t - a group of players with chips on their shoulders, ready to prove everyone wrong.',
    tone: 'hopeful',
    weight: 7,
  },
  {
    id: 'pre_new_1',
    phase: 'preseason',
    context: 'new_job',
    title: 'First Fall Camp',
    description: 'Your first fall camp as head coach of the {TEAM_FULL}. New office, new staff, new roster - everything feels foreign and exciting. The players are still learning your system, but the energy is palpable. Everyone wants to impress the new boss.',
    tone: 'hopeful',
    weight: 9,
  },
  {
    id: 'pre_new_2',
    phase: 'preseason',
    context: 'new_job',
    title: 'Meeting the Boosters',
    description: 'The AD introduces you to the major donors at a private function. Smiling faces, firm handshakes, and thinly veiled expectations. They\'ve invested heavily in this program and they want results. You assure them the future is bright while carefully managing their expectations.',
    tone: 'tense',
    weight: 8,
  },
];

// ============================================
// GAME BLOCK SCENES
// ============================================

export const gameBlockScenes: SceneTemplate[] = [
  // Winning context
  {
    id: 'gb_win_1',
    phase: 'game_block',
    context: 'winning',
    title: 'Riding High',
    description: 'The wins keep piling up. Practice feels effortless when everyone believes. Your players walk with a swagger that can only come from success. The challenge now is keeping them hungry, keeping them humble. Complacency is the enemy of sustained excellence.',
    tone: 'triumphant',
    weight: 9,
  },
  {
    id: 'gb_win_2',
    phase: 'game_block',
    context: 'winning',
    title: 'Building Momentum',
    description: 'Another game, another win. The locker room is loud with celebration, but you\'re already thinking about next week. The schedule gets tougher from here. You need this feeling - this confidence - to carry you through what\'s coming.',
    tone: 'hopeful',
    weight: 8,
  },
  {
    id: 'gb_win_3',
    phase: 'game_block',
    context: 'winning',
    title: 'National Attention',
    description: 'GameDay trucks are pulling up to campus. Your players are doing interviews with national media. The rankings have taken notice. Everything you\'ve built is starting to pay off, and the whole country is watching.',
    tone: 'triumphant',
    weight: 7,
  },

  // Losing context
  {
    id: 'gb_lose_1',
    phase: 'game_block',
    context: 'losing',
    title: 'Monday Morning Blues',
    description: 'The film room is silent as you click through another loss. Missed assignments, blown coverages, dropped passes - the mistakes are there in high definition. Your players won\'t meet your eyes. The questions are piling up and you need answers.',
    tone: 'worried',
    weight: 9,
  },
  {
    id: 'gb_lose_2',
    phase: 'game_block',
    context: 'losing',
    title: 'Crisis of Confidence',
    description: 'Doubt has crept into your program like a virus. Players who once made plays with confidence now hesitate. The sideline feels heavy with tension. You need something - anything - to spark a turnaround before the season slips away entirely.',
    tone: 'worried',
    weight: 8,
  },
  {
    id: 'gb_lose_3',
    phase: 'game_block',
    context: 'losing',
    title: 'Fan Frustration',
    description: 'The radio shows are brutal. Social media is worse. Fans who packed the stadium a few weeks ago are now selling their tickets. You block out the noise and focus on the players in front of you, but even they can feel the pressure building from outside.',
    tone: 'worried',
    weight: 7,
  },

  // Mixed context
  {
    id: 'gb_mix_1',
    phase: 'game_block',
    context: 'mixed',
    title: 'Finding Identity',
    description: 'Some weeks you look like world-beaters. Other weeks you can\'t get out of your own way. The inconsistency is maddening. Your team is still searching for its identity, and time is running out to find it.',
    tone: 'tense',
    weight: 9,
  },
  {
    id: 'gb_mix_2',
    phase: 'game_block',
    context: 'mixed',
    title: 'The Grind',
    description: 'Middle of the season. Bodies are aching. The initial excitement has faded into the daily grind of practice, meetings, and games. This is where championships are won or lost - in the mundane weeks when nobody\'s watching.',
    tone: 'neutral',
    weight: 8,
  },
];

// ============================================
// CAROUSEL/HOT SEAT SCENES
// ============================================

export const carouselScenes: SceneTemplate[] = [
  {
    id: 'car_hot_1',
    phase: 'carousel',
    context: 'hot_seat',
    title: 'Uncomfortable Questions',
    description: 'The press conference takes a dark turn. "Coach, there are reports that the administration is exploring other options. Care to comment?" You deflect, but the damage is done. Your job security is now a national story.',
    tone: 'worried',
    weight: 10,
  },
  {
    id: 'car_hot_2',
    phase: 'carousel',
    context: 'hot_seat',
    title: 'Meeting with the AD',
    description: 'The Athletic Director\'s secretary calls. "He\'d like to see you." The walk to his office feels endless. He\'s supportive - for now - but the subtext is clear: things need to change, and quickly.',
    tone: 'worried',
    weight: 9,
  },
  {
    id: 'car_hot_3',
    phase: 'carousel',
    context: 'hot_seat',
    title: 'Recruits Backing Out',
    description: 'Your phone buzzes with bad news. A top recruit has decommitted. Then another. The whispers about your job security have reached high school coaches and parents. Your recruiting class is falling apart.',
    tone: 'worried',
    weight: 8,
  },
  {
    id: 'car_fire_1',
    phase: 'carousel',
    context: 'fired',
    title: 'End of the Road',
    description: 'The AD doesn\'t make eye contact as he delivers the news. "We\'ve decided to go in a different direction." The words hit you like a physical blow. Years of work, relationships, dreams - all ending in this sterile conference room.',
    tone: 'worried',
    weight: 10,
  },
  {
    id: 'car_fire_2',
    phase: 'carousel',
    context: 'fired',
    title: 'Cleaning Out the Office',
    description: 'Cardboard boxes line your office wall. Family photos, awards, game balls - memories of better times. Your assistant coaches are scattered, looking for new jobs. This isn\'t how you imagined it ending.',
    tone: 'worried',
    weight: 9,
  },
  {
    id: 'car_secure_1',
    phase: 'carousel',
    context: 'secure',
    title: 'Vote of Confidence',
    description: 'The AD calls a press conference. "Coach {COACH_LAST} has our full support. We\'re extending his contract." The relief is overwhelming. You\'ve bought more time, but now you have to deliver.',
    tone: 'hopeful',
    weight: 9,
  },
];

// ============================================
// POSTSEASON SCENES
// ============================================

export const postseasonScenes: SceneTemplate[] = [
  // Bowl scenes
  {
    id: 'post_bowl_1',
    phase: 'bowl',
    context: 'bowl_prep',
    title: 'Bowl Week',
    description: 'Your team arrives in {BOWL_CITY} for the {BOWL}. After weeks of practice, your players are ready to cap the season with a win. The bowl experience is a reward for a solid year, but you want to send them home with a victory.',
    tone: 'hopeful',
    weight: 9,
  },
  {
    id: 'post_bowl_2',
    phase: 'bowl',
    context: 'bowl_prep',
    title: 'Final Preparation',
    description: 'Bowl week is half vacation, half business. Your players have enjoyed the festivities, but now it\'s time to lock in. Tomorrow\'s game is a chance to build momentum for next season - or let a good year end on a sour note.',
    tone: 'neutral',
    weight: 8,
  },

  // Playoff scenes
  {
    id: 'post_playoff_1',
    phase: 'playoff',
    context: 'playoff_prep',
    title: 'Playoff Intensity',
    description: 'This is what you\'ve worked for. All the early morning meetings, the recruiting battles, the tough losses that taught hard lessons - they led here. The playoff. Win and advance. Lose and go home. No margin for error.',
    tone: 'tense',
    weight: 10,
  },
  {
    id: 'post_playoff_2',
    phase: 'playoff',
    context: 'playoff_prep',
    title: 'Elite Company',
    description: 'Look around the bracket. The best programs in the country. The best coaches. And somehow, {TEAM} is among them. Your players feel it - the magnitude of the moment. You remind them: you earned this. Now go take it.',
    tone: 'triumphant',
    weight: 9,
  },

  // Championship scenes
  {
    id: 'post_champ_1',
    phase: 'playoff',
    context: 'championship',
    title: 'One Game Away',
    description: 'The national championship game. The biggest stage in college football. Everything you\'ve built, every decision you\'ve made, has led to this single game. Win, and you\'ll be immortalized in {TEAM} history forever.',
    tone: 'tense',
    weight: 10,
  },
  {
    id: 'post_champ_2',
    phase: 'playoff',
    context: 'championship',
    title: 'Legacy Defined',
    description: 'Championship week. Media obligations. Practice sessions in an unfamiliar stadium. Your players are either locked in or overwhelmed - it\'s hard to tell which. Tonight, you\'ll find out what they\'re made of.',
    tone: 'tense',
    weight: 9,
  },
];

// ============================================
// OFFSEASON SCENES
// ============================================

export const offseasonScenes: SceneTemplate[] = [
  {
    id: 'off_rec_1',
    phase: 'offseason',
    context: 'recruiting',
    title: 'Recruiting Trail',
    description: 'The season ended, but your work never stops. You\'re in a rental car driving between high schools, selling your program to 17-year-olds and their parents. Next year\'s team is built in these living rooms.',
    tone: 'neutral',
    weight: 9,
  },
  {
    id: 'off_rec_2',
    phase: 'offseason',
    context: 'recruiting',
    title: 'Signing Day Eve',
    description: 'Tomorrow is National Signing Day. Your board is covered in names - commits, targets, long shots. The staff has made their final pitches. Now you wait, refreshing social media like everyone else, hoping your class holds together.',
    tone: 'tense',
    weight: 8,
  },
  {
    id: 'off_rec_3',
    phase: 'offseason',
    context: 'recruiting',
    title: 'Transfer Portal Season',
    description: 'The transfer portal is open, and it\'s chaos. Players entering, players exiting, commitments and de-commitments flying by the hour. You\'re trying to plug holes in your roster while keeping your best players from leaving.',
    tone: 'tense',
    weight: 8,
  },
  {
    id: 'off_spring_1',
    phase: 'offseason',
    context: 'winning',
    title: 'Spring Practice Optimism',
    description: 'Spring ball brings fresh hope. Young players are developing. The new scheme is taking shape. Last year\'s struggles feel distant as you watch your team compete with renewed energy on the practice field.',
    tone: 'hopeful',
    weight: 8,
  },
  {
    id: 'off_spring_2',
    phase: 'offseason',
    context: 'losing',
    title: 'Building from Scratch',
    description: 'Spring practice reveals just how much work remains. The depth chart is thin. The skill positions need development. But every program has to start somewhere, and you\'re determined to lay the foundation for something better.',
    tone: 'hopeful',
    weight: 7,
  },
];

// ============================================
// COMBINED EXPORTS
// ============================================

export const allScenes: SceneTemplate[] = [
  ...preseasonScenes,
  ...gameBlockScenes,
  ...carouselScenes,
  ...postseasonScenes,
  ...offseasonScenes,
];

/**
 * Get scenes by phase
 */
export const getScenesByPhase = (phase: GamePhase): SceneTemplate[] => {
  return allScenes.filter(s => s.phase === phase);
};

/**
 * Get scenes by phase and context
 */
export const getScenesByContext = (
  phase: GamePhase,
  context: SceneContext
): SceneTemplate[] => {
  return allScenes.filter(s => s.phase === phase && s.context === context);
};

/**
 * Select a random scene (weighted)
 */
export const selectScene = (
  phase: GamePhase,
  context?: SceneContext,
  seed?: number
): SceneTemplate | undefined => {
  const scenes = context
    ? getScenesByContext(phase, context)
    : getScenesByPhase(phase);

  if (scenes.length === 0) return undefined;

  // Build weighted pool
  const weightedPool: SceneTemplate[] = [];
  for (const scene of scenes) {
    const weight = scene.weight || 5;
    for (let i = 0; i < weight; i++) {
      weightedPool.push(scene);
    }
  }

  const index = seed !== undefined
    ? Math.abs(seed) % weightedPool.length
    : Math.floor(Math.random() * weightedPool.length);

  return weightedPool[index];
};
