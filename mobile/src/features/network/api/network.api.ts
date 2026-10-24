import { MOCK_CHALLENGE } from './network.mock';
import type { FeedItem, LeaderboardEntry, WeeklyChallenge } from '@/features/network/types';
import { apiRequest } from '@/lib/api-client';

type FeedItemResponse = Omit<FeedItem, 'userAvatarUrl'> & { userAvatarUrl: string | null };
type LeaderboardEntryResponse = Omit<LeaderboardEntry, 'userAvatarUrl'> & {
  userAvatarUrl: string | null;
};

export const networkApi = {
  listFeed: async (): Promise<FeedItem[]> =>
    (await apiRequest<FeedItemResponse[]>('/network/feed', { viewer: true })).map((row) => ({
      ...row,
      userAvatarUrl: row.userAvatarUrl ?? '',
    })),
  listLeaderboard: async (): Promise<LeaderboardEntry[]> =>
    (await apiRequest<LeaderboardEntryResponse[]>('/network/leaderboard', { viewer: true })).map(
      (row) => ({ ...row, userAvatarUrl: row.userAvatarUrl ?? '' }),
    ),
  // Demo only: the schema has no challenge definitions/progress. Never mixed with live scores.
  getChallenge: async (): Promise<WeeklyChallenge> => ({
    ...MOCK_CHALLENGE,
    endsAt: new Date(Date.now() + MOCK_CHALLENGE.daysLeft * 86_400_000).toISOString(),
  }),
};
