import { MapPin, PIN_SIZE } from '@/features/courses/components/map/MapPin';
import type { MapCamera } from '@/features/courses/hooks/useMapCamera';
import { LOCATION_KIND_ICONS } from '@/features/courses/location-kinds';
import { clusterPoints } from '@/features/courses/map/cluster';
import {
  boxOfPoints,
  MIN_CAMERA_WIDTH,
  project,
  type Box,
  type Viewport,
} from '@/features/courses/map/geometry';
import type { Location } from '@/features/courses/types';

// Pins whose centres are closer than this on screen merge into a group.
const CLUSTER_DISTANCE_PX = PIN_SIZE;
const ROW_GAP_PX = 6;
// Treat "almost fully zoomed in" as fully, so a near-limit camera still spreads overlaps.
const FULL_ZOOM_TOLERANCE = 1.05;

/** Screen-px x offset for item `i` of `n` in a centred row. */
const rowOffset = (i: number, n: number) => (i - (n - 1) / 2) * (PIN_SIZE + ROW_GAP_PX);

export type PinLayerProps = {
  locations: Location[];
  camera: MapCamera;
  viewport: Viewport;
  /** Camera width when movement last settled; clustering is recomputed from it. */
  settledWidth: number;
  onFocusGroup: (box: Box) => void;
  onOpenLocation: (id: string) => void;
};

export function PinLayer({
  locations,
  camera,
  viewport,
  settledWidth,
  onFocusGroup,
  onOpenLocation,
}: PinLayerProps) {
  const points = locations.map((l) => ({ ...l, ...project(l.lng, l.lat) }));
  const radius = (CLUSTER_DISTANCE_PX * settledWidth) / viewport.width;
  const isFullyZoomed = settledWidth <= MIN_CAMERA_WIDTH * FULL_ZOOM_TOLERANCE;

  return clusterPoints(points, radius).flatMap((cluster) => {
    // One site, or sites that can't separate any further: show each as its own pin, in a row.
    if (cluster.members.length === 1 || isFullyZoomed) {
      return cluster.members.map((site, i) => (
        <MapPin
          key={site.id}
          kind="image"
          imageUrl={site.imageUrl}
          badgeIcon={LOCATION_KIND_ICONS[site.kind]}
          point={cluster}
          offsetX={rowOffset(i, cluster.members.length)}
          camera={camera}
          viewport={viewport}
          label={`${site.name}, ${site.city}: show courses`}
          onPress={() => onOpenLocation(site.id)}
        />
      ));
    }
    return (
      <MapPin
        key={cluster.id}
        kind="group"
        count={cluster.members.length}
        point={cluster}
        camera={camera}
        viewport={viewport}
        label={`${cluster.members.length} places: zoom in`}
        onPress={() => onFocusGroup(boxOfPoints(cluster.members))}
      />
    );
  });
}
