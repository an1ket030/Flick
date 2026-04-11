import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/auth';
import { Colors, Typography, Spacing, Radius, backdropUrl, posterUrl } from '@flick/ui';
import { FilmCard } from '@flick/ui';
import { RatingBadge } from '@flick/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_WIDTH * 1.1;

interface Film {
  id: string;
  tmdb_id: number;
  title: string;
  release_year: number;
  poster_url: string | null;
  backdrop_url: string | null;
  tmdb_rating: number;
  genres: number[];
  synopsis: string | null;
}

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const part = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return `${part}${name ? `, ${name.split(' ')[0]}` : ''}.`;
}

function SectionHeader({ title, subtitle, onViewAll }: { title: string; subtitle?: string; onViewAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {onViewAll && (
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { profile } = useAuthStore();
  const [dailyPick, setDailyPick] = useState<Film | null>(null);
  const [popularFilms, setPopularFilms] = useState<Film[]>([]);
  const [topRated, setTopRated] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // Fetch daily pick — highest rated film not in user's library
      const { data: pick } = await supabase
        .from('films')
        .select('id, tmdb_id, title, release_year, poster_url, backdrop_url, tmdb_rating, genres, synopsis')
        .gte('tmdb_rating', 7.5)
        .gte('tmdb_vote_count', 10000)
        .not('backdrop_url', 'is', null)
        .order('tmdb_rating', { ascending: false })
        .limit(20);

      if (pick && pick.length > 0) {
        // Pick a "daily" film deterministically by day-of-year
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        setDailyPick(pick[dayOfYear % pick.length]);
      }

      // Fetch popular films
      const { data: pop } = await supabase
        .from('films')
        .select('id, tmdb_id, title, release_year, poster_url, backdrop_url, tmdb_rating, genres, synopsis')
        .gte('tmdb_vote_count', 50000)
        .order('tmdb_vote_count', { ascending: false })
        .limit(20);

      if (pop) setPopularFilms(pop);

      // Fetch top-rated films
      const { data: top } = await supabase
        .from('films')
        .select('id, tmdb_id, title, release_year, poster_url, backdrop_url, tmdb_rating, genres, synopsis')
        .gte('tmdb_rating', 8.0)
        .gte('tmdb_vote_count', 5000)
        .order('tmdb_rating', { ascending: false })
        .limit(20);

      if (top) setTopRated(top);
    } catch (error) {
      console.error('Home data fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.brand.primary}
          colors={[Colors.brand.primary]}
        />
      }
    >
      {/* ── Greeting ── */}
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>{getGreeting(profile?.display_name || '')}</Text>
        <Text style={styles.greetingSubtext}>Here's your pick for today.</Text>
      </View>

      {/* ── Daily Pick Hero ── */}
      {dailyPick && (
        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => router.push(`/film/${dailyPick.tmdb_id}`)}
          activeOpacity={0.92}
        >
          {/* Backdrop */}
          {dailyPick.backdrop_url && (
            <Image
              source={{ uri: backdropUrl(dailyPick.backdrop_url.startsWith('/') ? dailyPick.backdrop_url : null) || dailyPick.backdrop_url }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={500}
            />
          )}

          {/* Gradient overlay */}
          <View style={styles.heroGradient} />

          {/* Pick label */}
          <View style={styles.pickLabel}>
            <View style={styles.pickLabelDot} />
            <Text style={styles.pickLabelText}>Today's Pick</Text>
          </View>

          {/* Film info */}
          <View style={styles.heroInfo}>
            <Text style={styles.heroTitle} numberOfLines={2}>{dailyPick.title}</Text>
            <View style={styles.heroMeta}>
              <Text style={styles.heroYear}>{dailyPick.release_year}</Text>
              {dailyPick.tmdb_rating > 0 && (
                <RatingBadge rating={dailyPick.tmdb_rating} size="sm" />
              )}
            </View>
            {dailyPick.synopsis && (
              <Text style={styles.heroSynopsis} numberOfLines={3}>
                {dailyPick.synopsis}
              </Text>
            )}
            <View style={styles.heroCTA}>
              <TouchableOpacity
                style={styles.heroPrimaryBtn}
                onPress={() => router.push(`/film/${dailyPick.tmdb_id}`)}
                activeOpacity={0.85}
              >
                <Text style={styles.heroPrimaryBtnText}>View film</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroSecondaryBtn} activeOpacity={0.7}>
                <Text style={styles.heroSecondaryBtnText}>Not for me</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* ── Popular Right Now ── */}
      {popularFilms.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Popular right now"
            subtitle="Films everyone is watching"
          />
          <FlatList
            data={popularFilms}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filmRow}
            renderItem={({ item }) => (
              <FilmCard
                tmdbId={item.tmdb_id}
                title={item.title}
                year={item.release_year}
                posterPath={item.poster_url?.startsWith('/') ? item.poster_url : null}
                rating={item.tmdb_rating}
                onPress={() => router.push(`/film/${item.tmdb_id}`)}
                style={styles.filmCardGap}
              />
            )}
          />
        </View>
      )}

      {/* ── Critically Acclaimed ── */}
      {topRated.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Critically acclaimed"
            subtitle="The highest-rated films of all time"
          />
          <FlatList
            data={topRated}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filmRow}
            renderItem={({ item }) => (
              <FilmCard
                tmdbId={item.tmdb_id}
                title={item.title}
                year={item.release_year}
                posterPath={item.poster_url?.startsWith('/') ? item.poster_url : null}
                rating={item.tmdb_rating}
                onPress={() => router.push(`/film/${item.tmdb_id}`)}
                style={styles.filmCardGap}
              />
            )}
          />
        </View>
      )}

      <View style={{ height: Spacing[8] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.base,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.base,
  },

  // ── Greeting ──
  greeting: {
    paddingHorizontal: Spacing[6],
    paddingTop: 60,
    paddingBottom: Spacing[5],
  },
  greetingText: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  greetingSubtext: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
    marginTop: 2,
  },

  // ── Hero Card ──
  heroCard: {
    marginHorizontal: Spacing[6],
    height: HERO_HEIGHT,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.background.surface,
    marginBottom: Spacing[8],
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    background: 'transparent',
    // Layered gradient: transparent top, dark bottom
    backgroundColor: 'transparent',
    // Using borderRadius workaround for gradient effect
    backgroundImage: 'linear-gradient(to bottom, transparent 30%, #121212 100%)',
  },
  pickLabel: {
    position: 'absolute',
    top: Spacing[4],
    left: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,107,44,0.2)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,107,44,0.5)',
  },
  pickLabelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.brand.primary,
  },
  pickLabelText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.brand.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing[5],
    // Background gradient from bottom
    backgroundColor: 'rgba(18,18,18,0.7)',
  },
  heroTitle: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: Spacing[2],
    lineHeight: 32,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },
  heroYear: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.text.secondary,
  },
  heroSynopsis: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: Spacing[4],
  },
  heroCTA: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  heroPrimaryBtn: {
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  heroPrimaryBtnText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodyBold,
    color: Colors.text.inverse,
  },
  heroSecondaryBtn: {
    backgroundColor: 'rgba(240,240,240,0.1)',
    borderRadius: Radius.full,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    borderWidth: 1,
    borderColor: 'rgba(240,240,240,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSecondaryBtnText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.text.secondary,
  },

  // ── Section Row ──
  section: {
    marginBottom: Spacing[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[6],
    marginBottom: Spacing[4],
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.family.headingSemi,
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  seeAll: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.brand.primary,
  },
  filmRow: {
    paddingHorizontal: Spacing[6],
    gap: Spacing[4],
  },
  filmCardGap: {},
});
