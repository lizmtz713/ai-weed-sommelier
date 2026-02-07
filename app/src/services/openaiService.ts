// OpenAI Integration for AI Weed Sommelier
// Real AI-powered cannabis recommendations

// ===========================================
// CONFIGURATION
// ===========================================

let OPENAI_API_KEY: string | null = null;

export function setOpenAIKey(key: string) {
  OPENAI_API_KEY = key;
}

export function hasOpenAIKey(): boolean {
  return OPENAI_API_KEY !== null && OPENAI_API_KEY.length > 0;
}

// ===========================================
// SYSTEM PROMPTS
// ===========================================

const BUDTENDER_SYSTEM_PROMPT = `You are an expert AI Cannabis Sommelier (Budtender) with deep knowledge of:

- Cannabis strains (Indica, Sativa, Hybrid)
- Terpene profiles and their effects
- Cannabinoid ratios (THC, CBD, CBN, etc.)
- Consumption methods (flower, edibles, vapes, concentrates)
- Medical applications
- Responsible use and harm reduction

GUIDELINES:
1. Be friendly, knowledgeable, and non-judgmental
2. Give specific strain recommendations with reasoning
3. Consider the user's desired effects, mood, and experience level
4. Explain terpenes and their roles in effects
5. Mention potential side effects when relevant
6. Always promote responsible use
7. Use emojis sparingly but effectively

KNOWLEDGE:
- Indica: Body high, relaxing, sedating ("in-da-couch")
- Sativa: Head high, energizing, creative
- Hybrid: Balanced or leaning indica/sativa
- Key terpenes: Myrcene (sedating), Limonene (uplifting), Pinene (alert), Caryophyllene (anti-inflammatory)
- THC: Psychoactive compound, 15-20% typical, 25%+ high potency
- CBD: Non-psychoactive, therapeutic, can reduce THC anxiety

Always be helpful and make the user feel comfortable asking questions!`;

const STRAIN_ANALYSIS_PROMPT = `Analyze this cannabis strain and provide:
1. Expected effects (physical, mental, emotional)
2. Best activities/occasions
3. Medical benefits
4. Potential side effects
5. Recommended consumption method
6. Similar strains to try

Respond in JSON format:
{
  "effects": {"physical": [], "mental": [], "emotional": []},
  "activities": [],
  "medicalBenefits": [],
  "sideEffects": [],
  "consumptionTips": "string",
  "similarStrains": [],
  "overallRating": number 1-5,
  "experienceLevel": "beginner" | "intermediate" | "experienced"
}`;

// ===========================================
// CHAT API
// ===========================================

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  success: boolean;
  message: string;
  error?: string;
}

export async function chat(
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
  context?: {
    favoriteStrains?: string[];
    preferredEffects?: string[];
    experienceLevel?: string;
    medicalNeeds?: string[];
  }
): Promise<ChatResponse> {
  if (!OPENAI_API_KEY) {
    return {
      success: true,
      message: getLocalResponse(userMessage),
    };
  }

  try {
    let contextString = '';
    if (context) {
      contextString = `\n\nUSER CONTEXT:
- Favorite strains: ${context.favoriteStrains?.join(', ') || 'Not specified'}
- Preferred effects: ${context.preferredEffects?.join(', ') || 'Not specified'}
- Experience level: ${context.experienceLevel || 'Unknown'}
- Medical needs: ${context.medicalNeeds?.join(', ') || 'None specified'}`;
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: BUDTENDER_SYSTEM_PROMPT + contextString },
      ...conversationHistory.slice(-10),
      { role: 'user', content: userMessage },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 800,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return {
      success: true,
      message: data.choices[0].message.content,
    };
  } catch (error) {
    console.error('OpenAI chat error:', error);
    return {
      success: true,
      message: getLocalResponse(userMessage),
    };
  }
}

// ===========================================
// STRAIN RECOMMENDATIONS
// ===========================================

interface StrainRecommendation {
  strains: {
    name: string;
    type: 'indica' | 'sativa' | 'hybrid';
    reason: string;
    effects: string[];
    confidence: number;
  }[];
}

