// AI Service for Weed Sommelier
// Dual provider support (OpenAI + Anthropic) with automatic failover
// Smart model selection based on task complexity

import Constants from 'expo-constants';

// ============================================
// CONFIGURATION
// ============================================

type Provider = 'openai' | 'anthropic';
type ModelTier = 'fast' | 'standard' | 'powerful';

interface ProviderConfig {
  apiKey: string;
  models: Record<ModelTier, string>;
}

interface AIConfig {
  primaryProvider: Provider;
  providers: Record<Provider, ProviderConfig>;
}

// Runtime API key storage
let runtimeKeys: { openai?: string; anthropic?: string } = {};

export const setAPIKey = (provider: Provider, key: string) => {
  runtimeKeys[provider] = key;
};

export const hasAPIKey = (provider?: Provider): boolean => {
  const config = getConfig();
  if (provider) {
    return !!config.providers[provider].apiKey;
  }
  return !!config.providers.openai.apiKey || !!config.providers.anthropic.apiKey;
};

const getConfig = (): AIConfig => {
  const openaiKey = runtimeKeys.openai || 
    Constants.expoConfig?.extra?.openaiApiKey || 
    process.env.OPENAI_API_KEY || '';
  const anthropicKey = runtimeKeys.anthropic || 
    Constants.expoConfig?.extra?.anthropicApiKey || 
    process.env.ANTHROPIC_API_KEY || '';
  
  const primaryProvider: Provider = anthropicKey ? 'anthropic' : 'openai';

  return {
    primaryProvider,
    providers: {
      openai: {
        apiKey: openaiKey,
        models: {
          fast: 'gpt-4o-mini',
          standard: 'gpt-4o',
          powerful: 'gpt-4o',
        },
      },
      anthropic: {
        apiKey: anthropicKey,
        models: {
          fast: 'claude-3-5-haiku-20241022',
          standard: 'claude-sonnet-4-20250514',
          powerful: 'claude-sonnet-4-20250514',
        },
      },
    },
  };
};

const getAvailableProviders = (): Provider[] => {
  const config = getConfig();
  const available: Provider[] = [];
  if (config.providers.anthropic.apiKey) available.push('anthropic');
  if (config.providers.openai.apiKey) available.push('openai');
  
  if (available.length > 1 && available[0] !== config.primaryProvider) {
    return [config.primaryProvider, ...available.filter(p => p !== config.primaryProvider)];
  }
  return available;
};

// ============================================
// SYSTEM PROMPTS
// ============================================

const BUDTENDER_SYSTEM_PROMPT = `You are an expert AI Cannabis Sommelier (Budtender) — knowledgeable, friendly, and never preachy.

## Your Expertise
- Cannabis strains: Indica, Sativa, Hybrids — effects, lineages, and what makes each unique
- Terpene profiles: Myrcene (couch-lock), Limonene (uplifting), Pinene (focused), Caryophyllene (anti-inflammatory), Linalool (calming)
- Cannabinoids: THC, CBD, CBG, CBN, and how ratios affect experience
- Consumption methods: Flower, edibles, vapes, concentrates — pros/cons of each
- Medical applications: Pain, anxiety, sleep, appetite, creativity
- Harm reduction: Responsible use, tolerance, avoiding overconsumption

## Personality
- Friendly and chill, like a knowledgeable friend at a dispensary
- Non-judgmental about experience level or reasons for use
- Explains science simply without being condescending
- Uses emojis sparingly (🌿 occasionally)
- Honest about effects including potential downsides

## Key Knowledge
- THC levels: 10-15% mild, 15-22% moderate, 22%+ potent, 30%+ very strong
- Indica: Body high, relaxing, "in-da-couch" — evening/night
- Sativa: Head high, energizing, creative — daytime
- Hybrid: Best of both, balanced or leaning one way
- CBD can reduce THC-induced anxiety
- Start low, go slow — especially with edibles (wait 2 hours!)

## Rules
1. Give specific strain recommendations with reasoning
2. Consider user's experience level, desired effects, and concerns
3. Mention onset time and duration for different methods
4. Include harm reduction tips naturally
5. Never recommend for minors or illegal activity`;

const ANALYSIS_SYSTEM_PROMPT = `You are a cannabis strain analyst. Provide detailed, accurate information about strains based on their genetics, terpene profile, and reported effects. Always respond in valid JSON format.`;

const PAIRING_SYSTEM_PROMPT = `You are a cannabis experience designer. Match strains to activities, moods, and occasions based on their effects profile. Be specific about why certain strains enhance certain experiences.`;

