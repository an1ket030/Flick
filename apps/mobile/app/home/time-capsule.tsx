/**
 * Time Capsule Screen — Phase 3 Sprint 3.3
 *
 * Immersive full-screen card presenting the monthly birth-year film 
 * recommendation with Gemini-generated context.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth';
import { Colors, Typography, Spacing, Radius, posterUrl, backdropUrl } from '@flick/ui';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://flick-ysai.onrender.com';

interface TimeCapsuleData {
  target_year: number;
  ai_copy: string;
  generated_at: string;
  films: {
    id: string;
    tmdb_id: number;
    title: string;
    release_year: number;
    poster_path: string | null;
    backdrop_path: string | null;
    tmdb_rating: number;
    genres: string[];
    synopsis: string | null;
  };
}

export default function TimeCapsuleScreen() {
  const { session } = useAuthStore();
  const [data, setData] = useState<TimeCapsuleData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCapsule = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/recommendations/time-capsule`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (err) {
      console.error('[TimeCapsule] fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => { fetchCapsule(); }, [fetchCapsule]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.brand.primary} size="large" />
      </View>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.center} edges={['top', 'bottom']}>
        <Text style={styles.errorText}>Your Time Capsule isn't ready yet.</Text>
        <TouchableOpacity style={styles.backBtnWrapper} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { films: film, target_year, ai_copy } = data;

  return (
    <View style={styles.container}>
      {/* Background Poster/Backdrop */}
      <Image
        source={{ uri: posterUrl(film.poster_path, 'w780') }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        blurRadius={3}
      />
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Time Capsule</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.yearBadge}>
            <Text style={styles.yearText}>{target_year}</Text>
          </View>

          <Text style={styles.filmTitle}>{film.title}</Text>
          
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>★ {film.tmdb_rating.toFixed(1)}</Text>
            <Text style={styles.metaDivider}>·</Text>
            <Text style={styles.metaText}>{target_year}</Text>
          </View>

          {/* AI Copy Block */}
          <View style={styles.aiBlock}>
            <View style={styles.aiHeader}>
              <Text style={styles.aiHeaderIcon}>✦</Text>
              <Text style={styles.aiHeaderText}>From the Archives</Text>
            </View>
            <Text style={styles.aiCopy}>{ai_copy}</Text>
          </View>

        </ScrollView>

        {/* Action Bottom */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.detailBtn}
            onPress={() => router.push(`/film/${film.tmdb_id}`)}
            activeOpacity={0.9}
          >
            <Text style={styles.detailBtnText}>View Film Details</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.base },
  center: { flex: 1, backgroundColor: Colors.background.base, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: Colors.text.primary, fontFamily: Typography.family.body, fontSize: Typography.size.base, marginBottom: Spacing[4] },
  backBtnWrapper: { padding: Spacing[3], backgroundColor: Colors.background.surface, borderRadius: Radius.full },
  backBtnText: { color: Colors.text.primary, fontFamily: Typography.family.bodyBold },
  
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  safeArea: { flex: 1 },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 22,
  },
  closeText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  headerTitle: {
    color: '#FFF',
    fontFamily: Typography.family.headingSemi,
    fontSize: Typography.size.base,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  scrollContent: {
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[10],
    paddingBottom: Spacing[10],
    alignItems: 'center',
  },
  
  yearBadge: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[1],
    borderRadius: Radius.full,
    marginBottom: Spacing[6],
  },
  yearText: {
    color: '#000',
    fontFamily: Typography.family.bodyBold,
    fontSize: Typography.size.lg,
  },
  
  filmTitle: {
    color: '#FFF',
    fontFamily: Typography.family.heading,
    fontSize: Typography.size['4xl'],
    textAlign: 'center',
    marginBottom: Spacing[3],
    lineHeight: 48,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[8],
  },
  metaText: { color: 'rgba(255,255,255,0.7)', fontFamily: Typography.family.bodyMedium, fontSize: Typography.size.base },
  metaDivider: { color: 'rgba(255,255,255,0.3)', marginHorizontal: Spacing[2] },

  aiBlock: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.lg,
    padding: Spacing[5],
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[3],
    gap: Spacing[2],
  },
  aiHeaderIcon: {
    color: Colors.brand.primary,
    fontSize: Typography.size.lg,
  },
  aiHeaderText: {
    color: Colors.brand.primary,
    fontFamily: Typography.family.bodyBold,
    fontSize: Typography.size.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiCopy: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: Typography.family.body,
    fontSize: Typography.size.base,
    lineHeight: 26,
  },

  footer: {
    padding: Spacing[6],
  },
  detailBtn: {
    backgroundColor: Colors.text.inverse,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailBtnText: {
    color: '#000',
    fontFamily: Typography.family.bodyBold,
    fontSize: Typography.size.base,
  },
});
