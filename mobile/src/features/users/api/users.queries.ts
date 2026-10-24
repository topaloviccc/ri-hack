import { queryOptions, useQuery } from '@tanstack/react-query';

import { usersApi } from '@/features/users/api/users.api';
import type { UserFilters } from '@/features/users/types';

export const userKeys = {
  all: ['users'] as const,
  list: (f: UserFilters = {}) => [...userKeys.all, 'list', f] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

export const userListQueryOptions = (f: UserFilters = {}) =>
  queryOptions({ queryKey: userKeys.list(f), queryFn: () => usersApi.list(f) });

export const userQueryOptions = (id: string) =>
  queryOptions({ queryKey: userKeys.detail(id), queryFn: () => usersApi.getById(id) });

export const useUsersQuery = (f: UserFilters = {}) => useQuery(userListQueryOptions(f));

export const useUserQuery = (id: string) => useQuery(userQueryOptions(id));

export const useMeQuery = () => useUserQuery(usersApi.meId);
