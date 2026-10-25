export type FeedItem = {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string;
  courseId: string;
  courseTitle: string;
  /** ISO 8601 */
  completedAt: string;
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  userName: string;
  userAvatarUrl: string;
  completedThisWeek: number;
  isMe: boolean;
};
