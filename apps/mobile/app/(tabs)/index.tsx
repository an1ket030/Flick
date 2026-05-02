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

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_WIDTH * 1.1;

interface Film {
  id: string;
  tmdb_id: number;
  title: string;
  release_year: number;
  poster_path: string | null;
  backdrop_path: string | null;
  tmdb_rating: number;
  genres: number[];
  synopsis: string | null;
}

interface DailyPick {
  id: string;
  film_id: string;
  title: string;
  release_year: number;
  poster_path: string | null;
  backdrop_path: string | null;
  tmdb_id: number;
  score: number;
  explanation: { pitch: string; reasons: string[] };
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
  const { profile, session } = useAuthStore();
  const [dailyPick, setDailyPick] = useState<DailyPick | null>(null);
  const [popularFilms, setPopularFilms] = useState<Film[]>([]);
  const [topRated, setTopRated] = useState<Film[]>([]);
  const [continueWatching, setContinueWatching] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  // Convince Me (Gemini AI)
  const [convincePitch, setConvincePitch] = useState<string | null>(null);
  const [convinceLoading, setConvinceLoading] = useState(false);
  const [convinceExpanded, setConvinceExpanded] = useState(false);

  const fetchDailyPick = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/recommendations/daily-pick`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDailyPick(data.recommendation || null);
      } else {
        setDailyPick(null);
      }
    } catch (err) {
      console.error('Failed to fetch daily pick', err);
    }
  }, [session?.access_token]);

  const fetchData = useCallback(async () => {
    try {
      await fetchDailyPick();

      // Fetch Continue Watching
      if (session?.user?.id) {
        const { data: cw } = await supabase
          .from('user_film_entries')
          .select('films(id, tmdb_id, title, release_year, poster_path, backdrop_path, tmdb_rating)')
          .eq('user_id', session.user.id)
          .eq('status', 'watching')
          .order('updated_at', { ascending: false })
          .limit(10);
        if (cw) {
          setContinueWatching(cw.map((entry: any) => entry.films).filter(Boolean));
        }
      }

      // Fetch popular films
      const { data: pop, error: popErr } = await supabase
        .from('films')
        .select('id, tmdb_id, title, release_year, poster_path, backdrop_path, tmdb_rating, genres, synopsis')
        .gte('tmdb_vote_count', 100)
        .order('tmdb_vote_count', { ascending: false })
        .limit(20);

      if (popErr) console.error('Popular films error:', popErr.message);
      if (pop) setPopularFilms(pop);

      // Fetch top-rated films
      const { data: top, error: topErr } = await supabase
        .from('films')
        .select('id, tmdb_id, title, release_year, poster_path, backdrop_path, tmdb_rating, genres, synopsis')
        .gte('tmdb_rating', 7.5)
        .gte('tmdb_vote_count', 100)
        .order('tmdb_rating', { ascending: false })
        .limit(20);

      if (topErr) console.error('Top-rated films error:', topErr.message);
      if (top) setTopRated(top);
    } catch (error) {
      console.error('Home data fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchDailyPick, session?.user?.id]);

  const handleDismiss = async () => {
    if (!dailyPick || !session?.access_token) return;
    setDismissing(true);
    // Reset convince me state with each new pick
    setConvincePitch(null);
    setConvinceExpanded(false);
    try {
      await fetch(`${API_BASE_URL}/api/recommendations/daily-pick/action`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ film_id: dailyPick.film_id, action: 'dismissed' })
      });
      await fetchDailyPick();
    } catch (err) {
      console.error('Dismiss error', err);
    } finally {
      setDismissing(false);
    }
  };

  const handleConvinceMe = async () => {
    if (!dailyPick || !session?.access_token) return;

    // Toggle off if already showing
    if (convinceExpanded && convincePitch) {
      setConvinceExpanded(false);
      return;
    }

    setConvinceLoading(true);
    setConvinceExpanded(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/convince-me`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ film_id: dailyPick.film_id }),
      });
      if (res.ok) {
        const data = await res.json();
        setConvincePitch(data.pitch || null);
      }
    } catch (err) {
      console.error('Convince me error', err);
    } finally {
      setConvinceLoading(false);
    }
  };

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
      {dailyPick ? (
        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => router.push(`/film/${dailyPick.tmdb_id}`)}
          activeOpacity={0.92}
        >
          {/* Backdrop */}
          {dailyPick.backdrop_path && (
            <Image
              source={{ uri: backdropUrl(dailyPick.backdrop_path) ?? dailyPick.backdrop_path }}
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
            </View>
            {dailyPick.explanation?.pitch && (
              <Text style={styles.heroSynopsis} numberOfLines={3}>
                {dailyPick.explanation.pitch}
              </Text>
            )}

            {/* ── Convince Me AI Panel ── */}
            {convinceExpanded && (
              <View style={styles.convincePanel}>
                {convinceLoading ? (
                  <ActivityIndicator color={Colors.brand.primary} size="small" />
                ) : convincePitch ? (
                  <Text style={styles.convinceText}>{convincePitch}</Text>
                ) : null}
              </View>
            )}

            <View style={styles.heroCTA}>
              <TouchableOpacity
                style={styles.heroPrimaryBtn}
                onPress={() => router.push(`/film/${dailyPick.tmdb_id}`)}
                activeOpacity={0.85}
              >
                <Text style={styles.heroPrimaryBtnText}>View film</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.convinceBtn} 
                activeOpacity={0.8}
                onPress={handleConvinceMe}
                disabled={convinceLoading}
              >
                <Text style={styles.convinceBtnText}>
                  {convinceExpanded && convincePitch ? 'Hide' : 'Convince me'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Show another — subtle text link below CTA */}
            <TouchableOpacity
              style={styles.dismissLink}
              onPress={handleDismiss}
              disabled={dismissing}
              activeOpacity={0.6}
            >
              {dismissing ? (
                <ActivityIndicator color={Colors.text.tertiary} size="small" />
              ) : (
                <Text style={styles.dismissLinkText}>Show me another</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={[styles.heroCard, styles.heroEmpty]}>
          <Text style={styles.heroEmptyTitle}>You're all caught up!</Text>
          <Text style={styles.heroEmptyText}>We need to generate more picks for you. Check back later to see what we find.</Text>
        </View>
      )}

      {/* ── Sprint 3.3: Time Capsule Banner ── */}
      <View style={{ paddingHorizontal: Spacing[6], marginTop: Spacing[6] }}>
        <TouchableOpacity 
          style={{
            backgroundColor: 'rgba(201,168,76,0.15)',
            borderWidth: 1,
            borderColor: 'rgba(201,168,76,0.3)',
            borderRadius: Radius.lg,
            padding: Spacing[5],
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
          activeOpacity={0.8}
          onPress={() => router.push('/home/time-capsule')}
        >
          <View style={{ flex: 1, paddingRight: Spacing[4] }}>
            <Text style={{ fontSize: Typography.size.sm, fontFamily: Typography.family.bodyBold, color: Colors.brand.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>This Month</Text>
            <Text style={{ fontSize: Typography.size.lg, fontFamily: Typography.family.headingSemi, color: Colors.text.primary, marginBottom: 2 }}>Your Time Capsule</Text>
            <Text style={{ fontSize: Typography.size.sm, fontFamily: Typography.family.body, color: Colors.text.secondary }}>A film from your past, unlocked by AI.</Text>
          </View>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,107,44,0.15)', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.brand.primary }} />
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Continue Watching ── */}
      {continueWatching.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Continue watching"
            subtitle="Films you've started"
            onViewAll={() => router.push('/(tabs)/library')}
          />
          <FlatList
            data={continueWatching}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filmRow}
            renderItem={({ item }) => (
              <FilmCard
                tmdbId={item.tmdb_id}
                title={item.title}
                year={item.release_year}
                posterPath={item.poster_path?.startsWith('/') ? item.poster_path : null}
                rating={item.tmdb_rating}
                onPress={() => router.push(`/film/${item.tmdb_id}`)}
                style={styles.filmCardGap}
              />
            )}
          />
        </View>
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
                posterPath={item.poster_path}
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
                posterPath={item.poster_path}
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
  convincePanel: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: Radius.lg,
    padding: Spacing[4],
    marginBottom: Spacing[4],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  convinceText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
    lineHeight: 21,
    fontStyle: 'italic',
  },
  convinceBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.full,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  convinceBtnText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.text.primary,
  },
  dismissLink: {
    marginTop: Spacing[3],
    alignItems: 'center',
  },
  dismissLinkText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
  },
  heroEmpty: {
    padding: Spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.background.overlay,
  },
  heroEmptyTitle: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.family.headingSemi,
    color: Colors.text.primary,
    marginBottom: Spacing[2],
  },
  heroEmptyText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
    textAlign: 'center',
    maxWidth: '80%',
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
