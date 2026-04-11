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
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setErrors({ general: error.message });
      }
      // On success, auth listener in _layout redirects automatically
    } catch (err: any) {
      setErrors({ general: 'Something went wrong. Try again.' });
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.title}>Welcome back.</Text>
          <Text style={styles.subtitle}>Sign in to your Flick account.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {errors.general && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errors.general}</Text>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email address</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              value={email}
              onChangeText={(t) => { setEmail(t); setErrors(p => ({ ...p, email: undefined, general: undefined })); }}
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
              onChangeText={(t) => { setPassword(t); setErrors(p => ({ ...p, password: undefined, general: undefined })); }}
              placeholder="••••••••"
              placeholderTextColor={Colors.text.tertiary}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}
          </View>

          <TouchableOpacity
            onPress={() => Alert.alert('Coming soon', 'Password reset via email — coming in the next update.')}
            style={styles.forgotLink}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>Forgot your password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.text.inverse} />
            ) : (
              <Text style={styles.primaryButtonText}>Sign in</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign up link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/signup')} activeOpacity={0.7}>
            <Text style={styles.footerLink}>Create one</Text>
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
    marginBottom: Spacing[10],
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
  fieldError: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    color: Colors.status.error,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: -Spacing[2],
  },
  forgotText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bodyMedium,
    color: Colors.brand.primary,
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
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: Typography.size.md,
    fontFamily: Typography.family.bodyBold,
    color: Colors.text.inverse,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing[10],
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
});