// ============================================
// API CALLS
// ============================================

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  content: string;
  provider: Provider;
  model: string;
  error?: string;
}

const callOpenAI = async (
  config: ProviderConfig,
  systemPrompt: string,
  messages: Message[],
  model: string,
  maxTokens: number,
  temperature: number
): Promise<AIResponse> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    provider: 'openai',
    model,
  };
};

const callAnthropic = async (
  config: ProviderConfig,
  systemPrompt: string,
  messages: Message[],
  model: string,
  maxTokens: number,
  temperature: number
): Promise<AIResponse> => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Anthropic error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    provider: 'anthropic',
    model,
  };
};

const callWithFailover = async (
  systemPrompt: string,
  messages: Message[],
  tier: ModelTier = 'standard',
  maxTokens: number = 600,
  temperature: number = 0.7
): Promise<AIResponse> => {
  const config = getConfig();
  const providers = getAvailableProviders();
  
  if (providers.length === 0) {
    return {
      content: '',
      provider: 'openai',
      model: '',
      error: 'No API keys configured',
    };
  }

  let lastError: Error | null = null;

  for (const provider of providers) {
    const providerConfig = config.providers[provider];
    const model = providerConfig.models[tier];

    try {
      if (provider === 'openai') {
        return await callOpenAI(providerConfig, systemPrompt, messages, model, maxTokens, temperature);
      } else {
        return await callAnthropic(providerConfig, systemPrompt, messages, model, maxTokens, temperature);
      }
    } catch (error) {
      console.warn(`${provider} failed, trying next...`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  return {
    content: '',
    provider: providers[0],
    model: '',
    error: lastError?.message || 'All providers failed',
  };
};

// ============================================
// PUBLIC API: CHAT
// ============================================

export interface ChatContext {
  favoriteStrains?: string[];
  preferredEffects?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'experienced';
  medicalNeeds?: string[];
  tolerance?: 'low' | 'medium' | 'high';
  avoidEffects?: string[];
}

export interface ChatResponse {
  success: boolean;
  message: string;
  provider?: Provider;
  error?: string;
}

export const chat = async (
  userMessage: string,
  conversationHistory: Message[] = [],
  context?: ChatContext
): Promise<ChatResponse> => {
  let contextStr = '';
  if (context) {
    const parts: string[] = [];
    if (context.favoriteStrains?.length) {
      parts.push(`Favorite strains: ${context.favoriteStrains.join(', ')}`);
    }
    if (context.preferredEffects?.length) {
      parts.push(`Looking for: ${context.preferredEffects.join(', ')}`);
    }
    if (context.experienceLevel) {
      parts.push(`Experience: ${context.experienceLevel}`);
    }
    if (context.medicalNeeds?.length) {
      parts.push(`Medical needs: ${context.medicalNeeds.join(', ')}`);
    }
    if (context.tolerance) {
      parts.push(`Tolerance: ${context.tolerance}`);
    }
    if (context.avoidEffects?.length) {
      parts.push(`Wants to avoid: ${context.avoidEffects.join(', ')}`);
    }
    if (parts.length) {
      contextStr = `\n\n## User Profile\n${parts.join('\n')}`;
    }
  }

  const systemPrompt = BUDTENDER_SYSTEM_PROMPT + contextStr;
  const messages: Message[] = [
    ...conversationHistory.slice(-10),
    { role: 'user', content: userMessage },
  ];

  const response = await callWithFailover(systemPrompt, messages, 'standard', 800, 0.8);

  if (response.error) {
    return {
      success: true,
      message: getLocalChatResponse(userMessage),
    };
  }

  return {
    success: true,
    message: response.content,
    provider: response.provider,
  };
};

// ============================================
// PUBLIC API: RECOMMENDATIONS
// ============================================

export interface RecommendationParams {
  mood?: string;
  activity?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  desiredEffects?: string[];
  avoidEffects?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'experienced';
  medicalNeeds?: string[];
  method?: 'flower' | 'edible' | 'vape' | 'concentrate' | 'any';
}

export interface StrainRecommendation {
  name: string;
  type: 'Indica' | 'Sativa' | 'Hybrid';
  thcRange: string;
  effects: string[];
  reason: string;
  terpenes?: string[];
  matchScore: number;
}

export interface RecommendationResponse {
  success: boolean;
  recommendations: StrainRecommendation[];
  intro?: string;
  tips?: string;
  error?: string;
}

export const getRecommendations = async (
  params: RecommendationParams
): Promise<RecommendationResponse> => {
  const prompt = buildRecommendationPrompt(params);

  const response = await callWithFailover(
    BUDTENDER_SYSTEM_PROMPT,
    [{ role: 'user', content: prompt }],
    'standard',
    800,
    0.7
  );

  if (response.error) {
    return {
      success: true,
      recommendations: getLocalRecommendations(params),
    };
  }

  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        recommendations: parsed.recommendations || parsed.strains || [],
        intro: parsed.intro,
        tips: parsed.tips,
      };
    }
  } catch (e) {
    return {
      success: true,
      recommendations: getLocalRecommendations(params),
      intro: response.content.slice(0, 200),
    };
  }

  return {
    success: true,
    recommendations: getLocalRecommendations(params),
  };
};

