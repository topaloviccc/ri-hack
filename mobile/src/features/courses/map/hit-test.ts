import type { MapPoint } from '@/features/courses/map/geometry';
import { WORLD_SHAPES } from '@/features/courses/map/world-shapes';

type Ring = MapPoint[];
type IndexedShape = { code: string; rings: Ring[] };

/** 'M 1,2 L 3,4 Z M …' -> rings of points. Only handles the M/L/Z paths world-shapes emits. */
export const parseRings = (d: string): Ring[] =>
  d
    .split('M')
    .map((part) => part.replace(/Z/g, '').trim())
    .filter(Boolean)
    .map((part) =>
      part.split('L').map((pair) => {
        const [x, y] = pair.trim().split(',').map(Number);
        return { x, y };
      }),
    );

/** Even-odd ray casting. */
export const isInRing = (p: MapPoint, ring: Ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
};

let index: IndexedShape[] | null = null;

// Parsed lazily on the first tap: ~170 shapes, a few ms.
const getIndex = () => {
  index ??= WORLD_SHAPES.map((s) => ({ code: s.code, rings: parseRings(s.d) }));
  return index;
};

/** ISO code of the country under a map point, if any. */
export const countryAt = (p: MapPoint): string | undefined =>
  getIndex().find((s) => s.rings.some((ring) => isInRing(p, ring)))?.code;
