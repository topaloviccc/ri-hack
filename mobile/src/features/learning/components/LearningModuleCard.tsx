import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/theme';
import type { LearningLesson } from '../api/learning.dto';
import { lessonState, quizState, type LearningTarget } from '../progress';
import { StepStatus } from './StepStatus';

export type LearningModuleCardProps = {
  lesson: LearningLesson;
  index: number;
  courseCompleted: boolean;
  onOpen: (target: LearningTarget) => void;
};
export function LearningModuleCard({
  lesson,
  index,
  courseCompleted,
  onOpen,
}: LearningModuleCardProps) {
  const colors = useThemeColors();
  const reading = lessonState(lesson, courseCompleted);
  const quiz = quizState(lesson.quiz, courseCompleted);
  const locked = reading === 'locked';
  const done = Number(reading === 'completed') + Number(quiz === 'completed');
  const current = !locked && done < 2;
  return (
    <View
      className={cn(
        'overflow-hidden rounded-card border bg-surface',
        current ? 'border-primary' : 'border-border',
      )}
    >
      <View className="flex-row items-start gap-3 p-4">
        <View
          className={cn(
            'h-11 w-11 items-center justify-center rounded-xl',
            current ? 'bg-primary/20' : 'bg-secondary/20',
          )}
        >
          <Text variant="mono" className="font-mono-medium text-base text-text">
            {String(index + 1).padStart(2, '0')}
          </Text>
        </View>
        <View className="flex-1 gap-1.5">
          <StepStatus
            state={locked ? 'locked' : done === 2 ? 'completed' : 'ready'}
            label={current ? 'Up next' : undefined}
          />
          <Text variant="heading" className="text-base">
            {lesson.title}
          </Text>
          <Text variant="caption" className="text-xs text-text/80">
            {lesson.estimatedMinutes ? `${lesson.estimatedMinutes} min + ` : 'Lesson + '}
            {lesson.quiz.questionCount}-question quiz
          </Text>
        </View>
      </View>
      <View className="gap-3 px-4 pb-3">
        <ProgressBar value={done / 2} accessibilityLabel={`Part ${index + 1} progress`} />
        {locked ? (
          <Text variant="caption" className="text-xs text-text/80">
            {index === 0
              ? 'Start learning to unlock this part.'
              : `Submit the quiz in part ${index} to unlock.`}
          </Text>
        ) : null}
      </View>
      <View className="border-t border-border">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Read lesson ${index + 1}`}
          accessibilityState={{ disabled: locked }}
          disabled={locked}
          onPress={() => onOpen({ lesson: lesson.id })}
          className="min-h-12 flex-row items-center gap-3 px-4 py-3 active:bg-secondary/10"
        >
          <Ionicons
            name={
              reading === 'completed'
                ? 'checkmark-circle'
                : locked
                  ? 'lock-closed-outline'
                  : 'reader-outline'
            }
            size={20}
            color={colors.text}
          />
          <Text variant="label" className="flex-1">
            {reading === 'completed' ? 'Lesson read' : 'Read lesson'}
          </Text>
          <Text variant="caption" className="text-xs text-text/80">
            {locked ? 'Locked' : reading === 'completed' ? 'Review' : 'Read'}
          </Text>
          {!locked ? <Ionicons name="chevron-forward" size={16} color={colors.text} /> : null}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${lesson.quiz.attempts ? 'Retry' : 'Take'} ${lesson.quiz.title}`}
          accessibilityState={{ disabled: quiz === 'locked' }}
          disabled={quiz === 'locked'}
          onPress={() => onOpen({ quiz: lesson.quiz.id })}
          className="min-h-12 flex-row items-center gap-3 border-t border-border px-4 py-3 active:bg-secondary/10"
        >
          <Ionicons
            name={
              quiz === 'completed'
                ? 'checkmark-circle'
                : quiz === 'locked'
                  ? 'lock-closed-outline'
                  : 'help-circle-outline'
            }
            size={20}
            color={colors.text}
          />
          <Text variant="label" className="flex-1">
            Lesson quiz
          </Text>
          <Text variant="caption" className="text-xs text-text/80">
            {quiz === 'locked'
              ? 'Locked'
              : lesson.quiz.attempts
                ? `${lesson.quiz.bestCorrectCount}/${lesson.quiz.questionCount} correct · Retry`
                : courseCompleted
                  ? 'Review'
                  : 'Ready'}
          </Text>
          {quiz !== 'locked' ? (
            <Ionicons name="chevron-forward" size={16} color={colors.text} />
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}
