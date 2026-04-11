import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Radius, Shadows, PosterRatio, posterUrl } from '../tokens.js';
import { SkeletonLoader } from './SkeletonLoader.js';

interface FilmPosterProps {
  posterPath: string | null;
  width: number;
  borderRadius?: number;
  style?: ViewStyle;
  priority?: 'high' | 'normal' | 'low';
}

export function FilmPoster({
  posterPath,
  width,
  borderRadius = Radius.md,
  style,
  priority = 'normal',
}: FilmPosterProps) {
  const height = width / PosterRatio;
  const url = posterUrl(posterPath, width < 150 ? 'w185' : 'w342');

  if (!url) {
    return (
      <View
        style={[
          styles.placeholder,
          { width, height, borderRadius },
          style,
        ]}
      />
    );
  }

  return (
    <View style={[{ width, height, borderRadius, overflow: 'hidden' }, Shadows.sm, style]}>
      <Image
        source={{ uri: url }}
        style={{ width, height }}
        contentFit="cover"
        priority={priority}
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        transition={200}
      />
    </View>
  );
}

// Skeleton version for loading state
export function FilmPosterSkeleton({ width, borderRadius = Radius.md, style }: {
  width: number;
  borderRadius?: number;
  style?: ViewStyle;
}) {
  const height = width / PosterRatio;
  return <SkeletonLoader width={width} height={height} borderRadius={borderRadius} style={style} />;
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: Colors.background.overlay,
  },
});
