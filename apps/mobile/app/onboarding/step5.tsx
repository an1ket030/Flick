/**
 * Onboarding Step 5 — Seed Film Ratings
 * 8 curated films, custom 10-point tap rating + "Haven't seen it" button
 * Requires rating/skip of at least 4 films
 * Writes rated films to user_film_entries with status: 'watched'
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/auth';
import { Colors, Typography, Spacing, Radius, posterUrl } from '@flick/ui';
import OnboardingProgress from '../../components/OnboardingProgress';

// 8 diverse, well-known seed films (tmdb_id, title, year, poster_path)
const SEED_FILMS = [
  { tmdb_id: 238, title: 'The Godfather', year: 1972, poster_path: '/3bhkrj58Vtu7enYsLeSHO7LKXW1.jpg' },
  { tmdb_id: 680, title: 'Pulp Fiction', year: 1994, poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
  { tmdb_id: 19404, title: 'Dilwale Dulhania Le Jayenge', year: 1995, poster_path: '/kSBXou5Ac7vEqKd97wotJumyJvU.jpg' },
  { tmdb_id: 496243, title: 'Parasite', year: 2019, poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg' },
  { tmdb_id: 157336, title: 'Interstellar', year: 2014, poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
  { tmdb_id: 330457, title: 'Frozen', year: 2013, poster_path: '/kgwjIb2JDHRhNk13lmSxiClFjVk.jpg' },
  { tmdb_id: 546554, title: 'Knives Out', year: 2019, poster_path: '/pThyQovXQrws2hmLinls2m19Vmo.jpg' },
  { tmdb_id: 101, title: 'Léon: The Professional', year: 1994, poster_path: '/yI6X2cx7QBmMmsOUhXHAdoxKwfj.jpg' },
];

type FilmEntry = {
  tmdb_id: number;
  rating: number | null; // null = "Haven't seen it"
  answered: boolean;
};

function RatingRow({ onRate }: { onRate: (r: number | null) => void }) {
  return (
    <View style={ratingStyles.container}>
      <View style={ratingStyles.stars}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <TouchableOpacity
            key={n}
            onPress={() => onRate(n)}
            style={ratingStyles.num}
            activeOpacity={0.7}
          >
            <Text style={ratingStyles.numText}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={() => onRate(null)} style={ratingStyles.skipBtn} activeOpacity={0.7}>
        <Text style={ratingStyles.skipText}>Haven't seen it</Text>
      </TouchableOpacity>
    </View>
  );
}

const ratingStyles = StyleSheet.create({
  container: { marginTop: Spacing[3] },
  stars: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing[2] },
  num: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    fontSize: 12,
    fontFamily: Typography.family.bodyBold,
    color: Colors.text.secondary,
  },
  skipBtn: {
    alignSelf: 'center',
    paddingVertical: 6,
  },
  skipText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
    textDecorationLine: 'underline',
  },
});

export default function OnboardingStep5() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<Record<number, FilmEntry>>({});
  const [loading, setLoading] = useState(false);

  const rate = (tmdb_id: number, rating: number | null) => {
    setEntries(prev => ({ ...prev, [tmdb_id]: { tmdb_id, rating, answered: true } }));
  };

  const answeredCount = Object.values(entries).filter(e => e.answered).length;
  const canContinue = answeredCount >= 4;

  const handleFinish = async () => {
    if (!canContinue) return;
    setLoading(true);
    try {
      // Get film IDs from tmdb_ids
      const tmdbIds = Object.values(entries)
        .filter(e => e.answered && e.rating !== null)
        .map(e => e.tmdb_id);

      if (tmdbIds.length > 0) {
        const { data: films } = await supabase
          .from('films')
          .select('id, tmdb_id')
          .in('tmdb_id', tmdbIds);

        if (films && films.length > 0) {
          const entriesToInsert = films.map(film => ({
            user_id: user!.id,
            film_id: film.id,
            status: 'watched',
            rating: entries[film.tmdb_id]?.rating,
            created_at: new Date().toISOString(),
          }));

          await supabase.from('user_film_entries').upsert(entriesToInsert, {
            onConflict: 'user_id,film_id',
          });
        }
      }

      router.push('/onboarding/complete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingProgress currentStep={5} />

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.stepLabel}>SEED RATINGS</Text>
          <Text style={styles.title}>Rate what you know.</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{answeredCount}/8</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>
        Rate at least 4 films. Tap a number 1–10 or "Haven't seen it".
      </Text>

      <FlatList
        data={SEED_FILMS}
        keyExtractor={item => String(item.tmdb_id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const entry = entries[item.tmdb_id];
          const answered = entry?.answered;
          return (
            <View style={[styles.filmRow, answered && styles.filmRowAnswered]}>
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/w154${item.poster_path}` }}
                style={styles.poster}
                contentFit="cover"
              />
              <View style={styles.filmInfo}>
                <Text style={styles.filmTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.filmYear}>{item.year}</Text>
                {answered ? (
                  <View style={styles.answeredRow}>
                    {entry.rating !== null ? (
                      <View style={styles.ratingBadgeGiven}>
                        <Text style={styles.ratingBadgeText}>{entry.rating}/10</Text>
                      </View>
                    ) : (
                      <Text style={styles.notSeenText}>Not seen</Text>
                    )}
                    <TouchableOpacity
                      onPress={() => setEntries(prev => {
                        const next = { ...prev };
                        delete next[item.tmdb_id];
                        return next;
                      })}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.changeText}>Change</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <RatingRow onRate={(r) => rate(item.tmdb_id, r)} />
                )}
              </View>
            </View>
          );
        }}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, (!canContinue || loading) && styles.nextButtonDisabled]}
          onPress={handleFinish}
          disabled={!canContinue || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={Colors.text.inverse} />
            : <Text style={styles.nextButtonText}>
                {canContinue ? 'Build my taste profile' : `Rate ${4 - answeredCount} more to continue`}
              </Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.base },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[6],
    marginBottom: Spacing[2],
  },
  stepLabel: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.brand.primary,
    letterSpacing: 2,
    marginBottom: Spacing[1],
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  countBadge: {
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
  },
  countBadgeText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodyBold,
    color: Colors.text.inverse,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
    paddingHorizontal: Spacing[6],
    lineHeight: 20,
    marginBottom: Spacing[4],
  },
  list: {
    paddingHorizontal: Spacing[6],
    gap: Spacing[4],
    paddingBottom: Spacing[4],
  },
  filmRow: {
    flexDirection: 'row',
    gap: Spacing[4],
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.background.overlay,
  },
  filmRowAnswered: {
    borderColor: Colors.brand.primary,
    backgroundColor: 'rgba(255,107,44,0.05)',
  },
  poster: {
    width: 56,
    height: 84,
    borderRadius: Radius.md,
    backgroundColor: Colors.background.overlay,
  },
  filmInfo: { flex: 1 },
  filmTitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.headingSemi,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  filmYear: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
    marginBottom: Spacing[2],
  },
  answeredRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  ratingBadgeGiven: {
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 4,
  },
  ratingBadgeText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodyBold,
    color: Colors.text.inverse,
  },
  notSeenText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.text.tertiary,
  },
  changeText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    color: Colors.brand.primary,
  },
  footer: {
    paddingHorizontal: Spacing[6],
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  nextButtonDisabled: { opacity: 0.5 },
  nextButtonText: {
    fontSize: Typography.size.md,
    fontFamily: Typography.family.bodyBold,
    color: Colors.text.inverse,
  },
});
