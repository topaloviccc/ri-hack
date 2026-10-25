import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import { AppState } from 'react-native';

import { ApiError } from '@/lib/api-client';

const STALE_TIME_MS = 60_000;
const MAX_RETRIES = 2;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      // Client errors won't fix themselves on retry.
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status >= 400 && error.status < 500) &&
        failureCount < MAX_RETRIES,
    },
  },
});

// RN has no window focus/online events.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(state.isConnected !== false)),
);

AppState.addEventListener('change', (status) => focusManager.setFocused(status === 'active'));

/**
 * Tags queries whose results depend on who the signed-in user's friends are, so a friendship
 * change can refresh them without the users feature importing every feature that shows friends.
 */
export const FRIENDSHIP_SCOPED = { friendshipScoped: true } as const;

export const invalidateFriendshipScoped = (client: QueryClient) =>
  client.invalidateQueries({ predicate: (query) => query.meta?.friendshipScoped === true });
