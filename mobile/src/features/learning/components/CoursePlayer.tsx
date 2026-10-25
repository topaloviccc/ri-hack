import { View } from 'react-native';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Text } from '@/components/ui/Text';
import { useLearningQuery } from '@/features/learning/api/learning.queries';
import { LearningOutline } from './LearningOutline';
import { LessonReader } from './LessonReader';
import { QuizPlayer } from './QuizPlayer';

export type CoursePlayerProps = { id: string; lesson?: string; quiz?: string };
export function CoursePlayer({ id, lesson, quiz }: CoursePlayerProps) {
  const query = useLearningQuery(id);
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
        <Text>Lesson not found.</Text>
      ) : (
        <LearningOutline learning={learning} />
      )}
    </View>
  );
}
