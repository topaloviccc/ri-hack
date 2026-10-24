import type { MapPoint } from '@/features/courses/map/geometry';

export type Cluster<T> = MapPoint & { id: string; members: T[] };

/**
 * Greedy distance clustering: each unassigned point absorbs every unassigned point within
 * `radius` (map units). Members' centroid becomes the cluster position.
 * shortcut: O(n²), fine for a few dozen towns per country; switch to supercluster for thousands.
 */
export function clusterPoints<T extends MapPoint & { id: string }>(
  points: T[],
  radius: number,
): Cluster<T>[] {
  const assigned = new Set<string>();
  const clusters: Cluster<T>[] = [];

  for (const seed of points) {
    if (assigned.has(seed.id)) continue;
    const members = points.filter(
      (p) => !assigned.has(p.id) && Math.hypot(p.x - seed.x, p.y - seed.y) <= radius,
    );
    members.forEach((m) => assigned.add(m.id));
    clusters.push({
      id: members.map((m) => m.id).join('+'),
      x: members.reduce((sum, m) => sum + m.x, 0) / members.length,
      y: members.reduce((sum, m) => sum + m.y, 0) / members.length,
      members,
    });
  }
  return clusters;
}
