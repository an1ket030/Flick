import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#0A0A0A', '#141414', '#0A0A0A']} style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.wordmark}>FLICK</Text>
          <Text style={styles.tagline}>Cinema, curated for you.</Text>
          <Text style={styles.sub}>One film. Every day. Chosen because it fits exactly how you watch.</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(auth)/signup')} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Start watching better</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={() => router.push('/(auth)/login')} activeOpacity={0.7}>
            <Text style={styles.ghostBtnText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background.base },
  container: { flex: 1, padding: Spacing[6], justifyContent: 'space-between' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing[5] },
  wordmark: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 52, color: Colors.brand.primary, letterSpacing: 12 },
  tagline: { fontFamily: 'PlayfairDisplay_400Regular', fontSize: Typography.size.xl, color: Colors.text.primary, textAlign: 'center' },
  sub: { fontFamily: 'Inter_400Regular', fontSize: Typography.size.base, color: Colors.text.secondary, textAlign: 'center', lineHeight: 24 },
  actions: { gap: Spacing[3] },
  primaryBtn: { backgroundColor: Colors.brand.primary, paddingVertical: Spacing[4], borderRadius: Radius.xl, alignItems: 'center' },
  primaryBtnText: { fontFamily: 'Inter_700Bold', fontSize: Typography.size.base, color: Colors.text.inverse },
  ghostBtn: { paddingVertical: Spacing[3], alignItems: 'center' },
  ghostBtnText: { fontFamily: 'Inter_400Regular', fontSize: Typography.size.base, color: Colors.text.secondary },
});
