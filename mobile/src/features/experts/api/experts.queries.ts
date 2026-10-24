import { queryOptions, useQuery } from '@tanstack/react-query';

import { expertsApi } from '@/features/experts/api/experts.api';

export const expertRequestKeys = {
  all: ['expertRequests'] as const,
  list: () => [...expertRequestKeys.all, 'list'] as const,
};

export const expertRequestListQueryOptions = () =>
  queryOptions({ queryKey: expertRequestKeys.list(), queryFn: expertsApi.list });

export const useExpertRequestsQuery = () => useQuery(expertRequestListQueryOptions());
