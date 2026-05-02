/**
 * Rewatch Vault Screen — Phase 3 Sprint 3.1
 *
 * Shows films rated ≥8.5 that the user hasn't revisited in 12+ months,
 * with rotating prompt copy and a re-rating flow that records a delta.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth';
import { Colors, Typography, Spacing, Radius, posterUrl } from '@flick/ui';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://flick-ysai.onrender.com';

// 6 rotating prompt templates — selected by (rating + film title length) % 6
const VAULT_PROMPTS = [
  (title: string) => `You gave ${title} a ${''} — does it still hold up?`,
  (title: string) => `It's been over a year since ${title}. Ready to revisit?`,
  (_title: string) => 'Films change as we do. Time to find out.',
  (title: string) => `You loved ${title}. Has your definition of that word changed?`,
  (_title: string) => 'A classic deserves more than one viewing.',
  (title: string) => `${title} has been waiting patiently. It has questions.`,
];

interface VaultEntry {
  id: string;
  rating: number;
  date_watched: string;
  rewatch_number: number;
  films: {
    id: string;
    tmdb_id: number;
    title: string;
    release_year: number;
    poster_path: string | null;
    backdrop_path: string | null;
    tmdb_rating: number;
    synopsis: string | null;
  };
}

export default function VaultScreen() {
  const { session } = useAuthStore();
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Re-rating modal state
  const [rewatchTarget, setRewatchTarget] = useState<VaultEntry | null>(null);
  const [newRating, setNewRating] = useState<number>(8.5);
  const [rewatchNote, setRewatchNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchVault = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/library/vault`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setEntries(json.data ?? []);
      }
    } catch (err) {
      console.error('[Vault] fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => { fetchVault(); }, [fetchVault]);

  const handleRewatch = async () => {
    if (!rewatchTarget || !session?.access_token) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/library/rewatch`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          film_id: rewatchTarget.films.id,
          new_rating: newRating,
          note: rewatchNote || undefined,
        }),
      });

      if (!res.ok) throw new Error('Rewatch failed');
      const json = await res.json();

      const delta = json.delta;
      const deltaStr = delta > 0 ? `+${delta}` : `${delta}`;
      const isPositive = delta >= 0;

      setRewatchTarget(null);
      setRewatchNote('');
      await fetchVault();

      Alert.alert(
        isPositive ? '⬆ It grew on you' : '⬇ Tastes evolve',
        `${deltaStr} from your original rating of ${json.old_rating}.\n\nYour new rating: ${newRating}`,
        [{ text: 'Done', style: 'default' }],
      );
    } catch (err) {
      Alert.alert('Error', 'Could not save your rewatch. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPrompt = (entry: VaultEntry) => {
    const idx = Math.floor((entry.rating + entry.films.title.length) % VAULT_PROMPTS.length);
    return VAULT_PROMPTS[idx](entry.films.title);
  };

  const RatingButtons = () => (
    <View style={styles.ratingRow}>
      {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((v) => (
        <TouchableOpacity
          key={v}
          style={[styles.ratingBtn, newRating === v && styles.ratingBtnActive]}
          onPress={() => setNewRating(v)}
        >
          <Text style={[styles.ratingBtnText, newRating === v && styles.ratingBtnTextActive]}>
            {v}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEntry = ({ item }: { item: VaultEntry }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push(`/film/${item.films.tmdb_id}`)}
    >
      <Image
        source={{ uri: posterUrl(item.films.poster_path, 'w185') }}
        style={styles.poster}
        contentFit="cover"
      />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.films.title}</Text>
        <Text style={styles.cardMeta}>{item.films.release_year} · Your rating: {item.rating}</Text>
        <Text style={styles.cardPrompt} numberOfLines={2}>{getPrompt(item)}</Text>
        <TouchableOpacity
          style={styles.rewatchBtn}
          activeOpacity={0.85}
          onPress={() => {
            setRewatchTarget(item);
            setNewRating(item.rating);
            setRewatchNote('');
          }}
        >
          <Text style={styles.rewatchBtnText}>Rate it again →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={Colors.brand.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Rewatch Vault</Text>
          <Text style={styles.headerSub}>{entries.length} film{entries.length !== 1 ? 's' : ''} waiting</Text>
        </View>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏛</Text>
          <Text style={styles.emptyTitle}>Vault is empty</Text>
          <Text style={styles.emptyText}>
            Films you rate 8.5 or above will appear here after 12 months — ready for re-evaluation.
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderEntry}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Re-rating Modal */}
      <Modal
        visible={!!rewatchTarget}
        animationType="slide"
        transparent
        onRequestClose={() => setRewatchTarget(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {rewatchTarget?.films.title}
            </Text>
            <Text style={styles.modalMeta}>
              Original rating: {rewatchTarget?.rating} · Watch #{(rewatchTarget?.rewatch_number ?? 1) + 1}
            </Text>

            <Text style={styles.label}>Your new rating</Text>
            <RatingButtons />

            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="What struck you differently this time?"
              placeholderTextColor={Colors.text.tertiary}
              multiline
              numberOfLines={3}
              value={rewatchNote}
              onChangeText={setRewatchNote}
            />

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleRewatch}
              disabled={submitting}
            >
              {submitting
                ? <ActivityIndicator color={Colors.text.inverse} size="small" />
                : <Text style={styles.submitBtnText}>Save rewatch</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRewatchTarget(null)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Not yet</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.base },
  center: { flex: 1, backgroundColor: Colors.background.base, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.overlay,
  },
  backBtn: { padding: Spacing[2] },
  backText: { fontSize: 22, color: Colors.text.primary },
  headerTitle: { fontSize: Typography.size.xl, fontFamily: Typography.family.headingSemi, color: Colors.text.primary },
  headerSub: { fontSize: Typography.size.xs, fontFamily: Typography.family.body, color: Colors.text.tertiary, marginTop: 2 },
  list: { padding: Spacing[5], gap: Spacing[4] },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.background.card,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.background.overlay,
  },
  poster: { width: 90, height: 135 },
  cardBody: { flex: 1, padding: Spacing[4], justifyContent: 'space-between' },
  cardTitle: { fontSize: Typography.size.base, fontFamily: Typography.family.headingSemi, color: Colors.text.primary, lineHeight: 22 },
  cardMeta: { fontSize: Typography.size.xs, fontFamily: Typography.family.body, color: Colors.text.tertiary, marginTop: 2 },
  cardPrompt: { fontSize: Typography.size.sm, fontFamily: Typography.family.body, color: Colors.text.secondary, lineHeight: 20, marginTop: Spacing[2], fontStyle: 'italic' },
  rewatchBtn: {
    marginTop: Spacing[3],
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderRadius: Radius.md,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
  },
  rewatchBtnText: { fontSize: Typography.size.xs, fontFamily: Typography.family.bodyBold, color: Colors.brand.primary },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing[10] },
  emptyIcon: { fontSize: 48, marginBottom: Spacing[4] },
  emptyTitle: { fontSize: Typography.size.xl, fontFamily: Typography.family.headingSemi, color: Colors.text.primary, marginBottom: Spacing[3] },
  emptyText: { fontSize: Typography.size.sm, fontFamily: Typography.family.body, color: Colors.text.tertiary, textAlign: 'center', lineHeight: 22 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Colors.background.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing[6], paddingBottom: Spacing[10] },
  modalHandle: { width: 40, height: 4, backgroundColor: Colors.background.overlay, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing[5] },
  modalTitle: { fontSize: Typography.size['2xl'], fontFamily: Typography.family.heading, color: Colors.text.primary, marginBottom: Spacing[1] },
  modalMeta: { fontSize: Typography.size.sm, fontFamily: Typography.family.body, color: Colors.text.tertiary, marginBottom: Spacing[5] },
  label: { fontSize: Typography.size.sm, fontFamily: Typography.family.bodyMedium, color: Colors.text.secondary, marginBottom: Spacing[2] },
  ratingRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginBottom: Spacing[5] },
  ratingBtn: { paddingVertical: Spacing[2], paddingHorizontal: Spacing[3], borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.background.overlay, backgroundColor: Colors.background.surface },
  ratingBtnActive: { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary },
  ratingBtnText: { fontSize: Typography.size.sm, fontFamily: Typography.family.bodyMedium, color: Colors.text.secondary },
  ratingBtnTextActive: { color: '#000' },
  noteInput: { borderWidth: 1, borderColor: Colors.background.overlay, borderRadius: Radius.md, padding: Spacing[4], color: Colors.text.primary, fontFamily: Typography.family.body, fontSize: Typography.size.sm, minHeight: 80, textAlignVertical: 'top', marginBottom: Spacing[5] },
  submitBtn: { backgroundColor: Colors.brand.primary, borderRadius: Radius.full, paddingVertical: Spacing[4], alignItems: 'center', marginBottom: Spacing[3] },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: Typography.size.base, fontFamily: Typography.family.bodyBold, color: '#000' },
  cancelBtn: { alignItems: 'center', paddingVertical: Spacing[2] },
  cancelText: { fontSize: Typography.size.sm, fontFamily: Typography.family.body, color: Colors.text.tertiary },
});
