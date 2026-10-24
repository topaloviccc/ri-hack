import type { EventResponse } from './events.dto';
import { MOCK_EVENTS } from './events.mock';
import type { EventFilters, LearningEvent } from '@/features/events/types';
import { apiRequest } from '@/lib/api-client';
import { demoSample } from '@/utils/demo-sample';

const toEvent = (row: EventResponse): LearningEvent => {
  const demo = demoSample(row.id, MOCK_EVENTS);
  return {
    ...row,
    venue: row.venue ?? 'Venue not specified',
    description: row.description ?? '',
    organizer: row.organizer ?? 'Organizer not specified',
    registrationUrl: row.registrationUrl ?? '',
    imageUrl: demo.imageUrl,
    city: demo.city,
    category: demo.category,
    language: demo.language,
    // Free/paid is live; only the numeric example price is demo content.
    priceEur: row.isFree ? null : (demo.priceEur ?? 5),
  };
};

export const eventsApi = {
  list: async ({ city }: EventFilters): Promise<LearningEvent[]> => {
    const rows = (await apiRequest<EventResponse[]>('/events')).map(toEvent);
    return city ? rows.filter((row) => row.city === city) : rows;
  },
  getById: async (id: string): Promise<LearningEvent> =>
    toEvent(await apiRequest<EventResponse>(`/events/${encodeURIComponent(id)}`)),
};
