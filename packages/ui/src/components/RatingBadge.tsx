import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Radius, Spacing } from '../tokens.js';

interface RatingBadgeProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  isUserRating?: boolean;
}

function getRatingColor(rating: number): string {
  if (rating >= 8.0) return Colors.rating.excellent;
  if (rating >= 6.5) return Colors.rating.good;
  if (rating >= 5.0) return Colors.rating.average;
  return Colors.rating.poor;
}

export function RatingBadge({ rating, size = 'md', isUserRating = false }: RatingBadgeProps) {
  const color = isUserRating ? Colors.brand.primary : getRatingColor(rating);
  const displayRating = rating.toFixed(1);

  const containerStyle = [
    styles.container,
    size === 'sm' && styles.sm,
    size === 'lg' && styles.lg,
    { borderColor: color },
  ];

  const textStyle = [
    styles.text,
    size === 'sm' && styles.textSm,
    size === 'lg' && styles.textLg,
    { color },
  ];

  const labelStyle = [
    styles.label,
    size === 'sm' && styles.labelSm,
    { color: Colors.text.tertiary },
  ];

  return (
    <View style={containerStyle}>
      {isUserRating && (
        <Text style={labelStyle}>YOU</Text>
      )}
      <Text style={textStyle}>{displayRating}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    backgroundColor: Colors.background.elevated,
  },
  sm: {
    paddingHorizontal: Spacing[1],
    paddingVertical: 2,
  },
  lg: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  text: {
    fontFamily: Typography.family.bodyBold,
    fontSize: Typography.size.sm,
    letterSpacing: Typography.tracking.tight,
  },
  textSm: {
    fontSize: Typography.size.xs,
  },
  textLg: {
    fontSize: Typography.size.lg,
  },
  label: {
    fontFamily: Typography.family.bodyBold,
    fontSize: 8,
    letterSpacing: Typography.tracking.wider,
  },
  labelSm: {
    fontSize: 7,
  },
});
