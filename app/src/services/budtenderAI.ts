// AI Budtender Service
// Personalized strain recommendations based on desired effects

import {
  STRAIN_DATABASE,
  Strain,
  Effect,
  searchStrains,
  getStrainsByEffect,
  getStrainsByType,
  getStrainsForMood,
} from '../data/strainDatabase';

// ============================================
// TYPES
// ============================================

export interface BudtenderResponse {
  message: string;
  recommendations?: StrainRecommendation[];
  followUp?: string[];
}

export interface StrainRecommendation {
  id: string;
  name: string;
  type: 'indica' | 'sativa' | 'hybrid';
  thc: string;
  matchScore: number;
  reason: string;
  effects: string[];
  flavors: string[];
}

export interface UserEffectProfile {
  userId: string;
  preferredEffects: Record<Effect, number>; // 1-5 preference
  avoidEffects: Effect[];
  preferredType: 'indica' | 'sativa' | 'hybrid' | 'any';
  thcTolerance: 'low' | 'medium' | 'high';
  preferredFlavors: string[];
  totalSessions: number;
  updatedAt: number;
}

interface Intent {
  type: 'mood' | 'activity' | 'medical' | 'time' | 'type' | 'search' | 'education' | 'recommendation' | 'unknown';
  entities: Record<string, string>;
}

// ============================================
// INTENT DETECTION
// ============================================

function detectIntent(message: string): Intent {
  const lower = message.toLowerCase();
  
  // Mood-based
  const moods = [
    { keywords: ['relax', 'chill', 'calm', 'unwind', 'destress'], mood: 'relax' },
    { keywords: ['energy', 'energetic', 'active', 'wake', 'productive'], mood: 'energy' },
    { keywords: ['creative', 'art', 'music', 'write', 'create'], mood: 'creative' },
    { keywords: ['social', 'party', 'friends', 'hangout', 'talk'], mood: 'social' },
    { keywords: ['sleep', 'insomnia', 'tired', 'bedtime', 'night'], mood: 'sleep' },
    { keywords: ['focus', 'concentrate', 'work', 'study'], mood: 'focus' },
    { keywords: ['happy', 'mood', 'depressed', 'sad', 'anxious', 'anxiety'], mood: 'happy' },
  ];
  
  for (const { keywords, mood } of moods) {
    if (keywords.some(k => lower.includes(k))) {
      return { type: 'mood', entities: { mood } };
    }
  }
  
  // Activity-based
  const activities = [
    { keywords: ['movie', 'movies', 'netflix', 'watch', 'tv'], activity: 'movies' },
    { keywords: ['hike', 'hiking', 'outdoor', 'nature', 'walk'], activity: 'outdoor' },
    { keywords: ['game', 'gaming', 'video game', 'play'], activity: 'gaming' },
    { keywords: ['eat', 'food', 'munchies', 'dinner', 'cook'], activity: 'food' },
    { keywords: ['sex', 'intimate', 'romance', 'partner'], activity: 'intimate' },
    { keywords: ['yoga', 'meditat', 'mindful'], activity: 'meditation' },
    { keywords: ['concert', 'music', 'festival', 'show'], activity: 'music' },
  ];
  
  for (const { keywords, activity } of activities) {
    if (keywords.some(k => lower.includes(k))) {
      return { type: 'activity', entities: { activity } };
    }
  }
  
  // Medical
  const medical = ['pain', 'headache', 'migraine', 'nausea', 'appetite', 'inflammation', 'cramp', 'spasm'];
  for (const condition of medical) {
    if (lower.includes(condition)) {
      return { type: 'medical', entities: { condition } };
    }
  }
  
  // Time of day
  if (lower.includes('morning') || lower.includes('wake and bake')) {
    return { type: 'time', entities: { time: 'morning' } };
  }
  if (lower.includes('afternoon') || lower.includes('daytime')) {
    return { type: 'time', entities: { time: 'afternoon' } };
  }
  if (lower.includes('evening') || lower.includes('night') || lower.includes('before bed')) {
    return { type: 'time', entities: { time: 'evening' } };
  }
  
  // Type request
  if (lower.includes('indica')) {
    return { type: 'type', entities: { strainType: 'indica' } };
  }
  if (lower.includes('sativa')) {
    return { type: 'type', entities: { strainType: 'sativa' } };
  }
  if (lower.includes('hybrid')) {
    return { type: 'type', entities: { strainType: 'hybrid' } };
  }
  
  // Search
  if (lower.includes('what is') || lower.includes('tell me about') || lower.includes('heard of')) {
    const searchTerm = lower.replace(/what is|tell me about|have you heard of|do you know/g, '').trim();
    if (searchTerm.length > 2) {
      return { type: 'search', entities: { query: searchTerm } };
    }
  }
  
  // Education
  if (lower.includes('terpene') || lower.includes('thc') || lower.includes('cbd') || lower.includes('difference between')) {
    return { type: 'education', entities: { topic: lower } };
  }
  
  // General recommendation
  if (lower.includes('recommend') || lower.includes('suggest') || lower.includes('what should') || lower.includes('good strain')) {
    return { type: 'recommendation', entities: {} };
  }
  
  return { type: 'unknown', entities: {} };
}

