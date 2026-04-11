import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Typography, Radius, Spacing, PosterRatio, posterUrl } from '../tokens';
import { RatingBadge } from './RatingBadge';

interface FilmCardProps {
  tmdbId: number;
  title: string;
  year?: number;
  posterPath: string | null;
  rating?: number;
  onPress?: () => void;
  style?: ViewStyle;
  orientation?: 'vertical' | 'horizontal';
}

export function FilmCard({
  tmdbId,
  title,
  year,
  posterPath,
  rating,
  onPress,
  style,
  orientation = 'vertical',
}: FilmCardProps) {
  const imageUrl = posterUrl(posterPath, 'w342');

  if (orientation === 'horizontal') {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[styles.horizontal, style]}
      >
        <View style={styles.horizontalPoster}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.posterPlaceholder]}>
              <Text style={styles.placeholderText}>{title.charAt(0)}</Text>
            </View>
          )}
        </View>
        <View style={styles.horizontalInfo}>
          <Text style={styles.horizontalTitle} numberOfLines={2}>{title}</Text>
          {year && <Text style={styles.horizontalYear}>{year}</Text>}
          {rating !== undefined && (
            <RatingBadge rating={rating} size="sm" />
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Vertical (default) — poster card used in horizontal scroll rows
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.vertical, style]}
    >
      <View style={styles.posterContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.posterPlaceholder]}>
            <Text style={styles.placeholderText}>{title.charAt(0)}</Text>
          </View>
        )}
        {rating !== undefined && (
          <View style={styles.ratingOverlay}>
            <RatingBadge rating={rating} size="sm" />
          </View>
        )}
      </View>
      <Text style={styles.verticalTitle} numberOfLines={2}>{title}</Text>
      {year && <Text style={styles.verticalYear}>{year}</Text>}
    </TouchableOpacity>
  );
}

const POSTER_WIDTH = 120;
const POSTER_HEIGHT = POSTER_WIDTH / PosterRatio;

const styles = StyleSheet.create({
  // ── Vertical Card ──
  vertical: {
    width: POSTER_WIDTH,
  },
  posterContainer: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.background.surface,
  },
  posterPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.elevated,
  },
  placeholderText: {
    fontSize: Typography.size['3xl'],
    fontFamily: Typography.family.heading,
    color: Colors.text.tertiary,
  },
  ratingOverlay: {
    position: 'absolute',
    bottom: Spacing[2],
    right: Spacing[2],
  },
  verticalTitle: {
    marginTop: Spacing[2],
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.text.primary,
    lineHeight: 18,
  },
  verticalYear: {
    marginTop: 2,
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
  },

  // ── Horizontal Card ──
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    gap: Spacing[3],
    padding: Spacing[3],
  },
  horizontalPoster: {
    width: 56,
    height: 84,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.background.elevated,
  },
  horizontalInfo: {
    flex: 1,
    gap: 4,
  },
  horizontalTitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  horizontalYear: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
  },
});
