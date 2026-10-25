import AsyncStorage from '@react-native-async-storage/async-storage';

// Non-sensitive preferences only. Tokens belong in expo-secure-store (CLAUDE.md §6).
export const STORAGE_KEYS = {
  themePreference: 'settings.themePreference',
  focusBlockedApps: 'focus.blockedApps',
  focusIsActive: 'focus.isActive',
  feedHintsSeen: 'courses.feedHintsSeen',
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const storage = {
  get: (key: StorageKey) => AsyncStorage.getItem(key),
  set: (key: StorageKey, value: string) => AsyncStorage.setItem(key, value),
};
