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
    poster_url: string | null;
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

  const fetchLibrary = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      let query = supabase
        .from('user_film_entries')
        .select(`
          id, status, rating, date_watched,
          films (id, tmdb_id, title, release_year, poster_url, tmdb_rating)
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLibrary();
  }, [fetchLibrary]);

  const renderEntry = ({ item }: { item: LibraryEntry }) => {
    const film = item.films;
    const imageUrl = film.poster_url?.startsWith('/')
      ? posterUrl(film.poster_url, 'w185')
      : null;

    return (
      <TouchableOpacity
        style={styles.entryRow}
        onPress={() => router.push(`/film/${film.tmdb_id}`)}
        activeOpacity={0.8}
      >
        {/* Poster */}
        <View style={styles.entryPoster}>
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
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Library</Text>

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
            <Text style={styles.statLabel}>Avg rating</Text>
          </View>
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
      ) : entries.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>
            {statusFilter === 'all' ? 'Your library is empty.' : `No ${statusFilter} films.`}
          </Text>
          <Text style={styles.emptySubtitle}>
            {statusFilter === 'all'
              ? 'Search for a film and add it to get started.'
              : `Films you mark as "${statusFilter}" will appear here.`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderEntry}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.brand.primary}
              colors={[Colors.brand.primary]}
            />
          }
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
    marginBottom: Spacing[5],
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
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
    paddingVertical: Spacing[3],
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
