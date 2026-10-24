import { LAT_MAX, LAT_MIN, MAP_HEIGHT, MAP_WIDTH } from '@/features/courses/map/world-shapes';

/** Point in map units (the MAP_WIDTH x MAP_HEIGHT Mercator box, see world-shapes.ts). */
export type MapPoint = { x: number; y: number };

/** [minX, minY, maxX, maxY] in map units. */
export type Box = [number, number, number, number];

/**
 * Top-left corner and width of the visible region, in map units. Height follows the viewport
 * aspect. Camera helpers are worklets so gestures can run them on the UI thread.
 */
export type Camera = { x: number; y: number; w: number };

export type Viewport = { width: number; height: number };

// ~40 km across: enough to split neighbouring sites.
export const MIN_CAMERA_WIDTH = 1;
// Breathing room around a focused box.
const FOCUS_PADDING = 1.5;
// Where the map opens: Europe.
const START_CENTER = { lng: 15, lat: 47 };

const mercator = (lat: number) => {
  'worklet';
  const clamped = Math.min(Math.max(lat, LAT_MIN), LAT_MAX);
  return Math.log(Math.tan(Math.PI / 4 + (clamped * Math.PI) / 360));
};

/** Same projection the shapes were generated with. */
export const project = (lng: number, lat: number): MapPoint => {
  'worklet';
  const top = mercator(LAT_MAX);
  return {
    x: ((lng + 180) / 360) * MAP_WIDTH,
    y: ((top - mercator(lat)) / (top - mercator(LAT_MIN))) * MAP_HEIGHT,
  };
};

export const cameraHeight = (w: number, vp: Viewport) => {
  'worklet';
  return (w * vp.height) / vp.width;
};

/** Widest view allowed: the map's full height fills the screen, and never wider than the map. */
export const maxCameraWidth = (vp: Viewport) => {
  'worklet';
  return Math.min((MAP_HEIGHT * vp.width) / vp.height, MAP_WIDTH);
};

export const clampWidth = (w: number, vp: Viewport) => {
  'worklet';
  return Math.min(Math.max(w, MIN_CAMERA_WIDTH), maxCameraWidth(vp));
};

/** Keeps the camera inside the map; no wrap-around. */
export const clampCamera = (cam: Camera, vp: Viewport): Camera => {
  'worklet';
  const w = clampWidth(cam.w, vp);
  const h = cameraHeight(w, vp);
  return {
    w,
    x: Math.min(Math.max(cam.x, 0), MAP_WIDTH - w),
    y: Math.min(Math.max(cam.y, 0), MAP_HEIGHT - h),
  };
};

const centeredCamera = (cx: number, cy: number, w: number, vp: Viewport): Camera => {
  'worklet';
  const width = clampWidth(w, vp);
  return clampCamera({ x: cx - width / 2, y: cy - cameraHeight(width, vp) / 2, w: width }, vp);
};

export const startCamera = (vp: Viewport): Camera => {
  const c = project(START_CENTER.lng, START_CENTER.lat);
  return centeredCamera(c.x, c.y, maxCameraWidth(vp), vp);
};

/** Smallest camera that shows the whole box with padding. */
export const cameraForBox = ([minX, minY, maxX, maxY]: Box, vp: Viewport): Camera => {
  'worklet';
  const aspect = vp.width / vp.height;
  const w = Math.max(maxX - minX, (maxY - minY) * aspect) * FOCUS_PADDING;
  return centeredCamera((minX + maxX) / 2, (minY + maxY) / 2, w, vp);
};

// Defined before its users: worklets capture referenced functions when they are created.
export const toMapPoint = (cam: Camera, vp: Viewport, sx: number, sy: number): MapPoint => {
  'worklet';
  const unitsPerPx = cam.w / vp.width;
  return { x: cam.x + sx * unitsPerPx, y: cam.y + sy * unitsPerPx };
};

/** Zoom by `factor` (>1 = in) keeping the map point under screen point (sx, sy) fixed. */
export const zoomAround = (
  cam: Camera,
  vp: Viewport,
  factor: number,
  sx: number,
  sy: number,
): Camera => {
  'worklet';
  const anchor = toMapPoint(cam, vp, sx, sy);
  const w = clampWidth(cam.w / factor, vp);
  const unitsPerPx = w / vp.width;
  return clampCamera({ x: anchor.x - sx * unitsPerPx, y: anchor.y - sy * unitsPerPx, w }, vp);
};

export const boxOfPoints = (points: MapPoint[]): Box => [
  Math.min(...points.map((p) => p.x)),
  Math.min(...points.map((p) => p.y)),
  Math.max(...points.map((p) => p.x)),
  Math.max(...points.map((p) => p.y)),
];
