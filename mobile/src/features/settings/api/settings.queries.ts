import { queryOptions, useQuery } from '@tanstack/react-query';

import { settingsApi } from '@/features/settings/api/settings.api';

export const settingsKeys = {
  all: ['settings'] as const,
  theme: () => [...settingsKeys.all, 'theme'] as const,
};

export const themePreferenceQueryOptions = () =>
  queryOptions({
    queryKey: settingsKeys.theme(),
    queryFn: settingsApi.getThemePreference,
    // Local storage never changes behind our back.
    staleTime: Infinity,
  });

/** Also restores the saved theme; the root layout waits on it before hiding the splash. */
export const useThemePreferenceQuery = () => useQuery(themePreferenceQueryOptions());