// ============================================
// RESPONSE GENERATORS
// ============================================

function generateMoodResponse(mood: string, profile: UserEffectProfile): BudtenderResponse {
  const strains = getStrainsForMood(mood);
  const scored = scoreStrains(strains, profile);
  const top3 = scored.slice(0, 3);
  
  const messages: Record<string, string> = {
    relax: "Time to unwind! 🧘 Here are some strains that'll melt your stress away:",
    energy: "Let's get you energized! ⚡ These strains will give you that boost:",
    creative: "Ready to create? 🎨 These strains unlock that artistic flow:",
    social: "Party time! 🎉 These strains will have you chatting and laughing:",
    sleep: "Need those Z's? 😴 These will send you to dreamland:",
    focus: "Locked in mode! 🎯 These strains help you concentrate:",
    happy: "Mood boost incoming! 😊 These strains are known for lifting spirits:",
  };
  
  return {
    message: messages[mood] || `Looking for ${mood} vibes? Here's what I recommend:`,
    recommendations: top3.map(({ strain, score }) => formatRecommendation(strain, score)),
    followUp: [
      `Want something stronger or milder?`,
      `Prefer indica, sativa, or hybrid?`,
      `Any flavors you love or hate?`,
    ],
  };
}

function generateActivityResponse(activity: string, profile: UserEffectProfile): BudtenderResponse {
  const activityStrains: Record<string, { effects: Effect[]; message: string }> = {
    movies: {
      effects: ['relaxed', 'happy', 'euphoric', 'giggly'],
      message: "Movie night! 🎬 These strains make everything more entertaining:",
    },
    outdoor: {
      effects: ['energetic', 'uplifted', 'happy', 'creative'],
      message: "Adventure time! 🌲 These strains pair great with nature:",
    },
    gaming: {
      effects: ['focused', 'energetic', 'happy', 'creative'],
      message: "Game on! 🎮 These strains enhance focus without couch-locking you:",
    },
    food: {
      effects: ['hungry', 'happy', 'relaxed', 'euphoric'],
      message: "Munchie mode activated! 🍕 These strains make food taste AMAZING:",
    },
    intimate: {
      effects: ['aroused', 'relaxed', 'euphoric', 'happy'],
      message: "Setting the mood! 💕 These strains enhance intimacy:",
    },
    meditation: {
      effects: ['relaxed', 'focused', 'euphoric', 'uplifted'],
      message: "Finding your center! 🧘 These strains deepen your practice:",
    },
    music: {
      effects: ['euphoric', 'happy', 'creative', 'uplifted'],
      message: "Feel the music! 🎵 These strains make every beat hit different:",
    },
  };
  
  const config = activityStrains[activity] || { effects: ['happy', 'relaxed'], message: "Here's what I'd recommend:" };
  
  const strains = STRAIN_DATABASE.filter(s => 
    config.effects.some(e => s.effects.includes(e))
  );
  const scored = scoreStrains(strains, profile);
  const top3 = scored.slice(0, 3);
  
  return {
    message: config.message,
    recommendations: top3.map(({ strain, score }) => formatRecommendation(strain, score)),
  };
}

