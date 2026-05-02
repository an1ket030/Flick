import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, profileUrl } from '@flick/ui';
import { Image } from 'expo-image';

export default function PersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Placeholder — real data fetching from TMDB can be added here
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar placeholder */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarIcon}>🎬</Text>
          </View>
        </View>

        <Text style={styles.name}>Person #{id}</Text>
        <Text style={styles.role}>Director / Actor</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Filmography</Text>
        <Text style={styles.placeholder}>
          Filmography data will appear here once TMDB person details are loaded.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.base,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: Colors.text.primary,
  },
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[12],
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: Spacing[4],
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: Radius.full,
    backgroundColor: Colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background.overlay,
  },
  avatarIcon: {
    fontSize: 48,
  },
  name: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing[1],
  },
  role: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.background.overlay,
    marginVertical: Spacing[6],
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.text.primary,
    alignSelf: 'flex-start',
    marginBottom: Spacing[3],
  },
  placeholder: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
