/**
 * HEADLINE TEMPLATES
 * Dynamic headlines for news ticker and breaking news
 */

// ============================================
// TEMPLATE TOKEN REFERENCE
// ============================================
// {TEAM} - Team nickname (e.g., "Crimson Tide")
// {TEAM_FULL} - Full team name (e.g., "Alabama Crimson Tide")
// {COACH} - Coach's full name
// {COACH_LAST} - Coach's last name
// {RECORD} - Current record (e.g., "8-2")
// {WINS} - Win count
// {LOSSES} - Loss count
// {STREAK} - Win/loss streak number
// {OPPONENT} - Opponent team name
// {SCORE} - Game score (e.g., "34-21")
// {PLAYER} - Featured player name
// {POSITION} - Player position
// {RANKING} - Team ranking (e.g., "#5")
// {CONFERENCE} - Conference name
// {BOWL} - Bowl game name
// {YEAR} - Current season year

export interface HeadlineTemplate {
  id: string;
  text: string;
  category: HeadlineCategory;
  tone: 'positive' | 'negative' | 'neutral';
  weight?: number; // Higher = more likely to be selected
}

export type HeadlineCategory =
  | 'win_blowout'
  | 'win_close'
  | 'win_upset'
  | 'win_streak'
  | 'loss_blowout'
  | 'loss_close'
  | 'loss_upset'
  | 'loss_streak'
  | 'hot_seat'
  | 'job_security'
  | 'fired'
  | 'hired'
  | 'recruiting'
  | 'injury'
  | 'preseason'
  | 'bowl_selection'
  | 'playoff'
  | 'championship'
  | 'transfer'
  | 'scandal'
  | 'general';

// ============================================
// WIN HEADLINES
// ============================================

export const winHeadlines: HeadlineTemplate[] = [
  // Blowout wins
  { id: 'win_blow_1', text: '{TEAM} dominates in {SCORE} rout', category: 'win_blowout', tone: 'positive', weight: 10 },
  { id: 'win_blow_2', text: '{COACH_LAST}\'s squad rolls to easy victory', category: 'win_blowout', tone: 'positive', weight: 8 },
  { id: 'win_blow_3', text: '{TEAM} makes statement with convincing win', category: 'win_blowout', tone: 'positive', weight: 9 },
  { id: 'win_blow_4', text: 'Defense smothers {OPPONENT} in shutout performance', category: 'win_blowout', tone: 'positive', weight: 7 },
  { id: 'win_blow_5', text: '{TEAM} puts up 40+ in dominant showing', category: 'win_blowout', tone: 'positive', weight: 8 },
  { id: 'win_blow_6', text: 'Complete performance: {TEAM} cruises past overmatched foe', category: 'win_blowout', tone: 'positive', weight: 6 },
  { id: 'win_blow_7', text: '{RANKING} {TEAM} looks every bit the contender', category: 'win_blowout', tone: 'positive', weight: 7 },
  { id: 'win_blow_8', text: 'Starters rest early as {TEAM} coasts', category: 'win_blowout', tone: 'positive', weight: 5 },

  // Close wins
  { id: 'win_close_1', text: '{TEAM} survives scare, edges {OPPONENT}', category: 'win_close', tone: 'positive', weight: 10 },
  { id: 'win_close_2', text: 'Clutch! {TEAM} pulls out nailbiter', category: 'win_close', tone: 'positive', weight: 9 },
  { id: 'win_close_3', text: '{COACH_LAST} finds a way as {TEAM} escapes', category: 'win_close', tone: 'positive', weight: 8 },
  { id: 'win_close_4', text: 'Fourth quarter heroics lift {TEAM} to win', category: 'win_close', tone: 'positive', weight: 8 },
  { id: 'win_close_5', text: '{TEAM} holds on in thriller', category: 'win_close', tone: 'positive', weight: 9 },
  { id: 'win_close_6', text: 'Defense makes stand, {TEAM} survives', category: 'win_close', tone: 'positive', weight: 7 },
  { id: 'win_close_7', text: 'Last-second field goal sends {TEAM} home happy', category: 'win_close', tone: 'positive', weight: 6 },
  { id: 'win_close_8', text: '{TEAM} guts out tough road win', category: 'win_close', tone: 'positive', weight: 7 },

  // Upset wins
  { id: 'win_upset_1', text: 'UPSET ALERT: {TEAM} stuns {RANKING} {OPPONENT}', category: 'win_upset', tone: 'positive', weight: 10 },
  { id: 'win_upset_2', text: '{TEAM} plays giant killer, knocks off {OPPONENT}', category: 'win_upset', tone: 'positive', weight: 9 },
  { id: 'win_upset_3', text: 'Believe it! {TEAM} takes down favored {OPPONENT}', category: 'win_upset', tone: 'positive', weight: 8 },
  { id: 'win_upset_4', text: '{COACH_LAST}\'s magic continues with shocking upset', category: 'win_upset', tone: 'positive', weight: 7 },
  { id: 'win_upset_5', text: 'David beats Goliath: {TEAM} pulls off stunner', category: 'win_upset', tone: 'positive', weight: 8 },
  { id: 'win_upset_6', text: '{TEAM} shocks the world, defeats {RANKING} {OPPONENT}', category: 'win_upset', tone: 'positive', weight: 9 },

  // Win streaks
  { id: 'win_streak_1', text: '{TEAM} extends winning streak to {STREAK}', category: 'win_streak', tone: 'positive', weight: 10 },
  { id: 'win_streak_2', text: 'Rolling! {TEAM} makes it {STREAK} straight', category: 'win_streak', tone: 'positive', weight: 9 },
  { id: 'win_streak_3', text: '{COACH_LAST}\'s hot streak continues', category: 'win_streak', tone: 'positive', weight: 8 },
  { id: 'win_streak_4', text: '{TEAM} keeps momentum going with {STREAK}th straight', category: 'win_streak', tone: 'positive', weight: 8 },
  { id: 'win_streak_5', text: 'Who can stop them? {TEAM} wins {STREAK} in a row', category: 'win_streak', tone: 'positive', weight: 7 },
];

