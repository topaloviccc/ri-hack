import type { UserResponse } from './users.dto';
import { MOCK_USERS } from './users.mock';
import type { User, UserFilters } from '@/features/users/types';
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
    (await apiRequest<UserResponse[]>('/users', { query: filters, viewer: true })).map(toUser),
  getById: async (id: string): Promise<User> =>
    toUser(await apiRequest<UserResponse>(`/users/${encodeURIComponent(id)}`, { viewer: true })),
  me: async (): Promise<User> =>
    toUser(await apiRequest<UserResponse>('/users/me', { viewer: true })),
  sendFriendRequest: async (id: string): Promise<User> =>
    toUser(
      await apiRequest<UserResponse>(`/users/${encodeURIComponent(id)}/friend-requests`, {
        method: 'POST',
        viewer: true,
      }),
    ),
};