const buildRecommendationPrompt = (params: RecommendationParams): string => {
  const conditions: string[] = [];
  
  if (params.mood) conditions.push(`Mood: ${params.mood}`);
  if (params.activity) conditions.push(`Activity: ${params.activity}`);
  if (params.timeOfDay) conditions.push(`Time: ${params.timeOfDay}`);
  if (params.desiredEffects?.length) conditions.push(`Looking for: ${params.desiredEffects.join(', ')}`);
  if (params.avoidEffects?.length) conditions.push(`Avoid: ${params.avoidEffects.join(', ')}`);
  if (params.experienceLevel) conditions.push(`Experience: ${params.experienceLevel}`);
  if (params.medicalNeeds?.length) conditions.push(`Medical needs: ${params.medicalNeeds.join(', ')}`);
  if (params.method && params.method !== 'any') conditions.push(`Method: ${params.method}`);

  return `Recommend 3 cannabis strains for:
${conditions.join('\n')}

Respond in JSON:
{
  "intro": "Brief friendly intro (1-2 sentences)",
  "recommendations": [
    {
      "name": "Strain Name",
      "type": "Indica|Sativa|Hybrid",
      "thcRange": "15-20%",
      "effects": ["effect1", "effect2", "effect3"],
      "terpenes": ["terpene1", "terpene2"],
      "reason": "Why this fits (2 sentences)",
      "matchScore": 92
    }
  ],
  "tips": "One harm reduction or consumption tip"
}`;
};

// ============================================
// PUBLIC API: STRAIN ANALYSIS
// ============================================

export interface StrainAnalysis {
  effects: {
    physical: string[];
    mental: string[];
    emotional: string[];
  };
  bestFor: string[];
  medicalBenefits: string[];
  sideEffects: string[];
  consumptionTips: string;
  similarStrains: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'experienced';
  duration: string;
  onset: string;
}

export const analyzeStrain = async (
  strainName: string,
  type: 'Indica' | 'Sativa' | 'Hybrid',
  thc?: number,
  cbd?: number,
  terpenes?: string[]
): Promise<StrainAnalysis> => {
  const prompt = `Analyze this cannabis strain:
- Name: ${strainName}
- Type: ${type}
- THC: ${thc ? thc + '%' : 'Unknown'}
- CBD: ${cbd ? cbd + '%' : 'Unknown'}
- Terpenes: ${terpenes?.join(', ') || 'Unknown'}

Respond in JSON:
{
  "effects": {
    "physical": ["effect1", "effect2"],
    "mental": ["effect1", "effect2"],
    "emotional": ["effect1", "effect2"]
  },
  "bestFor": ["activity1", "activity2"],
  "medicalBenefits": ["benefit1", "benefit2"],
  "sideEffects": ["dry mouth", "etc"],
  "consumptionTips": "Best way to consume this strain",
  "similarStrains": ["Strain1", "Strain2"],
  "experienceLevel": "beginner|intermediate|experienced",
  "duration": "2-4 hours",
  "onset": "5-15 minutes for flower"
}`;

  const response = await callWithFailover(
    ANALYSIS_SYSTEM_PROMPT,
    [{ role: 'user', content: prompt }],
    'fast',
    500,
    0.5
  );

  if (response.error) {
    return getLocalAnalysis(type);
  }

  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse strain analysis:', e);
  }

  return getLocalAnalysis(type);
};

// ============================================
// PUBLIC API: ACTIVITY PAIRING
// ============================================

export interface ActivityPairingResponse {
  intro: string;
  pairings: {
    strain: string;
    type: 'Indica' | 'Sativa' | 'Hybrid';
    why: string;
    confidence: 'perfect' | 'great' | 'good';
  }[];
  tips?: string;
}

