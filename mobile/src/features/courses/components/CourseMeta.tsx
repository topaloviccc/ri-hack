import { View } from 'react-native';

import { CountryFlag } from '@/components/shared/CountryFlag';
import { Text } from '@/components/ui/Text';
import type { Course } from '@/features/courses/types';
import { cn } from '@/lib/cn';
import { formatCount } from '@/utils/format';

export type CourseMetaProps = {
  course: Course;
  className?: string;
};

/** "🇪🇸 Spain · 👥 1.2k learners" */
export function CourseMeta({ course, className }: CourseMetaProps) {
  return (
    <View className={cn('flex-row items-center gap-2', className)}>
      <CountryFlag code={course.countryCode} name={course.countryName} />
      <Text variant="caption" numberOfLines={1} className="flex-1">
        {course.countryName} · 👥 {formatCount(course.learnerCount)} learners
      </Text>
    </View>
  );
}
