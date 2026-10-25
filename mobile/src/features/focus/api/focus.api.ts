import { PermissionsAndroid } from 'react-native';

import { loadAppBlocker, type AppBlockerModule } from '@/features/focus/app-blocker-module';
import { randomBlockScreenConfig } from '@/features/focus/block-screen';
import type { BlockableApp, FocusPermissions } from '@/features/focus/types';
import { STORAGE_KEYS, storage } from '@/lib/storage';

const requireBlocker = async (): Promise<AppBlockerModule> => {
  const blocker = await loadAppBlocker();
  if (!blocker) throw new Error('App blocking needs the Android development build.');
  return blocker;
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === 'string');

const readBlockedApps = async (): Promise<string[]> => {
  try {
    const parsed: unknown = JSON.parse((await storage.get(STORAGE_KEYS.focusBlockedApps)) ?? '[]');
    return isStringArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const readIsActive = async () => (await storage.get(STORAGE_KEYS.focusIsActive)) === 'true';
// On unless the user switched it off: blocking is the point of picking apps.
const readIsEnabled = async () => (await storage.get(STORAGE_KEYS.focusEnabled)) !== 'false';

/**
 * Device-local app blocking. Our storage owns the chosen apps; the native blocker only gets them
 * while focus is on, because Android restarts its service on every boot regardless.
 */
export const focusApi = {
  /** null when blocking isn't available here (iOS, Expo Go). */
  getPermissions: async (): Promise<FocusPermissions | null> => {
    const blocker = await loadAppBlocker();
    if (!blocker) return null;
    const { details } = await blocker.getPermissionStatus();
    if (details.platform !== 'android') return null;
    return {
      overlay: details.overlay,
      usageAccess: details.usageStats,
      notifications: details.notifications,
    };
  },
  openOverlaySettings: async () => (await requireBlocker()).openOverlaySettings(),
  openUsageAccessSettings: async () => (await requireBlocker()).openUsageStatsSettings(),
  requestNotifications: () =>
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS),

  listInstalledApps: async (): Promise<BlockableApp[]> => {
    const apps = await (await requireBlocker()).getInstalledApps();
    return apps.map((app) => ({
      packageName: app.packageName,
      name: app.name,
      iconUri: app.iconBase64 ? `data:image/png;base64,${app.iconBase64}` : undefined,
    }));
  },
  getBlockedApps: readBlockedApps,
  setAppBlocked: async (packageName: string, isBlocked: boolean): Promise<string[]> => {
    const current = await readBlockedApps();
    const next = isBlocked
      ? [...new Set([...current, packageName])]
      : current.filter((p) => p !== packageName);
    await storage.set(STORAGE_KEYS.focusBlockedApps, JSON.stringify(next));
    if (await readIsActive()) (await requireBlocker()).setBlockedApps(next);
    return next;
  },

  getIsActive: readIsActive,
  setActive: async (isActive: boolean): Promise<boolean> => {
    const blocker = await requireBlocker();
    if (isActive) {
      blocker.configureAndroid(randomBlockScreenConfig());
      blocker.setBlockedApps(await readBlockedApps());
      blocker.startMonitoring();
    } else {
      blocker.setBlockedApps([]);
      blocker.stopMonitoring();
    }
    await storage.set(STORAGE_KEYS.focusIsActive, String(isActive));
    return isActive;
  },

  /** Settings' master switch for blocking and reminders during courses. */
  getIsEnabled: readIsEnabled,
  setEnabled: async (isEnabled: boolean): Promise<boolean> => {
    await storage.set(STORAGE_KEYS.focusEnabled, String(isEnabled));
    // The failsafe: switching off must end blocking right away, whatever left it on.
    if (!isEnabled && (await readIsActive())) await focusApi.setActive(false);
    return isEnabled;
  },
};