// ============================================
// LOSS HEADLINES
// ============================================

export const lossHeadlines: HeadlineTemplate[] = [
  // Blowout losses
  { id: 'loss_blow_1', text: '{TEAM} suffers embarrassing blowout', category: 'loss_blowout', tone: 'negative', weight: 10 },
  { id: 'loss_blow_2', text: 'Disaster: {TEAM} gets demolished by {OPPONENT}', category: 'loss_blowout', tone: 'negative', weight: 9 },
  { id: 'loss_blow_3', text: '{COACH_LAST} has no answers in ugly loss', category: 'loss_blowout', tone: 'negative', weight: 8 },
  { id: 'loss_blow_4', text: '{TEAM} overwhelmed in lopsided defeat', category: 'loss_blowout', tone: 'negative', weight: 8 },
  { id: 'loss_blow_5', text: 'Alarm bells: {TEAM} routed on national TV', category: 'loss_blowout', tone: 'negative', weight: 7 },
  { id: 'loss_blow_6', text: '{TEAM} gives up 40+ in humiliating defeat', category: 'loss_blowout', tone: 'negative', weight: 7 },
  { id: 'loss_blow_7', text: 'Nothing works as {TEAM} gets blown out', category: 'loss_blowout', tone: 'negative', weight: 6 },

  // Close losses
  { id: 'loss_close_1', text: '{TEAM} falls just short in heartbreaker', category: 'loss_close', tone: 'negative', weight: 10 },
  { id: 'loss_close_2', text: 'Agony: {TEAM} loses on final play', category: 'loss_close', tone: 'negative', weight: 9 },
  { id: 'loss_close_3', text: '{TEAM} lets lead slip away', category: 'loss_close', tone: 'negative', weight: 8 },
  { id: 'loss_close_4', text: 'So close! {TEAM} can\'t finish', category: 'loss_close', tone: 'negative', weight: 8 },
  { id: 'loss_close_5', text: '{COACH_LAST}\'s squad comes up short again', category: 'loss_close', tone: 'negative', weight: 7 },
  { id: 'loss_close_6', text: '{TEAM} falls in overtime thriller', category: 'loss_close', tone: 'negative', weight: 8 },
  { id: 'loss_close_7', text: 'Fourth quarter collapse dooms {TEAM}', category: 'loss_close', tone: 'negative', weight: 7 },

  // Upset losses
  { id: 'loss_upset_1', text: 'Shocker! {RANKING} {TEAM} falls to {OPPONENT}', category: 'loss_upset', tone: 'negative', weight: 10 },
  { id: 'loss_upset_2', text: '{TEAM} suffers stunning upset loss', category: 'loss_upset', tone: 'negative', weight: 9 },
  { id: 'loss_upset_3', text: 'Trap game: {TEAM} stunned by underdog', category: 'loss_upset', tone: 'negative', weight: 8 },
  { id: 'loss_upset_4', text: '{COACH_LAST} blindsided by upset loss', category: 'loss_upset', tone: 'negative', weight: 8 },
  { id: 'loss_upset_5', text: '{TEAM}\'s playoff hopes take major hit', category: 'loss_upset', tone: 'negative', weight: 7 },
  { id: 'loss_upset_6', text: 'Nobody saw this coming: {TEAM} falls', category: 'loss_upset', tone: 'negative', weight: 7 },

  // Loss streaks
  { id: 'loss_streak_1', text: 'Freefall: {TEAM} loses {STREAK}th straight', category: 'loss_streak', tone: 'negative', weight: 10 },
  { id: 'loss_streak_2', text: '{TEAM}\'s slide continues with {STREAK}th loss', category: 'loss_streak', tone: 'negative', weight: 9 },
  { id: 'loss_streak_3', text: 'Crisis mode: {TEAM} can\'t stop bleeding', category: 'loss_streak', tone: 'negative', weight: 8 },
  { id: 'loss_streak_4', text: '{COACH_LAST} under fire as losses mount', category: 'loss_streak', tone: 'negative', weight: 8 },
  { id: 'loss_streak_5', text: 'Rock bottom? {TEAM} drops {STREAK} in a row', category: 'loss_streak', tone: 'negative', weight: 7 },
];

