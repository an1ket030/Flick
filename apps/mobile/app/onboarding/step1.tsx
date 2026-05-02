/**
 * Onboarding Step 1 — Format Preferences
 * 2×2 grid: Live Action | Animation | Anime | All
 * Multi-select → persisted to taste_profiles.format_prefs
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/auth';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';
import OnboardingProgress from '../../components/OnboardingProgress';

const FORMAT_OPTIONS = [
  { id: 'live_action', label: 'Live Action', emoji: '🎬', description: 'Real actors, real sets' },
  { id: 'animation', label: 'Animation', emoji: '🎨', description: 'Pixar, Studio Ghibli, Disney' },
  { id: 'anime', label: 'Anime', emoji: '⛩', description: 'Japanese animation' },
  { id: 'all', label: 'All Formats', emoji: '🌍', description: 'I watch everything' },
];

export default function OnboardingStep1() {
  const { user } = useAuthStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = (id: string) => {
    if (id === 'all') {
      setSelected(prev => prev.includes('all') ? [] : ['all']);
      return;
    }
    setSelected(prev => {
      const withoutAll = prev.filter(p => p !== 'all');
      return withoutAll.includes(id)
        ? withoutAll.filter(p => p !== id)
        : [...withoutAll, id];
    });
  };

  const handleNext = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      const formatPrefs = selected.includes('all') ? ['live_action', 'animation', 'anime'] : selected;
      await supabase
        .from('taste_profiles')
        .upsert({ user_id: user!.id, format_prefs: formatPrefs }, { onConflict: 'user_id' });
      router.push('/onboarding/step2');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingProgress currentStep={1} />

      <View style={styles.content}>
        <Text style={styles.stepLabel}>FORMAT</Text>
        <Text style={styles.title}>What do you like to watch?</Text>
        <Text style={styles.subtitle}>
          Select all that apply. This shapes your recommendations.
        </Text>

        <View style={styles.grid}>
          {FORMAT_OPTIONS.map((opt) => {
            const isSelected = selected.includes(opt.id);
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => toggle(opt.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.cardEmoji}>{opt.emoji}</Text>
                <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                  {opt.label}
                </Text>
                <Text style={styles.cardDescription}>{opt.description}</Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, (selected.length === 0 || loading) && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={selected.length === 0 || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={Colors.text.inverse} />
            : <Text style={styles.nextButtonText}>Continue</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/onboarding/step2')}
          activeOpacity={0.7}
          style={styles.skipBtn}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.base },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[8],
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
    lineHeight: 36,
  },
  subtitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
    marginBottom: Spacing[8],
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[4],
  },
  card: {
    width: '47%',
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.xl,
    padding: Spacing[5],
    borderWidth: 1.5,
    borderColor: Colors.background.overlay,
    minHeight: 130,
    justifyContent: 'flex-end',
  },
  cardSelected: {
    borderColor: Colors.brand.primary,
    backgroundColor: 'rgba(255,107,44,0.08)',
  },
  cardEmoji: {
    fontSize: 28,
    marginBottom: Spacing[3],
  },
  cardLabel: {
    fontSize: Typography.size.md,
    fontFamily: Typography.family.headingSemi,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  cardLabelSelected: {
    color: Colors.brand.primary,
  },
  cardDescription: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
    lineHeight: 16,
  },
  checkBadge: {
    position: 'absolute',
    top: Spacing[3],
    right: Spacing[3],
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    fontSize: 12,
    color: Colors.text.inverse,
    fontFamily: Typography.family.bodyBold,
  },
  footer: {
    paddingHorizontal: Spacing[6],
    paddingBottom: 40,
    gap: Spacing[3],
  },
  nextButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  nextButtonDisabled: { opacity: 0.4 },
  nextButtonText: {
    fontSize: Typography.size.md,
    fontFamily: Typography.family.bodyBold,
    color: Colors.text.inverse,
  },
  skipBtn: { alignItems: 'center', paddingVertical: Spacing[2] },
  skipText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
  },
});