export async function getRecommendations(
  mood: string,
  activity: string,
  preferences: {
    wantsEnergy?: boolean;
    wantsRelaxation?: boolean;
    wantsCreativity?: boolean;
    wantsSleep?: boolean;
    avoidAnxiety?: boolean;
    experienceLevel?: 'beginner' | 'intermediate' | 'experienced';
  }
): Promise<StrainRecommendation> {
  if (!OPENAI_API_KEY) {
    return getLocalRecommendations(mood, activity, preferences);
  }

  try {
    const prompt = `Recommend 3 cannabis strains for someone who:
- Mood/Feeling: ${mood}
- Activity: ${activity}
- Wants energy: ${preferences.wantsEnergy ?? 'unknown'}
- Wants relaxation: ${preferences.wantsRelaxation ?? 'unknown'}
- Wants creativity: ${preferences.wantsCreativity ?? 'unknown'}
- Wants sleep help: ${preferences.wantsSleep ?? 'unknown'}
- Wants to avoid anxiety: ${preferences.avoidAnxiety ?? 'unknown'}
- Experience level: ${preferences.experienceLevel || 'unknown'}

Respond in JSON:
{
  "strains": [
    {"name": "Strain Name", "type": "indica|sativa|hybrid", "reason": "Why this fits", "effects": ["effect1", "effect2"], "confidence": 0.9}
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a cannabis expert. Respond only in valid JSON.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 600,
      }),
    });

    if (!response.ok) throw new Error('API failed');

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid response');
  } catch (error) {
    return getLocalRecommendations(mood, activity, preferences);
  }
}

// ===========================================
// STRAIN ANALYSIS
// ===========================================

export async function analyzeStrain(
  strainName: string,
  type: string,
  thc?: number,
  cbd?: number,
  terpenes?: string[]
): Promise<any> {
  if (!OPENAI_API_KEY) {
    return getLocalAnalysis(strainName, type);
  }

  try {
    const prompt = `Analyze this cannabis strain:
Name: ${strainName}
Type: ${type}
THC: ${thc || 'Unknown'}%
CBD: ${cbd || 'Unknown'}%
Terpenes: ${terpenes?.join(', ') || 'Unknown'}

${STRAIN_ANALYSIS_PROMPT}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a cannabis expert. Respond only in valid JSON.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 700,
      }),
    });

    if (!response.ok) throw new Error('API failed');

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid response');
  } catch (error) {
    return getLocalAnalysis(strainName, type);
  }
}

// ===========================================
// LOCAL FALLBACKS
// ===========================================

function getLocalResponse(question: string): string {
  const q = question.toLowerCase();
  
  if (q.includes('relax') || q.includes('sleep') || q.includes('indica')) {
    return `🌿 **Relaxation & Sleep Strains**

For winding down, here are my top picks:

**Heavy Indicas:**
- **Granddaddy Purple** — Grape flavor, full body relaxation, great for sleep
- **Northern Lights** — Classic, dreamy, muscle relaxation
- **Purple Kush** — Earthy, sedating, pain relief

**Balanced Options:**
- **9 Pound Hammer** — Fruity, not too heavy, good for evenings
- **Bubba Kush** — Coffee & chocolate notes, cozy vibes

💡 **Tips:**
- Start low, go slow (especially edibles)
- Try 30-60 min before bed
- Keep water nearby

What are you looking to achieve? 😴`;
  }
  
  if (q.includes('energy') || q.includes('creative') || q.includes('sativa') || q.includes('focus')) {
    return `🌿 **Energy & Creativity Strains**

For daytime motivation:

**Uplifting Sativas:**
- **Green Crack** — Energizing, focused, citrus flavor
- **Sour Diesel** — Cerebral, creative, classic fuel smell
- **Jack Herer** — Balanced energy, piney, good for work

**Creative Hybrids:**
- **Blue Dream** — Gentle energy, euphoric, very popular
- **Super Lemon Haze** — Zesty, happy, social

💡 **Tips:**
- Great for creative projects, hiking, social events
- Avoid before important meetings if you're sensitive
- Pairs well with coffee ☕

What activity are you planning? 🎨`;
  }
  
  if (q.includes('anxiety') || q.includes('calm') || q.includes('cbd')) {
    return `🌿 **Anxiety-Friendly Strains**

Lower THC, higher CBD options:

**High CBD Strains:**
- **Harlequin** — 5:2 CBD:THC ratio, clear-headed relief
- **ACDC** — Very high CBD, minimal high, great for anxiety
- **Cannatonic** — Balanced, mellow, functional

**Gentle THC Options:**
- **Granddaddy Purple** — Relaxing without racing thoughts
- **OG Kush** — Mood boost, stress relief

💡 **Tips:**
- CBD can counteract THC anxiety
- Start with low THC (<15%)
- Avoid strong sativas if prone to anxiety

What's your experience level? 🧘`;
  }
  
  return `🌿 **AI Budtender Here!**

I'm here to help you find your perfect strain! Tell me about:

- **Your goal** — Relax? Energy? Sleep? Pain relief? Creativity?
- **The occasion** — Movie night? Hiking? Social event? Bedtime?
- **Your experience** — New to cannabis? Regular user?

Or ask me about:
- "What's good for anxiety without paranoia?"
- "Best strain for watching movies?"
- "Something energizing for a hike?"
- "Help me sleep tonight"

What are you looking for? 💨`;
}