export const getActivityPairing = async (activity: string): Promise<ActivityPairingResponse> => {
  const prompt = `What cannabis strains pair best with: ${activity}

Consider:
- How the activity benefits from certain effects
- Timing and duration of the high
- Safety considerations

Respond in JSON:
{
  "intro": "Brief explanation of what effects enhance this activity",
  "pairings": [
    {"strain": "Strain Name", "type": "Indica|Sativa|Hybrid", "why": "Why it works", "confidence": "perfect|great|good"}
  ],
  "tips": "One tip for this activity + cannabis combo"
}`;

  const response = await callWithFailover(
    PAIRING_SYSTEM_PROMPT,
    [{ role: 'user', content: prompt }],
    'fast',
    500,
    0.6
  );

  if (response.error) {
    return getLocalActivityPairing(activity);
  }

  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse pairing:', e);
  }

  return getLocalActivityPairing(activity);
};

// ============================================
// LOCAL FALLBACKS
// ============================================

const getLocalChatResponse = (message: string): string => {
  const q = message.toLowerCase();

  if (q.includes('sleep') || q.includes('insomnia')) {
    return `🌿 **Best Strains for Sleep**

For catching those Z's, you want heavy indicas with sedating terpenes:

**Top Picks:**
• **Granddaddy Purple** — Grape goodness, melts into the couch
• **Northern Lights** — Classic sleepy strain, dreamy
• **Bubba Kush** — Heavy, tranquil, lights out

**Tips:**
• Take it 1-2 hours before bed
• Start low — being too high can keep you up
• Consider a CBD:THC combo for less grogginess

Sweet dreams! 💤`;
  }

  if (q.includes('anxiety') || q.includes('stress') || q.includes('relax')) {
    return `🌿 **Strains for Anxiety & Stress**

You want something calming but not paranoia-inducing:

**Gentle Options:**
• **ACDC** — High CBD, almost no high, just calm
• **Harlequin** — CBD/THC balanced, clear-headed
• **Cannatonic** — Mellow, functional, stress-free

**Stronger (but still chill):**
• **Blue Dream** — Balanced, euphoric, not racy
• **Girl Scout Cookies** — Happy and relaxed

**Pro tip:** Strains high in Linalool and Myrcene tend to be most calming. Avoid pure sativas if you're anxiety-prone!`;
  }

  if (q.includes('energy') || q.includes('focus') || q.includes('creative') || q.includes('productive')) {
    return `🌿 **Energizing & Creative Strains**

Wake and bake responsibly with these:

**Get Stuff Done:**
• **Green Crack** — Don't let the name scare you, pure energy
• **Durban Poison** — African sativa, clear and focused
• **Jack Herer** — Creative classic, cerebral buzz

**Balanced Energy:**
• **Super Lemon Haze** — Citrus burst, happy and uplifted
• **Sour Diesel** — Dreamy yet energetic, great for brainstorming

**Tip:** Start with a small dose — too much sativa can actually scatter your focus. Microdosing works great for productivity!`;
  }

  if (q.includes('pain') || q.includes('medical') || q.includes('chronic')) {
    return `🌿 **Pain Relief Strains**

For physical relief, you want high THC + specific terpenes:

**Heavy Hitters:**
• **OG Kush** — Full body relief, potent
• **Gorilla Glue #4** — Locks you down, serious medicine
• **Blue Dream** — Good balance of relief + function

**High CBD Options:**
• **Charlotte's Web** — Non-psychoactive, medical-grade
• **ACDC** — Pain relief without impairment

**Method matters:** Edibles last longer for chronic pain (4-8 hrs). Vapes hit faster for acute pain. Topicals for localized issues.`;
  }

  if (q.includes('munchies') || q.includes('appetite')) {
    return `🌿 **Appetite-Stimulating Strains**

The classic side effect, weaponized:

**Hunger Inducers:**
• **Royal Cookies** — Cookie monster mode activated
• **Candyland** — Sweet, happy, snacky
• **Pineapple Express** — Tropical munchies, fun vibes

**Pro tip:** These strains are actually medical-grade for people with appetite loss from chemo, HIV, or eating disorders. The munchies can be medicine! 🍪`;
  }

  return `🌿 **Your AI Budtender Here!**

I can help you find the perfect strain for any situation:

**Ask me about:**
• "What's good for sleep?"
• "Something for creativity"
• "Help with anxiety"
• "Best strain for movie night"
• "High CBD, low THC options"

**Or tell me:**
• Your mood and what you're doing
• Any effects you want to avoid
• Your experience level

What are you looking for today? ✨`;
};

