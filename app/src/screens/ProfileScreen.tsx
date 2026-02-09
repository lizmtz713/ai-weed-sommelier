import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { CannabisAI, setAPIKey, hasAPIKey } from '../services/aiService';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalStrains: 0,
    totalSessions: 0,
    favoriteStrains: 0,
    avgRating: 0,
  });
  
  // AI Settings
  const [showAISettings, setShowAISettings] = useState(false);
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [aiConfigured, setAiConfigured] = useState(hasAPIKey());

  useEffect(() => {
    fetchStats();
    loadApiKeys();
  }, [user]);
  
  const loadApiKeys = async () => {
    try {
      const storedOpenai = await AsyncStorage.getItem('@weed_openai_key');
      const storedAnthropic = await AsyncStorage.getItem('@weed_anthropic_key');
      if (storedOpenai) {
        setOpenaiKey(storedOpenai);
        setAPIKey('openai', storedOpenai);
      }
      if (storedAnthropic) {
        setAnthropicKey(storedAnthropic);
        setAPIKey('anthropic', storedAnthropic);
      }
      setAiConfigured(hasAPIKey());
    } catch (e) {
      console.error('Error loading API keys:', e);
    }
  };
  
  const saveApiKey = async (provider: 'openai' | 'anthropic', key: string) => {
    try {
      const storageKey = provider === 'openai' ? '@weed_openai_key' : '@weed_anthropic_key';
      if (key.trim()) {
        await AsyncStorage.setItem(storageKey, key.trim());
        setAPIKey(provider, key.trim());
      } else {
        await AsyncStorage.removeItem(storageKey);
      }
      setAiConfigured(hasAPIKey());
      Alert.alert('Saved', `${provider === 'openai' ? 'OpenAI' : 'Anthropic'} key ${key.trim() ? 'saved' : 'removed'}.`);
    } catch (e) {
      Alert.alert('Error', 'Failed to save API key.');
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      // Fetch strains
      const strainsQuery = query(
        collection(db, 'strains'),
        where('userId', '==', user.id)
      );
      const strainsSnap = await getDocs(strainsQuery);
      const strains = strainsSnap.docs.map(d => d.data());
      
      // Fetch sessions
      const sessionsQuery = query(
        collection(db, 'sessions'),
        where('userId', '==', user.id)
      );
      const sessionsSnap = await getDocs(sessionsQuery);

      const totalRating = strains.reduce((sum, s) => sum + (s.rating || 0), 0);
      
      setStats({
        totalStrains: strains.length,
        totalSessions: sessionsSnap.size,
        favoriteStrains: strains.filter(s => s.favorite).length,
        avgRating: strains.length > 0 ? totalRating / strains.length : 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Profile</Text>

        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || '🌿'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalStrains}</Text>
            <Text style={styles.statLabel}>Strains</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.favoriteStrains}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.avgRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>

        {/* AI Settings */}
        <Text style={styles.sectionTitle}>AI Budtender</Text>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionRow}
            onPress={() => setShowAISettings(!showAISettings)}
          >
            <View style={[styles.aiDot, { backgroundColor: aiConfigured ? '#10B981' : '#EF4444' }]} />
            <Text style={styles.actionText}>
              {aiConfigured ? 'AI Enabled' : 'Configure AI Keys'}
            </Text>
            <Ionicons name={showAISettings ? 'chevron-up' : 'chevron-down'} size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          {showAISettings && (
            <View style={styles.aiSettings}>
              <View style={styles.apiKeyRow}>
                <TextInput
                  style={styles.apiKeyInput}
                  value={openaiKey}
                  onChangeText={setOpenaiKey}
                  placeholder="OpenAI API Key (sk-...)"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.saveKeyButton}
                  onPress={() => saveApiKey('openai', openaiKey)}
                >
                  <Text style={styles.saveKeyText}>Save</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.apiKeyRow}>
                <TextInput
                  style={styles.apiKeyInput}
                  value={anthropicKey}
                  onChangeText={setAnthropicKey}
                  placeholder="Anthropic API Key (sk-ant-...)"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.saveKeyButton}
                  onPress={() => saveApiKey('anthropic', anthropicKey)}
                >
                  <Text style={styles.saveKeyText}>Save</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.apiKeyNote}>
                Keys are stored securely on your device. Get keys from openai.com or anthropic.com.
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionRow}>
            <Ionicons name="notifications-outline" size={22} color="#059669" />
            <Text style={styles.actionText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionRow}>
            <Ionicons name="shield-outline" size={22} color="#059669" />
            <Text style={styles.actionText}>Privacy</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionRow}>
            <Ionicons name="help-circle-outline" size={22} color="#059669" />
            <Text style={styles.actionText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>AI Weed Sommelier v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#065F46', marginBottom: 20 },
  userCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, color: '#FFF', fontWeight: '600' },
  userName: { fontSize: 22, fontWeight: '600', color: '#1F2937' },
  userEmail: { fontSize: 15, color: '#6B7280', marginTop: 4 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: { fontSize: 28, fontWeight: '700', color: '#059669' },
  statLabel: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  actions: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionText: { flex: 1, fontSize: 16, color: '#1F2937', marginLeft: 12 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#EF4444', marginLeft: 8 },
  version: { textAlign: 'center', color: '#9CA3AF', marginTop: 24, fontSize: 13 },
  // AI Settings
  aiDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  aiSettings: { padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  apiKeyRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  apiKeyInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveKeyButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  saveKeyText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  apiKeyNote: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
});
