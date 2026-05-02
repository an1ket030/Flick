/**
 * Onboarding Step 3 — Pace & Tone
 * Two custom sliders using @miblanchard/react-native-slider
 * Pace: 0 (slow burn) → 10 (fast paced)
 * Tone: 0 (dark & heavy) → 10 (light & fun)
 * Persisted to taste_profiles.pace_slider and taste_profiles.tone_slider
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
import { Slider } from '@miblanchard/react-native-slider';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/auth';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';
import OnboardingProgress from '../../components/OnboardingProgress';

function SliderField({
  label,
  leftLabel,
  rightLabel,
  value,
  onChange,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={sliderStyles.container}>
      <Text style={sliderStyles.label}>{label}</Text>
      <View style={sliderStyles.row}>
        <Text style={sliderStyles.endLabel}>{leftLabel}</Text>
        <View style={sliderStyles.sliderWrap}>
          <Slider
            value={value}
            onValueChange={(vals) => onChange(Array.isArray(vals) ? vals[0]! : vals)}
            minimumValue={0}
            maximumValue={10}
            step={1}
            minimumTrackTintColor={Colors.brand.primary}
            maximumTrackTintColor="rgba(255,255,255,0.12)"
            thumbTintColor={Colors.brand.primary}
          />
        </View>
        <Text style={sliderStyles.endLabel}>{rightLabel}</Text>
      </View>
      <View style={sliderStyles.valueRow}>
        <View style={sliderStyles.valueBadge}>
          <Text style={sliderStyles.valueText}>{value}</Text>
        </View>
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  container: { marginBottom: Spacing[8] },
  label: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.text.secondary,
    letterSpacing: 0.3,
    marginBottom: Spacing[4],
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  endLabel: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
    width: 60,
    textAlign: 'center',
    lineHeight: 16,
  },
  sliderWrap: { flex: 1 },
  valueRow: { alignItems: 'center', marginTop: Spacing[2] },
  valueBadge: {
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.full,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodyBold,
    color: Colors.text.inverse,
  },
});

export default function OnboardingStep3() {
  const { user } = useAuthStore();
  const [pace, setPace] = useState(5);
  const [tone, setTone] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    try {
      await supabase.from('taste_profiles').upsert(
        { user_id: user!.id, pace_slider: pace, tone_slider: tone },
        { onConflict: 'user_id' }
      );
      router.push('/onboarding/step4');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingProgress currentStep={3} />

      <View style={styles.content}>
        <Text style={styles.stepLabel}>PACE & TONE</Text>
        <Text style={styles.title}>How do you like your films?</Text>
        <Text style={styles.subtitle}>
          Drag each slider to match your mood. You can always change this later.
        </Text>

        <SliderField
          label="PACE — How fast should the story move?"
          leftLabel="Slow burn"
          rightLabel="Fast paced"
          value={pace}
          onChange={setPace}
        />

        <SliderField
          label="TONE — What emotional weight works for you?"
          leftLabel="Dark & heavy"
          rightLabel="Light & fun"
          value={tone}
          onChange={setTone}
        />
      </View>

      <View style={styles.footer}>
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
        <TouchableOpacity
          onPress={() => router.push('/onboarding/step4')}
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
    marginBottom: Spacing[10],
    lineHeight: 24,
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
  nextButtonDisabled: { opacity: 0.6 },
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