// ============================================
// HOT SEAT / JOB SECURITY HEADLINES
// ============================================

export const jobSecurityHeadlines: HeadlineTemplate[] = [
  // Hot seat
  { id: 'hot_1', text: 'Sources: {COACH_LAST}\'s seat heating up', category: 'hot_seat', tone: 'negative', weight: 10 },
  { id: 'hot_2', text: '{COACH} feels pressure mount after loss', category: 'hot_seat', tone: 'negative', weight: 9 },
  { id: 'hot_3', text: 'Hot Seat Watch: Is {COACH_LAST}\'s time running out?', category: 'hot_seat', tone: 'negative', weight: 8 },
  { id: 'hot_4', text: 'Fans calling for {COACH_LAST}\'s job', category: 'hot_seat', tone: 'negative', weight: 8 },
  { id: 'hot_5', text: '{TEAM} boosters reportedly discussing coaching change', category: 'hot_seat', tone: 'negative', weight: 7 },
  { id: 'hot_6', text: 'AD meets with {COACH_LAST} amid struggles', category: 'hot_seat', tone: 'negative', weight: 7 },
  { id: 'hot_7', text: '{COACH_LAST} on the hot seat? \"I\'m focused on winning\"', category: 'hot_seat', tone: 'negative', weight: 6 },
  { id: 'hot_8', text: 'Speculation swirls around {TEAM} coaching future', category: 'hot_seat', tone: 'negative', weight: 6 },

  // Job secure
  { id: 'secure_1', text: '{COACH_LAST} silences critics with big win', category: 'job_security', tone: 'positive', weight: 10 },
  { id: 'secure_2', text: 'AD backs {COACH_LAST}: \"He\'s our guy\"', category: 'job_security', tone: 'positive', weight: 9 },
  { id: 'secure_3', text: '{COACH_LAST}\'s seat cools with turnaround', category: 'job_security', tone: 'positive', weight: 8 },
  { id: 'secure_4', text: '{TEAM} rewards {COACH_LAST} with extension talks', category: 'job_security', tone: 'positive', weight: 8 },
  { id: 'secure_5', text: 'Hot seat? What hot seat? {COACH_LAST} answers doubters', category: 'job_security', tone: 'positive', weight: 7 },

  // Fired
  { id: 'fire_1', text: 'BREAKING: {TEAM} fires {COACH}', category: 'fired', tone: 'negative', weight: 10 },
  { id: 'fire_2', text: '{COACH_LAST} out at {TEAM} after disappointing season', category: 'fired', tone: 'negative', weight: 10 },
  { id: 'fire_3', text: '{TEAM} parts ways with {COACH_LAST}', category: 'fired', tone: 'negative', weight: 9 },
  { id: 'fire_4', text: 'Sources: {COACH_LAST} to be let go by {TEAM}', category: 'fired', tone: 'negative', weight: 8 },
  { id: 'fire_5', text: 'End of an era: {COACH_LAST} out at {TEAM}', category: 'fired', tone: 'neutral', weight: 7 },

  // Hired
  { id: 'hire_1', text: 'BREAKING: {TEAM} hires {COACH}', category: 'hired', tone: 'positive', weight: 10 },
  { id: 'hire_2', text: '{COACH_LAST} named new {TEAM} head coach', category: 'hired', tone: 'positive', weight: 10 },
  { id: 'hire_3', text: '{TEAM} tabs {COACH_LAST} to lead program', category: 'hired', tone: 'positive', weight: 9 },
  { id: 'hire_4', text: 'New era begins: {COACH_LAST} takes over at {TEAM}', category: 'hired', tone: 'positive', weight: 8 },
  { id: 'hire_5', text: '{COACH_LAST} excited for \"dream job\" at {TEAM}', category: 'hired', tone: 'positive', weight: 7 },
];

