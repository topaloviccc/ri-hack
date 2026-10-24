import {
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
  useTapGesture,
} from 'react-native-gesture-handler';
import {
  cancelAnimation,
  Easing,
  useSharedValue,
  withDecay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import {
  cameraHeight,
  clampCamera,
  startCamera,
  toMapPoint,
  zoomAround,
  cameraForBox,
  maxCameraWidth,
  type Box,
  type Camera,
  type MapPoint,
  type Viewport,
} from '@/features/courses/map/geometry';
import { MAP_HEIGHT, MAP_WIDTH } from '@/features/courses/map/world-shapes';

const FLY_MS = 450;

export type MapCamera = { x: SharedValue<number>; y: SharedValue<number>; w: SharedValue<number> };

type Options = {
  /** Single tap, in map units. Return a box to fly to it. */
  onTap: (point: MapPoint) => Box | undefined;
  /** Camera width after any movement ends; drives JS-side work like pin clustering. */
  onSettled: (cameraWidth: number) => void;
};

/**
 * Camera state lives in shared values so pinch, pan, momentum and fly-to animations all run on
 * the UI thread; React only re-renders when movement settles.
 */
export function useMapCamera(vp: Viewport, { onTap, onSettled }: Options) {
  const start = startCamera(vp);
  const x = useSharedValue(start.x);
  const y = useSharedValue(start.y);
  const w = useSharedValue(start.w);
  const isPinching = useSharedValue(false);
  const hadPinch = useSharedValue(false);
  const panPointers = useSharedValue(0);
  const pinchStart = useSharedValue<Camera & { fx: number; fy: number }>({
    ...start,
    fx: 0,
    fy: 0,
  });

  const set = (cam: Camera) => {
    'worklet';
    x.value = cam.x;
    y.value = cam.y;
    w.value = cam.w;
  };

  const current = (): Camera => {
    'worklet';
    return { x: x.value, y: y.value, w: w.value };
  };

  const stop = () => {
    'worklet';
    cancelAnimation(x);
    cancelAnimation(y);
    cancelAnimation(w);
  };

  const settle = () => {
    'worklet';
    scheduleOnRN(onSettled, w.value);
  };

  const flyTo = (target: Camera) => {
    'worklet';
    stop();
    const cam = clampCamera(target, vp);
    const config = { duration: FLY_MS, easing: Easing.out(Easing.cubic) };
    x.value = withTiming(cam.x, config);
    y.value = withTiming(cam.y, config);
    w.value = withTiming(cam.w, config, (finished) => {
      if (finished) settle();
    });
  };

  const pan = usePanGesture({
    onBegin: () => {
      'worklet';
      stop();
      panPointers.value = 0;
    },
    onUpdate: (e) => {
      'worklet';
      // The pan tracks the centre of all fingers, which jumps when a finger lands or lifts.
      // Skip that frame, and leave movement to the pinch while two fingers are down.
      const pointersChanged = e.numberOfPointers !== panPointers.value;
      panPointers.value = e.numberOfPointers;
      if (pointersChanged || isPinching.value) return;
      const unitsPerPx = w.value / vp.width;
      set(
        clampCamera(
          {
            ...current(),
            x: x.value - e.changeX * unitsPerPx,
            y: y.value - e.changeY * unitsPerPx,
          },
          vp,
        ),
      );
    },
    onDeactivate: (e) => {
      'worklet';
      // Velocity right after a pinch is skewed by the lifted finger; just stop.
      if (hadPinch.value || isPinching.value) {
        settle();
        return;
      }
      const unitsPerPx = w.value / vp.width;
      x.value = withDecay({ velocity: -e.velocityX * unitsPerPx, clamp: [0, MAP_WIDTH - w.value] });
      y.value = withDecay(
        { velocity: -e.velocityY * unitsPerPx, clamp: [0, MAP_HEIGHT - cameraHeight(w.value, vp)] },
        (finished) => {
          if (finished) settle();
        },
      );
    },
    // Reset here, not in onBegin: a pinch can start before the pan does.
    onFinalize: () => {
      'worklet';
      hadPinch.value = false;
    },
  });

  const pinch = usePinchGesture({
    onActivate: (e) => {
      'worklet';
      stop();
      isPinching.value = true;
      hadPinch.value = true;
      pinchStart.value = { ...current(), fx: e.focalX, fy: e.focalY };
    },
    onUpdate: (e) => {
      'worklet';
      // With one finger left the focal point is that finger: ignore it instead of jumping.
      if (e.numberOfPointers < 2) return;
      const s = pinchStart.value;
      const zoomed = zoomAround(s, vp, e.scale, s.fx, s.fy);
      // Follow the fingers too: two-finger drag pans while zooming.
      const unitsPerPx = zoomed.w / vp.width;
      set(
        clampCamera(
          {
            ...zoomed,
            x: zoomed.x - (e.focalX - s.fx) * unitsPerPx,
            y: zoomed.y - (e.focalY - s.fy) * unitsPerPx,
          },
          vp,
        ),
      );
    },
    onDeactivate: settle,
    onFinalize: () => {
      'worklet';
      isPinching.value = false;
    },
  });

  const handleTap = (point: MapPoint) => {
    const box = onTap(point);
    if (box) flyTo(cameraForBox(box, vp));
  };

  const singleTap = useTapGesture({
    onActivate: (e) => {
      'worklet';
      scheduleOnRN(handleTap, toMapPoint(current(), vp, e.x, e.y));
    },
  });

  // No double-tap: it would make every single tap wait to see if a second one follows.
  const gesture = useSimultaneousGestures(pinch, pan, singleTap);

  /** Back out to the widest view, keeping the current centre. */
  const zoomOut = () => {
    const maxW = maxCameraWidth(vp);
    flyTo({
      x: x.value + w.value / 2 - maxW / 2,
      y: y.value + cameraHeight(w.value, vp) / 2 - cameraHeight(maxW, vp) / 2,
      w: maxW,
    });
  };

  const focusBox = (box: Box) => flyTo(cameraForBox(box, vp));

  const camera: MapCamera = { x, y, w };
  return { camera, gesture, focusBox, zoomOut };
}
