/**
 * CHOICE TEMPLATES
 * Player decision options by context
 */

// ============================================
// CHOICE TYPES
// ============================================

export interface ChoiceTemplate {
  id: string;
  context: ChoiceContext;
  text: string;
  description?: string;
  riskLevel: 'safe' | 'moderate' | 'risky';
  effects: ChoiceEffects;
  weight?: number;
}

export interface ChoiceEffects {
  security?: number;      // -20 to +20 job security change
  teamMorale?: number;    // -20 to +20 team morale change
  recruiting?: number;    // -20 to +20 recruiting impact
  development?: number;   // -20 to +20 player development
  mediaPerception?: number; // -20 to +20 media/PR impact
  fanSupport?: number;    // -20 to +20 fan support
}

export type ChoiceContext =
  | 'game_management'
  | 'player_discipline'
  | 'media_response'
  | 'recruiting_decision'
  | 'staff_management'
  | 'program_direction'
  | 'hot_seat_response'
  | 'injury_management'
  | 'game_planning'
  | 'halftime_adjustment'
  | 'press_conference';

export interface ChoiceSet {
  id: string;
  context: ChoiceContext;
  situation: string;
  choices: ChoiceTemplate[];
}

// ============================================
// GAME MANAGEMENT CHOICES
// ============================================

export const gameManagementChoices: ChoiceSet[] = [
  {
    id: 'gm_4th_down',
    context: 'game_management',
    situation: 'Fourth down in opponent territory. The safe play is a field goal, but going for it could swing momentum.',
    choices: [
      {
        id: 'gm_4th_fg',
        context: 'game_management',
        text: 'Kick the field goal',
        description: 'Take the points. Don\'t leave empty-handed.',
        riskLevel: 'safe',
        effects: { security: 0, teamMorale: -2 },
        weight: 6,
      },
      {
        id: 'gm_4th_go',
        context: 'game_management',
        text: 'Go for it',
        description: 'Trust your offense to convert. Set the tone.',
        riskLevel: 'risky',
        effects: { security: -5, teamMorale: 5 },
        weight: 8,
      },
      {
        id: 'gm_4th_punt',
        context: 'game_management',
        text: 'Punt and play field position',
        description: 'Pin them deep. Let the defense work.',
        riskLevel: 'safe',
        effects: { security: 2, teamMorale: -5 },
        weight: 4,
      },
    ],
  },
  {
    id: 'gm_timeout',
    context: 'game_management',
    situation: 'The offense is struggling. Your QB looks confused. Do you burn a timeout?',
    choices: [
      {
        id: 'gm_to_call',
        context: 'game_management',
        text: 'Call timeout',
        description: 'Regroup. Get everyone on the same page.',
        riskLevel: 'safe',
        effects: { teamMorale: 2 },
        weight: 7,
      },
      {
        id: 'gm_to_trust',
        context: 'game_management',
        text: 'Trust your players to figure it out',
        description: 'They need to learn to adjust on the fly.',
        riskLevel: 'moderate',
        effects: { development: 3, teamMorale: -2 },
        weight: 6,
      },
    ],
  },
  {
    id: 'gm_qb_decision',
    context: 'game_management',
    situation: 'Your starting QB is struggling. The backup is talented but inexperienced.',
    choices: [
      {
        id: 'gm_qb_stay',
        context: 'game_management',
        text: 'Stay with the starter',
        description: 'He got you here. Show faith in him.',
        riskLevel: 'moderate',
        effects: { teamMorale: 2, development: -2 },
        weight: 6,
      },
      {
        id: 'gm_qb_pull',
        context: 'game_management',
        text: 'Make the switch',
        description: 'Sometimes a spark is what you need.',
        riskLevel: 'risky',
        effects: { teamMorale: -3, development: 5 },
        weight: 7,
      },
    ],
  },
];

// ============================================
// PLAYER DISCIPLINE CHOICES
// ============================================

