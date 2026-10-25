import { View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { Image } from '@/components/ui/Image';
import { Scrim } from '@/components/ui/Scrim';
import { Text } from '@/components/ui/Text';
import { LockBadge } from '@/features/courses/components/LockBadge';
import type { Course } from '@/features/courses/types';
import { CountryFlag } from '@/components/shared/CountryFlag';

export type ReelCardProps = { course: Course };

export function ReelCard({ course }: ReelCardProps) {
  return (
    <View className="flex-1 justify-end gap-3 overflow-hidden rounded-card bg-border p-5">
      <Image uri={course.imageUrl} className="absolute inset-0" />
      <Scrim />
      <View className="flex-row gap-2">
        <Chip label={course.subject} />
        <Chip label="Demo image" variant="onImage" />
        {course.isUnlocked ? null : <LockBadge cost={course.unlockCost} />}
      </View>
      <Text variant="title" className="text-on-image">
        {course.title}
      </Text>
      <View className="flex-row items-center gap-2">
        <CountryFlag code={course.countryCode} name={course.countryName} />
        <Text variant="label" className="text-on-image">
          {course.countryName}
        </Text>
      </View>
      <Text variant="body" className="text-on-image" numberOfLines={3}>
        {course.description}
      </Text>
    </View>
  );
}
