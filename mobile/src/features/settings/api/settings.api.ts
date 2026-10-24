import { Appearance } from 'react-native';

import { THEME_PREFERENCES, type ThemePreference } from '@/features/settings/types';
import { STORAGE_KEYS, storage } from '@/lib/storage';

const isThemePreference = (value: unknown): value is ThemePreference =>
  THEME_PREFERENCES.some((p) => p === value);

// 'unspecified' hands the scheme back to the OS.
const applyTheme = (preference: ThemePreference) =>
  Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);

/** Device-local settings: read/write storage and apply the result immediately. */
export const settingsApi = {
  getThemePreference: async (): Promise<ThemePreference> => {
    const stored = await storage.get(STORAGE_KEYS.themePreference);
    const preference = isThemePreference(stored) ? stored : 'system';
    applyTheme(preference);
    return preference;
  },
  updateThemePreference: async (preference: ThemePreference): Promise<ThemePreference> => {
    applyTheme(preference);
    await storage.set(STORAGE_KEYS.themePreference, preference);
    return preference;
  },
};
