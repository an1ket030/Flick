import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import type { Film } from '@flick/types';
import { Colors, Typography, Spacing, Radius, Shadows } from '../tokens.js';
import { FilmPoster, FilmPosterSkeleton } from './FilmPoster.js';
import { RatingBadge } from './RatingBadge.js';

const POSTER_WIDTH = 72;

interface FilmCardProps {
  film: Film;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  showRating?: boolean;
  userRating?: number | null;
  statusColor?: string;
  rightSlot?: React.ReactNode;
}

export function FilmCard({
  film,
  onPress,
  onLongPress,
  style,
  showRating = true,
  userRating,
  statusColor,
  rightSlot,
}: FilmCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}
      style={[styles.container, style]}
    >
      {/* Status bar on left edge */}
      {statusColor && (
        <View style={[styles.statusBar, { backgroundColor: statusColor }]} />
      )}

      <FilmPoster posterPath={film.poster_path} width={POSTER_WIDTH} />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{film.title}</Text>

        <Text style={styles.meta}>
          {film.release_year ?? '—'}
          {film.original_language && film.original_language !== 'en'
            ? ` · ${film.original_language.toUpperCase()}`
            : ''}
          {film.runtime_minutes ? ` · ${film.runtime_minutes}m` : ''}
        </Text>

        {showRating && (
          <View style={styles.ratings}>
            {userRating != null && (
              <RatingBadge rating={userRating} size="sm" isUserRating />
            )}
            {film.tmdb_rating != null && film.tmdb_rating > 0 && (
              <RatingBadge rating={film.tmdb_rating} size="sm" />
            )}
          </View>
        )}
      </View>

      {rightSlot && <View style={styles.rightSlot}>{rightSlot}</View>}
    </TouchableOpacity>
  );
}

export function FilmCardSkeleton() {
  return (
    <View style={styles.skeleton}>
      <FilmPosterSkeleton width={POSTER_WIDTH} />
      <View style={styles.skeletonInfo}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonMeta} />
        <View style={styles.skeletonRating} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.lg,
    padding: Spacing[3],
    gap: Spacing[3],
    ...Shadows.sm,
  },
  statusBar: {
    position: 'absolute',
    left: 0,
    top: Radius.lg,
    bottom: Radius.lg,
    width: 3,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  info: {
    flex: 1,
    gap: Spacing[1],
  },
  title: {
    fontFamily: Typography.family.bodySemibold,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    lineHeight: Typography.size.base * Typography.lineHeight.tight,
  },
  meta: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
  ratings: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginTop: Spacing[1],
  },
  rightSlot: {
    alignItems: 'flex-end',
  },
  // Skeleton styles
  skeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.lg,
    padding: Spacing[3],
    gap: Spacing[3],
  },
  skeletonInfo: { flex: 1, gap: Spacing[2] },
  skeletonTitle: { height: 16, borderRadius: Radius.sm, backgroundColor: Colors.background.overlay, width: '80%' },
  skeletonMeta: { height: 12, borderRadius: Radius.sm, backgroundColor: Colors.background.overlay, width: '50%' },
  skeletonRating: { height: 20, borderRadius: Radius.sm, backgroundColor: Colors.background.overlay, width: 40 },
});
