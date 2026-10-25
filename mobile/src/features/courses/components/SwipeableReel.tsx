import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

// Fraction of screen size a swipe must travel to count.
const HORIZONTAL_SWIPE_THRESHOLD = 0.25;
const VERTICAL_SWIPE_THRESHOLD = 0.16;
const ACTIVE_OFFSET = 20;
const DISMISS_DURATION_MS = 200;
const OPEN_DURATION_MS = 180;
// Snap the reel back only once the details screen has slid over it.
const OPEN_RESET_DELAY_MS = 600;

export type SwipeableReelProps = {
  children: ReactNode;
  /** Swipe left: the reel flies off ("less like this"). */
  onDismiss: () => void;
  /** Swipe right: the reel slides out and the course opens. */
  onOpen: () => void;
  /** Swipe down to see the next course. */
  onNext: () => void;
  /** Swipe up to return to the previous course. */
  onPrevious: () => void;
  /** A swipe has started: a chance to load what `onOpen` will show. */
  onSwipeStart?: () => void;
  disabled?: boolean;
};

export function SwipeableReel({
  children,
  onDismiss,
  onOpen,
  onSwipeStart,
  onNext,
  onPrevious,
  disabled = false,
}: SwipeableReelProps) {
  const { width, height } = useWindowDimensions();
  const translateX = useSharedValue(0);

  const pan = usePanGesture({
    enabled: !disabled,
    activeOffsetX: [-ACTIVE_OFFSET, ACTIVE_OFFSET],
    activeOffsetY: [-ACTIVE_OFFSET, ACTIVE_OFFSET],
    onActivate: () => {
      'worklet';
      if (onSwipeStart) scheduleOnRN(onSwipeStart);
    },
    onUpdate: (e) => {
      'worklet';
      translateX.value = Math.abs(e.translationX) > Math.abs(e.translationY) ? e.translationX : 0;
    },
    onDeactivate: (e) => {
      'worklet';
      const isVertical = Math.abs(e.translationY) > Math.abs(e.translationX);
      if (isVertical) {
        const threshold = height * VERTICAL_SWIPE_THRESHOLD;
        if (e.translationY > threshold) scheduleOnRN(onNext);
        if (e.translationY < -threshold) scheduleOnRN(onPrevious);
        translateX.value = withSpring(0);
        return;
      }

      const threshold = width * HORIZONTAL_SWIPE_THRESHOLD;
      if (e.translationX < -threshold) {
        translateX.value = withTiming(-width, { duration: DISMISS_DURATION_MS }, (finished) => {
          if (finished) scheduleOnRN(onDismiss);
          // The HTTP save may fail; keep the keyed row visible until server data removes it.
          translateX.value = withSpring(0);
        });
        return;
      }
      if (e.translationX > threshold) {
        // Navigate right away and let the reel finish its slide under the incoming screen.
        scheduleOnRN(onOpen);
        translateX.value = withSequence(
          withTiming(width, { duration: OPEN_DURATION_MS }),
          withDelay(OPEN_RESET_DELAY_MS, withTiming(0, { duration: 0 })),
        );
        return;
      }
      translateX.value = withSpring(0);
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.fill, animatedStyle]}
        accessibilityHint="Swipe left to recommend less, swipe right to open the course, and swipe down for the next course"
        accessibilityState={{ disabled }}
        accessibilityActions={[
          { name: 'decrement', label: 'Recommend less like this' },
          { name: 'activate', label: 'Open details' },
        ]}
        onAccessibilityAction={(e) =>
          disabled ? undefined : e.nativeEvent.actionName === 'activate' ? onOpen() : onDismiss()
        }
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

// Reanimated views take style, not className.
const styles = StyleSheet.create({ fill: { flex: 1 } });
