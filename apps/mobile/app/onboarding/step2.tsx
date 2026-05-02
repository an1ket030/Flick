/**
 * Onboarding Step 2 — Region Comfort
 * 10 region tiles, scrollable grid, all selected by default (user deselects)
 * Persisted to taste_profiles.region_prefs
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

const REGIONS = [
  { id: 'hollywood', label: 'Hollywood', flag: '🇺🇸', description: 'US & Canadian cinema' },
  { id: 'bollywood', label: 'Bollywood', flag: '🇮🇳', description: 'Indian commercial cinema' },
  { id: 'art_house_india', label: 'Parallel Cinema', flag: '🎭', description: 'Indian art house & regional' },
  { id: 'european', label: 'European', flag: '🇪🇺', description: 'French, Italian, German…' },
  { id: 'east_asian', label: 'East Asian', flag: '🇯🇵', description: 'Japan, Korea, China' },
  { id: 'south_american', label: 'South American', flag: '🌎', description: 'Brazil, Argentina, Mexico' },
  { id: 'middle_eastern', label: 'Middle Eastern', flag: '🌙', description: 'Iran, Turkey, Arab cinema' },
  { id: 'african', label: 'African', flag: '🌍', description: 'African cinema & Nollywood' },
  { id: 'scandinavian', label: 'Scandinavian', flag: '🇸🇪', description: 'Nordic noir & drama' },
  { id: 'australian', label: 'Oceanian', flag: '🇦🇺', description: 'Australia & New Zealand' },
];

export default function OnboardingStep2() {
  const { user } = useAuthStore();
  // All selected by default — user deselects unwanted
  const [selected, setSelected] = useState<string[]>(REGIONS.map(r => r.id));
  const [loading, setLoading] = useState(false);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      await supabase
        .from('taste_profiles')
        .upsert({ user_id: user!.id, region_prefs: selected }, { onConflict: 'user_id' });
      router.push('/onboarding/step3');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingProgress currentStep={2} />

      <View style={styles.header}>
        <Text style={styles.stepLabel}>REGION</Text>
        <Text style={styles.title}>Where do your films come from?</Text>
        <Text style={styles.subtitle}>
          All regions are selected. Deselect any you'd rather skip.
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {REGIONS.map((region) => {
          const isSelected = selected.includes(region.id);
          return (
            <TouchableOpacity
              key={region.id}
              style={[styles.tile, isSelected && styles.tileSelected]}
              onPress={() => toggle(region.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.tileFlag}>{region.flag}</Text>
              <Text style={[styles.tileLabel, isSelected && styles.tileLabelSelected]}>
                {region.label}
              </Text>
              <Text style={styles.tileDesc}>{region.description}</Text>
              {!isSelected && <View style={styles.unselectedOverlay} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.selectedCount}>
          {selected.length} of {REGIONS.length} regions selected
        </Text>
        <TouchableOpacity
          style={[styles.nextButton, loading && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={Colors.text.inverse} />
            : <Text style={styles.nextButtonText}>Continue</Text>
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
    paddingBottom: Spacing[4],
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
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  scroll: { flex: 1 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[4],
    gap: Spacing[3],
    paddingBottom: Spacing[4],
  },
  tile: {
    width: '47%',
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.xl,
    padding: Spacing[4],
    borderWidth: 1.5,
    borderColor: Colors.brand.primary,
    minHeight: 100,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  tileSelected: {
    borderColor: Colors.brand.primary,
    backgroundColor: 'rgba(255,107,44,0.07)',
  },
  tileFlag: { fontSize: 24, marginBottom: Spacing[2] },
  tileLabel: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.headingSemi,
    color: Colors.brand.primary,
    marginBottom: 2,
  },
  tileLabelSelected: {
    color: Colors.brand.primary,
  },
  tileDesc: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
    lineHeight: 14,
  },
  unselectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18,18,18,0.6)',
    borderRadius: Radius.xl,
  },
  footer: {
    paddingHorizontal: Spacing[6],
    paddingBottom: 40,
    gap: Spacing[2],
  },
  selectedCount: {
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
  nextButtonDisabled: { opacity: 0.6 },
  nextButtonText: {
    fontSize: Typography.size.md,
    fontFamily: Typography.family.bodyBold,
    color: Colors.text.inverse,
  },
});
