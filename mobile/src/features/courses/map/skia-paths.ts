import { Skia, type SkPath } from '@shopify/react-native-skia';

import { project } from '@/features/courses/map/geometry';
import { WORLD_SHAPES } from '@/features/courses/map/world-shapes';

const GRID_STEP_DEG = 15;

let countryPaths: Map<string, SkPath> | null = null;

/** One SkPath per country, parsed once (~240 shapes) on first use. */
export const getCountryPaths = () => {
  if (!countryPaths) {
    countryPaths = new Map();
    for (const shape of WORLD_SHAPES) {
      const path = Skia.Path.MakeFromSVGString(shape.d);
      if (path) countryPaths.set(shape.code, path);
    }
  }
  return countryPaths;
};

/** Merges countries into one path so a whole group draws in a single call. */
export const combinePaths = (codes: Iterable<string>) => {
  const paths = getCountryPaths();
  const builder = Skia.PathBuilder.Make();
  for (const code of codes) {
    const path = paths.get(code);
    if (path) builder.addPath(path);
  }
  return builder.detach();
};

let gridPath: SkPath | null = null;

/** Meridians and parallels every 15°, in map units. */
export const getGridPath = () => {
  if (!gridPath) {
    const builder = Skia.PathBuilder.Make();
    for (let lng = -180; lng <= 180; lng += GRID_STEP_DEG) {
      const top = project(lng, 90);
      const bottom = project(lng, -90);
      builder.moveTo(top.x, top.y).lineTo(bottom.x, bottom.y);
    }
    for (let lat = -60; lat <= 75; lat += GRID_STEP_DEG) {
      const left = project(-180, lat);
      const right = project(180, lat);
      builder.moveTo(left.x, left.y).lineTo(right.x, right.y);
    }
    gridPath = builder.detach();
  }
  return gridPath;
};
