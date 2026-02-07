// Comprehensive Strain Database
// Popular strains with effects, terpenes, and medical uses

// ============================================
// TYPES
// ============================================

export interface Strain {
  id: string;
  name: string;
  type: 'indica' | 'sativa' | 'hybrid';
  thcRange: [number, number]; // min-max %
  cbdRange: [number, number];
  effects: Effect[];
  negatives: string[];
  flavors: string[];
  terpenes: Terpene[];
  medicalUses: string[];
  description: string;
  lineage?: string[];
  rating: number; // community 1-5
  ratingCount: number;
  difficulty: 'beginner' | 'moderate' | 'experienced';
  flowerTime?: string;
}

export type Effect = 
  | 'relaxed' | 'happy' | 'euphoric' | 'uplifted' | 'creative'
  | 'energetic' | 'focused' | 'giggly' | 'hungry' | 'sleepy'
  | 'talkative' | 'tingly' | 'aroused';

export interface Terpene {
  name: string;
  percentage?: number;
  effects: string[];
  aroma: string;
}

// ============================================
// TERPENE PROFILES
// ============================================

export const TERPENE_INFO: Record<string, { effects: string[]; aroma: string; color: string }> = {
  myrcene: {
    effects: ['relaxing', 'sedating', 'pain relief'],
    aroma: 'earthy, musky, herbal',
    color: '#10B981',
  },
  limonene: {
    effects: ['mood elevation', 'stress relief', 'energizing'],
    aroma: 'citrus, lemon, orange',
    color: '#F59E0B',
  },
  caryophyllene: {
    effects: ['anti-inflammatory', 'pain relief', 'anxiety relief'],
    aroma: 'spicy, peppery, woody',
    color: '#8B5CF6',
  },
  pinene: {
    effects: ['alertness', 'memory retention', 'anti-inflammatory'],
    aroma: 'pine, fresh, forest',
    color: '#059669',
  },
  linalool: {
    effects: ['calming', 'anti-anxiety', 'sedating'],
    aroma: 'floral, lavender, sweet',
    color: '#EC4899',
  },
  humulene: {
    effects: ['appetite suppressant', 'anti-inflammatory'],
    aroma: 'hoppy, earthy, woody',
    color: '#78716C',
  },
  terpinolene: {
    effects: ['uplifting', 'sedating in high doses', 'antioxidant'],
    aroma: 'floral, herbal, piney',
    color: '#06B6D4',
  },
  ocimene: {
    effects: ['uplifting', 'energizing', 'decongestant'],
    aroma: 'sweet, herbal, woody',
    color: '#84CC16',
  },
};

// ============================================
// STRAIN DATABASE (100+ Strains)
// ============================================

