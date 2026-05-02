/**
 * Onboarding Step 4 — Genre Loves & Hates
 * 24 genres, 3-state cycle: neutral → love (orange) → hate (red/muted) → neutral
 * Require at least 1 love to proceed
 * Persisted to taste_profiles.genre_loves and taste_profiles.genre_hates
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/auth';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';
import OnboardingProgress from '../../components/OnboardingProgress';

// TMDb genre IDs
const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
  { id: 10759, name: 'Action & Adv.' },
  { id: 10762, name: 'Kids' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
];

type GenreState = 'neutral' | 'love' | 'hate';

function cycle(state: GenreState): GenreState {
  if (state === 'neutral') return 'love';
  if (state === 'love') return 'hate';
  return 'neutral';
}

export default function OnboardingStep4() {
  const { user } = useAuthStore();
  const [states, setStates] = useState<Record<number, GenreState>>({});
  const [loading, setLoading] = useState(false);

  const toggle = (id: number) => {
    setStates(prev => ({ ...prev, [id]: cycle(prev[id] ?? 'neutral') }));
  };

  const loves = Object.entries(states).filter(([, s]) => s === 'love').map(([id]) => Number(id));
  const hates = Object.entries(states).filter(([, s]) => s === 'hate').map(([id]) => Number(id));
  const canContinue = loves.length >= 1;

  const handleNext = async () => {
    if (!canContinue) return;
    setLoading(true);
    try {
      await supabase.from('taste_profiles').upsert(
        { user_id: user!.id, genre_loves: loves, genre_hates: hates },
        { onConflict: 'user_id' }
      );
      router.push('/onboarding/step5');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingProgress currentStep={4} />

      <View style={styles.header}>
        <Text style={styles.stepLabel}>GENRES</Text>
        <Text style={styles.title}>Loves & hates.</Text>
        <Text style={styles.subtitle}>
          Tap once to love, again to hate, once more to clear. Pick at least 1 love.
        </Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.brand.primary }]} />
            <Text style={styles.legendText}>Love</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.status.error }]} />
            <Text style={styles.legendText}>Skip</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.background.overlay }]} />
            <Text style={styles.legendText}>Neutral</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {GENRES.map((genre) => {
          const state = states[genre.id] ?? 'neutral';
          return (
            <TouchableOpacity
              key={genre.id}
              onPress={() => toggle(genre.id)}
              activeOpacity={0.75}
              style={[
                styles.chip,
                state === 'love' && styles.chipLove,
                state === 'hate' && styles.chipHate,
              ]}
            >
              {state === 'love' && <Text style={styles.chipIcon}>♥ </Text>}
              {state === 'hate' && <Text style={styles.chipIconHate}>✕ </Text>}
              <Text style={[
                styles.chipText,
                state === 'love' && styles.chipTextLove,
                state === 'hate' && styles.chipTextHate,
              ]}>
                {genre.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.countText}>
          {loves.length} loved · {hates.length} skipped
        </Text>
        <TouchableOpacity
          style={[styles.nextButton, (!canContinue || loading) && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!canContinue || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={Colors.text.inverse} />
            : <Text style={styles.nextButtonText}>
                {canContinue ? 'Continue' : 'Love at least 1 genre'}
              </Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.base },
  header: {
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[6],
    paddingBottom: Spacing[2],
  },
  stepLabel: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.brand.primary,
    letterSpacing: 2,
    marginBottom: Spacing[2],
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: Spacing[3],
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing[4],
    marginBottom: Spacing[2],
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
  },
  scroll: { flex: 1 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[4],
    gap: Spacing[2],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.background.surface,
    borderWidth: 1.5,
    borderColor: Colors.background.overlay,
  },
  chipLove: {
    borderColor: Colors.brand.primary,
    backgroundColor: 'rgba(255,107,44,0.12)',
  },
  chipHate: {
    borderColor: 'rgba(239,68,68,0.4)',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  chipIcon: {
    fontSize: 12,
    color: Colors.brand.primary,
    fontFamily: Typography.family.bodyBold,
  },
  chipIconHate: {
    fontSize: 12,
    color: Colors.status.error,
    fontFamily: Typography.family.bodyBold,
  },
  chipText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.text.secondary,
  },
  chipTextLove: { color: Colors.brand.primary },
  chipTextHate: { color: Colors.status.error },
  footer: {
    paddingHorizontal: Spacing[6],
    paddingBottom: 40,
    gap: Spacing[2],
  },
  countText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  nextButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  nextButtonDisabled: { opacity: 0.5 },
  nextButtonText: {
    fontSize: Typography.size.md,
    fontFamily: Typography.family.bodyBold,
    color: Colors.text.inverse,
  },
});
