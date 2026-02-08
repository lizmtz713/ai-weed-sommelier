import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useFeatureUsage } from '../hooks/useFeatureGate';

const { width } = Dimensions.get('window');

// ===========================================
// TYPES
// ===========================================

interface Feature {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  premium: boolean;
}

// ===========================================
// FEATURES LIST
// ===========================================

const FEATURES: Feature[] = [
  { icon: 'leaf', text: 'Basic strain logging', premium: false },
  { icon: 'calendar', text: 'Session tracking', premium: false },
  { icon: 'chatbubble', text: '5 AI chats per month', premium: false },
  { icon: 'infinite', text: 'Unlimited AI Sommelier chats', premium: true },
  { icon: 'trending-up', text: 'Tolerance insights & tracking', premium: true },
  { icon: 'analytics', text: 'Consumption patterns & stats', premium: true },
  { icon: 'download', text: 'Export your data', premium: true },
  { icon: 'close-circle', text: 'Ad-free experience', premium: true },
];

// ===========================================
// COMPONENT
// ===========================================

export function PaywallScreen() {
  const navigation = useNavigation();
  const {
    tier,
    isLoading,
    isPremium,
    monthlyPackage,
    yearlyPackage,
    purchasePremium,
    restore,
  } = useSubscription();
  
  const { getAIChatUsage } = useFeatureUsage();
  
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [processingPurchase, setProcessingPurchase] = useState(false);
  const [aiUsage, setAiUsage] = useState({ used: 0, limit: 5, remaining: 5 });

  // Load usage info
  useEffect(() => {
    const loadUsage = async () => {
      const usage = await getAIChatUsage();
      setAiUsage(usage);
    };
    loadUsage();
  }, []);

  // Handle purchase
  const handlePurchase = async () => {
    if (isPremium) {
      navigation.goBack();
      return;
    }

    setProcessingPurchase(true);
    try {
      const success = await purchasePremium(selectedPlan === 'yearly');
      if (success) {
        navigation.goBack();
      }
    } finally {
      setProcessingPurchase(false);
    }
  };

  // Handle restore
  const handleRestore = async () => {
    setProcessingPurchase(true);
    try {
      await restore();
    } finally {
      setProcessingPurchase(false);
    }
  };

  const monthlyPrice = monthlyPackage?.product.priceString || '$4.99';
  const yearlyPrice = yearlyPackage?.product.priceString || '$29.99';

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🌿✨</Text>
          <Text style={styles.heroTitle}>Upgrade to Premium</Text>
          <Text style={styles.heroSubtitle}>
            Unlock unlimited AI recommendations, deep insights, and more
          </Text>
        </View>

        {/* Current Usage (for free users) */}
        {!isPremium && (
          <View style={styles.usageContainer}>
            <Ionicons name="chatbubble-ellipses" size={20} color="#059669" />
            <Text style={styles.usageText}>
              AI chats this month: <Text style={styles.usageHighlight}>{aiUsage.used}/{aiUsage.limit}</Text>
            </Text>
          </View>
        )}

        {/* Plan Selection */}
        {!isPremium && (
          <View style={styles.plansContainer}>
            {/* Yearly Plan */}
            <TouchableOpacity
              style={[
                styles.planCard,
                selectedPlan === 'yearly' && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan('yearly')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={selectedPlan === 'yearly' ? ['#059669', '#047857'] : ['#F0FDF4', '#DCFCE7']}
                style={styles.planGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>SAVE 50%</Text>
                </View>
                <View style={styles.planContent}>
                  <View>
                    <Text style={[
                      styles.planName,
                      selectedPlan === 'yearly' && styles.planNameSelected
                    ]}>
                      Yearly
                    </Text>
                    <Text style={[
                      styles.planSubtext,
                      selectedPlan === 'yearly' && styles.planSubtextSelected
                    ]}>
                      Best value
                    </Text>
                  </View>
                  <View style={styles.planPriceContainer}>
                    <Text style={[
                      styles.planPrice,
                      selectedPlan === 'yearly' && styles.planPriceSelected
                    ]}>
                      {yearlyPrice}
                    </Text>
                    <Text style={[
                      styles.planPeriod,
                      selectedPlan === 'yearly' && styles.planPeriodSelected
                    ]}>
                      /year
                    </Text>
                  </View>
                </View>
                {selectedPlan === 'yearly' && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Monthly Plan */}
            <TouchableOpacity
              style={[
                styles.planCard,
                selectedPlan === 'monthly' && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan('monthly')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={selectedPlan === 'monthly' ? ['#059669', '#047857'] : ['#F0FDF4', '#DCFCE7']}
                style={styles.planGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.planContent}>
                  <View>
                    <Text style={[
                      styles.planName,
                      selectedPlan === 'monthly' && styles.planNameSelected
                    ]}>
                      Monthly
                    </Text>
                    <Text style={[
                      styles.planSubtext,
                      selectedPlan === 'monthly' && styles.planSubtextSelected
                    ]}>
                      Flexible
                    </Text>
                  </View>
                  <View style={styles.planPriceContainer}>
                    <Text style={[
                      styles.planPrice,
                      selectedPlan === 'monthly' && styles.planPriceSelected
                    ]}>
                      {monthlyPrice}
                    </Text>
                    <Text style={[
                      styles.planPeriod,
                      selectedPlan === 'monthly' && styles.planPeriodSelected
                    ]}>
                      /month
                    </Text>
                  </View>
                </View>
                {selectedPlan === 'monthly' && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What you get</Text>
          
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={[
                styles.featureIconContainer,
                feature.premium && styles.featureIconPremium
              ]}>
                <Ionicons
                  name={feature.icon}
                  size={18}
                  color={feature.premium ? '#059669' : '#64748B'}
                />
              </View>
              <Text style={[
                styles.featureText,
                feature.premium && styles.featureTextPremium
              ]}>
                {feature.text}
              </Text>
              {feature.premium && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* CTA Button */}
        {!isPremium && (
          <TouchableOpacity
            style={[
              styles.ctaButton,
              processingPurchase && styles.ctaButtonDisabled,
            ]}
            onPress={handlePurchase}
            disabled={processingPurchase}
          >
            <LinearGradient
              colors={['#059669', '#047857']}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {processingPurchase ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.ctaButtonText}>
                    Continue with {selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Already Premium */}
        {isPremium && (
          <View style={styles.alreadyPremium}>
            <Ionicons name="checkmark-circle" size={48} color="#059669" />
            <Text style={styles.alreadyPremiumTitle}>You're Premium! 🌿</Text>
            <Text style={styles.alreadyPremiumText}>
              Enjoy unlimited access to all Sommelier features
            </Text>
          </View>
        )}

        {/* Restore Purchases */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={processingPurchase}
        >
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.termsText}>
          By subscribing, you agree to our Terms of Service and Privacy Policy.
          Subscriptions automatically renew unless cancelled at least 24 hours
          before the end of the current period. Cancel anytime in your device settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ===========================================
// STYLES
// ===========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  usageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  usageText: {
    fontSize: 14,
    color: '#166534',
    marginLeft: 8,
  },
  usageHighlight: {
    fontWeight: '700',
  },
  plansContainer: {
    marginBottom: 24,
  },
  planCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  planCardSelected: {
    borderColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  planGradient: {
    padding: 20,
    position: 'relative',
  },
  saveBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FBBF24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#78350F',
  },
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  planNameSelected: {
    color: '#FFFFFF',
  },
  planSubtext: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  planSubtextSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  planPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
  },
  planPriceSelected: {
    color: '#FFFFFF',
  },
  planPeriod: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 2,
  },
  planPeriodSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  checkmark: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  featuresContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  featureIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIconPremium: {
    backgroundColor: '#DCFCE7',
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#64748B',
    marginLeft: 12,
  },
  featureTextPremium: {
    color: '#1E293B',
    fontWeight: '500',
  },
  premiumBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  premiumBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  ctaButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  alreadyPremium: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  alreadyPremiumTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  alreadyPremiumText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  restoreButtonText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  termsText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
});
