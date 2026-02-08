import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Alert } from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';
import {
  subscriptionService,
  SubscriptionTier,
  SubscriptionStatus,
  SubscriptionPackage,
  PRODUCTS,
} from '../services/subscriptionService';
import { useAuth } from './AuthContext';

// ===========================================
// TYPES
// ===========================================

interface SubscriptionContextType {
  // Subscription state
  tier: SubscriptionTier;
  isLoading: boolean;
  isPremium: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  
  // Available packages
  packages: SubscriptionPackage[];
  monthlyPackage: SubscriptionPackage | null;
  yearlyPackage: SubscriptionPackage | null;
  
  // Actions
  purchasePremium: (yearly?: boolean) => Promise<boolean>;
  purchasePackage: (pkg: SubscriptionPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
  refreshStatus: () => Promise<void>;
}

// ===========================================
// CONTEXT
// ===========================================

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// ===========================================
// PROVIDER
// ===========================================

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // State
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);

  // Derived state
  const isPremium = tier === 'premium';

  // Find specific packages
  const monthlyPackage = packages.find(pkg => 
    pkg.identifier.toLowerCase().includes('monthly') || 
    pkg.rcPackage.product.identifier === PRODUCTS.PREMIUM_MONTHLY
  ) || null;

  const yearlyPackage = packages.find(pkg => 
    pkg.identifier.toLowerCase().includes('annual') ||
    pkg.identifier.toLowerCase().includes('yearly') || 
    pkg.rcPackage.product.identifier === PRODUCTS.PREMIUM_YEARLY
  ) || null;

  // Initialize RevenueCat
  useEffect(() => {
    const init = async () => {
      try {
        await subscriptionService.initialize();
        
        if (user?.id) {
          await subscriptionService.setUserId(user.id);
        }
        
        await Promise.all([
          loadOfferings(),
          refreshStatus(),
        ]);
      } catch (error) {
        console.error('[SubscriptionContext] Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Update RevenueCat user ID when auth changes
  useEffect(() => {
    const updateUserId = async () => {
      if (user?.id) {
        try {
          await subscriptionService.setUserId(user.id);
          await refreshStatus();
        } catch (error) {
          console.error('[SubscriptionContext] Failed to set user ID:', error);
        }
      } else {
        try {
          await subscriptionService.logout();
          setTier('free');
          setSubscriptionStatus(null);
        } catch (error) {
          console.error('[SubscriptionContext] Failed to logout:', error);
        }
      }
    };

    updateUserId();
  }, [user?.id]);

  // Listen for subscription changes
  useEffect(() => {
    const unsubscribe = subscriptionService.addCustomerInfoListener((status) => {
      setSubscriptionStatus(status);
      setTier(status.tier);
    });

    return unsubscribe;
  }, []);

  // Load available packages
  const loadOfferings = async () => {
    try {
      const offerings = await subscriptionService.getOfferings();
      setPackages(offerings);
    } catch (error) {
      console.error('[SubscriptionContext] Failed to load offerings:', error);
    }
  };

  // Refresh subscription status
  const refreshStatus = useCallback(async () => {
    try {
      const status = await subscriptionService.getSubscriptionStatus();
      setSubscriptionStatus(status);
      setTier(status.tier);
    } catch (error) {
      console.error('[SubscriptionContext] Failed to refresh status:', error);
    }
  }, []);

  // Purchase a specific package
  const purchasePackage = useCallback(async (pkg: SubscriptionPackage): Promise<boolean> => {
    setIsLoading(true);
    try {
      const status = await subscriptionService.purchasePackage(pkg.rcPackage);
      setSubscriptionStatus(status);
      setTier(status.tier);
      
      Alert.alert(
        '🌿 Welcome to Premium!',
        'You now have unlimited access to all Sommelier features. Enjoy!',
        [{ text: 'Let\'s Go!' }]
      );
      
      return true;
    } catch (error: any) {
      if (error.message !== 'Purchase cancelled') {
        Alert.alert(
          'Purchase Failed',
          'There was an error processing your purchase. Please try again.',
          [{ text: 'OK' }]
        );
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Purchase Premium subscription
  const purchasePremium = useCallback(async (yearly: boolean = false): Promise<boolean> => {
    const pkg = yearly ? yearlyPackage : monthlyPackage;
    if (!pkg) {
      Alert.alert('Unavailable', 'Premium subscription is not available at this time.');
      return false;
    }
    return purchasePackage(pkg);
  }, [monthlyPackage, yearlyPackage, purchasePackage]);

  // Restore purchases
  const restore = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const status = await subscriptionService.restorePurchases();
      setSubscriptionStatus(status);
      setTier(status.tier);
      
      if (status.tier === 'premium') {
        Alert.alert(
          'Purchases Restored',
          'Your Premium subscription has been restored. Welcome back! 🌿',
          [{ text: 'Great!' }]
        );
        return true;
      } else {
        Alert.alert(
          'No Purchases Found',
          'We couldn\'t find any previous purchases to restore.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      Alert.alert(
        'Restore Failed',
        'There was an error restoring your purchases. Please try again.',
        [{ text: 'OK' }]
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: SubscriptionContextType = {
    tier,
    isLoading,
    isPremium,
    subscriptionStatus,
    packages,
    monthlyPackage,
    yearlyPackage,
    purchasePremium,
    purchasePackage,
    restore,
    refreshStatus,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// ===========================================
// HOOK
// ===========================================

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
