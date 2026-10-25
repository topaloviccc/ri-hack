import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { CoursePlayer } from '@/features/learning';

export default function CourseLearningScreen() {
  const { id, lesson, quiz } = useLocalSearchParams<{
    id: string;
    lesson?: string;
    quiz?: string;
  }>();
  return (
    <Screen edgeToEdge>
      <CoursePlayer id={id} lesson={lesson} quiz={quiz} />
    </Screen>
  );
}
