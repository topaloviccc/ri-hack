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

export type WeeklyChallenge = {
  id: string;
  title: string;
  reward: string;
  progress: number;
  target: number;
  /** ISO 8601 */
  endsAt: string;
  daysLeft: number;
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  userName: string;
  userAvatarUrl: string;
  completedThisWeek: number;
  isMe: boolean;
};
