import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors, Typography, Spacing, Radius, posterUrl } from '@flick/ui';
import { RatingBadge } from '@flick/ui';

interface Film {
  id: string;
  tmdb_id: number;
  title: string;
  release_year: number;
  poster_url: string | null;
  tmdb_rating: number;
  original_language: string | null;
}

const GENRE_PILLS = [
  'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi',
  'Thriller', 'Romance', 'Animation', 'Crime', 'Documentary',
];

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Film[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const searchFilms = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const { data, error } = await supabase
        .from('films')
        .select('id, tmdb_id, title, release_year, poster_url, tmdb_rating, original_language')
        .ilike('title', `%${q.trim()}%`)
        .order('tmdb_vote_count', { ascending: false })
        .limit(30);

      if (!error && data) {
        setResults(data);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => searchFilms(text), 300);
  };

  const handleGenrePress = async (genre: string) => {
    Keyboard.dismiss();
    setQuery('');
    if (activeGenre === genre) {
      setActiveGenre(null);
      setResults([]);
      setHasSearched(false);
      return;
    }
    setActiveGenre(genre);
    setLoading(true);
    setHasSearched(true);
    try {
      const { data } = await supabase
        .from('films')
        .select('id, tmdb_id, title, release_year, poster_url, tmdb_rating, original_language')
        .order('tmdb_rating', { ascending: false })
        .gte('tmdb_vote_count', 5000)
        .limit(30);
      if (data) setResults(data);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setActiveGenre(null);
    inputRef.current?.focus();
  };

  const renderFilmRow = ({ item }: { item: Film }) => {
    const imageUrl = item.poster_url?.startsWith('/')
      ? posterUrl(item.poster_url, 'w185')
      : null;

    return (
      <TouchableOpacity
        style={styles.filmRow}
        onPress={() => router.push(`/film/${item.tmdb_id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.filmPoster}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.posterPlaceholder]}>
              <Text style={styles.placeholderLetter}>{item.title.charAt(0)}</Text>
            </View>
          )}
        </View>
        <View style={styles.filmInfo}>
          <Text style={styles.filmTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.filmMeta}>
            {item.release_year && <Text style={styles.filmYear}>{item.release_year}</Text>}
            {item.original_language && item.original_language !== 'en' && (
              <View style={styles.langBadge}>
                <Text style={styles.langText}>{item.original_language.toUpperCase()}</Text>
              </View>
            )}
          </View>
        </View>
        {item.tmdb_rating > 0 && (
          <RatingBadge rating={item.tmdb_rating} size="sm" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchHeader}>
        <Text style={styles.screenTitle}>Search</Text>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            value={query}
            onChangeText={handleQueryChange}
            placeholder="Films, directors, actors..."
            placeholderTextColor={Colors.text.tertiary}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {(query.length > 0 || activeGenre) && (
            <TouchableOpacity onPress={clearSearch} activeOpacity={0.7}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Genre pills */}
      {!hasSearched && (
        <View style={styles.genreSection}>
          <Text style={styles.genreSectionLabel}>Browse by genre</Text>
          <View style={styles.genrePills}>
            {GENRE_PILLS.map((genre) => (
              <TouchableOpacity
                key={genre}
                style={[styles.genrePill, activeGenre === genre && styles.genrePillActive]}
                onPress={() => handleGenrePress(genre)}
                activeOpacity={0.75}
              >
                <Text style={[styles.genrePillText, activeGenre === genre && styles.genrePillTextActive]}>
                  {genre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Results */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.brand.primary} />
        </View>
      ) : hasSearched && results.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No results found.</Text>
          <Text style={styles.emptySubtitle}>
            Try a different title, director, or actor name.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderFilmRow}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.base,
  },
  searchHeader: {
    paddingHorizontal: Spacing[6],
    paddingTop: 60,
    paddingBottom: Spacing[4],
  },
  screenTitle: {
    fontSize: Typography.size['3xl'],
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    letterSpacing: -1,
    marginBottom: Spacing[4],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.background.overlay,
    paddingHorizontal: Spacing[4],
    minHeight: 52,
    gap: Spacing[2],
  },
  searchIcon: {
    fontSize: 20,
    color: Colors.text.tertiary,
    lineHeight: 24,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.size.base,
    fontFamily: Typography.family.body,
    color: Colors.text.primary,
    paddingVertical: Spacing[3],
  },
  clearBtn: {
    fontSize: 14,
    color: Colors.text.tertiary,
    paddingHorizontal: 4,
  },

  // ── Genre pills ──
  genreSection: {
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[4],
  },
  genreSectionLabel: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.text.tertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing[3],
  },
  genrePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  genrePill: {
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    borderRadius: Radius.full,
    backgroundColor: Colors.background.surface,
    borderWidth: 1,
    borderColor: Colors.background.overlay,
  },
  genrePillActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  genrePillText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.text.secondary,
  },
  genrePillTextActive: {
    color: Colors.text.inverse,
    fontFamily: Typography.family.bodySemibold,
  },

  // ── Results ──
  resultsList: {
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
  },
  filmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
    paddingVertical: Spacing[3],
  },
  filmPoster: {
    width: 52,
    height: 78,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.background.surface,
    flexShrink: 0,
  },
  posterPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.elevated,
  },
  placeholderLetter: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.family.heading,
    color: Colors.text.tertiary,
  },
  filmInfo: {
    flex: 1,
    gap: 4,
  },
  filmTitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  filmMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  filmYear: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
  },
  langBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background.elevated,
  },
  langText: {
    fontSize: 10,
    fontFamily: Typography.family.bodyBold,
    color: Colors.text.tertiary,
    letterSpacing: 0.5,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.background.surface,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[8],
  },
  emptyTitle: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.family.headingSemi,
    color: Colors.text.primary,
    marginBottom: Spacing[2],
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