// ============================================
// RECRUITING HEADLINES
// ============================================

export const recruitingHeadlines: HeadlineTemplate[] = [
  { id: 'rec_1', text: '{TEAM} lands 5-star {POSITION} {PLAYER}', category: 'recruiting', tone: 'positive', weight: 10 },
  { id: 'rec_2', text: 'Commitment: {PLAYER} picks {TEAM}', category: 'recruiting', tone: 'positive', weight: 9 },
  { id: 'rec_3', text: '{COACH_LAST} strikes recruiting gold', category: 'recruiting', tone: 'positive', weight: 8 },
  { id: 'rec_4', text: '{TEAM}\'s class jumps to top 10 after commitments', category: 'recruiting', tone: 'positive', weight: 8 },
  { id: 'rec_5', text: 'Flip! {PLAYER} decommits, joins {TEAM}', category: 'recruiting', tone: 'positive', weight: 7 },
  { id: 'rec_6', text: '{TEAM} signs top-ranked {POSITION} in class', category: 'recruiting', tone: 'positive', weight: 7 },
  { id: 'rec_7', text: 'Signing Day success for {TEAM}', category: 'recruiting', tone: 'positive', weight: 8 },
  { id: 'rec_8', text: '{TEAM} building for future with strong class', category: 'recruiting', tone: 'positive', weight: 6 },
  { id: 'rec_9', text: '{COACH_LAST} addresses recruiting concerns', category: 'recruiting', tone: 'neutral', weight: 5 },
  { id: 'rec_10', text: '{TEAM} loses key recruit to rival', category: 'recruiting', tone: 'negative', weight: 6 },
];

// ============================================
// INJURY HEADLINES
// ============================================

