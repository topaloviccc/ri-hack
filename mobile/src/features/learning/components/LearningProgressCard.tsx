import { View } from 'react-native';
import { CoinIcon } from '@/components/ui/CoinIcon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Text } from '@/components/ui/Text';
import type { LearningResponse } from '../api/learning.dto';
import { learningProgress } from '../progress';
import { StepStatus } from './StepStatus';

export type LearningProgressCardProps = { learning: LearningResponse };
export function LearningProgressCard({ learning }: LearningProgressCardProps) {
  const progress = learningProgress(learning);
  const percentage = Math.round(progress.fraction * 100);
  // Historical completions can predate the current sample quizzes; retain their passed status.
  const showScore = progress.hasScore && (!learning.completed || learning.percentage >= 80);
  return (
    <View className="gap-3 rounded-card border border-border bg-surface p-4">
      <View className="flex-row items-center justify-between gap-2">
        <Text variant="label">Your progress</Text>
        {learning.completed ? (
          <StepStatus state="completed" label="Course passed" />
        ) : (
          <Text variant="label">{percentage}%</Text>
        )}
      </View>
      <ProgressBar
        value={progress.fraction}
        className="h-2"
        accessibilityLabel="Course content progress"
      />
      <Text variant="caption">
        {progress.done} of {progress.total} steps completed · lessons and quizzes
      </Text>
      <View className="flex-row border-t border-border pt-3">
        <View className="flex-1 gap-1">
          <Text variant="caption">Quiz score</Text>
          <Text variant="heading">
            {showScore
              ? `${Math.floor(learning.percentage * 10) / 10}%`
              : learning.completed
                ? 'Passed'
                : 'Not graded yet'}
          </Text>
          <Text variant="caption" className="text-xs">
            {showScore
              ? `${learning.correctCount}/${learning.questionCount} correct · best attempts`
              : learning.completed
                ? 'Saved completion'
                : '80% overall to pass'}
          </Text>
        </View>
        <View className="flex-1 gap-1 border-l border-border pl-4">
          <Text variant="caption">
            {learning.completed ? 'Reward earned' : 'Completion reward'}
          </Text>
          <View className="flex-row items-center gap-2">
            <CoinIcon />
            <Text variant="heading">
              {learning.completed ? learning.awardedCoins : learning.rewardCoins} coins
            </Text>
          </View>
          <Text variant="caption" className="text-xs">
            Once per course
          </Text>
        </View>
      </View>
      {!learning.completed && progress.done === progress.total ? (
        <Text variant="caption" className="text-text">
          All steps are done. Improve a quiz score to reach 80% and pass.
        </Text>
      ) : null}
    </View>
  );
}
