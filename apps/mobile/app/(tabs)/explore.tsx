import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/auth';
import { Colors, Typography, Spacing, Radius, posterUrl, backdropUrl } from '@flick/ui';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';
import { RatingBadge } from '@flick/ui';
import MoodSelector, { MoodId } from '../../components/MoodSelector';

interface Film {
  id: string;
  tmdb_id: number;
  title: string;
  release_year: number;
  poster_path: string | null;
  backdrop_path: string | null;
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
  const { session } = useAuthStore();
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDecade, setActiveDecade] = useState<string>('All');
  
  // Mood pick state
  const [activeMood, setActiveMood] = useState<MoodId | null>(null);
  const [filterRuntime, setFilterRuntime] = useState<boolean>(false);
  const [filterLang, setFilterLang] = useState<boolean>(false);
  const [filterPlatform, setFilterPlatform] = useState<boolean>(false);
  const [moodLoading, setMoodLoading] = useState(false);
  const [moodResults, setMoodResults] = useState<Film[] | null>(null);

  const [predictions, setPredictions] = useState<any[]>([]);
  const [hiddenGems, setHiddenGems] = useState<Film[]>([]);
  const [newReleases, setNewReleases] = useState<Film[]>([]);
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    if (!moodResults) {
      fetchExplore();
    }
  }, [activeDecade]);

  useEffect(() => {
    fetchRails();
  }, []);

  const fetchRails = async () => {
    // Fetch Predictions
    try {
      const pRes = await fetch(`${API_BASE_URL}/api/recommendations/predictions`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (pRes.ok) {
        const { data } = await pRes.json();
        setPredictions(data || []);
      }
    } catch(e) { console.warn('Predictions fetch error', e); }

    // Fetch Hidden Gems
    try {
      const { data } = await supabase
        .from('films')
        .select('id, tmdb_id, title, release_year, poster_path, backdrop_path, tmdb_rating, genres')
        .gte('tmdb_rating', 7.0)
        .gte('tmdb_vote_count', 1000)
        .lte('tmdb_vote_count', 5000)
        .order('tmdb_rating', { ascending: false })
        .limit(10);
      if (data) setHiddenGems(data);
    } catch(e) {}

    // Fetch New Releases
    try {
      const { data } = await supabase
        .from('films')
        .select('id, tmdb_id, title, release_year, poster_path, backdrop_path, tmdb_rating, genres')
        .gte('release_year', new Date().getFullYear() - 1)
        .gte('tmdb_vote_count', 1000)
        .order('release_year', { ascending: false })
        .order('tmdb_rating', { ascending: false })
        .limit(10);
      if (data) setNewReleases(data);
    } catch(e) {}

    // Fetch Editorial Collections (Sprint 3.5)
    try {
      const cRes = await fetch(`${API_BASE_URL}/api/recommendations/collections`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (cRes.ok) {
        const { data } = await cRes.json();
        setCollections(data || []);
      }
    } catch(e) {}
  };

  const handleMoodSearch = async () => {
    if (!activeMood || !session?.access_token) return;
    setMoodLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/recommendations/mood-pick`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood: activeMood,
          runtime: filterRuntime,
          lang: filterLang,
          platform: filterPlatform
        })
      });

      if (res.ok) {
        const { data } = await res.json();
        setMoodResults(data || []);
      } else {
        setMoodResults([]);
      }
    } catch (e) {
      console.error('Mood fetch error', e);
    } finally {
      setMoodLoading(false);
    }
  };

  const fetchExplore = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('films')
        .select('id, tmdb_id, title, release_year, poster_path, backdrop_path, tmdb_rating, genres')
        .gte('tmdb_vote_count', 100)
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

  const renderFilmRail = (title: string, subtitle: string, items: any[], isPrediction: boolean = false) => {
    if (!items || items.length === 0) return null;
    return (
      <View style={styles.railContainer}>
        <View style={styles.railHeader}>
          <Text style={styles.railTitle}>{title}</Text>
          <Text style={styles.railSubtitle}>{subtitle}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.railScrollList}>
          {items.map((item) => {
            const film = isPrediction ? item.film : item;
            if (!film) return null;
            const imageUrl = film.poster_path?.startsWith('/') ? posterUrl(film.poster_path, 'w342') : null;
            
            return (
              <TouchableOpacity
                key={film.id}
                style={styles.railCard}
                onPress={() => router.push(`/film/${film.tmdb_id}`)}
                activeOpacity={0.85}
              >
                <View style={styles.railPoster}>
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
                  ) : (
                    <View style={[StyleSheet.absoluteFill, styles.gridFallback]}>
                      <Text style={styles.gridFallbackText}>{film.title.charAt(0)}</Text>
                    </View>
                  )}
                  {isPrediction && (
                    <View style={styles.predictionBadge}>
                      <Text style={styles.predictionBadgeText}>+ {item.difference.toFixed(1)} vs TMDb</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header & Mood Pick */}
      <View style={styles.headerBlock}>
        <Text style={styles.screenTitle}>Explore</Text>
        
        <View style={styles.moodSection}>
          <View style={styles.moodHeader}>
            <Text style={styles.sectionTitle}>Mood Pick</Text>
            <Text style={styles.sectionDesc}>What are you feeling?</Text>
          </View>

          <MoodSelector selected={activeMood} onSelect={setActiveMood} />

          {activeMood && (
            <View style={styles.filtersBlock}>
              <View style={styles.filterToggles}>
                <TouchableOpacity 
                  style={[styles.miniToggle, filterRuntime && styles.miniToggleActive]}
                  onPress={() => setFilterRuntime(!filterRuntime)}
                >
                  <Text style={[styles.miniToggleText, filterRuntime && styles.miniToggleTextActive]}>&lt; 100 mins</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.miniToggle, filterLang && styles.miniToggleActive]}
                  onPress={() => setFilterLang(!filterLang)}
                >
                  <Text style={[styles.miniToggleText, filterLang && styles.miniToggleTextActive]}>English Only</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.miniToggle, filterPlatform && styles.miniToggleActive]}
                  onPress={() => setFilterPlatform(!filterPlatform)}
                >
                  <Text style={[styles.miniToggleText, filterPlatform && styles.miniToggleTextActive]}>Streamable</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.findButton}
                onPress={handleMoodSearch}
                disabled={moodLoading}
              >
                {moodLoading ? <ActivityIndicator color={Colors.text.inverse} /> : <Text style={styles.findButtonText}>Find 3 Films</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {moodResults && (
          <View style={styles.moodResultsBlock}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={styles.sectionTitle}>Your Match</Text>
              <TouchableOpacity onPress={() => setMoodResults(null)}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.moodResultsGrid}>
              {moodResults.map(item => {
                 const imageUrl = item.poster_path?.startsWith('/') ? posterUrl(item.poster_path, 'w500') : null;
                 return (
                   <TouchableOpacity
                     key={item.id}
                     style={styles.moodResultCard}
                     onPress={() => router.push(`/film/${item.tmdb_id}`)}
                   >
                     <Image source={{ uri: imageUrl }} style={styles.moodResultImage} />
                   </TouchableOpacity>
                 );
              })}
            </View>
          </View>
        )}
      </View>

      {!moodResults && (
        <View style={styles.railsBlock}>
          {/* Sprint 3.2: Blind Spot Finder Banner */}
          <View style={{ paddingHorizontal: Spacing[6], marginBottom: Spacing[6] }}>
            <TouchableOpacity 
              style={[styles.moodSection, { marginTop: 0, backgroundColor: 'rgba(201,168,76,0.15)', borderColor: 'rgba(201,168,76,0.3)' }]}
              activeOpacity={0.8}
              onPress={() => router.push('/explore/blind-spots')}
            >
              <Text style={styles.sectionTitle}>Blind Spot Finder</Text>
              <Text style={styles.sectionDesc}>12 highly-rated masterpieces missing from your library.</Text>
            </TouchableOpacity>
          </View>

          {renderFilmRail("Built For You", "Outliers you'll rate way higher than the consensus.", predictions, true)}
          {renderFilmRail("New & Buzzing", "Recent releases making waves.", newReleases)}
          {renderFilmRail("Hidden Gems", "Highly rated but under the radar.", hiddenGems)}

          {/* The Vault - Grid View */}
          <View style={styles.feedHeader}>
            <Text style={styles.sectionTitle}>The Vault</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
              {['All', ...DECADES].map((decade) => (
                <TouchableOpacity key={decade} style={[styles.filterPill, activeDecade === decade && styles.filterPillActive]} onPress={() => setActiveDecade(decade)}>
                  <Text style={[styles.filterPillText, activeDecade === decade && styles.filterPillTextActive]}>{decade}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {loading ? (
             <ActivityIndicator style={{marginTop: 20}} color={Colors.brand.primary} />
          ) : (
            <View style={styles.grid}>
              {films.map(item => {
                const imageUrl = item.poster_path?.startsWith('/')
                  ? posterUrl(item.poster_path, 'w342')
                  : null;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.gridBox}
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
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}
    </ScrollView>
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
  headerBlock: {
    paddingHorizontal: Spacing[6],
    paddingTop: 60,
    marginBottom: Spacing[4],
  },
  railsBlock: {
    paddingBottom: Spacing[10],
  },
  railContainer: {
    marginBottom: Spacing[8],
  },
  railHeader: {
    paddingHorizontal: Spacing[6],
    marginBottom: Spacing[3],
  },
  railTitle: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
  },
  railSubtitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  railScrollList: {
    paddingHorizontal: Spacing[6],
    gap: Spacing[4],
  },
  railCard: {
    width: 140,
  },
  railPoster: {
    width: 140,
    height: 210,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.background.surface,
  },
  predictionBadge: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: Spacing[2],
    paddingVertical: 4,
    borderRadius: Radius.md,
  },
  predictionBadgeText: {
    color: Colors.text.inverse,
    fontFamily: Typography.family.bodyBold,
    fontSize: Typography.size.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing[6],
    paddingBottom: Spacing[8],
    justifyContent: 'space-between',
    gap: Spacing[4],
  },
  gridBox: {
    width: '47%',
  },
  moodSection: {
    backgroundColor: Colors.background.elevated,
    padding: Spacing[5],
    borderRadius: Radius.xl,
    marginTop: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.background.overlay,
  },
  moodHeader: {
    marginBottom: Spacing[4],
  },
  sectionTitle: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
  },
  sectionDesc: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  filtersBlock: {
    marginTop: Spacing[4],
    gap: Spacing[4],
  },
  filterToggles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  miniToggle: {
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.background.overlay,
  },
  miniToggleActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: Colors.text.primary,
  },
  miniToggleText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
  },
  miniToggleTextActive: {
    color: Colors.text.primary,
    fontFamily: Typography.family.bodyBold,
  },
  findButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  findButtonText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodyBold,
    color: Colors.text.inverse,
  },
  moodResultsBlock: {
    marginTop: Spacing[8],
  },
  clearText: {
    color: Colors.brand.primary,
    fontFamily: Typography.family.bodyBold,
    fontSize: Typography.size.sm,
  },
  moodResultsGrid: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginTop: Spacing[4],
    height: 180,
  },
  moodResultCard: {
    flex: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.background.overlay,
  },
  moodResultImage: {
    ...StyleSheet.absoluteFillObject,
  },
  feedHeader: {
    marginBottom: Spacing[4],
    paddingHorizontal: Spacing[6],
  },
});