function getLocalRecommendations(mood: string, activity: string, preferences: any): StrainRecommendation {
  const recommendations: StrainRecommendation = { strains: [] };
  
  if (preferences.wantsSleep || mood.toLowerCase().includes('sleep') || mood.toLowerCase().includes('relax')) {
    recommendations.strains = [
      { name: 'Granddaddy Purple', type: 'indica', reason: 'Heavy relaxation, great for sleep', effects: ['Relaxed', 'Sleepy', 'Happy'], confidence: 0.90 },
      { name: 'Northern Lights', type: 'indica', reason: 'Classic sedating strain', effects: ['Relaxed', 'Euphoric', 'Sleepy'], confidence: 0.85 },
      { name: 'Bubba Kush', type: 'indica', reason: 'Cozy, stress-relieving', effects: ['Relaxed', 'Happy', 'Hungry'], confidence: 0.80 },
    ];
  } else if (preferences.wantsEnergy || preferences.wantsCreativity || mood.toLowerCase().includes('energy')) {
    recommendations.strains = [
      { name: 'Green Crack', type: 'sativa', reason: 'Energizing and focused', effects: ['Energetic', 'Focused', 'Happy'], confidence: 0.90 },
      { name: 'Sour Diesel', type: 'sativa', reason: 'Cerebral, creative boost', effects: ['Energetic', 'Creative', 'Uplifted'], confidence: 0.85 },
      { name: 'Jack Herer', type: 'sativa', reason: 'Balanced daytime strain', effects: ['Happy', 'Creative', 'Focused'], confidence: 0.80 },
    ];
  } else {
    recommendations.strains = [
      { name: 'Blue Dream', type: 'hybrid', reason: 'Perfect all-rounder', effects: ['Relaxed', 'Happy', 'Euphoric'], confidence: 0.90 },
      { name: 'OG Kush', type: 'hybrid', reason: 'Classic balanced effects', effects: ['Relaxed', 'Happy', 'Uplifted'], confidence: 0.85 },
      { name: 'Girl Scout Cookies', type: 'hybrid', reason: 'Euphoric and relaxing', effects: ['Happy', 'Relaxed', 'Euphoric'], confidence: 0.80 },
    ];
  }
  
  return recommendations;
}

function getLocalAnalysis(strainName: string, type: string): any {
  return {
    effects: {
      physical: ['Relaxation', 'Body buzz'],
      mental: ['Euphoria', 'Calm'],
      emotional: ['Happy', 'Content'],
    },
    activities: ['Relaxing at home', 'Watching movies', 'Light socializing'],
    medicalBenefits: ['Stress relief', 'Pain management', 'Sleep aid'],
    sideEffects: ['Dry mouth', 'Dry eyes', 'Possible munchies'],
    consumptionTips: 'Start with a small amount and wait 15 minutes before consuming more.',
    similarStrains: ['Other ' + type + ' strains with similar profiles'],
    overallRating: 4,
    experienceLevel: 'intermediate',
  };
}