function generateMedicalResponse(condition: string, profile: UserEffectProfile): BudtenderResponse {
  const strains = STRAIN_DATABASE.filter(s => 
    s.medicalUses.some(use => use.toLowerCase().includes(condition.toLowerCase()))
  );
  const scored = scoreStrains(strains, profile);
  const top3 = scored.slice(0, 3);
  
  const messages: Record<string, string> = {
    pain: "For pain relief, these strains have helped many people: 💚",
    headache: "Headache? These strains may help take the edge off:",
    nausea: "For nausea, these are commonly recommended:",
    appetite: "Need to stimulate appetite? These strains are known for the munchies:",
    insomnia: "Sleep struggles? These heavy hitters may help:",
  };
  
  return {
    message: messages[condition] || `For ${condition}, here's what may help:`,
    recommendations: top3.map(({ strain, score }) => formatRecommendation(strain, score)),
    followUp: [
      "Always consult a doctor for medical advice",
      "Start low and go slow with new strains",
    ],
  };
}

function generateTimeResponse(time: string, profile: UserEffectProfile): BudtenderResponse {
  const timeConfig: Record<string, { types: ('indica' | 'sativa' | 'hybrid')[]; effects: Effect[]; message: string }> = {
    morning: {
      types: ['sativa', 'hybrid'],
      effects: ['energetic', 'uplifted', 'focused', 'creative'],
      message: "Rise and shine! ☀️ Wake and bake with these energizing strains:",
    },
    afternoon: {
      types: ['hybrid', 'sativa'],
      effects: ['happy', 'uplifted', 'creative', 'focused'],
      message: "Afternoon pick-me-up! 🌤️ These keep you going without the crash:",
    },
    evening: {
      types: ['indica', 'hybrid'],
      effects: ['relaxed', 'sleepy', 'happy', 'euphoric'],
      message: "Winding down! 🌙 These strains are perfect for evening relaxation:",
    },
  };
  
  const config = timeConfig[time];
  const strains = STRAIN_DATABASE.filter(s => 
    config.types.includes(s.type) && config.effects.some(e => s.effects.includes(e))
  );
  const scored = scoreStrains(strains, profile);
  const top3 = scored.slice(0, 3);
  
  return {
    message: config.message,
    recommendations: top3.map(({ strain, score }) => formatRecommendation(strain, score)),
  };
}

function generateTypeResponse(strainType: string, profile: UserEffectProfile): BudtenderResponse {
  const type = strainType as 'indica' | 'sativa' | 'hybrid';
  const strains = getStrainsByType(type);
  const scored = scoreStrains(strains, profile);
  const top3 = scored.slice(0, 3);
  
  const messages: Record<string, string> = {
    indica: "Indica lover! 🛋️ Here are some heavy hitters for that body high:",
    sativa: "Sativa fan! 🚀 These cerebral strains will lift you up:",
    hybrid: "Best of both worlds! ⚖️ These hybrids offer balanced effects:",
  };
  
  return {
    message: messages[type],
    recommendations: top3.map(({ strain, score }) => formatRecommendation(strain, score)),
  };
}