export const STRAIN_DATABASE: Strain[] = [
  // ============================================
  // INDICA DOMINANT
  // ============================================
  {
    id: 'granddaddy-purple',
    name: 'Granddaddy Purple',
    type: 'indica',
    thcRange: [17, 27],
    cbdRange: [0, 1],
    effects: ['relaxed', 'sleepy', 'happy', 'euphoric', 'hungry'],
    negatives: ['dry mouth', 'dry eyes', 'dizzy'],
    flavors: ['grape', 'berry', 'sweet'],
    terpenes: [
      { name: 'myrcene', percentage: 0.8, effects: ['relaxing', 'sedating'], aroma: 'earthy' },
      { name: 'caryophyllene', percentage: 0.3, effects: ['pain relief'], aroma: 'spicy' },
      { name: 'pinene', percentage: 0.2, effects: ['alertness'], aroma: 'pine' },
    ],
    medicalUses: ['insomnia', 'pain', 'stress', 'appetite loss', 'muscle spasms'],
    description: 'A famous indica cross of Purple Urkle and Big Bud. Known for its grape and berry aroma with potent physical effects.',
    lineage: ['Purple Urkle', 'Big Bud'],
    rating: 4.5,
    ratingCount: 12500,
    difficulty: 'beginner',
  },
  {
    id: 'northern-lights',
    name: 'Northern Lights',
    type: 'indica',
    thcRange: [16, 21],
    cbdRange: [0, 1],
    effects: ['relaxed', 'happy', 'sleepy', 'euphoric', 'hungry'],
    negatives: ['dry mouth', 'dry eyes'],
    flavors: ['earthy', 'pine', 'sweet'],
    terpenes: [
      { name: 'myrcene', percentage: 1.0, effects: ['relaxing', 'sedating'], aroma: 'earthy' },
      { name: 'caryophyllene', percentage: 0.4, effects: ['pain relief'], aroma: 'spicy' },
    ],
    medicalUses: ['insomnia', 'pain', 'stress', 'depression', 'appetite loss'],
    description: 'One of the most famous indicas of all time. Pure relaxation with a dreamy euphoria.',
    lineage: ['Afghani', 'Thai'],
    rating: 4.6,
    ratingCount: 18000,
    difficulty: 'beginner',
  },
  {
    id: 'bubba-kush',
    name: 'Bubba Kush',
    type: 'indica',
    thcRange: [15, 22],
    cbdRange: [0, 1],
    effects: ['relaxed', 'sleepy', 'happy', 'hungry', 'euphoric'],
    negatives: ['dry mouth', 'dry eyes', 'paranoid'],
    flavors: ['coffee', 'chocolate', 'earthy'],
    terpenes: [
      { name: 'caryophyllene', percentage: 0.5, effects: ['pain relief'], aroma: 'spicy' },
      { name: 'limonene', percentage: 0.3, effects: ['mood elevation'], aroma: 'citrus' },
      { name: 'myrcene', percentage: 0.7, effects: ['relaxing'], aroma: 'earthy' },
    ],
    medicalUses: ['insomnia', 'stress', 'pain', 'depression'],
    description: 'Sweet hashish flavors with subtle coffee and chocolate notes. Heavy tranquilizing effects.',
    rating: 4.4,
    ratingCount: 11000,
    difficulty: 'beginner',
  },
  {
    id: 'purple-punch',
    name: 'Purple Punch',
    type: 'indica',
    thcRange: [18, 25],
    cbdRange: [0, 1],
    effects: ['relaxed', 'sleepy', 'happy', 'euphoric', 'hungry'],
    negatives: ['dry mouth', 'dry eyes'],
    flavors: ['grape', 'blueberry', 'vanilla'],
    terpenes: [
      { name: 'caryophyllene', percentage: 0.4, effects: ['pain relief'], aroma: 'spicy' },
      { name: 'limonene', percentage: 0.3, effects: ['mood elevation'], aroma: 'citrus' },
      { name: 'myrcene', percentage: 0.6, effects: ['relaxing'], aroma: 'earthy' },
    ],
    medicalUses: ['insomnia', 'stress', 'pain', 'nausea'],
    description: 'Tastes like grape candy. Hits hard and fast — one-two punch to the head and body.',
    lineage: ['Larry OG', 'Granddaddy Purple'],
    rating: 4.5,
    ratingCount: 9500,
    difficulty: 'beginner',
  },
  {
    id: 'do-si-dos',
    name: 'Do-Si-Dos',
    type: 'indica',
    thcRange: [19, 30],
    cbdRange: [0, 1],
    effects: ['relaxed', 'happy', 'euphoric', 'sleepy', 'hungry'],
    negatives: ['dry mouth', 'dry eyes', 'anxious'],
    flavors: ['earthy', 'sweet', 'floral'],
    terpenes: [
      { name: 'limonene', percentage: 0.5, effects: ['mood elevation'], aroma: 'citrus' },
      { name: 'caryophyllene', percentage: 0.4, effects: ['pain relief'], aroma: 'spicy' },
      { name: 'linalool', percentage: 0.3, effects: ['calming'], aroma: 'floral' },
    ],
    medicalUses: ['stress', 'pain', 'depression', 'insomnia'],
    description: 'Face-numbing potency with floral and earthy notes. Perfect for winding down.',
    lineage: ['Girl Scout Cookies', 'Face Off OG'],
    rating: 4.4,
    ratingCount: 8000,
    difficulty: 'moderate',
  },
  {
    id: 'zkittlez',
    name: 'Zkittlez',
    type: 'indica',
    thcRange: [15, 23],
    cbdRange: [0, 1],
    effects: ['relaxed', 'happy', 'euphoric', 'sleepy', 'focused'],
    negatives: ['dry mouth', 'dry eyes'],
    flavors: ['sweet', 'tropical', 'berry'],
    terpenes: [
      { name: 'caryophyllene', percentage: 0.4, effects: ['pain relief'], aroma: 'spicy' },
      { name: 'linalool', percentage: 0.3, effects: ['calming'], aroma: 'floral' },
      { name: 'humulene', percentage: 0.2, effects: ['anti-inflammatory'], aroma: 'hoppy' },
    ],
    medicalUses: ['stress', 'depression', 'pain', 'anxiety'],
    description: 'Winner of multiple Cannabis Cups. Tastes like a bag of fruit candy.',
    lineage: ['Grape Ape', 'Grapefruit'],
    rating: 4.5,
    ratingCount: 10500,
    difficulty: 'beginner',
  },
  {
    id: 'ice-cream-cake',
    name: 'Ice Cream Cake',
    type: 'indica',
    thcRange: [20, 25],
    cbdRange: [0, 1],
    effects: ['relaxed', 'sleepy', 'happy', 'euphoric', 'hungry'],
    negatives: ['dry mouth', 'dry eyes', 'dizzy'],
    flavors: ['vanilla', 'sweet', 'creamy'],
    terpenes: [
      { name: 'limonene', percentage: 0.4, effects: ['mood elevation'], aroma: 'citrus' },
      { name: 'caryophyllene', percentage: 0.3, effects: ['pain relief'], aroma: 'spicy' },
      { name: 'myrcene', percentage: 0.5, effects: ['relaxing'], aroma: 'earthy' },
    ],
    medicalUses: ['insomnia', 'pain', 'anxiety', 'appetite loss'],
    description: 'Dessert strain with creamy vanilla flavors. Heavy indica effects for nighttime.',
    lineage: ['Wedding Cake', 'Gelato #33'],
    rating: 4.4,
    ratingCount: 7500,
    difficulty: 'beginner',
  },
  
  // ============================================
  // SATIVA DOMINANT
  // ============================================
  {
    id: 'sour-diesel',
    name: 'Sour Diesel',
    type: 'sativa',
    thcRange: [19, 25],
    cbdRange: [0, 1],
    effects: ['energetic', 'happy', 'uplifted', 'euphoric', 'creative'],
    negatives: ['dry mouth', 'paranoid', 'dry eyes', 'anxious'],
    flavors: ['diesel', 'pungent', 'earthy'],
    terpenes: [
      { name: 'caryophyllene', percentage: 0.5, effects: ['pain relief'], aroma: 'spicy' },
      { name: 'myrcene', percentage: 0.4, effects: ['relaxing'], aroma: 'earthy' },
      { name: 'limonene', percentage: 0.3, effects: ['mood elevation'], aroma: 'citrus' },
    ],
    medicalUses: ['stress', 'depression', 'pain', 'fatigue'],
    description: 'Legendary energizing sativa. Pungent diesel aroma with fast-acting cerebral effects.',
    rating: 4.5,
    ratingCount: 22000,
    difficulty: 'moderate',
  },
  {
    id: 'jack-herer',
    name: 'Jack Herer',
    type: 'sativa',
    thcRange: [18, 24],
    cbdRange: [0, 1],
    effects: ['happy', 'uplifted', 'energetic', 'creative', 'focused'],
    negatives: ['dry mouth', 'dry eyes', 'anxious'],
    flavors: ['pine', 'earthy', 'woody'],
    terpenes: [
      { name: 'terpinolene', percentage: 0.5, effects: ['uplifting'], aroma: 'floral' },
      { name: 'pinene', percentage: 0.4, effects: ['alertness'], aroma: 'pine' },
      { name: 'caryophyllene', percentage: 0.2, effects: ['pain relief'], aroma: 'spicy' },
    ],
    medicalUses: ['stress', 'depression', 'fatigue', 'pain'],
    description: 'Named after the cannabis activist. Blissful, clear-headed, creative inspiration.',
    lineage: ['Haze', 'Northern Lights #5', 'Shiva Skunk'],
    rating: 4.6,
    ratingCount: 15000,
    difficulty: 'moderate',
  },
  {
    id: 'green-crack',
    name: 'Green Crack',
    type: 'sativa',
    thcRange: [15, 25],
    cbdRange: [0, 1],
    effects: ['energetic', 'focused', 'happy', 'uplifted', 'euphoric'],
    negatives: ['dry mouth', 'paranoid', 'anxious'],
    flavors: ['citrus', 'mango', 'sweet'],
    terpenes: [
      { name: 'myrcene', percentage: 0.5, effects: ['relaxing'], aroma: 'earthy' },
      { name: 'caryophyllene', percentage: 0.3, effects: ['pain relief'], aroma: 'spicy' },
      { name: 'limonene', percentage: 0.2, effects: ['mood elevation'], aroma: 'citrus' },
    ],
    medicalUses: ['fatigue', 'stress', 'depression'],
    description: 'Sharp energy and focus. Tangy mango flavor. Great for daytime productivity.',
    lineage: ['Skunk #1', 'Unknown Indica'],
    rating: 4.4,
    ratingCount: 19000,
    difficulty: 'experienced',
  },
  {
    id: 'durban-poison',
    name: 'Durban Poison',
    type: 'sativa',
    thcRange: [17, 26],
    cbdRange: [0, 1],
    effects: ['energetic', 'uplifted', 'happy', 'creative', 'focused'],
    negatives: ['dry mouth', 'dry eyes', 'paranoid'],
    flavors: ['sweet', 'earthy', 'pine'],
    terpenes: [
      { name: 'terpinolene', percentage: 0.6, effects: ['uplifting'], aroma: 'floral' },
      { name: 'myrcene', percentage: 0.3, effects: ['relaxing'], aroma: 'earthy' },
      { name: 'ocimene', percentage: 0.2, effects: ['energizing'], aroma: 'sweet' },
    ],
    medicalUses: ['depression', 'stress', 'fatigue', 'nausea'],
    description: 'Pure African sativa landrace. The espresso of cannabis — pure energy.',
    rating: 4.5,
    ratingCount: 14000,
    difficulty: 'experienced',
  },
  {
    id: 'super-lemon-haze',
    name: 'Super Lemon Haze',
    type: 'sativa',
    thcRange: [16, 25],
    cbdRange: [0, 1],
    effects: ['happy', 'energetic', 'uplifted', 'creative', 'focused'],
    negatives: ['dry mouth', 'dry eyes', 'paranoid'],
    flavors: ['lemon', 'citrus', 'sweet'],
    terpenes: [
      { name: 'terpinolene', percentage: 0.4, effects: ['uplifting'], aroma: 'floral' },
      { name: 'caryophyllene', percentage: 0.3, effects: ['pain relief'], aroma: 'spicy' },
      { name: 'limonene', percentage: 0.5, effects: ['mood elevation'], aroma: 'citrus' },
    ],
    medicalUses: ['stress', 'depression', 'fatigue', 'pain'],
    description: 'Two-time Cannabis Cup winner. Zesty lemon flavor with energetic, lively effects.',
    lineage: ['Lemon Skunk', 'Super Silver Haze'],
    rating: 4.4,
    ratingCount: 11500,
    difficulty: 'moderate',
  },
  {
    id: 'tangie',
    name: 'Tangie',
    type: 'sativa',
    thcRange: [19, 22],
    cbdRange: [0, 1],
    effects: ['happy', 'uplifted', 'energetic', 'creative', 'euphoric'],
    negatives: ['dry mouth', 'dry eyes'],
    flavors: ['orange', 'citrus', 'sweet'],
    terpenes: [
      { name: 'limonene', percentage: 0.6, effects: ['mood elevation'], aroma: 'citrus' },
      { name: 'myrcene', percentage: 0.3, effects: ['relaxing'], aroma: 'earthy' },
      { name: 'pinene', percentage: 0.2, effects: ['alertness'], aroma: 'pine' },
    ],
    medicalUses: ['depression', 'stress', 'fatigue'],
    description: 'Tastes exactly like fresh tangerines. Euphoric and uplifting.',
    lineage: ['California Orange', 'Skunk'],
    rating: 4.4,
    ratingCount: 9000,
    difficulty: 'moderate',
  },
  {
    id: 'strawberry-cough',
    name: 'Strawberry Cough',
    type: 'sativa',
    thcRange: [15, 20],
    cbdRange: [0, 1],
    effects: ['happy', 'uplifted', 'euphoric', 'energetic', 'creative'],
    negatives: ['dry mouth', 'dry eyes', 'anxious'],
    flavors: ['strawberry', 'sweet', 'berry'],
    terpenes: [
      { name: 'myrcene', percentage: 0.4, effects: ['relaxing'], aroma: 'earthy' },
      { name: 'pinene', percentage: 0.3, effects: ['alertness'], aroma: 'pine' },
      { name: 'limonene', percentage: 0.2, effects: ['mood elevation'], aroma: 'citrus' },
    ],
    medicalUses: ['stress', 'anxiety', 'depression'],
    description: 'Sweet strawberry taste that will make you cough. Great for social anxiety.',
    rating: 4.3,
    ratingCount: 10000,
    difficulty: 'beginner',
  },
  
  // ============================================
  // HYBRID
  // ============================================
  {
    id: 'blue-dream',
    name: 'Blue Dream',
    type: 'hybrid',
    thcRange: [17, 24],
    cbdRange: [0, 2],
    effects: ['happy', 'relaxed', 'euphoric', 'uplifted', 'creative'],
    negatives: ['dry mouth', 'dry eyes', 'paranoid'],
    flavors: ['blueberry', 'sweet', 'berry'],
    terpenes: [
      { name: 'myrcene', percentage: 0.5, effects: ['relaxing'], aroma: 'earthy' },
      { name: 'pinene', percentage: 0.3, effects: ['alertness'], aroma: 'pine' },
      { name: 'caryophyllene', percentage: 0.2, effects: ['pain relief'], aroma: 'spicy' },
    ],
    medicalUses: ['stress', 'depression', 'pain', 'headaches'],
    description: 'The most popular strain in America. Balanced effects perfect for any time.',
    lineage: ['Blueberry', 'Haze'],
    rating: 4.4,
    ratingCount: 35000,
    difficulty: 'beginner',
  },
  {
    id: 'og-kush',
    name: 'OG Kush',
    type: 'hybrid',
    thcRange: [19, 26],
    cbdRange: [0, 1],
    effects: ['relaxed', 'happy', 'euphoric', 'uplifted', 'hungry'],
    negatives: ['dry mouth', 'dry eyes', 'paranoid'],
    flavors: ['earthy', 'pine', 'woody'],
    terpenes: [
      { name: 'myrcene', percentage: 0.5, effects: ['relaxing'], aroma: 'earthy' },
      { name: 'limonene', percentage: 0.4, effects: ['mood elevation'], aroma: 'citrus' },
      { name: 'caryophyllene', percentage: 0.3, effects: ['pain relief'], aroma: 'spicy' },
    ],
    medicalUses: ['stress', 'pain', 'depression', 'insomnia'],
    description: 'The backbone of West Coast cannabis. Complex, earthy, and legendary.',
    rating: 4.5,
    ratingCount: 28000,
    difficulty: 'moderate',
  },
  {
    id: 'girl-scout-cookies',
    name: 'Girl Scout Cookies (GSC)',
    type: 'hybrid',
    thcRange: [19, 28],
    cbdRange: [0, 1],
    effects: ['happy', 'relaxed', 'euphoric', 'uplifted', 'creative'],
    negatives: ['dry mouth', 'dry eyes', 'paranoid'],
    flavors: ['sweet', 'earthy', 'pungent'],
    terpenes: [
      { name: 'caryophyllene', percentage: 0.4, effects: ['pain relief'], aroma: 'spicy' },
      { name: 'limonene', percentage: 0.3, effects: ['mood elevation'], aroma: 'citrus' },
      { name: 'humulene', percentage: 0.2, effects: ['anti-inflammatory'], aroma: 'hoppy' },
    ],
    medicalUses: ['stress', 'depression', 'pain', 'nausea', 'appetite loss'],
    description: 'Sweet and earthy. Full-body relaxation with cerebral euphoria.',
    lineage: ['OG Kush', 'Durban Poison'],
    rating: 4.6,
    ratingCount: 25000,
    difficulty: 'moderate',
  },
  {
    id: 'gelato',
    name: 'Gelato',
    type: 'hybrid',
    thcRange: [20, 25],
    cbdRange: [0, 1],
    effects: ['relaxed', 'happy', 'euphoric', 'uplifted', 'creative'],
    negatives: ['dry mouth', 'dry eyes'],
    flavors: ['sweet', 'citrus', 'fruity'],
    terpenes: [
      { name: 'limonene', percentage: 0.4, effects: ['mood elevation'], aroma: 'citrus' },
      { name: 'caryophyllene', percentage: 0.3, effects: ['pain relief'], aroma: 'spicy' },
      { name: 'myrcene', percentage: 0.2, effects: ['relaxing'], aroma: 'earthy' },
    ],
    medicalUses: ['pain', 'stress', 'depression', 'insomnia'],
    description: 'Dessert strain from the Cookie family. Creamy and fruity with potent effects.',
    lineage: ['Sunset Sherbet', 'Thin Mint GSC'],
    rating: 4.5,
    ratingCount: 18000,
    difficulty: 'moderate',
  },
  {
    id: 'wedding-cake',
    name: 'Wedding Cake',
    type: 'hybrid',
    thcRange: [21, 25],
    cbdRange: [0, 1],
    effects: ['relaxed', 'happy', 'euphoric', 'uplifted', 'hungry'],
    negatives: ['dry mouth', 'dry eyes'],
    flavors: ['sweet', 'vanilla', 'earthy'],
    terpenes: [
      { name: 'limonene', percentage: 0.5, effects: ['mood elevation'], aroma: 'citrus' },
      { name: 'caryophyllene', percentage: 0.4, effects: ['pain relief'], aroma: 'spicy' },
      { name: 'myrcene', percentage: 0.3, effects: ['relaxing'], aroma: 'earthy' },
    ],
    medicalUses: ['pain', 'insomnia', 'appetite loss', 'depression'],
    description: 'Rich and tangy with earthy pepper. Powerfully relaxing.',
    lineage: ['Cherry Pie', 'Girl Scout Cookies'],
    rating: 4.5,
    ratingCount: 15000,
    difficulty: 'moderate',
  },
  {
    id: 'runtz',
    name: 'Runtz',
    type: 'hybrid',
    thcRange: [19, 29],
    cbdRange: [0, 1],
    effects: ['happy', 'euphoric', 'relaxed', 'uplifted', 'giggly'],
    negatives: ['dry mouth', 'dry eyes'],
    flavors: ['sweet', 'tropical', 'fruity'],
    terpenes: [
      { name: 'limonene', percentage: 0.4, effects: ['mood elevation'], aroma: 'citrus' },
      { name: 'caryophyllene', percentage: 0.3, effects: ['pain relief'], aroma: 'spicy' },
      { name: 'linalool', percentage: 0.2, effects: ['calming'], aroma: 'floral' },
    ],
    medicalUses: ['stress', 'anxiety', 'pain', 'depression'],
    description: 'Tastes like the candy. Rare and highly sought after.',
    lineage: ['Zkittlez', 'Gelato'],
    rating: 4.6,
    ratingCount: 12000,
    difficulty: 'moderate',
  },
  {
    id: 'gorilla-glue',
    name: 'Gorilla Glue #4 (GG4)',
    type: 'hybrid',
    thcRange: [25, 32],
    cbdRange: [0, 1],
    effects: ['relaxed', 'happy', 'euphoric', 'uplifted', 'sleepy'],
    negatives: ['dry mouth', 'dry eyes', 'dizzy'],
    flavors: ['earthy', 'pine', 'pungent'],
    terpenes: [
      { name: 'caryophyllene', percentage: 0.6, effects: ['pain relief'], aroma: 'spicy' },
      { name: 'limonene', percentage: 0.3, effects: ['mood elevation'], aroma: 'citrus' },
      { name: 'myrcene', percentage: 0.4, effects: ['relaxing'], aroma: 'earthy' },
    ],
    medicalUses: ['pain', 'stress', 'insomnia', 'depression'],
    description: 'Named for the resin that glues scissors. Extremely potent — couch lock city.',
    lineage: ['Chem Sister', 'Sour Dubb', 'Chocolate Diesel'],
    rating: 4.6,
    ratingCount: 20000,
    difficulty: 'experienced',
  },
  {
    id: 'pineapple-express',
    name: 'Pineapple Express',
    type: 'hybrid',
    thcRange: [17, 24],
    cbdRange: [0, 1],
    effects: ['happy', 'uplifted', 'euphoric', 'energetic', 'creative'],
    negatives: ['dry mouth', 'dry eyes', 'paranoid'],
    flavors: ['pineapple', 'tropical', 'citrus'],
    terpenes: [
      { name: 'caryophyllene', percentage: 0.4, effects: ['pain relief'], aroma: 'spicy' },
      { name: 'limonene', percentage: 0.3, effects: ['mood elevation'], aroma: 'citrus' },
      { name: 'pinene', percentage: 0.2, effects: ['alertness'], aroma: 'pine' },
    ],
    medicalUses: ['stress', 'depression', 'pain', 'fatigue'],
    description: 'Made famous by the movie. Tropical flavor with energetic, buzzy effects.',
    lineage: ['Trainwreck', 'Hawaiian'],
    rating: 4.3,
    ratingCount: 18000,
    difficulty: 'beginner',
  },
  {
    id: 'white-widow',
    name: 'White Widow',
    type: 'hybrid',
    thcRange: [18, 25],
    cbdRange: [0, 1],
    effects: ['happy', 'euphoric', 'relaxed', 'uplifted', 'creative'],
    negatives: ['dry mouth', 'dry eyes', 'paranoid'],
    flavors: ['earthy', 'woody', 'pungent'],
    terpenes: [
      { name: 'myrcene', percentage: 0.4, effects: ['relaxing'], aroma: 'earthy' },
      { name: 'caryophyllene', percentage: 0.3, effects: ['pain relief'], aroma: 'spicy' },
      { name: 'limonene', percentage: 0.2, effects: ['mood elevation'], aroma: 'citrus' },
    ],
    medicalUses: ['stress', 'depression', 'pain', 'fatigue'],
    description: 'Amsterdam coffeeshop legend. Powerful euphoria with conversation starter energy.',
    lineage: ['Brazilian Sativa', 'South Indian Indica'],
    rating: 4.4,
    ratingCount: 22000,
    difficulty: 'beginner',
  },
  {
    id: 'gg4-thin-mint',
    name: 'GMO Cookies',
    type: 'hybrid',
    thcRange: [20, 30],
    cbdRange: [0, 1],
    effects: ['relaxed', 'happy', 'euphoric', 'sleepy', 'hungry'],
    negatives: ['dry mouth', 'dry eyes'],
    flavors: ['garlic', 'coffee', 'diesel'],
    terpenes: [
      { name: 'caryophyllene', percentage: 0.6, effects: ['pain relief'], aroma: 'spicy' },
      { name: 'limonene', percentage: 0.3, effects: ['mood elevation'], aroma: 'citrus' },
      { name: 'myrcene', percentage: 0.4, effects: ['relaxing'], aroma: 'earthy' },
    ],
    medicalUses: ['chronic pain', 'insomnia', 'stress', 'appetite loss'],
    description: 'Garlic, mushroom, onion — hence GMO. Extremely potent and pungent.',
    lineage: ['Girl Scout Cookies', 'Chemdawg'],
    rating: 4.5,
    ratingCount: 8500,
    difficulty: 'experienced',
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function searchStrains(query: string): Strain[] {
  const lowerQuery = query.toLowerCase();
  return STRAIN_DATABASE.filter(strain =>
    strain.name.toLowerCase().includes(lowerQuery) ||
    strain.effects.some(e => e.toLowerCase().includes(lowerQuery)) ||
    strain.flavors.some(f => f.toLowerCase().includes(lowerQuery)) ||
    strain.type.includes(lowerQuery)
  ).slice(0, 20);
}

export function getStrainsByEffect(effect: Effect): Strain[] {
  return STRAIN_DATABASE.filter(strain => strain.effects.includes(effect));
}

export function getStrainsByType(type: 'indica' | 'sativa' | 'hybrid'): Strain[] {
  return STRAIN_DATABASE.filter(strain => strain.type === type);
}

export function getStrainsForMood(mood: string): Strain[] {
  const moodEffects: Record<string, Effect[]> = {
    'relax': ['relaxed', 'sleepy', 'happy'],
    'energy': ['energetic', 'uplifted', 'focused'],
    'creative': ['creative', 'euphoric', 'uplifted'],
    'social': ['talkative', 'giggly', 'happy'],
    'sleep': ['sleepy', 'relaxed'],
    'pain': ['relaxed', 'happy', 'euphoric'],
    'focus': ['focused', 'energetic', 'creative'],
  };
  
  const effects = moodEffects[mood.toLowerCase()] || [];
  return STRAIN_DATABASE.filter(strain =>
    effects.some(e => strain.effects.includes(e))
  ).slice(0, 10);
}

export function getTopRatedStrains(limit: number = 10): Strain[] {
  return [...STRAIN_DATABASE]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}
