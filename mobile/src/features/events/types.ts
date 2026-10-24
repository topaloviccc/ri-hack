export const EVENT_CATEGORIES = [
  'lecture',
  'workshop',
  'exhibition',
  'film',
  'sport',
  'other',
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const CITIES = ['Podgorica', 'Budva', 'Bar', 'Tivat', 'Herceg Novi', 'Kotor'] as const;

export type EventFilters = { city: string };

// TODO(hack): spec F17 capacity and saved-vs-registered are deferred. See BACKLOG.md.
export type LearningEvent = {
  id: string;
  title: string;
  category: EventCategory;
  /** ISO 8601 with offset */
  startsAt: string;
  city: string;
  venue: string;
  lat: number;
  lng: number;
  imageUrl: string;
  description: string;
  organizer: string;
  /** null = free */
  priceEur: number | null;
  /** BCP 47, e.g. "en", "sr-ME" */
  language: string;
  registrationUrl: string;
};
