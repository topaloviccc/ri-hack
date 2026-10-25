import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

export type NotificationsModule = typeof import('expo-notifications');

/**
 * Loads expo-notifications only when its native code is in the build, so a development build made
 * before it was added keeps running (just without reminders). Android only, like app blocking.
 */
export async function loadNotifications(): Promise<NotificationsModule | null> {
  if (Platform.OS !== 'android') return null;
  // expo-notifications eagerly imports its Android topic module from its public entry point.
  // Checking only the scheduler lets an older development build pass this check and then throw
  // while importing the package because it does not contain ExpoTopicSubscriptionModule yet.
  return requireOptionalNativeModule('ExpoNotificationScheduler') &&
    requireOptionalNativeModule('ExpoTopicSubscriptionModule')
    ? import('expo-notifications')
    : null;
}
