import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';

export default function SignupScreen() {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!displayName.trim()) e.displayName = 'Name is required.';
    if (!username.trim()) e.username = 'Username is required.';
    else if (!/^[a-z0-9_]{3,20}$/.test(username)) e.username = '3–20 chars, lowercase letters, numbers, underscores only.';
    if (!email.trim()) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: username.trim().toLowerCase(),
            display_name: displayName.trim(),
          },
        },
      });
      if (error) {
        setErrors({ general: error.message });
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setErrors({ general: 'Something went wrong. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Check your inbox.</Text>
          <Text style={styles.successSubtitle}>
            We sent a verification link to{'\n'}
            <Text style={{ color: Colors.brand.primary }}>{email}</Text>
            {'\n\n'}Click it to activate your account and start using Flick.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace('/(auth)/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Go to sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create your account.</Text>
          <Text style={styles.subtitle}>Join Flick. It takes under a minute.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {errors.general && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errors.general}</Text>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Your name</Text>
            <TextInput
              style={[styles.input, errors.displayName ? styles.inputError : null]}
              value={displayName}
              onChangeText={(t) => { setDisplayName(t); setErrors(p => ({ ...p, displayName: undefined })); }}
              placeholder="e.g. Alex"
              placeholderTextColor={Colors.text.tertiary}
              autoCapitalize="words"
              returnKeyType="next"
            />
            {errors.displayName && <Text style={styles.fieldError}>{errors.displayName}</Text>}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Username</Text>
            <View style={styles.usernameWrap}>
              <Text style={styles.usernameAt}>@</Text>
              <TextInput
                style={[styles.usernameInput, errors.username ? styles.inputError : null]}
                value={username}
                onChangeText={(t) => { setUsername(t.toLowerCase()); setErrors(p => ({ ...p, username: undefined })); }}
                placeholder="yourhandle"
                placeholderTextColor={Colors.text.tertiary}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
            {errors.username && <Text style={styles.fieldError}>{errors.username}</Text>}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email address</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              value={email}
              onChangeText={(t) => { setEmail(t); setErrors(p => ({ ...p, email: undefined })); }}
              placeholder="your@email.com"
              placeholderTextColor={Colors.text.tertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
            {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              value={password}
              onChangeText={(t) => { setPassword(t); setErrors(p => ({ ...p, password: undefined })); }}
              placeholder="8+ characters"
              placeholderTextColor={Colors.text.tertiary}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSignup}
            />
            {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.text.inverse} />
            ) : (
              <Text style={styles.primaryButtonText}>Create account</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.legalText}>
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>

        {/* Login link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')} activeOpacity={0.7}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.base,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: 64,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: Spacing[8],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: Colors.text.primary,
    fontFamily: Typography.family.body,
  },
  header: {
    marginBottom: Spacing[8],
  },
  title: {
    fontSize: Typography.size['3xl'],
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    letterSpacing: -1,
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
  },
  form: {
    gap: Spacing[5],
    flex: 1,
  },
  errorBanner: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    padding: Spacing[4],
  },
  errorBannerText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.status.error,
  },
  fieldGroup: {
    gap: Spacing[2],
  },
  fieldLabel: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.text.secondary,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.background.overlay,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    fontSize: Typography.size.base,
    fontFamily: Typography.family.body,
    color: Colors.text.primary,
    minHeight: 52,
  },
  inputError: {
    borderColor: Colors.status.error,
  },
  usernameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.background.overlay,
    minHeight: 52,
    overflow: 'hidden',
  },
  usernameAt: {
    paddingHorizontal: Spacing[4],
    fontSize: Typography.size.base,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
  },
  usernameInput: {
    flex: 1,
    paddingVertical: Spacing[4],
    paddingRight: Spacing[4],
    fontSize: Typography.size.base,
    fontFamily: Typography.family.body,
    color: Colors.text.primary,
    borderWidth: 0,
  },
  fieldError: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    color: Colors.status.error,
  },
  primaryButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[2],
    minHeight: 56,
  },
  primaryButtonDisabled: { opacity: 0.6 },
  primaryButtonText: {
    fontSize: Typography.size.md,
    fontFamily: Typography.family.bodyBold,
    color: Colors.text.inverse,
  },
  legalText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing[8],
  },
  footerText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
  },
  footerLink: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodySemibold,
    color: Colors.brand.primary,
  },
  // ── Success state ──
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[8],
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderWidth: 2,
    borderColor: Colors.status.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[6],
  },
  successIconText: {
    fontSize: 28,
    color: Colors.status.success,
    fontFamily: Typography.family.heading,
  },
  successTitle: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.family.heading,
    color: Colors.text.primary,
    marginBottom: Spacing[4],
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  successSubtitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.family.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing[10],
  },
});
