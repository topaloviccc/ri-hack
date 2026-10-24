import { clusterPoints } from '@/features/courses/map/cluster';
import {
  cameraForBox,
  cameraHeight,
  clampCamera,
  maxCameraWidth,
  project,
  startCamera,
  toMapPoint,
  zoomAround,
} from '@/features/courses/map/geometry';
import { countryAt, isInRing, parseRings } from '@/features/courses/map/hit-test';
import { LAT_MAX, LAT_MIN, MAP_HEIGHT, MAP_WIDTH } from '@/features/courses/map/world-shapes';

const VP = { width: 400, height: 800 };

describe('project', () => {
  it('maps the cropped Mercator corners to the map box', () => {
    expect(project(-180, LAT_MAX)).toEqual({ x: 0, y: 0 });
    const corner = project(180, LAT_MIN);
    expect(corner.x).toBe(MAP_WIDTH);
    expect(corner.y).toBeCloseTo(MAP_HEIGHT);
  });
});

describe('camera limits', () => {
  it('never zooms out past the map height filling the screen', () => {
    const cam = clampCamera({ x: 0, y: 0, w: 5000 }, VP);
    expect(cam.w).toBe(maxCameraWidth(VP));
    expect(cameraHeight(cam.w, VP)).toBeCloseTo(MAP_HEIGHT);
  });

  it('keeps the camera inside the map', () => {
    const cam = clampCamera({ x: -50, y: 9999, w: 100 }, VP);
    expect(cam.x).toBe(0);
    expect(cam.y + cameraHeight(cam.w, VP)).toBeCloseTo(MAP_HEIGHT);
  });

  it('opens at the widest view', () => {
    expect(startCamera(VP).w).toBeCloseTo(maxCameraWidth(VP));
  });
});

describe('cameraForBox', () => {
  it('centres the box', () => {
    const cam = cameraForBox([480, 100, 500, 110], VP);
    expect(cam.x + cam.w / 2).toBeCloseTo(490);
    expect(cam.y + cameraHeight(cam.w, VP) / 2).toBeCloseTo(105);
  });
});

describe('zoomAround', () => {
  it('keeps the map point under the focal point fixed', () => {
    const cam = cameraForBox([400, 100, 600, 200], VP);
    const focal = { x: 100, y: 300 };
    const before = toMapPoint(cam, VP, focal.x, focal.y);
    const after = toMapPoint(zoomAround(cam, VP, 2, focal.x, focal.y), VP, focal.x, focal.y);
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
  });
});

describe('hit-test', () => {
  it('parses M/L/Z paths into rings', () => {
    expect(parseRings('M0,0 L10,0 L10,10 Z M20,20 L30,20 L30,30 Z')).toHaveLength(2);
  });

  it('detects points inside a ring', () => {
    const square = parseRings('M0,0 L10,0 L10,10 L0,10 Z')[0];
    expect(isInRing({ x: 5, y: 5 }, square)).toBe(true);
    expect(isInRing({ x: 15, y: 5 }, square)).toBe(false);
  });

  it('finds real countries', () => {
    expect(countryAt(project(-3.7, 40.4))).toBe('ES'); // Madrid
    expect(countryAt(project(139.7, 35.7))).toBe('JP'); // Tokyo
    expect(countryAt(project(-30, 30))).toBeUndefined(); // Atlantic
  });
});

describe('clusterPoints', () => {
  const points = [
    { id: 'a', x: 0, y: 0 },
    { id: 'b', x: 1, y: 1 },
    { id: 'c', x: 50, y: 50 },
  ];

  it('merges points within the radius', () => {
    const clusters = clusterPoints(points, 5);
    expect(clusters).toHaveLength(2);
    expect(clusters[0].members.map((m) => m.id)).toEqual(['a', 'b']);
    expect(clusters[0].x).toBeCloseTo(0.5);
  });

  it('keeps every point alone when the radius is tiny', () => {
    expect(clusterPoints(points, 0.1)).toHaveLength(3);
  });
});
