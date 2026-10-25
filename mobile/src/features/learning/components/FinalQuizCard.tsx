import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/theme';
import type { LearningQuizSummary } from '../api/learning.dto';
import { quizState } from '../progress';
import { StepStatus } from './StepStatus';

export type FinalQuizCardProps = {
  quiz: LearningQuizSummary;
  completed: boolean;
  onOpen: () => void;
};
export function FinalQuizCard({ quiz, completed, onOpen }: FinalQuizCardProps) {
  const colors = useThemeColors();
  const state = quizState(quiz, completed);
  const locked = state === 'locked';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${quiz.attempts ? 'Retry' : 'Take'} ${quiz.title}`}
      disabled={locked}
      accessibilityState={{ disabled: locked }}
      onPress={onOpen}
      className={cn(
        'gap-3 rounded-card border border-border bg-surface p-4 active:opacity-80',
        !locked && !completed && 'border-primary bg-primary/10',
      )}
    >
      <View className="flex-row items-center justify-between">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary/20">
          <Ionicons name="ribbon-outline" size={24} color={colors.text} />
        </View>
        <StepStatus state={state} />
      </View>
      <Text variant="heading">Final summary quiz</Text>
      <Text variant="caption">
        {quiz.questionCount} questions to bring everything together.
      </Text>
      <View className="flex-row items-center justify-between border-t border-border pt-3">
        <Text variant="label" className="flex-1">
          {locked
            ? 'Complete the lesson quizzes to unlock'
            : quiz.attempts
              ? `Best: ${quiz.bestCorrectCount}/${quiz.questionCount} correct`
              : completed
                ? 'Review final quiz'
                : 'Ready for the final quiz'}
        </Text>
        <Ionicons
          name={locked ? 'lock-closed-outline' : 'arrow-forward'}
          size={18}
          color={colors.text}
        />
      </View>
    </Pressable>
  );
}
