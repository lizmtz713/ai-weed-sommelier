import { useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSubscription } from '../contexts/SubscriptionContext';

// ===========================================
// CONSTANTS
// ===========================================

const FREE_AI_CHATS_PER_MONTH = 5;
const AI_CHAT_STORAGE_KEY = '@sommelier_ai_chat_usage';

interface AIUsageData {
  count: number;
  monthKey: string; // Format: "2024-01"
}

// ===========================================
// HOOK
// ===========================================

export function useFeatureGate() {
  const { isPremium } = useSubscription();

  // Feature flags
  const canUseUnlimitedAI = useMemo(() => isPremium, [isPremium]);
  const canExportData = useMemo(() => isPremium, [isPremium]);
  const canUseToleranceInsights = useMemo(() => isPremium, [isPremium]);
  const canUseConsumptionPatterns = useMemo(() => isPremium, [isPremium]);
  const isAdFree = useMemo(() => isPremium, [isPremium]);

  // Get current month key
  const getCurrentMonthKey = useCallback(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // Get AI chat usage for free tier
  const getAIChatUsage = useCallback(async (): Promise<{ used: number; limit: number; remaining: number }> => {
    if (isPremium) {
      return { used: 0, limit: Infinity, remaining: Infinity };
    }

    try {
      const stored = await AsyncStorage.getItem(AI_CHAT_STORAGE_KEY);
      const currentMonthKey = getCurrentMonthKey();

      if (stored) {
        const data: AIUsageData = JSON.parse(stored);
        // Reset if new month
        if (data.monthKey !== currentMonthKey) {
          return { used: 0, limit: FREE_AI_CHATS_PER_MONTH, remaining: FREE_AI_CHATS_PER_MONTH };
        }
        const remaining = Math.max(0, FREE_AI_CHATS_PER_MONTH - data.count);
        return { used: data.count, limit: FREE_AI_CHATS_PER_MONTH, remaining };
      }

      return { used: 0, limit: FREE_AI_CHATS_PER_MONTH, remaining: FREE_AI_CHATS_PER_MONTH };
    } catch (error) {
      console.error('[useFeatureGate] Failed to get AI chat usage:', error);
      return { used: 0, limit: FREE_AI_CHATS_PER_MONTH, remaining: FREE_AI_CHATS_PER_MONTH };
    }
  }, [isPremium, getCurrentMonthKey]);

  // Check if user can use AI chat (and optionally increment usage)
  const checkAIChatLimit = useCallback(async (increment: boolean = false): Promise<{ allowed: boolean; remaining: number }> => {
    if (isPremium) {
      return { allowed: true, remaining: Infinity };
    }

    try {
      const currentMonthKey = getCurrentMonthKey();
      const stored = await AsyncStorage.getItem(AI_CHAT_STORAGE_KEY);
      
      let data: AIUsageData = { count: 0, monthKey: currentMonthKey };
      
      if (stored) {
        data = JSON.parse(stored);
        // Reset if new month
        if (data.monthKey !== currentMonthKey) {
          data = { count: 0, monthKey: currentMonthKey };
        }
      }

      const remaining = Math.max(0, FREE_AI_CHATS_PER_MONTH - data.count);
      
      if (remaining <= 0) {
        return { allowed: false, remaining: 0 };
      }

      if (increment) {
        data.count += 1;
        await AsyncStorage.setItem(AI_CHAT_STORAGE_KEY, JSON.stringify(data));
        return { allowed: true, remaining: remaining - 1 };
      }

      return { allowed: true, remaining };
    } catch (error) {
      console.error('[useFeatureGate] Failed to check AI chat limit:', error);
      // On error, allow usage but don't track
      return { allowed: true, remaining: FREE_AI_CHATS_PER_MONTH };
    }
  }, [isPremium, getCurrentMonthKey]);

  // Get remaining AI chats this month
  const aiChatsRemaining = useCallback(async (): Promise<number> => {
    const usage = await getAIChatUsage();
    return usage.remaining;
  }, [getAIChatUsage]);

  // Reset AI usage (for testing)
  const resetAIUsage = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(AI_CHAT_STORAGE_KEY);
    } catch (error) {
      console.error('[useFeatureGate] Failed to reset AI usage:', error);
    }
  }, []);

  return {
    // Feature flags
    canUseUnlimitedAI,
    canExportData,
    canUseToleranceInsights,
    canUseConsumptionPatterns,
    isAdFree,
    isPremium,

    // AI chat limits
    getAIChatUsage,
    checkAIChatLimit,
    aiChatsRemaining,
    resetAIUsage,

    // Constants
    FREE_AI_CHATS_PER_MONTH,
  };
}

// ===========================================
// USAGE HOOK (for PaywallScreen)
// ===========================================

export function useFeatureUsage() {
  const { getAIChatUsage } = useFeatureGate();

  return {
    getAIChatUsage,
  };
}
