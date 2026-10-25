import type { FeedItem, LeaderboardEntry } from '@/features/network/types';
import { apiRequest } from '@/lib/api-client';

type FeedItemResponse = Omit<FeedItem, 'userAvatarUrl'> & { userAvatarUrl: string | null };
type LeaderboardEntryResponse = Omit<LeaderboardEntry, 'userAvatarUrl'> & {
  userAvatarUrl: string | null;
};

export const networkApi = {
  listFeed: async (): Promise<FeedItem[]> =>
    (await apiRequest<FeedItemResponse[]>('/network/feed')).map((row) => ({
      ...row,
      userAvatarUrl: row.userAvatarUrl ?? '',
    })),
  listLeaderboard: async (): Promise<LeaderboardEntry[]> =>
    (await apiRequest<LeaderboardEntryResponse[]>('/network/leaderboard')).map((row) => ({
      ...row,
      userAvatarUrl: row.userAvatarUrl ?? '',
    })),
};
