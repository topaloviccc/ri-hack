import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import type { LocationKind } from '@/features/courses/types';

export const LOCATION_KIND_ICONS: Record<LocationKind, ComponentProps<typeof Ionicons>['name']> = {
  monument: 'business',
  nature: 'leaf',
  museum: 'color-palette',
  venue: 'people',
  site: 'compass',
};

export const LOCATION_KIND_LABELS: Record<LocationKind, string> = {
  monument: 'Monument',
  nature: 'Nature',
  museum: 'Museum',
  venue: 'Venue',
  site: 'Historic site',
};
