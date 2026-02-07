// PUFF Achievements System
// Gamification for cannabis journey

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  requirement: AchievementRequirement;
  points: number;
  secret?: boolean;
}

export type AchievementCategory = 
  | 'getting-started'
  | 'explorer'
  | 'connoisseur'
  | 'social'
  | 'wellness'
  | 'collector'
  | 'special';

export interface AchievementRequirement {
  type: string;
  value: number;
}

export interface UserAchievements {
  unlockedIds: string[];
  totalPoints: number;
  level: number;
  levelName: string;
}

// ============================================
// ACHIEVEMENTS
// ============================================

export const ACHIEVEMENTS: Achievement[] = [
  // Getting Started
  {
    id: 'first-puff',
    name: 'First Puff',
    description: 'Log your first session',
    emoji: '🌱',
    category: 'getting-started',
    requirement: { type: 'sessions', value: 1 },
    points: 10,
  },
  {
    id: 'strain-hunter',
    name: 'Strain Hunter',
    description: 'Add your first strain',
    emoji: '🔍',
    category: 'getting-started',
    requirement: { type: 'strains', value: 1 },
    points: 10,
  },
  {
    id: 'budtender-chat',
    name: 'Ask the Budtender',
    description: 'Get your first AI recommendation',
    emoji: '💬',
    category: 'getting-started',
    requirement: { type: 'budtender_chats', value: 1 },
    points: 10,
  },
  {
    id: 'photo-first',
    name: 'Picture Perfect',
    description: 'Add a photo to a strain',
    emoji: '📸',
    category: 'getting-started',
    requirement: { type: 'photos', value: 1 },
    points: 10,
  },
  
  // Explorer
  {
    id: 'strain-sampler',
    name: 'Strain Sampler',
    description: 'Try 10 different strains',
    emoji: '🎯',
    category: 'explorer',
    requirement: { type: 'unique_strains', value: 10 },
    points: 25,
  },
  {
    id: 'strain-veteran',
    name: 'Strain Veteran',
    description: 'Try 25 different strains',
    emoji: '🏅',
    category: 'explorer',
    requirement: { type: 'unique_strains', value: 25 },
    points: 50,
  },
  {
    id: 'strain-master',
    name: 'Strain Master',
    description: 'Try 50 different strains',
    emoji: '👑',
    category: 'explorer',
    requirement: { type: 'unique_strains', value: 50 },
    points: 100,
  },
  {
    id: 'indica-lover',
    name: 'Indica Lover',
    description: 'Try 10 different indicas',
    emoji: '🛋️',
    category: 'explorer',
    requirement: { type: 'indica_strains', value: 10 },
    points: 30,
  },
  {
    id: 'sativa-fan',
    name: 'Sativa Fan',
    description: 'Try 10 different sativas',
    emoji: '⚡',
    category: 'explorer',
    requirement: { type: 'sativa_strains', value: 10 },
    points: 30,
  },
  {
    id: 'hybrid-enthusiast',
    name: 'Hybrid Enthusiast',
    description: 'Try 10 different hybrids',
    emoji: '⚖️',
    category: 'explorer',
    requirement: { type: 'hybrid_strains', value: 10 },
    points: 30,
  },
  
  // Connoisseur
  {
    id: 'flavor-chaser',
    name: 'Flavor Chaser',
    description: 'Rate strains with 5 different flavor profiles',
    emoji: '👅',
    category: 'connoisseur',
    requirement: { type: 'flavor_profiles', value: 5 },
    points: 25,
  },
  {
    id: 'terpene-expert',
    name: 'Terpene Expert',
    description: 'Log sessions with 7 different dominant terpenes',
    emoji: '🧪',
    category: 'connoisseur',
    requirement: { type: 'terpene_variety', value: 7 },
    points: 50,
  },
  {
    id: 'high-roller',
    name: 'High Roller',
    description: 'Try a strain with 25%+ THC',
    emoji: '🎰',
    category: 'connoisseur',
    requirement: { type: 'high_thc', value: 1 },
    points: 20,
  },
  {
    id: 'cbd-curious',
    name: 'CBD Curious',
    description: 'Try a high-CBD strain (5%+)',
    emoji: '💚',
    category: 'connoisseur',
    requirement: { type: 'high_cbd', value: 1 },
    points: 20,
  },
  {
    id: 'method-mixer',
    name: 'Method Mixer',
    description: 'Try 4 different consumption methods',
    emoji: '🔄',
    category: 'connoisseur',
    requirement: { type: 'methods', value: 4 },
    points: 30,
  },
  
  // Wellness
  {
    id: 'mood-tracker',
    name: 'Mood Tracker',
    description: 'Log mood for 10 sessions',
    emoji: '📊',
    category: 'wellness',
    requirement: { type: 'mood_logs', value: 10 },
    points: 25,
  },
  {
    id: 't-break-warrior',
    name: 'T-Break Warrior',
    description: 'Complete a 7-day tolerance break',
    emoji: '💪',
    category: 'wellness',
    requirement: { type: 'tbreak_days', value: 7 },
    points: 50,
  },
  {
    id: 't-break-champion',
    name: 'T-Break Champion',
    description: 'Complete a 30-day tolerance break',
    emoji: '🏆',
    category: 'wellness',
    requirement: { type: 'tbreak_days', value: 30 },
    points: 100,
  },
  {
    id: 'mindful-consumer',
    name: 'Mindful Consumer',
    description: 'Set and track a weekly consumption goal',
    emoji: '🧘',
    category: 'wellness',
    requirement: { type: 'goal_set', value: 1 },
    points: 20,
  },
  {
    id: 'goal-crusher',
    name: 'Goal Crusher',
    description: 'Stay under your weekly goal for 4 weeks',
    emoji: '🎯',
    category: 'wellness',
    requirement: { type: 'goal_weeks', value: 4 },
    points: 50,
  },
  
  // Collector
  {
    id: 'library-builder',
    name: 'Library Builder',
    description: 'Add 25 strains to your collection',
    emoji: '📚',
    category: 'collector',
    requirement: { type: 'strains', value: 25 },
    points: 40,
  },
  {
    id: 'five-star-finds',
    name: 'Five Star Finds',
    description: 'Give 5 strains a 5-star rating',
    emoji: '⭐',
    category: 'collector',
    requirement: { type: 'five_star_ratings', value: 5 },
    points: 25,
  },
  {
    id: 'would-buy-again',
    name: 'Repeat Customer',
    description: 'Mark 10 strains as "would buy again"',
    emoji: '🔁',
    category: 'collector',
    requirement: { type: 'would_buy_again', value: 10 },
    points: 30,
  },
  {
    id: 'favorites-list',
    name: 'Favorites Collector',
    description: 'Add 10 strains to favorites',
    emoji: '❤️',
    category: 'collector',
    requirement: { type: 'favorites', value: 10 },
    points: 25,
  },
  
  // Social (Share cards feature)
  {
    id: 'first-share',
    name: 'Sharing is Caring',
    description: 'Create your first share card',
    emoji: '📤',
    category: 'social',
    requirement: { type: 'shares', value: 1 },
    points: 15,
  },
  {
    id: 'strain-reviewer',
    name: 'Strain Reviewer',
    description: 'Write detailed notes for 10 strains',
    emoji: '✍️',
    category: 'social',
    requirement: { type: 'detailed_notes', value: 10 },
    points: 30,
  },
  
  // Special / Secret
  {
    id: 'four-twenty',
    name: '4:20 Legend',
    description: 'Log a session at exactly 4:20',
    emoji: '🕟',
    category: 'special',
    requirement: { type: 'time_420', value: 1 },
    points: 42,
    secret: true,
  },
  {
    id: 'seven-ten',
    name: '7/10 Dabber',
    description: 'Log a dab session on July 10th',
    emoji: '🔥',
    category: 'special',
    requirement: { type: 'date_710', value: 1 },
    points: 71,
    secret: true,
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Log 10 sessions after midnight',
    emoji: '🦉',
    category: 'special',
    requirement: { type: 'late_night', value: 10 },
    points: 25,
    secret: true,
  },
  {
    id: 'early-bird',
    name: 'Wake & Baker',
    description: 'Log 10 sessions before 9 AM',
    emoji: '🌅',
    category: 'special',
    requirement: { type: 'early_morning', value: 10 },
    points: 25,
    secret: true,
  },
  {
    id: 'streak-week',
    name: 'Weekly Streak',
    description: 'Log sessions 7 days in a row',
    emoji: '🔥',
    category: 'special',
    requirement: { type: 'streak', value: 7 },
    points: 35,
  },
  {
    id: 'streak-month',
    name: 'Monthly Dedication',
    description: 'Log sessions 30 days in a row',
    emoji: '💎',
    category: 'special',
    requirement: { type: 'streak', value: 30 },
    points: 100,
  },
];

