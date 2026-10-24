import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import type { EventCategory } from '@/features/events/types';

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
export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  'sr-ME': 'Montenegrin',
};
