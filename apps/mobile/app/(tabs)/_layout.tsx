import { Tabs, Redirect } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useAuthStore } from '../../stores/auth';
import { Colors } from '@flick/ui';

export default function TabsLayout() {
  const { session, isLoading } = useAuthStore();
  if (isLoading) return null;
  if (!session) return <Redirect href="/(auth)/welcome" />;

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: Colors.brand.primary,
      tabBarInactiveTintColor: Colors.text.tertiary,
      tabBarLabelStyle: styles.tabLabel,
      tabBarHideOnKeyboard: true,
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { backgroundColor: Colors.background.elevated, borderTopColor: Colors.background.overlay, borderTopWidth: 1, height: 88, paddingBottom: 24, paddingTop: 10 },
  tabLabel: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.3 },
});
