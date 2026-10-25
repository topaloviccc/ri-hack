import Ionicons from '@expo/vector-icons/Ionicons';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import { DemoNotice } from '@/components/shared/DemoNotice';
import { CATEGORY_ICONS } from '@/features/events/categories';
import type { LearningEvent } from '@/features/events/types';
import { useThemeColors } from '@/lib/theme';
import { formatTime } from '@/utils/date';
import { hasCoordinates } from '@/utils/has-coordinates';

const ICON_SIZE = 20;

export type EventRowProps = {
  event: LearningEvent;
  onPress: (id: string) => void;
  onOpenMap: (event: LearningEvent) => void;
};

export const EventRow = memo(function EventRow({ event, onPress, onOpenMap }: EventRowProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open event ${event.title}`}
      // The row is one accessible element, so expose the map button as a custom action.
      accessibilityActions={
        hasCoordinates(event) ? [{ name: 'openMap', label: 'Open in maps' }] : []
      }
      onAccessibilityAction={() => {
        if (hasCoordinates(event)) onOpenMap(event);
      }}
      onPress={() => onPress(event.id)}
      className="active:opacity-80"
    >
      <Card className="flex-row items-center gap-3 p-3">
        <View className="items-center gap-1.5">
          <View className="rounded-lg bg-background px-2 py-1.5">
            <Text variant="mono" className="font-mono-medium">
              {formatTime(event.startsAt)}
            </Text>
          </View>
          <View className="h-9 w-9 items-center justify-center rounded-lg bg-background">
            <Ionicons
              name={CATEGORY_ICONS[event.category]}
              size={ICON_SIZE}
              color={colors.muted}
              accessibilityLabel={event.category}
            />
          </View>
        </View>
        <View className="flex-1 gap-1">
          <DemoNotice>city, category and image</DemoNotice>
          <Text variant="label" className="text-base" numberOfLines={2}>
            {event.title}
          </Text>
          <Text variant="caption" numberOfLines={1}>
            <Text variant="caption" className="font-sans-semibold">
              {event.city}
            </Text>
            , {event.venue}
          </Text>
        </View>
        <Image uri={event.imageUrl} className="h-16 w-16 rounded-lg bg-border" />
      </Card>
    </Pressable>
  );
});
