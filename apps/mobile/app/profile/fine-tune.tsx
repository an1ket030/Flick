import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Stack, router } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';
import { useAuthStore } from '../../stores/auth';
import { supabase } from '../../lib/supabase';
import DirectorGrid from '../../components/DirectorGrid';
import PrimaryIntentSelector, { IntentType } from '../../components/PrimaryIntentSelector';

type Step = 'extended_seeds' | 'directors' | 'intent';

// 8 niche/extended seed films
const EXTENDED_SEEDS = [
  { tmdb_id: 118340, title: 'Guardians of the Galaxy', year: 2014, poster_path: '/r7vmZjiyZw9rpJMQJmLHQ4YbPT3.jpg' },
  { tmdb_id: 530385, title: 'Midsommar', year: 2019, poster_path: '/7LEI8ulZzO5gy9Ww2NVCr6ZnMFR.jpg' },
  { tmdb_id: 264660, title: 'Ex Machina', year: 2015, poster_path: '/dmSqb0H2gKqQYw008dJvK2gJ92c.jpg' },
  { tmdb_id: 597089, title: 'Five Nights at Freddy\'s', year: 2023, poster_path: '/A4j8S6moJS2zNtRR8oWF08gRnL5.jpg' },
  { tmdb_id: 848538, title: 'Argylle', year: 2024, poster_path: '/srfAOSkEQiQ4S6QYg61kXgK1Boh.jpg' },
  { tmdb_id: 489, title: 'Good Will Hunting', year: 1997, poster_path: '/bABCBKYBK7A5G1x0FzoeoNfuj2.jpg' },
  { tmdb_id: 313369, title: 'La La Land', year: 2016, poster_path: '/uDO8zWDhfWwoFdKS4fzkUJt0Rv0.jpg' },
  { tmdb_id: 615656, title: 'Meg 2: The Trench', year: 2023, poster_path: '/uvnjE12C8dIe3xN8A7c03YqI2s6.jpg' },
];

type FilmEntry = {
  tmdb_id: number;
  rating: number | null; 
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
  num: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.background.overlay, alignItems: 'center', justifyContent: 'center' },
  numText: { fontSize: 12, fontFamily: Typography.family.bodyBold, color: Colors.text.secondary },
  skipBtn: { alignSelf: 'center', paddingVertical: 6 },
  skipText: { fontSize: Typography.size.xs, fontFamily: Typography.family.body, color: Colors.text.tertiary, textDecorationLine: 'underline' },
});

