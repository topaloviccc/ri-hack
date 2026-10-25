import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

export type NotificationsModule = typeof import('expo-notifications');

/**
 * Loads expo-notifications only when its native code is in the build, so a development build made
 * before it was added keeps running (just without reminders). Android only, like app blocking.
 */
export async function loadNotifications(): Promise<NotificationsModule | null> {
  if (Platform.OS !== 'android') return null;
  return requireOptionalNativeModule('ExpoNotificationScheduler')
    ? import('expo-notifications')
    : null;
}
