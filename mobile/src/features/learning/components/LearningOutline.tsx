import { router } from 'expo-router';
import { FlatList, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import type { LearningResponse } from '../api/learning.dto';
import { useStartLearning } from '../api/learning.mutations';
import { learningProgress, type LearningTarget } from '../progress';
import { LearningHeader } from './LearningHeader';
import { LearningProgressCard } from './LearningProgressCard';
import { LearningModuleCard } from './LearningModuleCard';
import { FinalQuizCard } from './FinalQuizCard';
import { LearningAction } from './LearningAction';

export type LearningOutlineProps = { learning: LearningResponse };
export function LearningOutline({ learning }: LearningOutlineProps) {
  const start = useStartLearning(learning.courseId);
  const progress = learningProgress(learning);
  const open = (target: LearningTarget) =>
    router.setParams({ lesson: target.lesson, quiz: target.quiz });
  const handleContinue = () => {
    if (!learning.started) {
      start.mutate(undefined, {
        onSuccess: (data) => {
          const next = learningProgress(data).next;
          if (next) open(next);
        },
      });
    } else if (learning.completed && learning.lessons[0]) open({ lesson: learning.lessons[0].id });
    else if (progress.next) open(progress.next);
  };
  const action = !learning.started
    ? 'Start learning'
    : learning.completed
      ? 'Review course'
      : progress.done === progress.total
        ? 'Improve quiz score'
        : 'Continue learning';
  return (
    <FlatList
      data={learning.lessons}
      keyExtractor={(item) => item.id}
      contentContainerClassName="gap-4 px-4 pb-12 pt-4"
      ListHeaderComponent={
        <View className="gap-4">
          <LearningHeader learning={learning} />
          <LearningProgressCard learning={learning} />
          <LearningAction
            label={start.isPending ? 'Starting...' : action}
            disabled={start.isPending}
            onPress={handleContinue}
          />
          {start.isError ? (
            <Text variant="caption" className="text-primary" accessibilityRole="alert">
              {start.error.message}
            </Text>
          ) : null}
          <View className="mt-2 flex-row items-center justify-between">
            <Text variant="heading">Course path</Text>
            <Text variant="caption">Learn at your own pace</Text>
          </View>
        </View>
      }
      renderItem={({ item, index }) => (
        <LearningModuleCard
          lesson={item}
          index={index}
          courseCompleted={learning.completed}
          onOpen={open}
        />
      )}
      ListFooterComponent={
        <View className="gap-4">
          <FinalQuizCard
            quiz={learning.finalQuiz}
            completed={learning.completed}
            onOpen={() => open({ quiz: learning.finalQuiz.id })}
          />
          <Text variant="caption" className="text-center text-xs leading-5">
            Read a lesson, then submit its quiz to unlock the next part. Best attempts count. Retry
            as often as you need.
          </Text>
        </View>
      }
    />
  );
}
