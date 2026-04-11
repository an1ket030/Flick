import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Radius, Spacing } from '../tokens';

interface RatingBadgeProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  source?: 'tmdb' | 'flick' | 'user' | 'predicted';
}

function getRatingColor(rating: number): string {
  if (rating >= 8.0) return Colors.rating.excellent;
  if (rating >= 6.5) return Colors.rating.good;
  if (rating >= 5.0) return Colors.rating.average;
  return Colors.rating.poor;
}

export function RatingBadge({ rating, size = 'md', source = 'tmdb' }: RatingBadgeProps) {
  const color = source === 'user' || source === 'predicted'
    ? Colors.brand.primary
    : getRatingColor(rating);

  const formattedRating = rating.toFixed(1);

  return (
    <View style={[styles.container, styles[`container_${size}`], { borderColor: `${color}40` }]}>
      <Text style={[styles.value, styles[`value_${size}`], { color }]}>
        {formattedRating}
      </Text>
      {size !== 'sm' && (
        <Text style={styles.sourceLabel}>
          {source === 'tmdb' ? 'TMDb' : source === 'predicted' ? 'Predicted' : source === 'flick' ? 'Flick' : 'You'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    borderWidth: 1,
    backgroundColor: Colors.background.surface,
  },
  container_sm: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    minWidth: 36,
  },
  container_md: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    minWidth: 52,
  },
  container_lg: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    minWidth: 72,
  },
  value: {
    fontFamily: Typography.family.heading,
    letterSpacing: -0.5,
  },
  value_sm: {
    fontSize: Typography.size.sm,
  },
  value_md: {
    fontSize: Typography.size.md,
  },
  value_lg: {
    fontSize: Typography.size.xl,
  },
  sourceLabel: {
    fontSize: 9,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.text.tertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 1,
  },
});
