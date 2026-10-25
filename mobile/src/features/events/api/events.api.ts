import type { EventResponse } from './events.dto';
import { isEventCategory, type LearningEvent } from '@/features/events/types';
import { apiRequest } from '@/lib/api-client';

const toEvent = (row: EventResponse): LearningEvent => ({
  ...row,
  category: isEventCategory(row.category) ? row.category : 'other',
  venue: row.venue ?? 'Venue not specified',
  description: row.description ?? '',
  organizer: row.organizer ?? 'Organizer not specified',
  registrationUrl: row.registrationUrl ?? '',
});

export const eventsApi = {
  // Few events overall: the app filters by city locally and derives the city chips from this list.
  list: async (): Promise<LearningEvent[]> =>
    (await apiRequest<EventResponse[]>('/events')).map(toEvent),
  getById: async (id: string): Promise<LearningEvent> =>
    toEvent(await apiRequest<EventResponse>(`/events/${encodeURIComponent(id)}`)),
};
