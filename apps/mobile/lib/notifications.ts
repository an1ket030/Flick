import { Platform, LogBox } from 'react-native';

// Suppress the expected warning about push notifications in Expo Go
LogBox.ignoreLogs(['`expo-notifications` functionality is not fully supported in Expo Go']);

/**
 * All expo-notifications imports and calls are inside functions (NOT at module
 * load time). This prevents the TokenEmitter crash in Expo Go where the native
 * push module initializes asynchronously.
 */

/** Call once on app boot — safe to call in useEffect, NOT at module level. */
export function setupNotificationHandler() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {
    console.warn('[notifications] setNotificationHandler failed (Expo Go?):', e);
  }
}

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  try {
    // Lazy imports — only load expo-notifications when actually called
    const Device = require('expo-device');
    const Notifications = require('expo-notifications');

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (!Device.isDevice) {
      console.log('[notifications] Must use physical device for Push Notifications');
      return undefined;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[notifications] Permission denied for push notifications');
      return undefined;
    }

    const rawToken = await Notifications.getDevicePushTokenAsync();
    return rawToken.data as string;
  } catch (e) {
    console.warn('[notifications] registerForPushNotificationsAsync failed:', e);
    return undefined;
  }
}

export async function sendTokenToBackend(token: string, sessionToken: string) {
  try {
    const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://flick-ysai.onrender.com';
    const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/notifications/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ token, platform: Platform.OS }),
    });

    if (!response.ok) {
      throw new Error('Push token register failed.');
    }
  } catch (error) {
    console.warn('[notifications] Error registering push token on backend:', error);
  }
}
