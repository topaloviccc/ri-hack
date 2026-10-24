import { Text } from '@/components/ui/Text';
import type { Course } from '@/features/courses/types';
import { countryFlag } from '@/utils/flag';
import { formatCount } from '@/utils/format';

export type CourseMetaProps = {
  course: Course;
  className?: string;
};

/** "🇪🇸 Spain · 👥 1.2k learners" */
export function CourseMeta({ course, className }: CourseMetaProps) {
  return (
    <Text variant="caption" numberOfLines={1} className={className}>
      {countryFlag(course.countryCode)} {course.countryName} · 👥 {formatCount(course.learnerCount)}{' '}
      learners
    </Text>
  );
}
