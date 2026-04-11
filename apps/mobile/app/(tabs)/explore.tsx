import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors, Typography, Spacing, Radius, posterUrl, backdropUrl } from '@flick/ui';
import { RatingBadge } from '@flick/ui';

interface Film {
  id: string;
  tmdb_id: number;
  title: string;
  release_year: number;
  poster_url: string | null;
  backdrop_url: string | null;
  tmdb_rating: number;
  genres: number[];
}

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western',
};

// Featured decades
const DECADES = ['2020s', '2010s', '2000s', '1990s', '1980s', 'Classic'];

export default function ExploreScreen() {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDecade, setActiveDecade] = useState<string>('All');

  useEffect(() => {
    fetchExplore();
  }, [activeDecade]);

  const fetchExplore = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('films')
        .select('id, tmdb_id, title, release_year, poster_url, backdrop_url, tmdb_rating, genres')
        .gte('tmdb_vote_count', 10000)
        .order('tmdb_rating', { ascending: false });

      if (activeDecade === '2020s') {
        query = query.gte('release_year', 2020);
      } else if (activeDecade === '2010s') {
        query = query.gte('release_year', 2010).lt('release_year', 2020);
      } else if (activeDecade === '2000s') {
        query = query.gte('release_year', 2000).lt('release_year', 2010);
      } else if (activeDecade === '1990s') {
        query = query.gte('release_year', 1990).lt('release_year', 2000);
      } else if (activeDecade === '1980s') {
        query = query.gte('release_year', 1980).lt('release_year', 1990);
      } else if (activeDecade === 'Classic') {
        query = query.lt('release_year', 1980);
      }

      const { data } = await query.limit(40);
      if (data) setFilms(data);
    } catch (err) {
      console.error('Explore fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Explore</Text>
        <Text style={styles.screenSubtitle}>Discover films from every era.</Text>
      </View>

      {/* Decade filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {['All', ...DECADES].map((decade) => (
          <TouchableOpacity
            key={decade}
            style={[styles.filterPill, activeDecade === decade && styles.filterPillActive]}
            onPress={() => setActiveDecade(decade)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterPillText, activeDecade === decade && styles.filterPillTextActive]}>
              {decade}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.brand.primary} />
        </View>
      ) : (
        <FlatList
          data={films}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const imageUrl = item.poster_url?.startsWith('/')
              ? posterUrl(item.poster_url, 'w342')
              : null;
            return (
              <TouchableOpacity
                style={styles.gridCard}
                onPress={() => router.push(`/film/${item.tmdb_id}`)}
                activeOpacity={0.85}
              >
                <View style={styles.gridPoster}>
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
                  ) : (
                    <View style={[StyleSheet.absoluteFill, styles.gridFallback]}>
                      <Text style={styles.gridFallbackText}>{item.title.charAt(0)}</Text>
                    </View>
                  )}
                  {item.tmdb_rating > 0 && (
                    <View style={styles.gridRating}>
                      <RatingBadge rating={item.tmdb_rating} size="sm" />
                    </View>
                  )}
                </View>
                <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.gridYear}>{item.release_year}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const CARD_WIDTH = (Spacing[6] === 24 ? (400 - 24 * 2 - 16) / 2 : 160);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.base,
  },
  header: {
    paddingHorizontal: Spacing[6],
    paddingTop: 60,
    paddingBottom: Spacing[4],
  },
  screenTitle: {
    fontSize: Typography.size['3xl'],
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    letterSpacing: -1,
  },
  screenSubtitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  filterScroll: {
    maxHeight: 48,
    marginBottom: Spacing[2],
  },
  filterContent: {
    paddingHorizontal: Spacing[6],
    gap: Spacing[2],
    alignItems: 'center',
  },
  filterPill: {
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    borderRadius: Radius.full,
    backgroundColor: Colors.background.surface,
    borderWidth: 1,
    borderColor: Colors.background.overlay,
  },
  filterPillActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  filterPillText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.text.secondary,
  },
  filterPillTextActive: {
    color: Colors.text.inverse,
    fontFamily: Typography.family.bodySemibold,
  },
  grid: {
    paddingHorizontal: Spacing[6],
    paddingBottom: Spacing[8],
    gap: Spacing[4],
  },
  gridRow: {
    gap: Spacing[4],
  },
  gridCard: {
    flex: 1,
  },
  gridPoster: {
    aspectRatio: 2 / 3,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.background.surface,
    marginBottom: Spacing[2],
  },
  gridFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.elevated,
  },
  gridFallbackText: {
    fontSize: Typography.size['3xl'],
    fontFamily: Typography.family.heading,
    color: Colors.text.tertiary,
  },
  gridRating: {
    position: 'absolute',
    bottom: Spacing[2],
    right: Spacing[2],
  },
  gridTitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.text.primary,
    lineHeight: 18,
  },
  gridYear: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
