import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import type { MapCamera } from '@/features/courses/hooks/useMapCamera';
import type { MapPoint, Viewport } from '@/features/courses/map/geometry';
import { countryFlag } from '@/utils/flag';

const CHIP_WIDTH = 64;
const CHIP_HEIGHT = 32;

export type CountryChipProps = {
  code: string;
  name: string;
  courseCount: number;
  point: MapPoint;
  camera: MapCamera;
  viewport: Viewport;
  onPress: (code: string) => void;
};

/** "🇪🇸 5" floating over a country, so country-level concepts are visible at world zoom. */
export function CountryChip({
  code,
  name,
  courseCount,
  point,
  camera,
  viewport,
  onPress,
}: CountryChipProps) {
  const positionStyle = useAnimatedStyle(() => {
    const k = viewport.width / camera.w.value;
    return {
      transform: [
        { translateX: (point.x - camera.x.value) * k - CHIP_WIDTH / 2 },
        { translateY: (point.y - camera.y.value) * k - CHIP_HEIGHT / 2 },
      ],
    };
  });

  return (
    <Animated.View
      style={[{ position: 'absolute', width: CHIP_WIDTH, height: CHIP_HEIGHT }, positionStyle]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${name}: ${courseCount} courses`}
        onPress={() => onPress(code)}
        hitSlop={8}
        className="h-full flex-row items-center justify-center gap-1 rounded-full bg-surface shadow-md shadow-overlay active:opacity-70"
      >
        <Text className="text-base">{countryFlag(code)}</Text>
        <Text variant="label">{courseCount}</Text>
      </Pressable>
    </Animated.View>
  );
}
