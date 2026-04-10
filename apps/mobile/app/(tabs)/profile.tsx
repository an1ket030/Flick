import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '@flick/ui';
import { useAuthStore } from '../../stores/auth';

export default function ProfileScreen() {
  const { profile, signOut } = useAuthStore();
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.c}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.ph}>
          <Text style={styles.icon}>👤</Text>
          <Text style={styles.name}>{profile?.display_name ?? profile?.username ?? 'Your Profile'}</Text>
          <Text style={styles.sub}>Stats, Collections and Settings - Phase 1</Text>
        </View>
        <TouchableOpacity style={styles.out} onPress={signOut}>
          <Text style={styles.outText}>Sign Out</Text>
        </TouchableOpacity>
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
  name: { fontFamily: 'Inter_700Bold', fontSize: Typography.size.lg, color: Colors.text.primary, marginBottom: Spacing[2] },
  sub: { fontFamily: 'Inter_400Regular', fontSize: Typography.size.sm, color: Colors.text.tertiary },
  out: { padding: Spacing[4], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.status.error, alignItems: 'center' },
  outText: { fontFamily: 'Inter_600SemiBold', fontSize: Typography.size.base, color: Colors.status.error },
});
