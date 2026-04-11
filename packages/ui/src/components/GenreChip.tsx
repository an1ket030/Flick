import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Radius, Spacing } from '../tokens';

type GenreState = 'neutral' | 'love' | 'hate';

interface GenreChipProps {
  label: string;
  state?: GenreState;
  onPress?: () => void;
  style?: ViewStyle;
}

export function GenreChip({ label, state = 'neutral', onPress, style }: GenreChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      disabled={!onPress}
      style={[
        styles.chip,
        state === 'love' && styles.chipLove,
        state === 'hate' && styles.chipHate,
        style,
      ]}
    >
      {state === 'love' && <Text style={styles.icon}>+</Text>}
      {state === 'hate' && <Text style={[styles.icon, styles.iconHate]}>−</Text>}
      <Text
        style={[
          styles.label,
          state === 'love' && styles.labelLove,
          state === 'hate' && styles.labelHate,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.sm,
    backgroundColor: Colors.background.surface,
    borderWidth: 1,
    borderColor: Colors.background.overlay,
    gap: 4,
  },
  chipLove: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  chipHate: {
    backgroundColor: Colors.genre.hate,
    borderColor: '#5A2020',
  },
  icon: {
    fontSize: 14,
    color: Colors.text.inverse,
    fontFamily: Typography.family.bodyBold,
    lineHeight: 16,
  },
  iconHate: {
    color: '#EF4444',
  },
  label: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.text.secondary,
    letterSpacing: 0.2,
  },
  labelLove: {
    color: Colors.text.inverse,
    fontFamily: Typography.family.bodySemibold,
  },
  labelHate: {
    color: '#EF4444',
  },
});
