/**
 * Blind Spot Finder Screen — Phase 3 Sprint 3.2
 *
 * Shows 12 highly rated films missing from the user's library.
 * Features 1-tap watchlist addition.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth';
import { Colors, Typography, Spacing, Radius, backdropUrl, posterUrl } from '@flick/ui';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://flick-ysai.onrender.com';

interface BlindSpotFilm {
  id: string;
  tmdb_id: number;
  title: string;
  release_year: number;
  poster_path: string | null;
  backdrop_path: string | null;
  tmdb_rating: number;
  genres: string[];
}

export default function BlindSpotsScreen() {
  const { session } = useAuthStore();
  const [films, setFilms] = useState<BlindSpotFilm[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const fetchBlindSpots = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/recommendations/blind-spots`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setFilms(json.data ?? []);
      }
    } catch (err) {
      console.error('[BlindSpots] fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => { fetchBlindSpots(); }, [fetchBlindSpots]);

  const handleAddWatchlist = async (film: BlindSpotFilm) => {
    if (!session?.access_token || addedIds.has(film.id)) return;
    
    // Optimistic UI update
    setAddedIds(prev => new Set(prev).add(film.id));

    try {
      const res = await fetch(`${API_BASE_URL}/api/recommendations/daily-pick/action`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        // We reuse the existing daily-pick action endpoint for simplicity which handles library inserts
        body: JSON.stringify({
          film_id: film.id,
          action: 'added_watchlist',
        }),
      });

      if (!res.ok) throw new Error('Failed to add');
    } catch (err) {
      // Revert optimism
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(film.id);
        return next;
      });
    }
  };

  const renderFilm = ({ item, index }: { item: BlindSpotFilm, index: number }) => {
    const isAdded = addedIds.has(item.id);
    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHitbox}
          activeOpacity={0.9}
          onPress={() => router.push(`/film/${item.tmdb_id}`)}
        >
          <Image
            source={{ uri: backdropUrl(item.backdrop_path, 'w780') || posterUrl(item.poster_path, 'w500') }}
            style={styles.backdrop}
            contentFit="cover"
          />
          <View style={styles.cardOverlay} />
          <View style={styles.numberBadge}>
            <Text style={styles.numberText}>{index + 1}</Text>
          </View>
          
          <View style={styles.cardContent}>
            <View>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.meta}>
                {item.release_year} · ★ {item.tmdb_rating.toFixed(1)}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.actionBtn, isAdded && styles.actionBtnAdded]}
              activeOpacity={0.8}
              onPress={() => handleAddWatchlist(item)}
            >
              <Text style={[styles.actionBtnText, isAdded && styles.actionBtnTextAdded]}>
                {isAdded ? 'Planned' : '+ Watchlist'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={['top']}>
        <ActivityIndicator color={Colors.brand.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerTitle}>Blind Spot Finder</Text>
          <Text style={styles.headerSub}>Highly rated films you haven't logged</Text>
        </View>
      </View>

      <FlatList
        data={films}
        keyExtractor={(item) => item.id}
        renderItem={renderFilm}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.base },
  center: { flex: 1, backgroundColor: Colors.background.base, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[6],
  },
  backBtn: { padding: Spacing[2], marginRight: Spacing[2], marginLeft: -Spacing[2] },
  backText: { fontSize: 24, color: Colors.text.primary },
  headerTextGroup: { flex: 1 },
  headerTitle: { fontSize: Typography.size.xl, fontFamily: Typography.family.headingSemi, color: Colors.text.primary },
  headerSub: { fontSize: Typography.size.sm, fontFamily: Typography.family.body, color: Colors.text.tertiary, marginTop: 2 },
  
  list: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[10], gap: Spacing[5] },
  
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    height: 180,
    borderWidth: 1,
    borderColor: Colors.background.overlay,
  },
  cardHitbox: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  numberBadge: {
    position: 'absolute',
    top: Spacing[3],
    left: Spacing[3],
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  numberText: { color: Colors.text.inverse, fontSize: Typography.size.xs, fontFamily: Typography.family.bodyBold },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing[4],
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    // Gradient mock via solid bg for easy read
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  title: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.family.headingSemi,
    color: '#FFF',
    marginBottom: 4,
  },
  meta: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.bodyMedium,
    color: 'rgba(255,255,255,0.8)',
  },
  actionBtn: {
    backgroundColor: Colors.brand.primary,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    borderRadius: Radius.full,
    marginLeft: Spacing[4],
  },
  actionBtnAdded: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionBtnText: {
    color: '#000',
    fontFamily: Typography.family.bodyBold,
    fontSize: Typography.size.sm,
  },
  actionBtnTextAdded: {
    color: '#FFF',
  },
});