function generateSearchResponse(query: string, profile: UserEffectProfile): BudtenderResponse {
  const results = searchStrains(query);
  
  if (results.length === 0) {
    return {
      message: `I couldn't find anything matching "${query}" in my database. Try searching for a strain name, effect, or flavor!`,
      followUp: [
        "What effects are you looking for?",
        "Want me to recommend something similar?",
      ],
    };
  }
  
  const scored = scoreStrains(results, profile);
  const top3 = scored.slice(0, 3);
  
  return {
    message: `Found ${results.length} strains matching "${query}"! Here are the best matches for you:`,
    recommendations: top3.map(({ strain, score }) => formatRecommendation(strain, score)),
  };
}

function generateEducationResponse(topic: string): BudtenderResponse {
  const education: Record<string, string> = {
    terpene: "**Terpenes** are aromatic compounds in cannabis that affect smell, taste, and effects! 🌿\n\n**Common terpenes:**\n• **Myrcene** — Earthy, relaxing, sedating\n• **Limonene** — Citrus, mood elevation, energizing\n• **Caryophyllene** — Spicy, pain relief, anti-anxiety\n• **Pinene** — Pine, alertness, memory\n• **Linalool** — Floral, calming, sleep\n\nTerpenes work with THC/CBD (the 'entourage effect') to create each strain's unique experience!",
    
    thc: "**THC (Tetrahydrocannabinol)** is the main psychoactive compound in cannabis. 🧪\n\n**THC Levels:**\n• **Low (10-15%)** — Mild, good for beginners\n• **Medium (15-20%)** — Balanced, most common\n• **High (20-25%)** — Strong, experienced users\n• **Very High (25%+)** — Intense, proceed with caution\n\nHigher THC ≠ better. It's about finding what works for YOU.",
    
    cbd: "**CBD (Cannabidiol)** is non-psychoactive but has many benefits! 💚\n\n**CBD effects:**\n• Anti-anxiety\n• Pain relief\n• Anti-inflammatory\n• Reduces THC anxiety\n• Helps sleep\n\n**CBD:THC ratios:**\n• **1:1** — Balanced, mild high\n• **2:1** — CBD dominant, subtle high\n• **High CBD** — No high, therapeutic only",
    
    'indica sativa': "**Indica vs Sativa** — The classic debate! 🌿\n\n**Indica:**\n• Body high, 'couch lock'\n• Relaxing, sedating\n• Best for: night, sleep, pain\n\n**Sativa:**\n• Head high, cerebral\n• Energizing, uplifting\n• Best for: day, creativity, social\n\n**Hybrid:**\n• Mix of both\n• Effects depend on genetics\n\n**Reality check:** Modern science says terpenes matter more than indica/sativa for effects. But the categories are still useful shortcuts!",
  };
  
  for (const [key, value] of Object.entries(education)) {
    if (topic.includes(key)) {
      return { message: value };
    }
  }
  
  return {
    message: "Great question! Try asking about terpenes, THC, CBD, or the difference between indica and sativa.",
  };
}

function generateRecommendationResponse(profile: UserEffectProfile): BudtenderResponse {
  const allStrains = [...STRAIN_DATABASE];
  const scored = scoreStrains(allStrains, profile);
  const top3 = scored.slice(0, 3);
  
  const prefDesc = describePreferences(profile);
  
  return {
    message: `Based on your profile, I know you ${prefDesc}.\n\nHere's what I think you'd love right now:`,
    recommendations: top3.map(({ strain, score }) => formatRecommendation(strain, score)),
    followUp: [
      "What are you in the mood for?",
      "Any specific activity planned?",
      "Indica, sativa, or hybrid?",
    ],
  };
}

// ============================================
// HELPERS
// ============================================

