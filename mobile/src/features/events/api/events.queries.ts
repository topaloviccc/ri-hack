import { queryOptions, useQuery } from '@tanstack/react-query';

import { eventsApi } from '@/features/events/api/events.api';
import type { EventFilters } from '@/features/events/types';

export const eventKeys = {
  all: ['events'] as const,
  list: (f: EventFilters) => [...eventKeys.all, 'list', f] as const,
  detail: (id: string) => [...eventKeys.all, 'detail', id] as const,
};

export const eventListQueryOptions = (f: EventFilters) =>
  queryOptions({ queryKey: eventKeys.list(f), queryFn: () => eventsApi.list(f) });

export const eventQueryOptions = (id: string) =>
  queryOptions({ queryKey: eventKeys.detail(id), queryFn: () => eventsApi.getById(id) });

export const useEventsQuery = (f: EventFilters) => useQuery(eventListQueryOptions(f));

export const useEventQuery = (id: string) => useQuery(eventQueryOptions(id));
