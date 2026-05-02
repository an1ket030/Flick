import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@flick/ui';

export default function OnboardingLayout() {
  return (
    <View style={styles.root}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#121212' }, animation: 'slide_from_right' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background.base },
});
