export const EVENT_CATEGORIES = [
  'lecture',
  'workshop',
  'exhibition',
  'film',
  'sport',
  'other',
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const isEventCategory = (value: string | null): value is EventCategory =>
  (EVENT_CATEGORIES as readonly (string | null)[]).includes(value);

// TODO(hack): spec F17 capacity and saved-vs-registered are deferred. See BACKLOG.md.
export type LearningEvent = {
  id: string;
  title: string;
  /** Unknown or missing backend categories become 'other'. */
  category: EventCategory;
  /** ISO 8601 with offset */
  startsAt: string;
  /** The venue's city; null when the backend doesn't know it. */
  city: string | null;
  venue: string;
  lat: number | null;
  lng: number | null;
  imageUrl: string | null;
  description: string;
  organizer: string;
  isFree: boolean;
  /** Only for paid events with a known price. */
  priceEur: number | null;
  /** BCP 47, e.g. "en", "sr-ME"; null when unknown. */
  language: string | null;
  registrationUrl: string;
};
