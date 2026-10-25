import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';
import { Chip } from '@/components/ui/Chip';
import { DemoNotice } from '@/components/shared/DemoNotice';
import { Image } from '@/components/ui/Image';
import { Scrim } from '@/components/ui/Scrim';
import { Text } from '@/components/ui/Text';
import { useCourseQuery } from '@/features/courses';
import type { LearningResponse } from '../api/learning.dto';
import { useThemeColors } from '@/lib/theme';
import { pluralize } from '@/utils/format';

export type LearningHeaderProps = { learning: LearningResponse };
export function LearningHeader({ learning }: LearningHeaderProps) {
  const { data: course } = useCourseQuery(learning.courseId);
  const colors = useThemeColors();
  return (
    <View className="gap-3">
      <View className="h-36 overflow-hidden rounded-card bg-secondary/30">
        {course?.imageUrl ? (
          <>
            <Image uri={course.imageUrl} className="absolute inset-0" />
            <Scrim />
          </>
        ) : null}
        <View className="flex-1 justify-between p-4">
          <View className="flex-row items-center justify-between">
            <Chip
              label={course?.subject ?? 'Your course'}
              variant={course?.imageUrl ? 'onImage' : 'secondary'}
            />
            {course?.imageUrl ? (
              <Chip label="Demo image" variant="onImage" />
            ) : (
              <Ionicons name="book-outline" size={28} color={colors.text} />
            )}
          </View>
          <Text
            variant="heading"
            className={course?.imageUrl ? 'text-xl text-on-image' : 'text-xl'}
            accessibilityRole="header"
            numberOfLines={3}
          >
            {learning.title}
          </Text>
        </View>
      </View>
      <View className="flex-row flex-wrap items-center gap-2">
        {typeof learning.estimatedMinutes === 'number' ? (
          <>
            <Ionicons name="time-outline" size={16} color={colors.text} />
            <Text variant="label">{learning.estimatedMinutes} min</Text>
            <Text variant="caption">·</Text>
          </>
        ) : null}
        <Ionicons name="layers-outline" size={16} color={colors.text} />
        <Text variant="label">{pluralize(learning.lessons.length, 'lesson')}</Text>
        <Text variant="caption">·</Text>
        <Text variant="label">{pluralize(learning.lessons.length + 1, 'quiz', 'quizzes')}</Text>
        <Text variant="caption">·</Text>
        <Text variant="label">80% to pass</Text>
      </View>
      {learning.lessons.some((lesson) => lesson.demo) ? (
        <DemoNotice>lesson and quiz content</DemoNotice>
      ) : null}
    </View>
  );
}