const getLocalRecommendations = (params: RecommendationParams): StrainRecommendation[] => {
  if (params.activity?.toLowerCase().includes('sleep') || params.mood?.toLowerCase().includes('sleep')) {
    return [
      { name: 'Granddaddy Purple', type: 'Indica', thcRange: '17-24%', effects: ['Relaxed', 'Sleepy', 'Happy'], reason: 'Heavy indica with grape terpenes that melt you into bed', terpenes: ['Myrcene', 'Caryophyllene'], matchScore: 95 },
      { name: 'Northern Lights', type: 'Indica', thcRange: '16-21%', effects: ['Sleepy', 'Relaxed', 'Euphoric'], reason: 'Classic sleep strain, dreamy and peaceful', terpenes: ['Myrcene', 'Pinene'], matchScore: 92 },
      { name: 'Bubba Kush', type: 'Indica', thcRange: '15-22%', effects: ['Relaxed', 'Sleepy', 'Happy'], reason: 'Heavy tranquil body high, lights out', terpenes: ['Caryophyllene', 'Limonene'], matchScore: 88 },
    ];
  }

  // Default: balanced recommendations
  return [
    { name: 'Blue Dream', type: 'Hybrid', thcRange: '17-24%', effects: ['Happy', 'Relaxed', 'Creative'], reason: 'America\'s favorite strain — balanced, versatile, crowd-pleaser', terpenes: ['Myrcene', 'Pinene'], matchScore: 90 },
    { name: 'Girl Scout Cookies', type: 'Hybrid', thcRange: '19-28%', effects: ['Euphoric', 'Relaxed', 'Happy'], reason: 'Sweet and powerful, great for any occasion', terpenes: ['Caryophyllene', 'Limonene'], matchScore: 88 },
    { name: 'OG Kush', type: 'Hybrid', thcRange: '18-26%', effects: ['Relaxed', 'Happy', 'Euphoric'], reason: 'West Coast legend, earthy and potent', terpenes: ['Myrcene', 'Limonene'], matchScore: 85 },
  ];
};

const getLocalAnalysis = (type: 'Indica' | 'Sativa' | 'Hybrid'): StrainAnalysis => {
  const base: StrainAnalysis = {
    effects: {
      physical: ['Relaxed', 'Body high'],
      mental: ['Calm', 'Peaceful'],
      emotional: ['Happy', 'Content'],
    },
    bestFor: ['Evening use', 'Relaxation'],
    medicalBenefits: ['Stress relief', 'Pain management'],
    sideEffects: ['Dry mouth', 'Dry eyes', 'Possible drowsiness'],
    consumptionTips: 'Start with a small amount and wait 15-30 minutes before consuming more.',
    similarStrains: ['Similar strains in this category'],
    experienceLevel: 'intermediate',
    duration: '2-4 hours',
    onset: '5-15 minutes for flower, 30-90 minutes for edibles',
  };

  if (type === 'Sativa') {
    base.effects = {
      physical: ['Energized', 'Light'],
      mental: ['Creative', 'Focused', 'Uplifted'],
      emotional: ['Happy', 'Euphoric'],
    };
    base.bestFor = ['Daytime use', 'Creative activities', 'Social situations'];
  }

  return base;
};

const getLocalActivityPairing = (activity: string): ActivityPairingResponse => {
  const lower = activity.toLowerCase();

  if (lower.includes('movie') || lower.includes('netflix')) {
    return {
      intro: 'Movies and cannabis are a classic combo. You want something that enhances visuals and sound without knocking you out.',
      pairings: [
        { strain: 'Blue Dream', type: 'Hybrid', why: 'Perfect balance of relaxation and engagement', confidence: 'perfect' },
        { strain: 'Pineapple Express', type: 'Hybrid', why: 'Fun, giggly, enhances comedy', confidence: 'great' },
        { strain: 'Granddaddy Purple', type: 'Indica', why: 'For late-night movie marathons when you want to sink into the couch', confidence: 'good' },
      ],
      tips: 'Have snacks ready before you start — you don\'t want to miss the good parts!',
    };
  }

  return {
    intro: `Great choice! Let me suggest some strains that would enhance ${activity}.`,
    pairings: [
      { strain: 'Blue Dream', type: 'Hybrid', why: 'Versatile strain that works for almost any activity', confidence: 'great' },
      { strain: 'Sour Diesel', type: 'Sativa', why: 'Energizing and creative for active experiences', confidence: 'good' },
      { strain: 'OG Kush', type: 'Hybrid', why: 'Relaxing but not too sedating', confidence: 'good' },
    ],
    tips: 'Start low, especially if you\'re trying a new activity while high. You can always consume more!',
  };
};

// ============================================
// EXPORTS
// ============================================

export const CannabisAI = {
  chat,
  getRecommendations,
  analyzeStrain,
  getActivityPairing,
  setAPIKey,
  hasAPIKey,
};

export default CannabisAI;
