import { queryOptions, useQuery } from '@tanstack/react-query';

import { badgesApi } from './badges.api';

export const badgeKeys = {
  all: ['badges'] as const,
  detail: (id: string) => [...badgeKeys.all, 'detail', id] as const,
  user: (userId: string) => [...badgeKeys.all, 'user', userId] as const,
};

export const badgeQueryOptions = (id: string) =>
  queryOptions({ queryKey: badgeKeys.detail(id), queryFn: () => badgesApi.getById(id) });

export const useBadgeQuery = (id: string) => useQuery(badgeQueryOptions(id));

export const useUserBadgesQuery = (userId: string) =>
  useQuery({ queryKey: badgeKeys.user(userId), queryFn: () => badgesApi.listForUser(userId) });
