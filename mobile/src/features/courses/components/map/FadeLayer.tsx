import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import type { MapCamera } from '@/features/courses/hooks/useMapCamera';

export type FadeLayerProps = {
  camera: MapCamera;
  /** Camera widths (map units) mapped to opacities, e.g. [[60, 0], [90, 1]]. */
  fade: readonly [readonly [number, number], readonly [number, number]];
  /** Whether children take touches; decide from the settled camera so hidden layers don't. */
  isInteractive: boolean;
  children: ReactNode;
};

/** Full-size overlay whose opacity follows the zoom level on the UI thread. */
export function FadeLayer({ camera, fade, isInteractive, children }: FadeLayerProps) {
  const [[w0, o0], [w1, o1]] = fade;
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(camera.w.value, [w0, w1], [o0, o1], Extrapolation.CLAMP),
  }));
  return (
    <Animated.View
      // box-none: touches between children fall through to the map's gestures.
      pointerEvents={isInteractive ? 'box-none' : 'none'}
      style={[StyleSheet.absoluteFill, style]}
    >
      {children}
    </Animated.View>
  );
}
