import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Typography, Spacing, Radius } from '../tokens.js';

const PLATFORM_COLORS: Record<string, string> = {
  'Netflix':        '#E50914',
  'Amazon Prime Video': '#00A8E1',
  'Disney Plus':    '#113CCF',
  'Apple TV Plus':  '#555555',
  'Hulu':           '#1CE783',
  'HBO Max':        '#6A33C2',
  'Max':            '#6A33C2',
  'Peacock':        '#000000',
  'Paramount Plus': '#0064FF',
  'Mubi':           '#001F37',
};

interface PlatformBadgeProps {
  platformName: string;
  logoPath?: string | null;
  streamType?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function PlatformBadge({
  platformName,
  logoPath,
  streamType,
  size = 'md',
  style,
}: PlatformBadgeProps) {
  const logoSize = size === 'sm' ? 20 : 28;
  const logoUrl = logoPath
    ? `https://image.tmdb.org/t/p/original${logoPath}`
    : null;

  const typeLabel = streamType === 'rent'
    ? 'RENT'
    : streamType === 'buy'
      ? 'BUY'
      : streamType === 'free'
        ? 'FREE'
        : null;

  return (
    <View style={[styles.container, size === 'sm' && styles.containerSm, style]}>
      {logoUrl ? (
        <Image
          source={{ uri: logoUrl }}
          style={{ width: logoSize, height: logoSize, borderRadius: Radius.sm }}
          contentFit="contain"
        />
      ) : (
        <View
          style={[
            styles.fallbackLogo,
            { width: logoSize, height: logoSize },
            { backgroundColor: PLATFORM_COLORS[platformName] ?? Colors.background.elevated },
          ]}
        >
          <Text style={styles.fallbackText}>{platformName[0]}</Text>
        </View>
      )}

      <View>
        <Text
          style={[styles.name, size === 'sm' && styles.nameSm]}
          numberOfLines={1}
        >
          {platformName}
        </Text>
        {typeLabel && (
          <Text style={styles.type}>{typeLabel}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.background.elevated,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.lg,
  },
  containerSm: {
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
  },
  fallbackLogo: {
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontFamily: Typography.family.bodyBold,
    fontSize: 10,
    color: Colors.text.primary,
  },
  name: {
    fontFamily: Typography.family.bodySemibold,
    fontSize: Typography.size.sm,
    color: Colors.text.primary,
    maxWidth: 100,
  },
  nameSm: { fontSize: Typography.size.xs },
  type: {
    fontFamily: Typography.family.bodyBold,
    fontSize: 9,
    color: Colors.text.tertiary,
    letterSpacing: Typography.tracking.wider,
  },
});
