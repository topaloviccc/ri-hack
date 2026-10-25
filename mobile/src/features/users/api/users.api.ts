import type { UserResponse } from './users.dto';
import { MOCK_USERS } from './users.mock';
import type { FriendshipAction, User, UserFilters } from '@/features/users/types';
import { apiRequest } from '@/lib/api-client';
import { demoSample } from '@/utils/demo-sample';

const toUser = (row: UserResponse): User => ({
  ...row,
  avatarUrl: row.avatarUrl ?? '',
  countryCode: row.countryCode ?? '',
  bio: demoSample(row.id, MOCK_USERS).bio,
});

export const usersApi = {
  list: async (filters: UserFilters = {}): Promise<User[]> =>
    (await apiRequest<UserResponse[]>('/users', { query: filters })).map(toUser),
  getById: async (id: string): Promise<User> =>
    toUser(await apiRequest<UserResponse>(`/users/${encodeURIComponent(id)}`)),
  me: async (): Promise<User> => toUser(await apiRequest<UserResponse>('/users/me')),
  sendFriendRequest: async (id: string): Promise<User> =>
    toUser(
      await apiRequest<UserResponse>(`/users/${encodeURIComponent(id)}/friend-requests`, {
        method: 'POST',
      }),
    ),
  /** `id` is the other user: who sent the request, who received it, or the friend. */
  updateFriendship: async (id: string, action: FriendshipAction): Promise<User> => {
    const suffix = action === 'unfriend' ? 'unfriend' : `friend-requests/${action}`;
    return toUser(
      await apiRequest<UserResponse>(`/users/${encodeURIComponent(id)}/${suffix}`, {
        method: 'POST',
      }),
    );
  },
};
