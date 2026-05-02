/**
 * Onboarding Complete — Taste Profile Card
 * Template-driven summary of the user's taste profile.
 * Sets onboarding_phase = 1, then redirects to home.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/auth';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';

const GENRE_NAMES: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller',
  10752: 'War', 37: 'Western',
};

function paceLabel(v: number) {
  if (v <= 3) return 'slow-burn, contemplative';
  if (v <= 6) return 'balanced';
  return 'fast-paced, kinetic';
}

function toneLabel(v: number) {
  if (v <= 3) return 'dark and heavy';
  if (v <= 6) return 'balanced';
  return 'light and fun';
}

export default function OnboardingComplete() {
  const { user, loadProfile } = useAuthStore();
  const [tasteData, setTasteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load current taste profile data for summary
    supabase
      .from('taste_profiles')
      .select('*')
      .eq('user_id', user!.id)
      .single()
      .then(({ data }) => {
        setTasteData(data);
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      });
  }, []);

  const handleStartFlick = async () => {
    setSaving(true);
    try {
      // Mark onboarding as complete
      await supabase
        .from('taste_profiles')
        .upsert({ user_id: user!.id, onboarding_phase: 1 }, { onConflict: 'user_id' });
      // Reload profile so isOnboarded becomes true
      await loadProfile();
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      await supabase
        .from('taste_profiles')
        .upsert({ user_id: user!.id, onboarding_phase: 1 }, { onConflict: 'user_id' });
      await loadProfile();
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.brand.primary} size="large" />
        <Text style={styles.loadingText}>Building your taste profile…</Text>
      </View>
    );
  }

  const loves: number[] = tasteData?.genre_loves ?? [];
  const topLoves = loves.slice(0, 3).map(id => GENRE_NAMES[id] ?? String(id)).join(', ');
  const pace = tasteData?.pace_slider ?? 5;
  const tone = tasteData?.tone_slider ?? 5;

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🎬</Text>
        </View>
        <Text style={styles.title}>Your taste profile is ready.</Text>
        <Text style={styles.subtitle}>Here's what Flick knows about you.</Text>

        {/* Profile card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardDot} />
            <Text style={styles.cardTitle}>TASTE PROFILE</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.cardKey}>Loves</Text>
            <Text style={styles.cardValue}>
              {topLoves || 'All kinds of films'}
            </Text>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardRow}>
            <Text style={styles.cardKey}>Pace</Text>
            <Text style={styles.cardValue}>{paceLabel(pace)}</Text>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardRow}>
            <Text style={styles.cardKey}>Tone</Text>
            <Text style={styles.cardValue}>{toneLabel(tone)}</Text>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardRow}>
            <Text style={styles.cardKey}>Regions</Text>
            <Text style={styles.cardValue}>
              {tasteData?.region_prefs?.length ?? 0} regions selected
            </Text>
          </View>
        </View>

        <Text style={styles.note}>
          Your Daily Pick and recommendations are now personalised to your preferences. You can edit your taste profile anytime from Settings.
        </Text>
      </Animated.View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, saving && styles.primaryButtonDisabled]}
          onPress={handleStartFlick}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color={Colors.text.inverse} />
            : <Text style={styles.primaryButtonText}>Start using Flick</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.base },
  loading: {
    flex: 1,
    backgroundColor: Colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[4],
  },
  loadingText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: 60,
    alignItems: 'center',
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,107,44,0.15)',
    borderWidth: 2,
    borderColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[6],
  },
  icon: { fontSize: 36 },
  title: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing[8],
  },
  card: {
    width: '100%',
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.xl,
    padding: Spacing[5],
    borderWidth: 1,
    borderColor: Colors.background.overlay,
    marginBottom: Spacing[6],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  cardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand.primary,
  },
  cardTitle: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.bodyBold,
    color: Colors.brand.primary,
    letterSpacing: 1.5,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[3],
  },
  cardKey: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
  },
  cardValue: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'right',
    textTransform: 'capitalize',
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.background.overlay,
  },
  note: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing[2],
  },
  footer: {
    paddingHorizontal: Spacing[6],
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryButtonDisabled: { opacity: 0.6 },
  primaryButtonText: {
    fontSize: Typography.size.md,
    fontFamily: Typography.family.bodyBold,
    color: Colors.text.inverse,
  },
});
