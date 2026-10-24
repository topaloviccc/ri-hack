import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import type { MapCamera } from '@/features/courses/hooks/useMapCamera';
import type { MapPoint, Viewport } from '@/features/courses/map/geometry';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/theme';

export const PIN_SIZE = 44;
const BADGE_SIZE = 20;
const BADGE_ICON_SIZE = 12;

type IconName = ComponentProps<typeof Ionicons>['name'];

export type MapPinProps = {
  /** Position in map units; the pin follows the camera on the UI thread. */
  point: MapPoint;
  /** Extra screen-px shift, used to lay out sites that overlap even at full zoom. */
  offsetX?: number;
  camera: MapCamera;
  viewport: Viewport;
  label: string;
  onPress: () => void;
} & (
  | { kind: 'image'; imageUrl: string; badgeIcon?: IconName }
  | { kind: 'icon'; icon: IconName }
  | { kind: 'group'; count: number }
);

/** A waypoint on the map: a photo (with optional icon badge), an icon, or a group count. */
export function MapPin({
  point,
  offsetX = 0,
  camera,
  viewport,
  label,
  onPress,
  ...pin
}: MapPinProps) {
  const colors = useThemeColors();
  const positionStyle = useAnimatedStyle(() => {
    const k = viewport.width / camera.w.value;
    return {
      transform: [
        { translateX: (point.x - camera.x.value) * k - PIN_SIZE / 2 + offsetX },
        { translateY: (point.y - camera.y.value) * k - PIN_SIZE / 2 },
      ],
    };
  });

  return (
    <Animated.View
      style={[{ position: 'absolute', width: PIN_SIZE, height: PIN_SIZE }, positionStyle]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        className="h-full w-full active:opacity-70"
      >
        <View
          className={cn(
            'h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-surface shadow-md shadow-overlay',
            pin.kind === 'group' ? 'bg-primary' : 'bg-secondary',
          )}
        >
          {pin.kind === 'image' ? <Image uri={pin.imageUrl} className="h-full w-full" /> : null}
          {pin.kind === 'icon' ? <Ionicons name={pin.icon} size={22} color={colors.text} /> : null}
          {pin.kind === 'group' ? (
            <Text variant="label" className="text-on-primary">
              {pin.count}
            </Text>
          ) : null}
        </View>
        {pin.kind === 'image' && pin.badgeIcon ? (
          <View
            className="absolute -bottom-1 -right-1 items-center justify-center rounded-full border border-surface bg-primary"
            style={{ width: BADGE_SIZE, height: BADGE_SIZE }}
          >
            <Ionicons name={pin.badgeIcon} size={BADGE_ICON_SIZE} color={colors.onPrimary} />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}