// ============================================
// LEVELS
// ============================================

export const LEVELS = [
  { level: 1, name: 'Seedling', minPoints: 0, emoji: '🌱' },
  { level: 2, name: 'Sprout', minPoints: 50, emoji: '🌿' },
  { level: 3, name: 'Budding', minPoints: 150, emoji: '🌳' },
  { level: 4, name: 'Flowering', minPoints: 300, emoji: '🌸' },
  { level: 5, name: 'Stoner', minPoints: 500, emoji: '😎' },
  { level: 6, name: 'Enthusiast', minPoints: 750, emoji: '🔥' },
  { level: 7, name: 'Connoisseur', minPoints: 1000, emoji: '🎩' },
  { level: 8, name: 'Expert', minPoints: 1500, emoji: '🧠' },
  { level: 9, name: 'Master', minPoints: 2000, emoji: '👑' },
  { level: 10, name: 'Legend', minPoints: 3000, emoji: '🌟' },
];

export function getLevelForPoints(points: number): { level: number; name: string; emoji: string } {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

export function getNextLevel(points: number): { level: number; name: string; minPoints: number } | null {
  const current = getLevelForPoints(points);
  const nextIndex = LEVELS.findIndex(l => l.level === current.level) + 1;
  if (nextIndex >= LEVELS.length) return null;
  return LEVELS[nextIndex];
}

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

export function getVisibleAchievements(): Achievement[] {
  return ACHIEVEMENTS.filter(a => !a.secret);
}

export function getSecretAchievements(): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.secret);
}
