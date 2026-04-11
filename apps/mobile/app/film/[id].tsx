import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/auth';
import { Colors, Typography, Spacing, Radius, backdropUrl, posterUrl, profileUrl } from '@flick/ui';
import { RatingBadge } from '@flick/ui';
import { GenreChip } from '@flick/ui';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BACKDROP_HEIGHT = SCREEN_HEIGHT * 0.45;

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western',
};

type LibraryStatus = 'planned' | 'watching' | 'watched' | 'paused' | 'dropped';

const STATUS_OPTIONS: { key: LibraryStatus; label: string; color: string }[] = [
  { key: 'planned', label: 'Add to watchlist', color: Colors.library.planned },
  { key: 'watching', label: 'Currently watching', color: Colors.library.watching },
  { key: 'watched', label: 'Mark as watched', color: Colors.library.watched },
  { key: 'paused', label: 'Paused', color: Colors.library.paused },
  { key: 'dropped', label: 'Dropped', color: Colors.library.dropped },
];

interface FilmDetail {
  id: string;
  tmdb_id: number;
  title: string;
  original_title: string | null;
  release_year: number;
  runtime_minutes: number | null;
  original_language: string | null;
  synopsis: string | null;
  tagline: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  tmdb_rating: number;
  tmdb_vote_count: number;
  genres: number[];
  content_rating: string | null;
}

interface CastMember {
  persons: {
    id: string;
    name: string;
    profile_url: string | null;
  };
  role: string;
  character_name: string | null;
  billing_order: number | null;
}

