import { Canvas, Group, LinearGradient, Path, Rect, vec } from '@shopify/react-native-skia';
import { memo, useMemo } from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import type { MapCamera } from '@/features/courses/hooks/useMapCamera';
import type { Viewport } from '@/features/courses/map/geometry';
import { combinePaths, getCountryPaths, getGridPath } from '@/features/courses/map/skia-paths';
import type { ThemeColors } from '@/lib/theme';

// Screen-pixel sizes, converted to map units every frame so lines stay crisp at any zoom.
const BORDER_PX = 0.6;
const ACTIVE_STROKE_PX = 1.2;
const SELECTED_STROKE_PX = 2;
const GRID_PX = 0.5;
const SHADOW_OFFSET_PX = 2.5;
const GRID_OPACITY = 0.35;
const SHADOW_OPACITY = 0.18;

export type CountryLayerProps = {
  camera: MapCamera;
  viewport: Viewport;
  colors: ThemeColors;
  /** Countries that have courses. */
  activeCodes: Set<string>;
  selectedCode?: string;
};

/**
 * Skia (GPU) map. Paths are built once; pinch/pan only change the group transform, which Skia
 * applies on the UI thread without React re-rendering.
 */
export const CountryLayer = memo(function CountryLayer({
  camera,
  viewport,
  colors,
  activeCodes,
  selectedCode,
}: CountryLayerProps) {
  const { allLand, active, selected } = useMemo(() => {
    const codes = [...getCountryPaths().keys()];
    return {
      allLand: combinePaths(codes),
      active: combinePaths(codes.filter((c) => activeCodes.has(c) && c !== selectedCode)),
      selected: combinePaths(selectedCode ? [selectedCode] : []),
    };
  }, [activeCodes, selectedCode]);

  const unitsPerPx = useDerivedValue(() => camera.w.value / viewport.width);
  const transform = useDerivedValue(() => {
    const k = viewport.width / camera.w.value;
    return [{ translateX: -camera.x.value * k }, { translateY: -camera.y.value * k }, { scale: k }];
  });
  const shadowTransform = useDerivedValue(() => [
    { translateY: SHADOW_OFFSET_PX * unitsPerPx.value },
  ]);
  const borderWidth = useDerivedValue(() => BORDER_PX * unitsPerPx.value);
  const activeWidth = useDerivedValue(() => ACTIVE_STROKE_PX * unitsPerPx.value);
  const selectedWidth = useDerivedValue(() => SELECTED_STROKE_PX * unitsPerPx.value);
  const gridWidth = useDerivedValue(() => GRID_PX * unitsPerPx.value);

  return (
    <Canvas style={{ width: viewport.width, height: viewport.height }} pointerEvents="none">
      <Rect x={0} y={0} width={viewport.width} height={viewport.height}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, viewport.height)}
          colors={[colors.mapOceanTop, colors.mapOceanBottom]}
        />
      </Rect>
      <Group transform={transform}>
        <Path
          path={getGridPath()}
          style="stroke"
          strokeWidth={gridWidth}
          color={colors.mapGrid}
          opacity={GRID_OPACITY}
        />
        <Group transform={shadowTransform}>
          <Path path={allLand} color={colors.mapLandShadow} opacity={SHADOW_OPACITY} />
        </Group>
        <Path path={allLand} color={colors.mapLand} />
        <Path path={active} color={colors.mapActive} />
        <Path path={selected} color={colors.mapSelected} />
        <Path path={allLand} style="stroke" strokeWidth={borderWidth} color={colors.mapBorder} />
        <Path
          path={active}
          style="stroke"
          strokeWidth={activeWidth}
          color={colors.mapActiveStroke}
        />
        <Path path={selected} style="stroke" strokeWidth={selectedWidth} color={colors.primary} />
      </Group>
    </Canvas>
  );
});
