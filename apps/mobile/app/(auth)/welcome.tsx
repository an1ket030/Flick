import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-linking';
import { supabase } from '../../lib/supabase';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Required for Expo WebBrowser to handle redirects properly
WebBrowser.maybeCompleteAuthSession();

const POSTER_GRID = [
  'https://image.tmdb.org/t/p/w342/eTp7gSPkSF3Aw79mNx1NkBP1PZT.jpg',
  'https://image.tmdb.org/t/p/w342/eJGWx219ZcEMVQJhAgMiqo8tYY.jpg',
  'https://image.tmdb.org/t/p/w342/mjkS2iAgWj3ik1DTjvI15nHZ7yl.jpg',
  'https://image.tmdb.org/t/p/w342/7wIBfBl2gejt6xHxNSK0reVIm7E.jpg',
  'https://image.tmdb.org/t/p/w342/3Qud19bBUrrJAzy0Ilm8gRJlJXP.jpg',
  'https://image.tmdb.org/t/p/w342/29Jdsak3SrwGds5k1t43kH6Khed.jpg',
  'https://image.tmdb.org/t/p/w342/aabwWZWx6z1aYP4PX2ADvbDKktd.jpg',
  'https://image.tmdb.org/t/p/w342/ygWXPL0RS91JyJPNOfK34eV3bRE.jpg',
  'https://image.tmdb.org/t/p/w342/yihdXomYb5kTeSivtFndMy5iDmf.jpg',
  'https://image.tmdb.org/t/p/w342/xjtWQ2CL1mpmMNwuU5HeS4Iuwuu.jpg',
  'https://image.tmdb.org/t/p/w342/uLXxpWRfoIPfB2fwM8hsAMIjSWf.jpg',
  'https://image.tmdb.org/t/p/w342/buPFnHZ3xQy6vZEHxbHgL1Pc6CR.jpg',
  'https://image.tmdb.org/t/p/w342/wfuqMlaExcoYiUEvKfVpUTt1v4u.jpg',
  'https://image.tmdb.org/t/p/w342/tVvpFIoteRHNnoZMhdnwIVwJpCA.jpg',
  'https://image.tmdb.org/t/p/w342/72AoFPC5TY4DfJwXXS9rPwPeReD.jpg',
  'https://image.tmdb.org/t/p/w342/fWVSwgjpT2D78VUh6X8UBd2rorW.jpg',
  'https://image.tmdb.org/t/p/w342/6oI4oQKTWMVUlr8Ivqydp28Ruu6.jpg',
  'https://image.tmdb.org/t/p/w342/3OyQTl0IGkbnjDxd3MhztfPE34g.jpg',
  'https://image.tmdb.org/t/p/w342/2H1TmgdfNtsVKq9k1vh15WqTsD1.jpg',
  'https://image.tmdb.org/t/p/w342/A4j8S6moRN2oo9mNNbiHLiMbK21.jpg',
  'https://image.tmdb.org/t/p/w342/nCbkMgexW07a781xM2qjPqjI485.jpg',
  'https://image.tmdb.org/t/p/w342/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  'https://image.tmdb.org/t/p/w342/57m3B8qHn7D7xG2PXX7Dq3G2r.jpg',
  'https://image.tmdb.org/t/p/w342/k8Q9ilyMUaTowDeCRZgGjL85h.jpg'
];

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const redirectTo = Linking.createURL('/');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });
      if (error) { Alert.alert('Error', error.message); return; }
      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type === 'success' && result.url) {
          // Supabase returns tokens in the URL fragment (#access_token=...)
          // Expo Linking.parse doesn't parse fragments, so we extract manually
          const url = result.url;
          const fragmentIndex = url.indexOf('#');
          const fragment = fragmentIndex >= 0 ? url.substring(fragmentIndex + 1) : '';
          const params: Record<string, string> = {};
          fragment.split('&').forEach(part => {
            const [key, val] = part.split('=');
            if (key && val) params[decodeURIComponent(key)] = decodeURIComponent(val);
          });

          const accessToken = params['access_token'];
          const refreshToken = params['refresh_token'];

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          } else {
            // Fallback: let supabase detect session from URL
            await supabase.auth.getSession();
          }
        } else if (result.type === 'cancel') {
          // User dismissed — silent fail
        }
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      Alert.alert('Sign-in failed', `Could not complete Google sign-in. Error: ${err?.message || 'Unknown error'}`);
    } finally {
      setGoogleLoading(false);
    }
  };

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
                  top: row * (POSTER_SIZE * 1.5 - 15) - 10,
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

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google OAuth */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
            activeOpacity={0.85}
          >
            {googleLoading ? (
              <ActivityIndicator color={Colors.text.primary} size="small" />
            ) : (
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            )}
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
  },
  googleButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.full,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    minHeight: 52,
  },
  googleButtonText: {
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
