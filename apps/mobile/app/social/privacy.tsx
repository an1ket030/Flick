import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';
import { api } from '../../lib/api';

type PrivacySettings = {
  ratings: boolean;
  watchlist: boolean;
  recent_watches: boolean;
  collections: boolean;
};

export default function FriendPrivacyScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings>({
    ratings: true,
    watchlist: true,
    recent_watches: true,
    collections: true,
  });
  const [friendName, setFriendName] = useState('Friend');

  useEffect(() => {
    fetchFriendData();
  }, [id]);

  const fetchFriendData = async () => {
    try {
      // Find the specific friend from the list
      const response = await api.get('/api/social/friends');
      if (response.data?.data) {
        const friendRecord = response.data.data.find((f: any) => f.friendship_id === id);
        if (friendRecord) {
          setSettings(friendRecord.my_permissions_for_them);
          setFriendName(friendRecord.friend.display_name || friendRecord.friend.username);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (key: keyof PrivacySettings) => {
    const newValue = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newValue }));
    
    setSaving(true);
    try {
      await api.patch(`/api/social/friends/${id}/privacy`, {
        [key]: newValue
      });
    } catch (e) {
      // Revert on failure
      setSettings(prev => ({ ...prev, [key]: !newValue }));
      alert('Failed to update privacy setting');
    } finally {
      setSaving(false);
    }
  };
  
  const handleUnfriend = async () => {
    try {
      await api.delete(`/api/social/friends/${id}`);
      router.back();
    } catch (e) {
      alert('Failed to remove friend');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Stack.Screen options={{ title: 'Privacy Settings' }} />
        <ActivityIndicator color={Colors.brand.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Privacy Settings',
          headerStyle: { backgroundColor: Colors.background.base },
          headerTintColor: Colors.text.primary,
          headerShadowVisible: false,
        }} 
      />

      <Text style={styles.headerText}>
        What can {friendName} see on your profile?
      </Text>

      <View style={styles.section}>
        <View style={styles.row}>
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowTitle}>Numeric Ratings</Text>
            <Text style={styles.rowDesc}>Show your exact 10-point ratings</Text>
          </View>
          <Switch 
            value={settings.ratings} 
            onValueChange={() => toggleSetting('ratings')}
            trackColor={{ true: Colors.brand.primary, false: Colors.background.tertiary }}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowTitle}>Watchlist</Text>
            <Text style={styles.rowDesc}>Let them see your planned films</Text>
          </View>
          <Switch 
            value={settings.watchlist} 
            onValueChange={() => toggleSetting('watchlist')}
            trackColor={{ true: Colors.brand.primary, false: Colors.background.tertiary }}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowTitle}>Recent Watches</Text>
            <Text style={styles.rowDesc}>Show films you watched recently</Text>
          </View>
          <Switch 
            value={settings.recent_watches} 
            onValueChange={() => toggleSetting('recent_watches')}
            trackColor={{ true: Colors.brand.primary, false: Colors.background.tertiary }}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowTitle}>Collections</Text>
            <Text style={styles.rowDesc}>Display your public lists to them</Text>
          </View>
          <Switch 
            value={settings.collections} 
            onValueChange={() => toggleSetting('collections')}
            trackColor={{ true: Colors.brand.primary, false: Colors.background.tertiary }}
          />
        </View>
      </View>

      <View style={styles.dangerSection}>
         <TouchableOpacity style={styles.unfriendBtn} onPress={handleUnfriend}>
            <Text style={styles.unfriendText}>Remove Friend</Text>
         </TouchableOpacity>
      </View>
      
      {saving && <ActivityIndicator size="small" style={{ marginTop: 20 }} color={Colors.text.tertiary} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.base,
  },
  headerText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text.primary,
    padding: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  section: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.background.secondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.secondary,
    backgroundColor: Colors.background.base,
  },
  rowTextWrap: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  rowTitle: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  rowDesc: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  dangerSection: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
  },
  unfriendBtn: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  unfriendText: {
    color: '#ff3b30',
    fontWeight: 'bold',
  }
});
