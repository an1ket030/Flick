import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#121212' } }}>
      <Stack.Screen name="import" />
      <Stack.Screen name="import-progress" />
      <Stack.Screen name="import-review" />
    </Stack>
  );
}