export const injuryHeadlines: HeadlineTemplate[] = [
  { id: 'inj_1', text: '{TEAM} {POSITION} {PLAYER} out for season', category: 'injury', tone: 'negative', weight: 10 },
  { id: 'inj_2', text: 'Devastating blow: {PLAYER} tears ACL', category: 'injury', tone: 'negative', weight: 9 },
  { id: 'inj_3', text: '{TEAM} loses {PLAYER} to injury', category: 'injury', tone: 'negative', weight: 8 },
  { id: 'inj_4', text: '{PLAYER}\'s status uncertain after injury scare', category: 'injury', tone: 'neutral', weight: 7 },
  { id: 'inj_5', text: '{COACH_LAST} hopeful about {PLAYER}\'s return', category: 'injury', tone: 'neutral', weight: 6 },
  { id: 'inj_6', text: 'Good news: {PLAYER} cleared to return', category: 'injury', tone: 'positive', weight: 8 },
  { id: 'inj_7', text: '{TEAM} gets boost with {PLAYER}\'s return', category: 'injury', tone: 'positive', weight: 7 },
];

// ============================================
// PRESEASON HEADLINES
// ============================================

export const preseasonHeadlines: HeadlineTemplate[] = [
  { id: 'pre_1', text: '{RANKING} {TEAM} opens camp with championship aspirations', category: 'preseason', tone: 'positive', weight: 10 },
  { id: 'pre_2', text: 'Expectations high for {COACH_LAST}\'s squad', category: 'preseason', tone: 'positive', weight: 9 },
  { id: 'pre_3', text: '{TEAM} picked to win {CONFERENCE}', category: 'preseason', tone: 'positive', weight: 9 },
  { id: 'pre_4', text: 'Dark horse? Experts eye {TEAM} as sleeper', category: 'preseason', tone: 'positive', weight: 7 },
  { id: 'pre_5', text: '{TEAM} enters season with questions at {POSITION}', category: 'preseason', tone: 'neutral', weight: 6 },
  { id: 'pre_6', text: '{COACH_LAST} downplays preseason hype', category: 'preseason', tone: 'neutral', weight: 6 },
  { id: 'pre_7', text: 'Under the radar: {TEAM} ready to surprise', category: 'preseason', tone: 'positive', weight: 7 },
  { id: 'pre_8', text: 'Rebuild mode: {TEAM} tempering expectations', category: 'preseason', tone: 'neutral', weight: 5 },
  { id: 'pre_9', text: '{TEAM} picked last in {CONFERENCE} preseason poll', category: 'preseason', tone: 'negative', weight: 5 },
];

// ============================================
// POSTSEASON HEADLINES
// ============================================

export const postseasonHeadlines: HeadlineTemplate[] = [
  // Bowl selection
  { id: 'bowl_1', text: '{TEAM} accepts bid to {BOWL}', category: 'bowl_selection', tone: 'positive', weight: 10 },
  { id: 'bowl_2', text: '{TEAM} headed to {BOWL} for New Year\'s Day', category: 'bowl_selection', tone: 'positive', weight: 9 },
  { id: 'bowl_3', text: 'Bowl season: {TEAM} vs {OPPONENT} in {BOWL}', category: 'bowl_selection', tone: 'neutral', weight: 8 },
  { id: 'bowl_4', text: '{TEAM} misses bowl eligibility', category: 'bowl_selection', tone: 'negative', weight: 7 },

  // Playoff
  { id: 'playoff_1', text: '{RANKING} {TEAM} clinches playoff spot', category: 'playoff', tone: 'positive', weight: 10 },
  { id: 'playoff_2', text: 'They\'re in! {TEAM} makes playoff field', category: 'playoff', tone: 'positive', weight: 10 },
  { id: 'playoff_3', text: '{TEAM} falls just short of playoff', category: 'playoff', tone: 'negative', weight: 8 },
  { id: 'playoff_4', text: 'Bubble watch: {TEAM}\'s playoff hopes hang in balance', category: 'playoff', tone: 'neutral', weight: 7 },
  { id: 'playoff_5', text: '{TEAM} makes case for playoff inclusion', category: 'playoff', tone: 'positive', weight: 7 },

  // Championship
  { id: 'champ_1', text: 'CHAMPIONS! {TEAM} wins national title', category: 'championship', tone: 'positive', weight: 10 },
  { id: 'champ_2', text: '{TEAM} crowned national champions', category: 'championship', tone: 'positive', weight: 10 },
  { id: 'champ_3', text: 'Dynasty: {TEAM} wins another title', category: 'championship', tone: 'positive', weight: 9 },
  { id: 'champ_4', text: '{COACH_LAST} completes journey with championship', category: 'championship', tone: 'positive', weight: 9 },
  { id: 'champ_5', text: '{TEAM} falls in championship game', category: 'championship', tone: 'negative', weight: 8 },
  { id: 'champ_6', text: 'So close: {TEAM} comes up short in title game', category: 'championship', tone: 'negative', weight: 8 },
];

