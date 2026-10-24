import { ME_ID, MOCK_USERS } from '@/features/users/api/users.mock';
import type { User, UserFilters } from '@/features/users/types';
import { ApiError } from '@/lib/api-client';
import { mockDelay } from '@/utils/mock-delay';

// TODO(hack): mock backend with in-memory state so friend requests survive until app restart.
// Swap for api-client calls once the API exists. See BACKLOG.md.
const users: User[] = MOCK_USERS.map((u) => ({ ...u }));
const SUGGESTED_LIMIT = 10;

const findUser = (id: string) => {
  const user = users.find((u) => u.id === id);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const matches = (user: User, query: string) => {
  const q = query.trim().toLowerCase();
  return user.name.toLowerCase().includes(q) || user.handle.toLowerCase().includes(q);
};

export const usersApi = {
  meId: ME_ID,
  list: async ({ query, relation, suggested }: UserFilters = {}): Promise<User[]> => {
    await mockDelay();
    if (suggested) {
      return users
        .filter((u) => u.relation === 'none' || u.relation === 'requested')
        .sort((a, b) => b.mutualFriendsCount - a.mutualFriendsCount)
        .slice(0, SUGGESTED_LIMIT);
    }
    return users.filter(
      (u) =>
        u.relation !== 'me' &&
        (!relation || u.relation === relation) &&
        (!query || matches(u, query)),
    );
  },
  getById: async (id: string): Promise<User> => {
    await mockDelay();
    return { ...findUser(id) };
  },
  sendFriendRequest: async (id: string): Promise<User> => {
    await mockDelay();
    const user = findUser(id);
    if (user.relation !== 'none') throw new ApiError(409, 'Already connected');
    user.relation = 'requested';
    return { ...user };
  },
};