function scoreStrains(strains: Strain[], profile: UserEffectProfile): { strain: Strain; score: number }[] {
  return strains.map(strain => {
    let score = 50;
    
    // Effect preferences
    strain.effects.forEach(effect => {
      const pref = profile.preferredEffects[effect] || 3;
      score += (pref - 3) * 5;
    });
    
    // Avoid effects penalty
    if (profile.avoidEffects.some(e => strain.effects.includes(e as Effect))) {
      score -= 30;
    }
    
    // Type preference
    if (profile.preferredType !== 'any' && strain.type === profile.preferredType) {
      score += 10;
    }
    
    // THC tolerance
    const avgThc = (strain.thcRange[0] + strain.thcRange[1]) / 2;
    if (profile.thcTolerance === 'low' && avgThc > 20) score -= 15;
    if (profile.thcTolerance === 'high' && avgThc < 18) score -= 10;
    
    // Flavor preferences
    if (profile.preferredFlavors.some(f => strain.flavors.includes(f))) {
      score += 10;
    }
    
    // Rating boost
    score += (strain.rating - 4) * 10;
    
    return { strain, score: Math.min(Math.max(score, 0), 100) };
  }).sort((a, b) => b.score - a.score);
}

function formatRecommendation(strain: Strain, score: number): StrainRecommendation {
  return {
    id: strain.id,
    name: strain.name,
    type: strain.type,
    thc: `${strain.thcRange[0]}-${strain.thcRange[1]}%`,
    matchScore: Math.round(score),
    reason: strain.description,
    effects: strain.effects.slice(0, 4),
    flavors: strain.flavors.slice(0, 3),
  };
}

function describePreferences(profile: UserEffectProfile): string {
  const prefs: string[] = [];
  
  const topEffects = Object.entries(profile.preferredEffects)
    .filter(([_, val]) => val >= 4)
    .map(([effect]) => effect);
  
  if (topEffects.includes('relaxed')) prefs.push("enjoy relaxing strains");
  if (topEffects.includes('energetic')) prefs.push("like energizing effects");
  if (topEffects.includes('creative')) prefs.push("appreciate creative strains");
  if (topEffects.includes('sleepy')) prefs.push("use cannabis for sleep");
  
  if (profile.preferredType !== 'any') {
    prefs.push(`prefer ${profile.preferredType}s`);
  }
  
  if (prefs.length === 0) return "have a balanced palate";
  return prefs.join(', ');
}

export function createDefaultProfile(userId: string): UserEffectProfile {
  return {
    userId,
    preferredEffects: {
      relaxed: 3, happy: 3, euphoric: 3, uplifted: 3, creative: 3,
      energetic: 3, focused: 3, giggly: 3, hungry: 3, sleepy: 3,
      talkative: 3, tingly: 3, aroused: 3,
    },
    avoidEffects: [],
    preferredType: 'any',
    thcTolerance: 'medium',
    preferredFlavors: [],
    totalSessions: 0,
    updatedAt: Date.now(),
  };
}

// ============================================
// MAIN FUNCTION
// ============================================

export function generateBudtenderResponse(
  message: string,
  profile: UserEffectProfile
): BudtenderResponse {
  const intent = detectIntent(message);
  
  switch (intent.type) {
    case 'mood':
      return generateMoodResponse(intent.entities.mood, profile);
    case 'activity':
      return generateActivityResponse(intent.entities.activity, profile);
    case 'medical':
      return generateMedicalResponse(intent.entities.condition, profile);
    case 'time':
      return generateTimeResponse(intent.entities.time, profile);
    case 'type':
      return generateTypeResponse(intent.entities.strainType, profile);
    case 'search':
      return generateSearchResponse(intent.entities.query, profile);
    case 'education':
      return generateEducationResponse(intent.entities.topic);
    case 'recommendation':
      return generateRecommendationResponse(profile);
    default:
      return {
        message: "Hey! I'm your AI Budtender 🌿\n\nTell me what you're looking for and I'll find the perfect strain. Try:\n\n• 'I want to relax'\n• 'Something for movie night'\n• 'Need help sleeping'\n• 'Best sativa for energy'\n• 'What is a terpene?'\n\nOr just tell me how you want to feel!",
        followUp: [
          "What effects are you looking for?",
          "Planning any activities?",
          "Morning, afternoon, or evening smoke?",
        ],
      };
  }
}