export const playerDisciplineChoices: ChoiceSet[] = [
  {
    id: 'pd_star_violation',
    context: 'player_discipline',
    situation: 'Your star player violated team rules the week before a big game.',
    choices: [
      {
        id: 'pd_suspend',
        context: 'player_discipline',
        text: 'Suspend him for the game',
        description: 'Rules are rules. No exceptions.',
        riskLevel: 'risky',
        effects: { security: -5, teamMorale: 5, mediaPerception: 10 },
        weight: 7,
      },
      {
        id: 'pd_internal',
        context: 'player_discipline',
        text: 'Handle it internally',
        description: 'Discipline him, but keep it in-house.',
        riskLevel: 'moderate',
        effects: { security: 2, teamMorale: 0, mediaPerception: -5 },
        weight: 6,
      },
      {
        id: 'pd_warning',
        context: 'player_discipline',
        text: 'Issue a warning',
        description: 'First offense. Give him another chance.',
        riskLevel: 'safe',
        effects: { security: 3, teamMorale: -5, mediaPerception: -10 },
        weight: 5,
      },
    ],
  },
  {
    id: 'pd_team_curfew',
    context: 'player_discipline',
    situation: 'Multiple players missed curfew before a road game.',
    choices: [
      {
        id: 'pd_curfew_bench',
        context: 'player_discipline',
        text: 'Bench all violators',
        description: 'Send a message to the entire team.',
        riskLevel: 'risky',
        effects: { security: -8, teamMorale: 8, development: 3 },
        weight: 6,
      },
      {
        id: 'pd_curfew_run',
        context: 'player_discipline',
        text: 'Extra conditioning',
        description: 'Make them earn their way back.',
        riskLevel: 'moderate',
        effects: { security: 0, teamMorale: 2, development: 2 },
        weight: 8,
      },
      {
        id: 'pd_curfew_talk',
        context: 'player_discipline',
        text: 'Team meeting to address it',
        description: 'Use it as a teaching moment.',
        riskLevel: 'safe',
        effects: { security: 2, teamMorale: 0, development: 1 },
        weight: 6,
      },
    ],
  },
];

// ============================================
// MEDIA RESPONSE CHOICES
// ============================================

export const mediaResponseChoices: ChoiceSet[] = [
  {
    id: 'mr_tough_loss',
    context: 'media_response',
    situation: 'After a tough loss, reporters are asking pointed questions about your team\'s performance.',
    choices: [
      {
        id: 'mr_accountability',
        context: 'media_response',
        text: 'Take full responsibility',
        description: '"That\'s on me. I didn\'t have them ready."',
        riskLevel: 'safe',
        effects: { mediaPerception: 10, teamMorale: 5 },
        weight: 8,
      },
      {
        id: 'mr_deflect',
        context: 'media_response',
        text: 'Deflect to execution',
        description: '"We had a good gameplan, just didn\'t execute."',
        riskLevel: 'moderate',
        effects: { mediaPerception: -5, teamMorale: -3 },
        weight: 5,
      },
      {
        id: 'mr_defiant',
        context: 'media_response',
        text: 'Push back on the narrative',
        description: '"We\'re better than people think. Watch."',
        riskLevel: 'risky',
        effects: { mediaPerception: -10, teamMorale: 8 },
        weight: 6,
      },
    ],
  },
  {
    id: 'mr_hot_seat',
    context: 'media_response',
    situation: 'A reporter asks directly: "Should fans be concerned about your job security?"',
    choices: [
      {
        id: 'mr_confident',
        context: 'media_response',
        text: 'Project confidence',
        description: '"I\'m focused on this team. Period."',
        riskLevel: 'safe',
        effects: { mediaPerception: 5, security: 2 },
        weight: 8,
      },
      {
        id: 'mr_honest',
        context: 'media_response',
        text: 'Acknowledge the situation',
        description: '"Look, I understand the frustration. We all do."',
        riskLevel: 'moderate',
        effects: { mediaPerception: 8, security: -2 },
        weight: 6,
      },
      {
        id: 'mr_dismiss',
        context: 'media_response',
        text: 'Dismiss the question',
        description: '"Next question."',
        riskLevel: 'risky',
        effects: { mediaPerception: -15, security: 0 },
        weight: 4,
      },
    ],
  },
];

// ============================================
// RECRUITING CHOICES
// ============================================

