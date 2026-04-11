import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';

export default function ProfileScreen() {
  const { profile, session, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out of Flick?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  const displayName = profile?.display_name || session?.user?.email?.split('@')[0] || 'User';
  const username = profile?.username;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Profile</Text>
      </View>

      {/* Avatar + name */}
      <View style={styles.profileBlock}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
        <Text style={styles.displayName}>{displayName}</Text>
        {username && <Text style={styles.username}>@{username}</Text>}
        {session?.user?.email && (
          <Text style={styles.email}>{session.user.email}</Text>
        )}
      </View>

      {/* Menu items */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionLabel}>Account</Text>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.75}>
          <Text style={styles.menuItemText}>Edit profile</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.75}>
          <Text style={styles.menuItemText}>Notification preferences</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.75}>
          <Text style={styles.menuItemText}>Privacy settings</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.menuSectionLabel}>Flick</Text>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.75}>
          <Text style={styles.menuItemText}>About</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.75}>
          <Text style={styles.menuItemText}>Terms of Service</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.75}>
          <Text style={styles.menuItemText}>Privacy Policy</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Sign out */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        activeOpacity={0.75}
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Flick · Phase 1 Build</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.base,
  },
  scrollContent: {
    paddingBottom: 60,
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

  // ── Profile block ──
  profileBlock: {
    alignItems: 'center',
    paddingVertical: Spacing[8],
    paddingHorizontal: Spacing[6],
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[4],
  },
  avatarInitial: {
    fontSize: Typography.size['4xl'],
    fontFamily: Typography.family.heading,
    color: Colors.text.inverse,
    letterSpacing: -1,
  },
  displayName: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  username: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  email: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
  },

  // ── Menu ──
  menuSection: {
    marginHorizontal: Spacing[6],
    marginBottom: Spacing[5],
  },
  menuSectionLabel: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.text.tertiary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing[2],
    paddingHorizontal: Spacing[1],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    marginBottom: 2,
    minHeight: 52,
  },
  menuItemText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.text.primary,
  },
  menuItemArrow: {
    fontSize: Typography.size.lg,
    color: Colors.text.tertiary,
    fontFamily: Typography.family.body,
  },

  // ── Sign Out ──
  signOutButton: {
    marginHorizontal: Spacing[6],
    marginTop: Spacing[2],
    borderRadius: Radius.lg,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    minHeight: 52,
  },
  signOutText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.status.error,
  },

  // ── Version ──
  version: {
    textAlign: 'center',
    marginTop: Spacing[6],
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
  },
});
