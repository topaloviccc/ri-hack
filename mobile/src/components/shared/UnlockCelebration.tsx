import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { CoinIcon } from '@/components/ui/CoinIcon';
import { Text } from '@/components/ui/Text';

// Timeline (ms): lock eases in -> shackle opens + coins drift out + haptic -> label -> fade out.
const POP_AT = 350;
const LABEL_AT = 450;
const FADE_AT = 1100;
const FADE_MS = 250;
const REDUCED_MS = 900;
const LOCK_IN_MS = 320;
const SHACKLE_MS = 280;
const LABEL_MS = 300;
// Ease-out without overshoot: smooth arrivals, no bounce.
const SMOOTH = Easing.bezier(0.22, 1, 0.36, 1);
const COIN_COUNT = 6;
const COIN_DISTANCE = 90;
const SHACKLE_LIFT = 14;
const SHACKLE_TILT_DEG = -28;

type CoinProps = { index: number; burst: SharedValue<number> };

function BurstCoin({ index, burst }: CoinProps) {
  const angle = (index / COIN_COUNT) * 2 * Math.PI - Math.PI / 2;
  const style = useAnimatedStyle(() => ({
    opacity: 1 - burst.value,
    transform: [
      { translateX: Math.cos(angle) * COIN_DISTANCE * burst.value },
      { translateY: Math.sin(angle) * COIN_DISTANCE * burst.value },
      { scale: 0.6 + burst.value * 0.6 },
    ],
  }));
  return (
    <Animated.View style={[styles.coin, style]}>
      <CoinIcon size="md" />
    </Animated.View>
  );
}

export type UnlockCelebrationProps = {
  label?: string;
  /** Called when the animation finishes or is tapped away. */
  onDone: () => void;
};

/** Lock eases in and opens, coins drift out, "Unlocked!" slides up. Tap to skip; respects Reduce Motion. */
export function UnlockCelebration({ label = 'Unlocked!', onDone }: UnlockCelebrationProps) {
  const reduceMotion = useReducedMotion();
  const lock = useSharedValue(0);
  const shackle = useSharedValue(0);
  const burst = useSharedValue(0);
  const text = useSharedValue(0);
  const fade = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      text.value = withTiming(1, { duration: FADE_MS });
      const done = setTimeout(onDone, REDUCED_MS);
      return () => clearTimeout(done);
    }
    lock.value = withTiming(1, { duration: LOCK_IN_MS, easing: SMOOTH });
    shackle.value = withDelay(POP_AT, withTiming(1, { duration: SHACKLE_MS, easing: SMOOTH }));
    burst.value = withDelay(POP_AT, withTiming(1, { duration: 650, easing: SMOOTH }));
    text.value = withDelay(LABEL_AT, withTiming(1, { duration: LABEL_MS, easing: SMOOTH }));
    fade.value = withDelay(FADE_AT, withTiming(0, { duration: FADE_MS }));
    const haptic = setTimeout(
      () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
      POP_AT,
    );
    const done = setTimeout(onDone, FADE_AT + FADE_MS);
    return () => {
      clearTimeout(haptic);
      clearTimeout(done);
    };
    // Plays once per mount; the parent unmounts it via onDone.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
  const lockStyle = useAnimatedStyle(() => ({
    opacity: lock.value,
    transform: [{ scale: 0.7 + 0.3 * lock.value }],
  }));
  const shackleStyle = useAnimatedStyle(() => ({
    transformOrigin: 'right bottom',
    transform: [
      { translateY: -SHACKLE_LIFT * shackle.value },
      { rotate: `${SHACKLE_TILT_DEG * shackle.value}deg` },
    ],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: text.value,
    transform: [{ translateY: 12 * (1 - text.value) }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, containerStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label} Tap to continue`}
        onPress={onDone}
        className="flex-1 items-center justify-center gap-6 bg-background/70"
      >
        {reduceMotion ? null : (
          <View className="items-center justify-center">
            {Array.from({ length: COIN_COUNT }, (_, i) => (
              <BurstCoin key={i} index={i} burst={burst} />
            ))}
            {/* Reanimated views take style only; NativeWind classes go on plain inner Views. */}
            <Animated.View style={[styles.lock, lockStyle]}>
              <Animated.View style={[styles.shackle, shackleStyle]}>
                <View className="h-12 w-12 rounded-t-full border-8 border-b-0 border-primary" />
              </Animated.View>
              <View className="h-14 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-overlay">
                <View className="h-4 w-4 rounded-full bg-coin-rim" />
              </View>
            </Animated.View>
          </View>
        )}
        <Animated.View style={textStyle}>
          <Text variant="title" className="text-primary">
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  coin: { position: 'absolute' },
  lock: { alignItems: 'center' },
  // Tucks the shackle's legs into the lock body.
  shackle: { marginBottom: -12 },
});
