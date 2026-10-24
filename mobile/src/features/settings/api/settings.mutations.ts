import { useMutation, useQueryClient } from '@tanstack/react-query';

import { settingsApi } from '@/features/settings/api/settings.api';
import { settingsKeys } from '@/features/settings/api/settings.queries';
import type { ThemePreference } from '@/features/settings/types';

export function useUpdateThemePreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (preference: ThemePreference) => settingsApi.updateThemePreference(preference),
    onSuccess: (preference) => queryClient.setQueryData(settingsKeys.theme(), preference),
  });
}
