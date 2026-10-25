import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

export type AppBlockerModule = typeof import('expo-app-blocker');

/**
 * Loads expo-app-blocker only when its native code is in the build. The package throws on import
 * otherwise, which would crash Expo Go and Jest. Android only by product decision.
 */
export async function loadAppBlocker(): Promise<AppBlockerModule | null> {
  if (Platform.OS !== 'android') return null;
  return requireOptionalNativeModule('ExpoAppBlocker') ? import('expo-app-blocker') : null;
}
