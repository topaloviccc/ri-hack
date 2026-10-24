import { MOCK_EVENTS, type MockEvent } from '@/features/events/api/events.mock';
import type { EventFilters, LearningEvent } from '@/features/events/types';
import { ApiError } from '@/lib/api-client';
import { mockDelay } from '@/utils/mock-delay';

// TODO(hack): mock backend. Mock dates are relative to today so the calendar always has data.
// Swap for api-client calls once the API exists. See BACKLOG.md.
const toEvent = ({ dayOffset, time, ...event }: MockEvent): LearningEvent => {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const startsAt = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + dayOffset,
    hours,
    minutes,
  );
  return { ...event, startsAt: startsAt.toISOString() };
};

export const eventsApi = {
  list: async ({ city }: EventFilters): Promise<LearningEvent[]> => {
    await mockDelay();
    return MOCK_EVENTS.filter((e) => e.city === city)
      .map(toEvent)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  },
  getById: async (id: string): Promise<LearningEvent> => {
    await mockDelay();
    const event = MOCK_EVENTS.find((e) => e.id === id);
    if (!event) throw new ApiError(404, 'Event not found');
    return toEvent(event);
  },
};
