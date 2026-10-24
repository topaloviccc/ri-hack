import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { Image } from '@/components/ui/Image';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Text } from '@/components/ui/Text';
import { CourseMeta } from '@/features/courses/components/CourseMeta';
import { LockBadge } from '@/features/courses/components/LockBadge';
import type { Course } from '@/features/courses/types';

export type CourseListItemProps = {
  course: Course;
  onPress: (id: string) => void;
  onPressIn?: (id: string) => void;
};

/** Compact row used by the location sheet, Country page, Fields list and profiles. */
export const CourseListItem = memo(function CourseListItem({
  course,
  onPress,
  onPressIn,
}: CourseListItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open course ${course.title}`}
      onPress={() => onPress(course.id)}
      onPressIn={() => onPressIn?.(course.id)}
      className="flex-row items-center gap-3 rounded-card border border-border bg-surface p-3 active:opacity-80"
    >
      <Image uri={course.imageUrl} className="h-16 w-16 rounded-lg bg-border" />
      <View className="flex-1 gap-1">
        <Text variant="label" className="text-base" numberOfLines={2}>
          {course.title}
        </Text>
        <CourseMeta course={course} />
        <View className="flex-row flex-wrap gap-2">
          <Chip label={course.subject} />
          {course.isUnlocked ? null : <LockBadge cost={course.unlockCost} />}
        </View>
        {course.progress !== undefined ? <ProgressBar value={course.progress} /> : null}
      </View>
    </Pressable>
  );
});
