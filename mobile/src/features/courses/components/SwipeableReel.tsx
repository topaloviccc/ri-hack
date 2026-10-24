import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
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

export type SwipeableReelProps = {
  children: ReactNode;
  /** Swipe right: the reel flies off ("less like this"). */
  onDismiss: () => void;
  /** Swipe left: open the course; the reel springs back. */
  onOpen: () => void;
};

export function SwipeableReel({ children, onDismiss, onOpen }: SwipeableReelProps) {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);

  const pan = usePanGesture({
    activeOffsetX: [-ACTIVE_OFFSET_X, ACTIVE_OFFSET_X],
    failOffsetY: [-FAIL_OFFSET_Y, FAIL_OFFSET_Y],
    onUpdate: (e) => {
      'worklet';
      translateX.value = e.translationX;
    },
    onDeactivate: (e) => {
      'worklet';
      const threshold = width * SWIPE_THRESHOLD;
      if (e.translationX > threshold) {
        translateX.value = withTiming(width, { duration: DISMISS_DURATION_MS }, () =>
          scheduleOnRN(onDismiss),
        );
        return;
      }
      if (e.translationX < -threshold) scheduleOnRN(onOpen);
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
        accessibilityActions={[
          { name: 'decrement', label: 'Show less like this' },
          { name: 'activate', label: 'Open details' },
        ]}
        onAccessibilityAction={(e) =>
          e.nativeEvent.actionName === 'activate' ? onOpen() : onDismiss()
        }
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

// Reanimated views take style, not className.
const styles = StyleSheet.create({ fill: { flex: 1 } });
