import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { Image } from '@/components/ui/Image';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Scrim } from '@/components/ui/Scrim';
import { Text } from '@/components/ui/Text';
import { CourseMeta } from '@/features/courses/components/CourseMeta';
import { LockBadge } from '@/features/courses/components/LockBadge';
import type { Course } from '@/features/courses/types';

export type CourseCardProps = {
  course: Course;
  onPress: (id: string) => void;
  onPressIn?: (id: string) => void;
};

export const CourseCard = memo(function CourseCard({
  course,
  onPress,
  onPressIn,
}: CourseCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open course ${course.title}`}
      onPress={() => onPress(course.id)}
      onPressIn={() => onPressIn?.(course.id)}
      className="w-72 overflow-hidden rounded-card border border-border bg-surface active:opacity-80"
    >
      <View className="h-40 justify-between p-3">
        <Image uri={course.imageUrl} className="absolute inset-0" />
        <Scrim />
        <View className="flex-row items-start justify-between">
          <Chip label="COURSE" variant="onImage" />
          {course.isUnlocked ? null : <LockBadge cost={course.unlockCost} />}
        </View>
        <Text variant="heading" className="text-on-image" numberOfLines={2}>
          {course.title}
        </Text>
      </View>
      <View className="gap-2 p-4">
        <CourseMeta course={course} />
        <Chip label={course.subject} />
        {course.progress !== undefined ? <ProgressBar value={course.progress} /> : null}
      </View>
    </Pressable>
  );
});
