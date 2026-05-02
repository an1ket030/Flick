import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth';
import { supabase } from '../../lib/supabase';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';

const GENRE_NAMES: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller',
  10752: 'War', 37: 'Western',
};

function paceLabel(v: number) {
  if (v <= 3) return 'slow-burn';
  if (v <= 6) return 'balanced';
  return 'fast-paced';
}

function toneLabel(v: number) {
  if (v <= 3) return 'dark and heavy';
  if (v <= 6) return 'balanced';
  return 'light and fun';
}

export default function ProfileScreen() {
  const { profile, session, signOut } = useAuthStore();
  const [tasteData, setTasteData] = useState<any>(null);
  const [loadingTaste, setLoadingTaste] = useState(true);
  const [moodHistory, setMoodHistory] = useState<{total_watched: number, top_genres: {id: number, name: string, count: number}[]} | null>(null);
  const [loadingMood, setLoadingMood] = useState(true);

  React.useEffect(() => {
    if (!profile) return;
    
    // Fetch Taste Profile
    supabase
      .from('taste_profiles')
      .select('*')
      .eq('user_id', profile.id)
      .single()
      .then(({ data }) => {
        setTasteData(data);
        setLoadingTaste(false);
      });

    // Fetch Mood History
    const fetchMoodHistory = async () => {
      try {
        const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://flick-ysai.onrender.com';
        const res = await fetch(`${EXPO_PUBLIC_API_URL}/api/profile/mood-history`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setMoodHistory(json.data);
        }
      } catch (err) {
        console.error('Mood history fetch error', err);
      } finally {
        setLoadingMood(false);
      }
    };
    fetchMoodHistory();
  }, [profile, session?.access_token]);

  const handleSignOut = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out of Flick?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  const displayName = profile?.display_name || session?.user?.email?.split('@')[0] || 'User';
  const username = profile?.username;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Profile</Text>
      </View>

      {/* Avatar + name */}
      <View style={styles.profileBlock}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
        <Text style={styles.displayName}>{displayName}</Text>
        {username && <Text style={styles.username}>@{username}</Text>}
        {session?.user?.email && (
          <Text style={styles.email}>{session.user.email}</Text>
        )}
      </View>

      {/* V2 Taste Profile Card */}
      <View style={styles.menuSection}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[2]}}>
          <Text style={styles.menuSectionLabel}>Your Taste Profile</Text>
          <TouchableOpacity onPress={() => router.push('/profile/fine-tune')}>
            <Text style={{color: Colors.brand.primary, fontSize: 12, fontFamily: Typography.family.bodyBold}}>FINE TUNE</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tasteCard}>
          {loadingTaste ? (
            <ActivityIndicator color={Colors.brand.primary} />
          ) : (
            <>
              <View style={styles.tasteRow}>
                <Text style={styles.tasteLabel}>Intent</Text>
                <Text style={styles.tasteValue}>{tasteData?.primary_intent || 'Not set'}</Text>
              </View>
              <View style={styles.cardDivider} />
              <View style={styles.tasteRow}>
                <Text style={styles.tasteLabel}>Directors Known</Text>
                <Text style={styles.tasteValue}>{tasteData?.director_familiarity?.length || 0}/30</Text>
              </View>
              <View style={styles.cardDivider} />
              <View style={styles.tasteRow}>
                <Text style={styles.tasteLabel}>Top Genres</Text>
                <Text style={styles.tasteValue}>
                  {tasteData?.genre_loves?.slice(0,2).map((id: number) => GENRE_NAMES[id]).join(', ') || 'Varied'}
                </Text>
              </View>
              <View style={styles.cardDivider} />
              <View style={styles.tasteRow}>
                <Text style={styles.tasteLabel}>Vibe</Text>
                <Text style={styles.tasteValue}>
                  {toneLabel(tasteData?.tone_slider ?? 5)}, {paceLabel(tasteData?.pace_slider ?? 5)}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* ── Sprint 3.5: Mood History ── */}
      <View style={styles.menuSection}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[2]}}>
          <Text style={styles.menuSectionLabel}>Mood History</Text>
        </View>

        <View style={styles.tasteCard}>
          {loadingMood ? (
            <ActivityIndicator color={Colors.brand.primary} />
          ) : moodHistory && moodHistory.total_watched > 0 ? (
            <>
              <View style={[styles.tasteRow, {justifyContent: 'center', paddingVertical: Spacing[4]}]}>
                <View style={{alignItems: 'center'}}>
                  <Text style={{fontSize: 28, fontFamily: Typography.family.heading, color: Colors.brand.primary}}>{moodHistory.total_watched}</Text>
                  <Text style={{fontSize: 12, fontFamily: Typography.family.body, color: Colors.text.secondary}}>Films Watched</Text>
                </View>
              </View>
              
              {moodHistory.top_genres.length > 0 && (
                <>
                  <View style={styles.cardDivider} />
                  <View style={{paddingVertical: Spacing[3]}}>
                    <Text style={{color: Colors.text.primary, fontFamily: Typography.family.bodyBold, fontSize: 13, marginBottom: Spacing[3], letterSpacing: 0.5, textTransform: 'uppercase'}}>Top Genres Explored</Text>
                    {moodHistory.top_genres.map((g, i) => (
                      <View key={g.id} style={{flexDirection: 'row', alignItems: 'center', marginBottom: i === moodHistory.top_genres.length - 1 ? 0 : Spacing[2]}}>
                        <Text style={{flex: 1, color: Colors.text.secondary, fontFamily: Typography.family.body, fontSize: 14}}>{g.name}</Text>
                        <View style={{flex: 2, height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden', marginRight: Spacing[3]}}>
                          <View style={{width: `${(g.count / Math.max(1, moodHistory.total_watched)) * 100}%`, height: '100%', backgroundColor: Colors.brand.primary}} />
                        </View>
                        <Text style={{color: Colors.text.primary, fontFamily: Typography.family.bodyMedium, fontSize: 14, width: 24, textAlign: 'right'}}>{g.count}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </>
          ) : (
            <View style={{paddingVertical: Spacing[4], alignItems: 'center'}}>
              <Text style={{color: Colors.text.tertiary, fontFamily: Typography.family.body, textAlign: 'center'}}>Log watched films to build your Mood History.</Text>
            </View>
          )}
        </View>
      </View>

      {/* Menu items */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionLabel}>Account</Text>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.75}>
          <Text style={styles.menuItemText}>Edit profile</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.75}>
          <Text style={styles.menuItemText}>Notification preferences</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.75}>
          <Text style={styles.menuItemText}>Privacy settings</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.menuSectionLabel}>Flick</Text>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.75}>
          <Text style={styles.menuItemText}>About</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.75}>
          <Text style={styles.menuItemText}>Terms of Service</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.75}>
          <Text style={styles.menuItemText}>Privacy Policy</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Sign out */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        activeOpacity={0.75}
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Flick · Phase 3 Build</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.base,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  header: {
    paddingHorizontal: Spacing[6],
    paddingTop: 60,
    paddingBottom: Spacing[4],
  },
  screenTitle: {
    fontSize: Typography.size['3xl'],
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    letterSpacing: -1,
  },

  // ── Profile block ──
  profileBlock: {
    alignItems: 'center',
    paddingVertical: Spacing[8],
    paddingHorizontal: Spacing[6],
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[4],
  },
  avatarInitial: {
    fontSize: Typography.size['4xl'],
    fontFamily: Typography.family.heading,
    color: Colors.text.inverse,
    letterSpacing: -1,
  },
  displayName: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  username: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  email: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
  },

  // ── Menu ──
  menuSection: {
    marginHorizontal: Spacing[6],
    marginBottom: Spacing[5],
  },
  menuSectionLabel: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.text.tertiary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing[2],
    paddingHorizontal: Spacing[1],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    marginBottom: 2,
    minHeight: 52,
  },
  menuItemText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.text.primary,
  },
  menuItemArrow: {
    fontSize: Typography.size.lg,
    color: Colors.text.tertiary,
    fontFamily: Typography.family.body,
  },

  // ── Sign Out ──
  signOutButton: {
    marginHorizontal: Spacing[6],
    marginTop: Spacing[2],
    borderRadius: Radius.lg,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    minHeight: 52,
  },
  signOutText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.status.error,
  },

  // ── Version ──
  version: {
    textAlign: 'center',
    marginTop: Spacing[6],
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
  },
  // ── Taste Card ──
  tasteCard: {
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.background.overlay,
  },
  tasteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[2],
  },
  tasteLabel: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
  },
  tasteValue: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodyBold,
    color: Colors.text.primary,
    textTransform: 'capitalize',
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.background.base,
    marginVertical: Spacing[1],
  },
});
