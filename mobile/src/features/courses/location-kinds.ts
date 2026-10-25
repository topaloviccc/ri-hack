import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import type { Location, LocationKind } from '@/features/courses/types';

type IconName = ComponentProps<typeof Ionicons>['name'];

const LOCATION_KIND_ICONS: Record<LocationKind, IconName> = {
  monument: 'business',
  nature: 'leaf',
  museum: 'color-palette',
  venue: 'people',
  site: 'compass',
};

const LOCATION_KIND_LABELS: Record<LocationKind, string> = {
  monument: 'Monument',
  nature: 'Nature',
  museum: 'Museum',
  venue: 'Venue',
  site: 'Historic site',
};

/** Places without a (known) kind get a generic pin and label. */
export const locationKindIcon = (kind: LocationKind | null): IconName =>
  kind ? LOCATION_KIND_ICONS[kind] : 'location';

export const locationKindLabel = (kind: LocationKind | null) =>
  kind ? LOCATION_KIND_LABELS[kind] : 'Place';

/** "Museum · Kotor", leaving out whatever the backend doesn't have. */
export const locationSummary = ({ kind, city }: Pick<Location, 'kind' | 'city'>) =>
  [locationKindLabel(kind), city].filter(Boolean).join(' · ');
