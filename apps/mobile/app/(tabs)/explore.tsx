import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '@flick/ui';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.c}>
        <Text style={styles.title}>Explore</Text>
        <View style={styles.ph}><Text style={styles.icon}>🧭</Text><Text style={styles.sub}>Predictions, Mood Pick and Discovery - Phase 2</Text></View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background.base },
  c: { flex: 1, padding: Spacing[5] },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: Typography.size.xl, color: Colors.text.primary },
  ph: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 40, marginBottom: Spacing[3] },
  sub: { fontFamily: 'Inter_400Regular', fontSize: Typography.size.sm, color: Colors.text.tertiary, textAlign: 'center' },
});
