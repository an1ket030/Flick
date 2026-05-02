import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/auth';
import { Colors, Typography, Spacing, Radius, posterUrl } from '@flick/ui';
import LibraryEntrySheet from '../../components/LibraryEntrySheet';
import { TextInput } from 'react-native-gesture-handler'; // or react-native

type LibraryStatus = 'all' | 'planned' | 'watching' | 'watched' | 'paused' | 'dropped';

const STATUS_TABS: { key: LibraryStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'planned', label: 'Planned' },
  { key: 'watching', label: 'Watching' },
  { key: 'watched', label: 'Watched' },
  { key: 'paused', label: 'Paused' },
  { key: 'dropped', label: 'Dropped' },
];

const STATUS_COLORS: Record<string, string> = {
  planned: Colors.library.planned,
  watching: Colors.library.watching,
  watched: Colors.library.watched,
  paused: Colors.library.paused,
  dropped: Colors.library.dropped,
};

interface LibraryEntry {
  id: string;
  status: string;
  rating: number | null;
  date_watched: string | null;
  films: {
    id: string;
    tmdb_id: number;
    title: string;
    release_year: number;
    poster_path: string | null;
    tmdb_rating: number;
  };
}

interface LibraryStats {
  total: number;
  watched: number;
  planned: number;
  avgRating: number | null;
}

