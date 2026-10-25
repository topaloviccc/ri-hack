import { useMutation, useQueryClient } from '@tanstack/react-query';

import { focusApi } from '@/features/focus/api/focus.api';
import { focusKeys } from '@/features/focus/api/focus.queries';

type ToggleVariables = { packageName: string; isBlocked: boolean };

export function useToggleBlockedApp() {
  const queryClient = useQueryClient();
  return useMutation({
    // Each toggle reads then writes the stored list; a shared scope runs them one at a time.
    scope: { id: 'focus.blockedApps' },
    mutationFn: ({ packageName, isBlocked }: ToggleVariables) =>
      focusApi.setAppBlocked(packageName, isBlocked),
    onSuccess: (blocked) => queryClient.setQueryData(focusKeys.blockedApps(), blocked),
  });
}

export function useSetFocusEnabled() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: focusApi.setEnabled,
    onSuccess: (isEnabled) => queryClient.setQueryData(focusKeys.isEnabled(), isEnabled),
  });
}

/** Shows Android's notification prompt, then re-checks permissions. */
export function useRequestNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: focusApi.requestNotifications,
    onSettled: () => queryClient.invalidateQueries({ queryKey: focusKeys.permissions() }),
  });
}
