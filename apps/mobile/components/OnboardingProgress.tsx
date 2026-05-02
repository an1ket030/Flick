import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';

interface Props {
  currentStep: number; // 1–5
  totalSteps?: number;
}

export default function OnboardingProgress({ currentStep, totalSteps = 5 }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;
          return (
            <View
              key={i}
              style={[
                styles.segment,
                isCompleted && styles.segmentCompleted,
                isActive && styles.segmentActive,
              ]}
            />
          );
        })}
      </View>
      <Text style={styles.label}>
        Step {currentStep} of {totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[6],
    paddingTop: 16,
    gap: Spacing[2],
  },
  track: {
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  segmentCompleted: {
    backgroundColor: Colors.brand.primary,
    opacity: 0.5,
  },
  segmentActive: {
    backgroundColor: Colors.brand.primary,
    opacity: 1,
  },
  label: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
    letterSpacing: 0.3,
  },
});