export default function LibraryScreen() {
  const { session } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<LibraryStatus>('all');
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [stats, setStats] = useState<LibraryStats>({ total: 0, watched: 0, planned: 0, avgRating: null });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Stream 4 additions
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'title'>('date');
  const [selectedFilm, setSelectedFilm] = useState<LibraryEntry['films'] | null>(null);

  const fetchLibrary = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      let query = supabase
        .from('user_film_entries')
        .select(`
          id, status, rating, date_watched,
          films (id, tmdb_id, title, release_year, poster_path, tmdb_rating)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data } = await query;
      if (data) {
        setEntries(data as LibraryEntry[]);

        // Compute stats from all entries
        const { data: allEntries } = await supabase
          .from('user_film_entries')
          .select('status, rating')
          .eq('user_id', session.user.id);

        if (allEntries) {
          const watched = allEntries.filter(e => e.status === 'watched');
          const rated = watched.filter(e => e.rating != null);
          const avgRating = rated.length > 0
            ? rated.reduce((sum, e) => sum + e.rating!, 0) / rated.length
            : null;
          setStats({
            total: allEntries.length,
            watched: watched.length,
            planned: allEntries.filter(e => e.status === 'planned').length,
            avgRating,
          });
        }
      }
    } catch (err) {
      console.error('Library fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session?.user?.id, statusFilter]);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const filteredEntries = entries
    .filter(e => {
      if (!searchQuery) return true;
      return e.films.title.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === 'title') {
        return a.films.title.localeCompare(b.films.title);
      }
      // date desc
      return new Date(b.date_watched || 0).getTime() - new Date(a.date_watched || 0).getTime();
    });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLibrary();
  }, [fetchLibrary]);

  const renderEntry = ({ item }: { item: LibraryEntry }) => {
    const film = item.films;
    const imageUrl = film.poster_path?.startsWith('/')
      ? posterUrl(film.poster_path, 'w185')
      : null;

    return (
      <TouchableOpacity
        style={viewMode === 'grid' ? styles.gridItem : styles.entryRow}
        onPress={() => router.push(`/film/${film.tmdb_id}`)}
        onLongPress={() => setSelectedFilm(film)}
        activeOpacity={0.8}
      >
        {/* Poster */}
        <View style={viewMode === 'grid' ? styles.gridPoster : styles.entryPoster}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.posterFallback]}>
              <Text style={styles.posterFallbackText}>{film.title.charAt(0)}</Text>
            </View>
          )}
          {/* Status strip */}
          <View style={[styles.statusStrip, { backgroundColor: STATUS_COLORS[item.status] || Colors.text.tertiary }]} />
        </View>

        {/* Info */}
        {viewMode === 'list' && (
          <View style={styles.entryInfo}>
            <Text style={styles.entryTitle} numberOfLines={2}>{film.title}</Text>
            <Text style={styles.entryYear}>{film.release_year}</Text>
            <View style={styles.entryMeta}>
              <View style={[styles.statusPill, { borderColor: STATUS_COLORS[item.status] || Colors.text.tertiary }]}>
                <Text style={[styles.statusPillText, { color: STATUS_COLORS[item.status] || Colors.text.tertiary }]}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
              {item.rating && (
                <Text style={styles.userRating}>{item.rating.toFixed(1)}</Text>
              )}
            </View>
          </View>
        )}
        {viewMode === 'list' && (
          <TouchableOpacity style={styles.moreBtn} onPress={() => setSelectedFilm(film)}>
            <Text style={styles.moreBtnText}>⋮</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>Library</Text>
          <View style={{ flexDirection: 'row', gap: Spacing[4] }}>
            <TouchableOpacity onPress={() => router.push('/library/vault')} activeOpacity={0.7}>
              <Text style={styles.importLink}>Vault</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/settings/import')} activeOpacity={0.7}>
              <Text style={styles.importLink}>Import</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.watched}</Text>
            <Text style={styles.statLabel}>Watched</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.planned}</Text>
            <Text style={styles.statLabel}>Planned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.brand.primary }]}>
              {stats.avgRating ? stats.avgRating.toFixed(1) : '—'}
            </Text>
            <Text style={styles.statLabel}>Avg</Text>
          </View>
        </View>

        {/* Tools row: Search + Controls */}
        <View style={styles.toolsRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search your library..."
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.toolBtn} onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}>
            <Text style={styles.toolBtnText}>{viewMode === 'list' ? '⊞' : '≡'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={() => setSortBy(sortBy === 'date' ? 'rating' : sortBy === 'rating' ? 'title' : 'date')}>
            <Text style={styles.toolBtnText}>{sortBy === 'date' ? '📅' : sortBy === 'rating' ? '⭐' : '🔤'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        {STATUS_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, statusFilter === tab.key && styles.tabActive]}
            onPress={() => setStatusFilter(tab.key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, statusFilter === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Entries */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.brand.primary} />
        </View>
      ) : filteredEntries.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No match found.' : statusFilter === 'all' ? 'Your library is empty.' : `No ${statusFilter} films.`}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? 'Try another search term.' : statusFilter === 'all'
              ? 'Search for a film and add it to get started.'
              : `Films you mark as "${statusFilter}" will appear here.`}
          </Text>
        </View>
      ) : (
        <FlatList
          key={viewMode}
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          renderItem={renderEntry}
          numColumns={viewMode === 'grid' ? 3 : 1}
          contentContainerStyle={[styles.list, viewMode === 'grid' && styles.gridList]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.brand.primary}
              colors={[Colors.brand.primary]}
            />
          }
          ItemSeparatorComponent={() => viewMode === 'list' ? <View style={styles.separator} /> : null}
        />
      )}

      {selectedFilm && (
        <LibraryEntrySheet 
          film={selectedFilm} 
          onClose={() => setSelectedFilm(null)} 
          onSaved={() => {
            setSelectedFilm(null);
            fetchLibrary();
          }}
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
  importLink: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.brand.primary,
    paddingVertical: Spacing[2],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.lg,
    padding: Spacing[4],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.background.overlay,
  },
  toolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: Spacing[4],
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[4],
    color: Colors.text.primary,
    fontFamily: Typography.family.body,
    fontSize: Typography.size.sm,
    borderWidth: 1,
    borderColor: Colors.background.overlay,
  },
  toolBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.surface,
    borderWidth: 1,
    borderColor: Colors.background.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBtnText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },

  // ── Tabs ──
  tabsScroll: {
    maxHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.surface,
  },
  tabsContent: {
    paddingHorizontal: Spacing[6],
    gap: Spacing[2],
    alignItems: 'center',
  },
  tab: {
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    borderRadius: Radius.full,
  },
  tabActive: {
    backgroundColor: Colors.brand.primary,
  },
  tabText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.text.tertiary,
  },
  tabTextActive: {
    color: Colors.text.inverse,
    fontFamily: Typography.family.bodySemibold,
  },

  // ── Entries ──
  list: {
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[8],
  },
  gridList: {
    paddingHorizontal: Spacing[4],
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
    paddingVertical: Spacing[3],
  },
  gridItem: {
    flex: 1,
    paddingHorizontal: Spacing[2],
    marginBottom: Spacing[4],
    alignItems: 'center',
  },
  entryPoster: {
    width: 52,
    height: 78,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.background.surface,
    flexShrink: 0,
    position: 'relative',
  },
  gridPoster: {
    width: '100%',
    aspectRatio: 2/3,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.background.surface,
    position: 'relative',
  },
  posterFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.elevated,
  },
  posterFallbackText: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.family.heading,
    color: Colors.text.tertiary,
  },
  statusStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  entryInfo: {
    flex: 1,
    gap: 4,
  },
  entryTitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  entryYear: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 11,
    fontFamily: Typography.family.bodySemibold,
  },
  userRating: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.heading,
    color: Colors.brand.primary,
  },
  moreBtn: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  moreBtnText: {
    fontSize: Typography.size.lg,
    color: Colors.text.tertiary,
    fontFamily: Typography.family.heading,
  },

  separator: {
    height: 1,
    backgroundColor: Colors.background.surface,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[8],
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
