import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import type { EventCategory, LearningEvent } from '@/features/events/types';

export const CATEGORY_ICONS: Record<EventCategory, ComponentProps<typeof Ionicons>['name']> = {
  lecture: 'school-outline',
  workshop: 'construct-outline',
  exhibition: 'business-outline',
  film: 'film-outline',
  sport: 'walk-outline',
  other: 'pin-outline',
};

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  lecture: 'Lecture',
  workshop: 'Workshop',
  exhibition: 'Exhibition',
  film: 'Film',
  sport: 'Sport',
  other: 'Event',
};

// shortcut: hand-mapped; switch to Intl.DisplayNames once confirmed on Hermes for both platforms.
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  'sr-ME': 'Montenegrin',
};

/** Unmapped BCP 47 tags show as-is rather than being hidden. */
export const languageName = (code: string) => LANGUAGE_NAMES[code] ?? code;

/** "Free", "€12" or "€7.50", or just "Paid" when the backend has no price. */
export const eventPriceLabel = ({
  isFree,
  priceEur,
}: Pick<LearningEvent, 'isFree' | 'priceEur'>) => {
  if (isFree) return 'Free';
  if (priceEur === null) return 'Paid';
  return `€${priceEur.toLocaleString('en-GB', { minimumFractionDigits: priceEur % 1 ? 2 : 0 })}`;
};