export const recruitingChoices: ChoiceSet[] = [
  {
    id: 'rec_commitment',
    context: 'recruiting_decision',
    situation: 'A 4-star recruit is ready to commit, but you\'re waiting on a 5-star at the same position.',
    choices: [
      {
        id: 'rec_take_4star',
        context: 'recruiting_decision',
        text: 'Accept the commitment',
        description: 'A bird in hand. Secure the talent.',
        riskLevel: 'safe',
        effects: { recruiting: 5, security: 3 },
        weight: 7,
      },
      {
        id: 'rec_wait',
        context: 'recruiting_decision',
        text: 'Ask him to wait',
        description: 'Risk losing him while chasing the bigger fish.',
        riskLevel: 'risky',
        effects: { recruiting: -5, security: -2 },
        weight: 5,
      },
      {
        id: 'rec_take_both',
        context: 'recruiting_decision',
        text: 'Offer both - figure it out later',
        description: 'Oversigning creates problems, but talent is talent.',
        riskLevel: 'moderate',
        effects: { recruiting: 8, mediaPerception: -5 },
        weight: 6,
      },
    ],
  },
  {
    id: 'rec_character',
    context: 'recruiting_decision',
    situation: 'A highly-rated recruit has character concerns. Your staff is divided.',
    choices: [
      {
        id: 'rec_pass',
        context: 'recruiting_decision',
        text: 'Pass on him',
        description: 'Culture over talent. No exceptions.',
        riskLevel: 'safe',
        effects: { recruiting: -8, teamMorale: 5, mediaPerception: 5 },
        weight: 6,
      },
      {
        id: 'rec_take_risk',
        context: 'recruiting_decision',
        text: 'Take the chance',
        description: 'Maybe your program can turn him around.',
        riskLevel: 'risky',
        effects: { recruiting: 10, teamMorale: -3, mediaPerception: -8 },
        weight: 5,
      },
      {
        id: 'rec_conditions',
        context: 'recruiting_decision',
        text: 'Offer with conditions',
        description: 'Set clear expectations. Probationary status.',
        riskLevel: 'moderate',
        effects: { recruiting: 5, teamMorale: 0, mediaPerception: 0 },
        weight: 7,
      },
    ],
  },
];

// ============================================
// HOT SEAT CHOICES
// ============================================

export const hotSeatChoices: ChoiceSet[] = [
  {
    id: 'hs_staff_change',
    context: 'hot_seat_response',
    situation: 'Your job is on the line. The AD suggests making staff changes might help.',
    choices: [
      {
        id: 'hs_fire_coord',
        context: 'hot_seat_response',
        text: 'Fire a coordinator',
        description: 'Sometimes change is necessary.',
        riskLevel: 'moderate',
        effects: { security: 5, teamMorale: -5, mediaPerception: 3 },
        weight: 7,
      },
      {
        id: 'hs_loyalty',
        context: 'hot_seat_response',
        text: 'Stand by your staff',
        description: '"We win together, we lose together."',
        riskLevel: 'risky',
        effects: { security: -5, teamMorale: 8, mediaPerception: -3 },
        weight: 6,
      },
      {
        id: 'hs_reorganize',
        context: 'hot_seat_response',
        text: 'Reorganize responsibilities',
        description: 'Shuffle duties without firing anyone.',
        riskLevel: 'safe',
        effects: { security: 2, teamMorale: 0, mediaPerception: 0 },
        weight: 6,
      },
    ],
  },
  {
    id: 'hs_approach',
    context: 'hot_seat_response',
    situation: 'The pressure is mounting. How do you handle the final weeks of the season?',
    choices: [
      {
        id: 'hs_all_in',
        context: 'hot_seat_response',
        text: 'Go all-in to save your job',
        description: 'Play your best players, regardless of development.',
        riskLevel: 'risky',
        effects: { security: 5, development: -8 },
        weight: 6,
      },
      {
        id: 'hs_develop',
        context: 'hot_seat_response',
        text: 'Focus on player development',
        description: 'Build for the future, even if it costs you.',
        riskLevel: 'risky',
        effects: { security: -8, development: 10 },
        weight: 5,
      },
      {
        id: 'hs_balance',
        context: 'hot_seat_response',
        text: 'Find a balance',
        description: 'Compete to win while developing young players.',
        riskLevel: 'moderate',
        effects: { security: 0, development: 3 },
        weight: 7,
      },
    ],
  },
];

// ============================================
// PROGRAM DIRECTION CHOICES
// ============================================