export default function FineTuneScreen() {
  const [currentStep, setCurrentStep] = useState<Step>('extended_seeds');
  const [loading, setLoading] = useState(false);
  const { session, user } = useAuthStore();

  // State for seeds
  const [entries, setEntries] = useState<Record<number, FilmEntry>>({});
  const answeredCount = Object.values(entries).filter(e => e.answered).length;

  // State for directors
  const [directors, setDirectors] = useState<string[]>([]);

  // State for intent
  const [intent, setIntent] = useState<IntentType | null>(null);

  const rate = (tmdb_id: number, rating: number | null) => {
    setEntries(prev => ({ ...prev, [tmdb_id]: { tmdb_id, rating, answered: true } }));
  };

  const toggleDirector = (name: string) => {
    setDirectors(prev => 
      prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name]
    );
  };

  const handleNextStep = () => {
    if (currentStep === 'extended_seeds') {
      if (answeredCount >= 4) setCurrentStep('directors');
    } else if (currentStep === 'directors') {
      setCurrentStep('intent');
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!intent || !user) return;
    setLoading(true);
    try {
      // 1. Submit extended seed targets
      const ratedEntries = Object.values(entries).filter(e => e.answered && e.rating !== null);
      const tmdbIds = ratedEntries.map(e => e.tmdb_id);

      if (tmdbIds.length > 0) {
        const { data: films, error: filmsErr } = await supabase
          .from('films')
          .select('id, tmdb_id')
          .in('tmdb_id', tmdbIds);

        if (filmsErr) throw filmsErr;

        // Warn if some rated films aren't in the DB yet (seed sync not run)
        if (!films || films.length < tmdbIds.length) {
          const foundIds = new Set((films ?? []).map(f => f.tmdb_id));
          const missing = tmdbIds.filter(id => !foundIds.has(id));
          console.warn(`⚠️ Fine-tune: ${missing.length} rated film(s) missing from DB (TMDB IDs: ${missing.join(', ')}). Run sync-tmdb to fix.`);
        }

        if (films && films.length > 0) {
          const entriesToInsert = films.map(film => ({
            user_id: user.id,
            film_id: film.id,
            status: 'watched',
            rating: entries[film.tmdb_id]?.rating,
          }));
          const { error: upsertErr } = await supabase
            .from('user_film_entries')
            .upsert(entriesToInsert, { onConflict: 'user_id,film_id' });
          if (upsertErr) throw upsertErr;
        }
      }

      // 2. Update Taste Profile
      const { error: profileErr } = await supabase
        .from('taste_profiles')
        .update({
          primary_intent: intent,
          director_familiarity: directors,
        })
        .eq('user_id', user.id);

      if (profileErr) throw profileErr;

      router.back();
    } catch (e: any) {
      console.error('Failed to complete fine tune', e);
      Alert.alert(
        'Save Failed',
        'We couldn\'t save your preferences. Please check your connection and try again.' +
          (e?.message ? `\n\nDetails: ${e.message}` : ''),
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderProgress = () => {
    const steps: Step[] = ['extended_seeds', 'directors', 'intent'];
    const activeIndex = steps.indexOf(currentStep);
    
    return (
      <View style={styles.progressContainer}>
        {steps.map((step, idx) => (
          <View 
            key={step} 
            style={[
              styles.progressSegment,
              idx <= activeIndex ? styles.progressActive : null
            ]} 
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Fine-Tune Taste',
        headerStyle: { backgroundColor: Colors.background.base },
        headerTintColor: Colors.text.primary,
        headerShadowVisible: false,
      }} />

      {renderProgress()}

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
        
        {currentStep === 'extended_seeds' && (
          <View>
            <Text style={styles.title}>Deeper cuts.</Text>
            <Text style={styles.subtitle}>Rate at least 4 of these films to help us refine your specific niches.</Text>
            
            <View style={styles.list}>
              {EXTENDED_SEEDS.map(item => {
                const entry = entries[item.tmdb_id];
                const answered = entry?.answered;
                return (
                  <View key={item.tmdb_id} style={[styles.filmRow, answered && styles.filmRowAnswered]}>
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
                            <View style={styles.ratingBadgeGiven}><Text style={styles.ratingBadgeText}>{entry.rating}/10</Text></View>
                          ) : (
                            <Text style={styles.notSeenText}>Not seen</Text>
                          )}
                          <TouchableOpacity onPress={() => setEntries(prev => { const next = { ...prev }; delete next[item.tmdb_id]; return next; })} activeOpacity={0.7}>
                            <Text style={styles.changeText}>Change</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <RatingRow onRate={(r) => rate(item.tmdb_id, r)} />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

          </View>
        )}

        {currentStep === 'directors' && (
          <View>
            <Text style={styles.title}>How many of these names do you know?</Text>
            <Text style={styles.subtitle}>Tap the directors you recognize. No guessing needed.</Text>
            <DirectorGrid selected={directors} onToggle={toggleDirector} />
          </View>
        )}

        {currentStep === 'intent' && (
          <View>
            <Text style={styles.title}>What do you most want from a film?</Text>
            <Text style={styles.subtitle}>This shapes how we talk to you about our recommendations.</Text>
            <PrimaryIntentSelector selected={intent} onSelect={setIntent} />
          </View>
        )}

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.primaryButton, 
            ((currentStep === 'extended_seeds' && answeredCount < 4) || 
             (currentStep === 'intent' && !intent) || 
             loading) && styles.primaryButtonDisabled
          ]} 
          onPress={handleNextStep}
          disabled={((currentStep === 'extended_seeds' && answeredCount < 4) || (currentStep === 'intent' && !intent) || loading)}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Saving...' : (currentStep === 'intent' ? 'Finish Fine-Tuning' : 'Continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.base,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.full,
  },
  progressActive: {
    backgroundColor: Colors.brand.primary,
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: Spacing[4],
    paddingBottom: Spacing[8],
  },
  title: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
    marginBottom: Spacing[6],
  },
  footer: {
    padding: Spacing[4],
    paddingBottom: Spacing[8],
    borderTopWidth: 1,
    borderColor: Colors.background.overlay,
    backgroundColor: Colors.background.base,
  },
  primaryButton: {
    backgroundColor: Colors.brand.primary,
    paddingVertical: Spacing[4],
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: Colors.background.base,
    fontFamily: Typography.family.heading,
    fontSize: Typography.size.base,
  },
  list: { gap: Spacing[4], marginTop: Spacing[4] },
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
  poster: { width: 56, height: 84, borderRadius: Radius.md, backgroundColor: Colors.background.overlay },
  filmInfo: { flex: 1 },
  filmTitle: { fontSize: Typography.size.base, fontFamily: Typography.family.headingSemi, color: Colors.text.primary, marginBottom: 2 },
  filmYear: { fontSize: Typography.size.xs, fontFamily: Typography.family.body, color: Colors.text.tertiary, marginBottom: Spacing[2] },
  answeredRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  ratingBadgeGiven: { backgroundColor: Colors.brand.primary, borderRadius: Radius.full, paddingHorizontal: Spacing[3], paddingVertical: 4 },
  ratingBadgeText: { fontSize: Typography.size.sm, fontFamily: Typography.family.bodyBold, color: Colors.text.inverse },
  notSeenText: { fontSize: Typography.size.sm, fontFamily: Typography.family.bodyMedium, color: Colors.text.tertiary },
  changeText: { fontSize: Typography.size.xs, fontFamily: Typography.family.body, color: Colors.brand.primary },
});
