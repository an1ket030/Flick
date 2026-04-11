import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Curated real movie posters arranged in a collage background
const POSTER_GRID = [
  'https://image.tmdb.org/t/p/w342/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', // The Shawshank Redemption
  'https://image.tmdb.org/t/p/w342/3bhkrj58Vtu7enYsLeSHO7LKXW1.jpg', // The Godfather
  'https://image.tmdb.org/t/p/w342/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg', // Oppenheimer
  'https://image.tmdb.org/t/p/w342/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg', // Interstellar
  'https://image.tmdb.org/t/p/w342/vBNbFU3OS6okJIQANOWYqqSr4xm.jpg', // Parasite
  'https://image.tmdb.org/t/p/w342/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg', // Dune Part Two
  'https://image.tmdb.org/t/p/w342/qjA0jnltMS738VEeQUm8Kzm1QDm.jpg', // Blade Runner 2049
  'https://image.tmdb.org/t/p/w342/sgxzT54GnvgeMnOZgpQQx9csAdd.jpg', // Whiplash
  'https://image.tmdb.org/t/p/w342/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg', // Fight Club
  'https://image.tmdb.org/t/p/w342/iuFNMS8vlEpbNtl5hkuxE0anY6U.jpg', // Goodfellas
  'https://image.tmdb.org/t/p/w342/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', // The Dark Knight
  'https://image.tmdb.org/t/p/w342/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg', // Joker
];

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
        delay: 200,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
        delay: 300,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
        delay: 100,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Collage poster background */}
      <View style={styles.posterGrid}>
        {POSTER_GRID.map((uri, index) => {
          const col = index % 3;
          const row = Math.floor(index / 3);
          return (
            <View
              key={index}
              style={[
                styles.posterCell,
                {
                  left: col * (SCREEN_WIDTH / 3),
                  top: row * (SCREEN_HEIGHT / 4),
                  transform: [{ rotate: `${(index % 2 === 0 ? 1 : -1) * 2}deg` }],
                },
              ]}
            >
              <Image
                source={{ uri }}
                style={styles.posterImage}
                contentFit="cover"
              />
            </View>
          );
        })}
      </View>

      {/* Deep gradient overlay — fades posters into black from bottom */}
      <LinearGradient
        colors={['rgba(18,18,18,0.2)', 'rgba(18,18,18,0.6)', 'rgba(18,18,18,0.92)', '#121212']}
        locations={[0, 0.35, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
          <Text style={styles.logoText}>flick</Text>
          <View style={styles.logoDot} />
        </Animated.View>

        {/* Tagline */}
        <Text style={styles.tagline}>Your personal film companion.</Text>
        <Text style={styles.subTagline}>
          Discover, track, and truly understand{'\n'}what cinema means to you.
        </Text>

        {/* CTAs */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(auth)/signup')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Get started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.75}
          >
            <Text style={styles.secondaryButtonText}>I already have an account</Text>
          </TouchableOpacity>
        </View>

        {/* Legal micro-copy */}
        <Text style={styles.legal}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </Animated.View>
    </View>
  );
}

const POSTER_SIZE = SCREEN_WIDTH / 3 + 10;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.base,
  },

  // ── Poster grid ──
  posterGrid: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  posterCell: {
    position: 'absolute',
    width: POSTER_SIZE,
    height: POSTER_SIZE * 1.5,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },

  // ── Content ──
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 52,
    paddingHorizontal: Spacing[6],
  },

  // ── Logo ──
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing[5],
    gap: 4,
  },
  logoText: {
    fontSize: 52,
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    letterSpacing: -2,
    lineHeight: 56,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.brand.primary,
    marginBottom: 12,
  },

  // ── Tagline ──
  tagline: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: Spacing[3],
    lineHeight: 34,
  },
  subTagline: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: Spacing[10],
  },

  // ── Buttons ──
  ctaContainer: {
    gap: Spacing[3],
    marginBottom: Spacing[6],
  },
  primaryButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: Typography.size.md,
    fontFamily: Typography.family.bodyBold,
    color: Colors.text.inverse,
    letterSpacing: 0.2,
  },
  secondaryButton: {
    backgroundColor: 'rgba(240,240,240,0.08)',
    borderRadius: Radius.full,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(240,240,240,0.12)',
  },
  secondaryButtonText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.text.primary,
    letterSpacing: 0.2,
  },

  // ── Legal ──
  legal: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
