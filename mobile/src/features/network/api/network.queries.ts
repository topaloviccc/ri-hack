import { queryOptions, useQuery } from '@tanstack/react-query';

import { networkApi } from '@/features/network/api/network.api';
import { FRIENDSHIP_SCOPED } from '@/lib/query-client';

export const networkKeys = {
  all: ['network'] as const,
  feed: () => [...networkKeys.all, 'feed'] as const,
  leaderboard: () => [...networkKeys.all, 'leaderboard'] as const,
};

export const feedQueryOptions = () =>
  queryOptions({
    queryKey: networkKeys.feed(),
    queryFn: networkApi.listFeed,
    meta: FRIENDSHIP_SCOPED,
  });

export const leaderboardQueryOptions = () =>
  queryOptions({
    queryKey: networkKeys.leaderboard(),
    queryFn: networkApi.listLeaderboard,
    meta: FRIENDSHIP_SCOPED,
  });

export const useFeedQuery = () => useQuery(feedQueryOptions());

export const useLeaderboardQuery = () => useQuery(leaderboardQueryOptions());
