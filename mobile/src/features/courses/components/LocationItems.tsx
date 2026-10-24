import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import { LOCATION_KIND_ICONS, LOCATION_KIND_LABELS } from '@/features/courses/location-kinds';
import type { Location } from '@/features/courses/types';
import { useThemeColors } from '@/lib/theme';

export const openLocation = (id: string) =>
  router.push({ pathname: '/location/[id]', params: { id } });

export type LocationItemProps = { location: Location };

/** Full-width row: photo, name, kind and town. Used on course details. */
export const LocationRow = memo(function LocationRow({ location }: LocationItemProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${location.name}, ${location.city}. Show courses`}
      onPress={() => openLocation(location.id)}
      className="flex-row items-center gap-3 rounded-card border border-border bg-surface p-3 active:opacity-80"
    >
      <Image uri={location.imageUrl} className="h-14 w-14 rounded-lg bg-border" />
      <View className="flex-1">
        <Text variant="label" className="text-base" numberOfLines={1}>
          {location.name}
        </Text>
        <Text variant="caption" numberOfLines={1}>
          {LOCATION_KIND_LABELS[location.kind]} · {location.city}
        </Text>
      </View>
      <Ionicons name={LOCATION_KIND_ICONS[location.kind]} size={18} color={colors.primary} />
    </Pressable>
  );
});

/** Photo card for horizontal strips. Used on the Country page. */
export const LocationCard = memo(function LocationCard({ location }: LocationItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${location.name}, ${location.city}. Show courses`}
      onPress={() => openLocation(location.id)}
      className="w-40 overflow-hidden rounded-card border border-border bg-surface active:opacity-80"
    >
      <Image uri={location.imageUrl} className="h-24 w-full bg-border" />
      <View className="gap-0.5 p-2">
        <Text variant="label" numberOfLines={2}>
          {location.name}
        </Text>
        <Text variant="caption" numberOfLines={1}>
          {LOCATION_KIND_LABELS[location.kind]} · {location.city}
        </Text>
      </View>
    </Pressable>
  );
});
