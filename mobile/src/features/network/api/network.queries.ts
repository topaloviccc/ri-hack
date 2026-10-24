import { queryOptions, useQuery } from '@tanstack/react-query';

import { networkApi } from '@/features/network/api/network.api';

export const networkKeys = {
  all: ['network'] as const,
  feed: () => [...networkKeys.all, 'feed'] as const,
  challenge: () => [...networkKeys.all, 'challenge'] as const,
  leaderboard: () => [...networkKeys.all, 'leaderboard'] as const,
};

export const feedQueryOptions = () =>
  queryOptions({ queryKey: networkKeys.feed(), queryFn: networkApi.listFeed });

export const challengeQueryOptions = () =>
  queryOptions({ queryKey: networkKeys.challenge(), queryFn: networkApi.getChallenge });

export const leaderboardQueryOptions = () =>
  queryOptions({ queryKey: networkKeys.leaderboard(), queryFn: networkApi.listLeaderboard });

export const useFeedQuery = () => useQuery(feedQueryOptions());

export const useChallengeQuery = () => useQuery(challengeQueryOptions());

export const useLeaderboardQuery = () => useQuery(leaderboardQueryOptions());