// ============================================
// GENERAL/MISC HEADLINES
// ============================================

export const generalHeadlines: HeadlineTemplate[] = [
  { id: 'gen_1', text: '{TEAM} moves to {RECORD} on season', category: 'general', tone: 'neutral', weight: 5 },
  { id: 'gen_2', text: '{PLAYER} earns {CONFERENCE} Player of the Week', category: 'general', tone: 'positive', weight: 7 },
  { id: 'gen_3', text: '{TEAM} opens as favorite against {OPPONENT}', category: 'general', tone: 'neutral', weight: 5 },
  { id: 'gen_4', text: '{TEAM} set for primetime matchup', category: 'general', tone: 'neutral', weight: 6 },
  { id: 'gen_5', text: '{COACH_LAST} addresses team after tough week', category: 'general', tone: 'neutral', weight: 5 },
  { id: 'gen_6', text: 'Rivalry Week: {TEAM} vs {OPPONENT}', category: 'general', tone: 'neutral', weight: 8 },
  { id: 'gen_7', text: '{TEAM} hosts sold-out homecoming', category: 'general', tone: 'positive', weight: 5 },
  { id: 'gen_8', text: 'Weather concerns for {TEAM}-{OPPONENT} matchup', category: 'general', tone: 'neutral', weight: 4 },
];

// ============================================
// TRANSFER PORTAL HEADLINES
// ============================================

export const transferHeadlines: HeadlineTemplate[] = [
  { id: 'trans_1', text: '{PLAYER} enters transfer portal', category: 'transfer', tone: 'neutral', weight: 8 },
  { id: 'trans_2', text: '{TEAM} lands {POSITION} {PLAYER} from portal', category: 'transfer', tone: 'positive', weight: 9 },
  { id: 'trans_3', text: 'Portal pickup: {PLAYER} commits to {TEAM}', category: 'transfer', tone: 'positive', weight: 8 },
  { id: 'trans_4', text: '{TEAM} loses key player to transfer portal', category: 'transfer', tone: 'negative', weight: 7 },
  { id: 'trans_5', text: '{COACH_LAST} active in transfer portal', category: 'transfer', tone: 'neutral', weight: 6 },
  { id: 'trans_6', text: '{TEAM} rebuilds through transfer portal', category: 'transfer', tone: 'neutral', weight: 6 },
];

// ============================================
// COMBINED EXPORTS
// ============================================

export const allHeadlines: HeadlineTemplate[] = [
  ...winHeadlines,
  ...lossHeadlines,
  ...jobSecurityHeadlines,
  ...recruitingHeadlines,
  ...injuryHeadlines,
  ...preseasonHeadlines,
  ...postseasonHeadlines,
  ...generalHeadlines,
  ...transferHeadlines,
];

/**
 * Get headlines by category
 */
export const getHeadlinesByCategory = (category: HeadlineCategory): HeadlineTemplate[] => {
  return allHeadlines.filter(h => h.category === category);
};

/**
 * Get random headline from category (weighted)
 */
export const selectHeadline = (
  category: HeadlineCategory,
  seed?: number
): HeadlineTemplate | undefined => {
  const headlines = getHeadlinesByCategory(category);
  if (headlines.length === 0) return undefined;

  // Build weighted pool
  const weightedPool: HeadlineTemplate[] = [];
  for (const headline of headlines) {
    const weight = headline.weight || 5;
    for (let i = 0; i < weight; i++) {
      weightedPool.push(headline);
    }
  }

  const index = seed !== undefined
    ? Math.abs(seed) % weightedPool.length
    : Math.floor(Math.random() * weightedPool.length);

  return weightedPool[index];
};
