import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '@flick/ui';
import { useAuthStore } from '../../stores/auth';

export default function HomeScreen() {
  const { profile } = useAuthStore();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>{greeting}{profile ? `, ${profile.display_name ?? profile.username}` : ''}</Text>
        <Text style={styles.sub}>Your Daily Pick is being prepared.</Text>
        <View style={styles.ph}><Text style={styles.icon}>🎬</Text><Text style={styles.phText}>Daily Pick, Recommendations — Phase 1</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background.base },
  container: { flex: 1 },
  content: { padding: Spacing[5], gap: Spacing[4] },
  greeting: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: Typography.size['2xl'], color: Colors.text.primary },
  sub: { fontFamily: 'Inter_400Regular', fontSize: Typography.size.base, color: Colors.text.secondary },
  ph: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  icon: { fontSize: 40, marginBottom: Spacing[3] },
  phText: { fontFamily: 'Inter_400Regular', fontSize: Typography.size.sm, color: Colors.text.tertiary, textAlign: 'center' },
});
