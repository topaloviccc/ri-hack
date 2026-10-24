import { MOCK_COURSES } from '@/features/courses/api/courses.mock';
import {
  MOCK_CHALLENGE,
  MOCK_FEED,
  MOCK_WEEKLY_COMPLETIONS,
} from '@/features/network/api/network.mock';
import type { FeedItem, LeaderboardEntry, WeeklyChallenge } from '@/features/network/types';
import { ME_ID, MOCK_USERS } from '@/features/users/api/users.mock';
import { mockDelay } from '@/utils/mock-delay';

// TODO(hack): mock backend. The joins below reach into other features' mock data, which the real
// API will do server-side; this file is the only place allowed to, and it goes away with the
// mocks. See BACKLOG.md.
const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;
const FEED_LIMIT = 5;

const userById = (id: string) => MOCK_USERS.find((u) => u.id === id);
const courseTitle = (id: string) => MOCK_COURSES.find((c) => c.id === id)?.title ?? '';

export const networkApi = {
  listFeed: async (): Promise<FeedItem[]> => {
    await mockDelay();
    return MOCK_FEED.slice(0, FEED_LIMIT).map(({ id, userId, courseId, hoursAgo }) => {
      const user = userById(userId);
      return {
        id,
        userId,
        userName: user?.name ?? '',
        userAvatarUrl: user?.avatarUrl ?? '',
        courseId,
        courseTitle: courseTitle(courseId),
        completedAt: new Date(Date.now() - hoursAgo * HOUR_MS).toISOString(),
      };
    });
  },
  getChallenge: async (): Promise<WeeklyChallenge> => {
    await mockDelay();
    const { daysLeft, ...challenge } = MOCK_CHALLENGE;
    return {
      ...challenge,
      daysLeft,
      endsAt: new Date(Date.now() + daysLeft * DAY_MS).toISOString(),
    };
  },
  listLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    await mockDelay();
    return Object.entries(MOCK_WEEKLY_COMPLETIONS)
      .map(([userId, completedThisWeek]) => {
        const user = userById(userId);
        return {
          userId,
          userName: user?.name ?? '',
          userAvatarUrl: user?.avatarUrl ?? '',
          completedThisWeek,
          isMe: userId === ME_ID,
        };
      })
      .sort(
        (a, b) => b.completedThisWeek - a.completedThisWeek || a.userName.localeCompare(b.userName),
      )
      .map((entry, i) => ({ ...entry, rank: i + 1 }));
  },
};
