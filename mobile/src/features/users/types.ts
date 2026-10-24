/** How the signed-in user relates to this user. */
export type Relation = 'me' | 'friend' | 'requested' | 'none';

export type UserSummary = {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
};

export type User = UserSummary & {
  /** ISO 3166-1 alpha-2 */
  countryCode: string;
  bio: string;
  stats: { completedCount: number; streakDays: number; countriesCount: number };
  /** Countries where the user completed at least one course */
  badgeCountryCodes: string[];
  inProgressCourseIds: string[];
  completedCourseIds: string[];
  relation: Relation;
  mutualFriendsCount: number;
};

export type UserFilters = {
  query?: string;
  relation?: Relation;
  suggested?: boolean;
};
