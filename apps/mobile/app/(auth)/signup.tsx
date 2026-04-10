import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, TextInput, Button } from '@flick/ui';
import { supabase } from '../../lib/supabase';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !username) { Alert.alert('Missing fields', 'Please fill all fields.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
    setLoading(false);
    if (error) Alert.alert('Sign up failed', error.message);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Your cinema journey begins.</Text>
        </View>
        <View style={styles.form}>
          <TextInput label="Username" value={username} onChangeText={setUsername} placeholder="cinephile42" returnKeyType="next" />
          <TextInput label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" returnKeyType="next" autoCapitalize="none" />
          <TextInput label="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry returnKeyType="done" onSubmitEditing={handleSignup} />
          <Button label="Create account" onPress={handleSignup} loading={loading} fullWidth size="lg" />
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have one? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.link}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background.base },
  container: { flex: 1, padding: Spacing[6] },
  header: { marginBottom: Spacing[8] },
  backBtn: { marginBottom: Spacing[6] },
  backText: { fontFamily: 'Inter_400Regular', fontSize: Typography.size.base, color: Colors.text.secondary },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: Typography.size['3xl'], color: Colors.text.primary, marginBottom: Spacing[2] },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: Typography.size.base, color: Colors.text.secondary },
  form: { gap: Spacing[4] },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing[6] },
  footerText: { fontFamily: 'Inter_400Regular', fontSize: Typography.size.base, color: Colors.text.secondary },
  link: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.size.base, color: Colors.brand.primary },
});
