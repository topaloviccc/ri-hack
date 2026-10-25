/** How the signed-in user relates to this user. `requested`: they were sent a request;
 * `incoming`: they sent the signed-in user a request. */
export type Relation = 'me' | 'friend' | 'requested' | 'incoming' | 'none';

export type UserSummary = {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
};

export type User = UserSummary & {
  /** ISO 3166-1 alpha-2 */
  countryCode: string;
  bio: string | null;
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

/** `accept`/`decline`: a request you received; `cancel`: one you sent; `unfriend`: an accepted friend. */
export type FriendshipAction = 'accept' | 'decline' | 'cancel' | 'unfriend';
