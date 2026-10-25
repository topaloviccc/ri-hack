import { queryOptions, useQuery } from '@tanstack/react-query';

import { eventsApi } from '@/features/events/api/events.api';

export const eventKeys = {
  all: ['events'] as const,
  list: () => [...eventKeys.all, 'list'] as const,
  detail: (id: string) => [...eventKeys.all, 'detail', id] as const,
};

export const eventListQueryOptions = () =>
  queryOptions({ queryKey: eventKeys.list(), queryFn: eventsApi.list });

export const eventQueryOptions = (id: string) =>
  queryOptions({ queryKey: eventKeys.detail(id), queryFn: () => eventsApi.getById(id) });

export const useEventsQuery = () => useQuery(eventListQueryOptions());

export const useEventQuery = (id: string) => useQuery(eventQueryOptions(id));
