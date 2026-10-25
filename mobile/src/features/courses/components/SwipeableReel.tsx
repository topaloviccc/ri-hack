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

// Fraction of screen width a swipe must travel to count.
const SWIPE_THRESHOLD = 0.25;
// Horizontal travel before the pan claims the touch; vertical travel first lets the list page.
const ACTIVE_OFFSET_X = 20;
const FAIL_OFFSET_Y = 15;
const DISMISS_DURATION_MS = 200;
const OPEN_DURATION_MS = 180;
// Snap the reel back only once the details screen has slid over it.
const OPEN_RESET_DELAY_MS = 600;

export type SwipeableReelProps = {
  children: ReactNode;
  /** Swipe right: the reel flies off ("less like this"). */
  onDismiss: () => void;
  /** Swipe left: the reel slides out and the course opens. */
  onOpen: () => void;
  /** A horizontal swipe has started: a chance to load what `onOpen` will show. */
  onSwipeStart?: () => void;
  disabled?: boolean;
};

export function SwipeableReel({
  children,
  onDismiss,
  onOpen,
  onSwipeStart,
  disabled = false,
}: SwipeableReelProps) {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);

  const pan = usePanGesture({
    enabled: !disabled,
    activeOffsetX: [-ACTIVE_OFFSET_X, ACTIVE_OFFSET_X],
    failOffsetY: [-FAIL_OFFSET_Y, FAIL_OFFSET_Y],
    onActivate: () => {
      'worklet';
      if (onSwipeStart) scheduleOnRN(onSwipeStart);
    },
    onUpdate: (e) => {
      'worklet';
      translateX.value = e.translationX;
    },
    onDeactivate: (e) => {
      'worklet';
      const threshold = width * SWIPE_THRESHOLD;
      if (e.translationX > threshold) {
        translateX.value = withTiming(width, { duration: DISMISS_DURATION_MS }, (finished) => {
          if (finished) scheduleOnRN(onDismiss);
          // The HTTP save may fail; keep the keyed row visible until server data removes it.
          translateX.value = withSpring(0);
        });
        return;
      }
      if (e.translationX < -threshold) {
        // Navigate right away and let the reel finish its slide under the incoming screen.
        scheduleOnRN(onOpen);
        translateX.value = withSequence(
          withTiming(-width, { duration: OPEN_DURATION_MS }),
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
        accessibilityHint="Swipe left for details, swipe right to see less like this"
        accessibilityState={{ disabled }}
        accessibilityActions={[
          { name: 'decrement', label: 'Show less like this' },
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
