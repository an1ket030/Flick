import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../tokens.js';

type GenreState = 'neutral' | 'love' | 'hate';

interface GenreChipProps {
  label: string;
  state?: GenreState;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export function GenreChip({
  label,
  state = 'neutral',
  onPress,
  style,
  disabled,
}: GenreChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      disabled={disabled || !onPress}
      style={[
        styles.chip,
        state === 'love' && styles.love,
        state === 'hate' && styles.hate,
        style,
      ]}
    >
      {state === 'love' && <Text style={styles.stateIcon}>♥ </Text>}
      {state === 'hate' && <Text style={[styles.stateIcon, styles.hateIcon]}>✕ </Text>}
      <Text
        style={[
          styles.label,
          state === 'love' && styles.loveLabel,
          state === 'hate' && styles.hateLabel,
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
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    backgroundColor: Colors.genre.neutral,
    borderWidth: 1,
    borderColor: Colors.background.overlay,
  },
  love: {
    backgroundColor: 'rgba(245, 197, 24, 0.15)',
    borderColor: Colors.genre.love,
  },
  hate: {
    backgroundColor: Colors.genre.hate,
    borderColor: '#4A1A1A',
  },
  stateIcon: {
    fontSize: 10,
    color: Colors.brand.primary,
  },
  hateIcon: {
    color: Colors.status.error,
  },
  label: {
    fontFamily: Typography.family.bodySemibold,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
  loveLabel: { color: Colors.brand.primary },
  hateLabel: { color: Colors.status.error },
});