export const programChoices: ChoiceSet[] = [
  {
    id: 'prog_style',
    context: 'program_direction',
    situation: 'Entering a new season, your staff debates offensive philosophy.',
    choices: [
      {
        id: 'prog_air_raid',
        context: 'program_direction',
        text: 'Spread it out and throw',
        description: 'Modern, explosive offense. Recruit skill players.',
        riskLevel: 'moderate',
        effects: { recruiting: 5, fanSupport: 5 },
        weight: 7,
      },
      {
        id: 'prog_power',
        context: 'program_direction',
        text: 'Pound the rock',
        description: 'Physical, controlling style. Win the trenches.',
        riskLevel: 'moderate',
        effects: { recruiting: 0, development: 5 },
        weight: 6,
      },
      {
        id: 'prog_balanced',
        context: 'program_direction',
        text: 'Stay balanced',
        description: 'Adapt to your personnel each year.',
        riskLevel: 'safe',
        effects: { recruiting: 2, development: 2 },
        weight: 6,
      },
    ],
  },
  {
    id: 'prog_culture',
    context: 'program_direction',
    situation: 'The locker room culture needs defining. What do you emphasize?',
    choices: [
      {
        id: 'prog_discipline',
        context: 'program_direction',
        text: 'Iron discipline',
        description: '"Do your job" mentality. No excuses.',
        riskLevel: 'moderate',
        effects: { teamMorale: -3, development: 8 },
        weight: 6,
      },
      {
        id: 'prog_family',
        context: 'program_direction',
        text: 'Family atmosphere',
        description: 'Players first. Build relationships.',
        riskLevel: 'moderate',
        effects: { teamMorale: 8, recruiting: 5 },
        weight: 7,
      },
      {
        id: 'prog_compete',
        context: 'program_direction',
        text: 'Ruthless competition',
        description: 'Best players play. Earn everything.',
        riskLevel: 'risky',
        effects: { teamMorale: -5, development: 10 },
        weight: 5,
      },
    ],
  },
];

// ============================================
// COMBINED EXPORTS
// ============================================

export const allChoiceSets: ChoiceSet[] = [
  ...gameManagementChoices,
  ...playerDisciplineChoices,
  ...mediaResponseChoices,
  ...recruitingChoices,
  ...hotSeatChoices,
  ...programChoices,
];

/**
 * Get choice sets by context
 */
export const getChoiceSetsByContext = (context: ChoiceContext): ChoiceSet[] => {
  return allChoiceSets.filter(cs => cs.context === context);
};

/**
 * Select a random choice set from context
 */
export const selectChoiceSet = (
  context: ChoiceContext,
  seed?: number
): ChoiceSet | undefined => {
  const sets = getChoiceSetsByContext(context);
  if (sets.length === 0) return undefined;

  const index = seed !== undefined
    ? Math.abs(seed) % sets.length
    : Math.floor(Math.random() * sets.length);

  return sets[index];
};

/**
 * Apply choice effects to game state
 */
export const calculateChoiceImpact = (choice: ChoiceTemplate): string[] => {
  const impacts: string[] = [];
  const effects = choice.effects;

  if (effects.security && effects.security > 0) impacts.push(`Job security improved`);
  if (effects.security && effects.security < 0) impacts.push(`Job security decreased`);
  if (effects.teamMorale && effects.teamMorale > 0) impacts.push(`Team morale boosted`);
  if (effects.teamMorale && effects.teamMorale < 0) impacts.push(`Team morale suffered`);
  if (effects.recruiting && effects.recruiting > 0) impacts.push(`Recruiting momentum gained`);
  if (effects.recruiting && effects.recruiting < 0) impacts.push(`Recruiting took a hit`);
  if (effects.development && effects.development > 0) impacts.push(`Player development accelerated`);
  if (effects.mediaPerception && effects.mediaPerception > 0) impacts.push(`Media perception improved`);
  if (effects.mediaPerception && effects.mediaPerception < 0) impacts.push(`Media backlash`);
  if (effects.fanSupport && effects.fanSupport > 0) impacts.push(`Fan support increased`);
  if (effects.fanSupport && effects.fanSupport < 0) impacts.push(`Fan frustration growing`);

  return impacts;
};
