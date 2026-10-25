import { useQuery } from '@tanstack/react-query';

import { focusApi } from '@/features/focus/api/focus.api';

const INSTALLED_APPS_STALE_MS = 5 * 60_000;

export const focusKeys = {
  all: ['focus'] as const,
  permissions: () => [...focusKeys.all, 'permissions'] as const,
  installedApps: () => [...focusKeys.all, 'installedApps'] as const,
  blockedApps: () => [...focusKeys.all, 'blockedApps'] as const,
  isEnabled: () => [...focusKeys.all, 'isEnabled'] as const,
};

export const useFocusPermissionsQuery = () =>
  useQuery({
    queryKey: focusKeys.permissions(),
    queryFn: focusApi.getPermissions,
    // Granted in system settings, outside the app: re-check whenever the app comes back.
    staleTime: 0,
  });

export const useInstalledAppsQuery = () =>
  useQuery({
    queryKey: focusKeys.installedApps(),
    queryFn: focusApi.listInstalledApps,
    staleTime: INSTALLED_APPS_STALE_MS,
  });

// Local storage never changes behind our back.
export const useBlockedAppsQuery = () =>
  useQuery({
    queryKey: focusKeys.blockedApps(),
    queryFn: focusApi.getBlockedApps,
    staleTime: Infinity,
  });

export const useFocusEnabledQuery = () =>
  useQuery({
    queryKey: focusKeys.isEnabled(),
    queryFn: focusApi.getIsEnabled,
    staleTime: Infinity,
  });
