import { View } from 'react-native';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { useLearningQuery } from '@/features/learning/api/learning.queries';
import { useCourseFocus } from '@/features/focus';
import { LearningBackLink } from './LearningBackLink';
import { LearningOutline } from './LearningOutline';
import { LessonReader } from './LessonReader';
import { QuizPlayer } from './QuizPlayer';

export type CoursePlayerProps = { id: string; lesson?: string; quiz?: string };
export function CoursePlayer({ id, lesson, quiz }: CoursePlayerProps) {
  const query = useLearningQuery(id);
  useCourseFocus(id, !!query.data?.started && !query.data.completed);
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={query.refetch} />;
  const learning = query.data;
  const selected = lesson ? learning.lessons.find((item) => item.id === lesson) : undefined;
  return (
    <View className="flex-1">
      {quiz ? (
        <QuizPlayer key={quiz} learning={learning} quizId={quiz} />
      ) : selected ? (
        <LessonReader key={selected.id} course={id} lesson={selected} />
      ) : lesson ? (
        <View className="flex-1 p-4">
          <LearningBackLink />
          <EmptyState title="Lesson not found" message="It may have been moved or removed." />
        </View>
      ) : (
        <LearningOutline learning={learning} />
      )}
    </View>
  );
}
