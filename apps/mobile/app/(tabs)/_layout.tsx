import { Tabs, Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useAuthStore } from '../../stores/auth';
import { Colors } from '@flick/ui';

// Inline SVG-path icon components using simple shapes instead of requiring icon library
// Using text-based tab icons for now — will upgrade to Lucide in full implementation
function HomeIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 18, height: 16, borderRadius: 2, borderWidth: 2, borderColor: color, borderBottomWidth: 0 }} />
      <View style={{ width: 24, height: 2, backgroundColor: color, borderRadius: 1, position: 'absolute', bottom: 4 }} />
    </View>
  );
}

export default function TabsLayout() {
  const { session, isLoading } = useAuthStore();
  if (isLoading) return null;
  if (!session) return <Redirect href="/(auth)/welcome" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.brand.primary,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <View style={[styles.iconDot, { backgroundColor: color }]} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <View style={[styles.iconDot, { backgroundColor: color }]} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <View style={[styles.iconDot, { backgroundColor: color }]} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <View style={[styles.iconDot, { backgroundColor: color }]} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <View style={[styles.iconDot, { backgroundColor: color }]} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1A1A1A',
    borderTopColor: '#2E2E2E',
    borderTopWidth: 1,
    height: 88,
    paddingBottom: 24,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tabItem: {
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'BeVietnamPro_600SemiBold',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(255, 107, 44, 0.15)',
  },
  iconDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