export default function FilmDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuthStore();
  const [film, setFilm] = useState<FilmDetail | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [similar, setSimilar] = useState<FilmDetail[]>([]);
  const [libraryStatus, setLibraryStatus] = useState<LibraryStatus | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const fetchFilm = useCallback(async () => {
    if (!id) return;
    try {
      // Fetch by tmdb_id
      const { data: filmData } = await supabase
        .from('films')
        .select('*')
        .eq('tmdb_id', parseInt(id as string))
        .single();

      if (!filmData) return;
      setFilm(filmData);

      // Fetch cast
      const { data: castData } = await supabase
        .from('film_persons')
        .select(`
          role, character_name, billing_order,
          persons (id, name, profile_url)
        `)
        .eq('film_id', filmData.id)
        .in('role', ['actor', 'director'])
        .order('billing_order', { ascending: true })
        .limit(10);

      if (castData) setCast(castData as CastMember[]);

      // Fetch similar films by overlapping genres
      if (filmData.genres && filmData.genres.length > 0) {
        const { data: similarData } = await supabase
          .from('films')
          .select('id, tmdb_id, title, release_year, poster_url, backdrop_url, tmdb_rating, genres')
          .contains('genres', [filmData.genres[0]])
          .neq('id', filmData.id)
          .gte('tmdb_rating', 6.5)
          .order('tmdb_vote_count', { ascending: false })
          .limit(15);

        if (similarData) setSimilar(similarData as FilmDetail[]);
      }

      // Check user library status
      if (session?.user?.id) {
        const { data: entryData } = await supabase
          .from('user_film_entries')
          .select('status, rating')
          .eq('user_id', session.user.id)
          .eq('film_id', filmData.id)
          .single();

        if (entryData) {
          setLibraryStatus(entryData.status as LibraryStatus);
          setUserRating(entryData.rating);
        }
      }
    } catch (err) {
      console.error('Film detail fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [id, session?.user?.id]);

  useEffect(() => {
    fetchFilm();
  }, [fetchFilm]);

  const handleStatusSelect = async (status: LibraryStatus) => {
    setShowStatusPicker(false);
    if (!session?.user?.id || !film) return;

    try {
      const { error } = await supabase
        .from('user_film_entries')
        .upsert({
          user_id: session.user.id,
          film_id: film.id,
          status,
          rewatch_number: 1,
        }, { onConflict: 'user_id,film_id,rewatch_number' });

      if (!error) setLibraryStatus(status);
    } catch (err) {
      Alert.alert('Error', 'Could not update library status. Please try again.');
    }
  };

  const formatRuntime = (minutes: number | null) => {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
      </View>
    );
  }

  if (!film) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Film not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const backdropImgUrl = film.backdrop_url?.startsWith('/')
    ? backdropUrl(film.backdrop_url)
    : null;
  const posterImgUrl = film.poster_url?.startsWith('/')
    ? posterUrl(film.poster_url, 'w342')
    : null;
  const directors = cast.filter(c => c.role === 'director');
  const actors = cast.filter(c => c.role === 'actor');

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Hero Backdrop ── */}
        <View style={styles.hero}>
          {backdropImgUrl ? (
            <Image
              source={{ uri: backdropImgUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          ) : posterImgUrl ? (
            <Image
              source={{ uri: posterImgUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.heroFallback]} />
          )}
          {/* Gradient overlay */}
          <View style={styles.heroOverlay} />
        </View>

        {/* ── Content ── */}
        <View style={styles.content}>
          {/* Poster + Title row */}
          <View style={styles.titleRow}>
            {posterImgUrl && (
              <View style={styles.posterThumb}>
                <Image source={{ uri: posterImgUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
              </View>
            )}
            <View style={styles.titleInfo}>
              <Text style={styles.filmTitle}>{film.title}</Text>
              {film.original_title && film.original_title !== film.title && (
                <Text style={styles.originalTitle}>{film.original_title}</Text>
              )}
              <View style={styles.metaPills}>
                {film.release_year && (
                  <View style={styles.pill}><Text style={styles.pillText}>{film.release_year}</Text></View>
                )}
                {film.runtime_minutes && (
                  <View style={styles.pill}><Text style={styles.pillText}>{formatRuntime(film.runtime_minutes)}</Text></View>
                )}
                {film.content_rating && (
                  <View style={styles.pill}><Text style={styles.pillText}>{film.content_rating}</Text></View>
                )}
              </View>
              {film.tmdb_rating > 0 && (
                <RatingBadge rating={film.tmdb_rating} size="md" source="tmdb" />
              )}
            </View>
          </View>

          {/* ── Action Buttons ── */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.primaryBtn, libraryStatus && styles.primaryBtnActive]}
              onPress={() => session ? setShowStatusPicker(true) : router.push('/(auth)/login')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>
                {libraryStatus
                  ? libraryStatus.charAt(0).toUpperCase() + libraryStatus.slice(1)
                  : 'Add to library'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => Share.share({ message: `Check out ${film.title} on Flick!` })}
              activeOpacity={0.75}
            >
              <Text style={styles.iconBtnText}>↗</Text>
            </TouchableOpacity>
          </View>

          {/* ── Genres ── */}
          {film.genres && film.genres.length > 0 && (
            <View style={styles.section}>
              <View style={styles.genreChips}>
                {film.genres.map((g) => GENRE_MAP[g] && (
                  <GenreChip key={g} label={GENRE_MAP[g]} />
                ))}
              </View>
            </View>
          )}

          {/* ── Tagline ── */}
          {film.tagline && (
            <Text style={styles.tagline}>"{film.tagline}"</Text>
          )}

          {/* ── Synopsis ── */}
          {film.synopsis && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Synopsis</Text>
              <Text
                style={styles.synopsis}
                numberOfLines={synopsisExpanded ? undefined : 4}
              >
                {film.synopsis}
              </Text>
              <TouchableOpacity
                onPress={() => setSynopsisExpanded(!synopsisExpanded)}
                activeOpacity={0.7}
                style={styles.readMore}
              >
                <Text style={styles.readMoreText}>
                  {synopsisExpanded ? 'Read less' : 'Read more'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Director ── */}
          {directors.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                {directors.length === 1 ? 'Director' : 'Directors'}
              </Text>
              <View style={styles.crewList}>
                {directors.map((d, i) => (
                  <TouchableOpacity key={i} style={styles.crewItem} activeOpacity={0.75}>
                    <PersonAvatar name={d.persons.name} profilePath={d.persons.profile_url} />
                    <Text style={styles.crewName}>{d.persons.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ── Cast ── */}
          {actors.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Cast</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.castScroll}>
                {actors.map((a, i) => (
                  <View key={i} style={styles.castItem}>
                    <PersonAvatar name={a.persons.name} profilePath={a.persons.profile_url} size={56} />
                    <Text style={styles.castName} numberOfLines={2}>{a.persons.name}</Text>
                    {a.character_name && (
                      <Text style={styles.castCharacter} numberOfLines={1}>{a.character_name}</Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── Similar Films ── */}
          {similar.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>More like this</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.similarRow}>
                  {similar.slice(0, 10).map((s) => {
                    const sUrl = s.poster_url?.startsWith('/') ? posterUrl(s.poster_url, 'w185') : null;
                    return (
                      <TouchableOpacity
                        key={s.id}
                        style={styles.similarCard}
                        onPress={() => router.push(`/film/${s.tmdb_id}`)}
                        activeOpacity={0.85}
                      >
                        <View style={styles.similarPoster}>
                          {sUrl ? (
                            <Image source={{ uri: sUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
                          ) : (
                            <View style={[StyleSheet.absoluteFill, styles.heroFallback]}>
                              <Text style={{ color: Colors.text.tertiary, fontSize: 20, fontFamily: Typography.family.heading }}>
                                {s.title.charAt(0)}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.similarTitle} numberOfLines={2}>{s.title}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}

          <View style={{ height: Spacing[10] }} />
        </View>
      </ScrollView>

      {/* ── Back Button ── */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* ── Status Picker Sheet ── */}
      {showStatusPicker && (
        <TouchableOpacity
          style={styles.sheetOverlay}
          onPress={() => setShowStatusPicker(false)}
          activeOpacity={1}
        >
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Add to library</Text>
            <View style={styles.sheetOptions}>
              {STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.sheetOption,
                    libraryStatus === opt.key && { borderColor: opt.color, backgroundColor: `${opt.color}15` },
                  ]}
                  onPress={() => handleStatusSelect(opt.key)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.sheetOptionDot, { backgroundColor: opt.color }]} />
                  <Text style={[
                    styles.sheetOptionText,
                    libraryStatus === opt.key && { color: opt.color },
                  ]}>
                    {opt.label}
                  </Text>
                  {libraryStatus === opt.key && (
                    <Text style={[styles.checkMark, { color: opt.color }]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

function PersonAvatar({ name, profilePath, size = 44 }: { name: string; profilePath: string | null; size?: number }) {
  const url = profilePath?.startsWith('/')
    ? profileUrl(profilePath, 'w185')
    : null;
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {url ? (
        <Image source={{ uri: url }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <Text style={styles.avatarInitial}>{name.charAt(0)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.base,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.base,
  },
  errorText: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
    marginBottom: Spacing[4],
  },
  backBtn: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
    borderRadius: Radius.full,
  },
  backBtnText: {
    color: Colors.text.inverse,
    fontFamily: Typography.family.bodySemibold,
    fontSize: Typography.size.base,
  },

  // ── Hero ──
  hero: {
    height: BACKDROP_HEIGHT,
    backgroundColor: Colors.background.elevated,
  },
  heroFallback: {
    backgroundColor: Colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18,18,18,0.3)',
  },

  // ── Back button ──
  backButton: {
    position: 'absolute',
    top: 52,
    left: Spacing[4],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(18,18,18,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: Colors.text.primary,
    fontFamily: Typography.family.body,
    lineHeight: 24,
  },

  // ── Content ──
  content: {
    marginTop: -Spacing[8],
    backgroundColor: Colors.background.base,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Spacing[6],
    paddingHorizontal: Spacing[5],
  },
  titleRow: {
    flexDirection: 'row',
    gap: Spacing[4],
    marginBottom: Spacing[5],
  },
  posterThumb: {
    width: 90,
    height: 135,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.background.elevated,
    flexShrink: 0,
  },
  titleInfo: {
    flex: 1,
    gap: Spacing[2],
    paddingTop: 4,
  },
  filmTitle: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  originalTitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
  },
  metaPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[1],
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background.surface,
    borderWidth: 1,
    borderColor: Colors.background.overlay,
  },
  pillText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.text.secondary,
    letterSpacing: 0.3,
  },

  // ── Actions ──
  actionRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginBottom: Spacing[5],
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryBtnActive: {
    backgroundColor: Colors.brand.primaryDim,
  },
  primaryBtnText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.bodyBold,
    color: Colors.text.inverse,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.surface,
    borderWidth: 1,
    borderColor: Colors.background.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: {
    fontSize: 20,
    color: Colors.text.primary,
  },

  // ── Section ──
  section: {
    marginBottom: Spacing[6],
  },
  sectionLabel: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.text.tertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing[3],
  },
  genreChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  tagline: {
    fontSize: Typography.size.base,
    fontFamily: 'BeVietnamPro_400Regular',
    fontStyle: 'italic',
    color: Colors.text.secondary,
    marginBottom: Spacing[6],
    lineHeight: 24,
  },
  synopsis: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  readMore: {
    marginTop: Spacing[2],
  },
  readMoreText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.brand.primary,
  },

  // ── Cast ──
  castScroll: {
    marginHorizontal: -Spacing[5],
    paddingHorizontal: Spacing[5],
  },
  castItem: {
    width: 72,
    marginRight: Spacing[3],
    alignItems: 'center',
  },
  castName: {
    marginTop: Spacing[2],
    fontSize: 11,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  castCharacter: {
    fontSize: 10,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 13,
  },

  // ── Crew ──
  crewList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[4],
  },
  crewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  crewName: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.text.primary,
  },

  // ── Avatar ──
  avatar: {
    backgroundColor: Colors.background.elevated,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: Typography.size.md,
    fontFamily: Typography.family.heading,
    color: Colors.text.tertiary,
  },

  // ── Similar ──
  similarRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    paddingRight: Spacing[5],
  },
  similarCard: {
    width: 100,
  },
  similarPoster: {
    width: 100,
    height: 150,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.background.surface,
    marginBottom: Spacing[2],
  },
  similarTitle: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.text.secondary,
    lineHeight: 16,
  },

  // ── Status Sheet ──
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background.elevated,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing[6],
    paddingBottom: 48,
  },
  sheetTitle: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    marginBottom: Spacing[5],
    letterSpacing: -0.3,
  },
  sheetOptions: {
    gap: Spacing[2],
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
    borderRadius: Radius.lg,
    backgroundColor: Colors.background.surface,
    borderWidth: 1,
    borderColor: Colors.background.overlay,
    gap: Spacing[3],
  },
  sheetOptionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sheetOptionText: {
    flex: 1,
    fontSize: Typography.size.base,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.text.primary,
  },
  checkMark: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.bodyBold,
  },
});
