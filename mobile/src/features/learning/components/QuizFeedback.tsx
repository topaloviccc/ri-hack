import { router } from 'expo-router';
import { FlatList, View } from 'react-native';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Text } from '@/components/ui/Text';
import type { QuizResponse, QuizResult } from '@/features/learning/api/learning.dto';
import { LearningAction } from './LearningAction';
import { LearningBackLink } from './LearningBackLink';
import { StepStatus } from './StepStatus';

export type QuizFeedbackProps = { quiz: QuizResponse; result: QuizResult; onRetry: () => void };
export function QuizFeedback({ quiz, result, onRetry }: QuizFeedbackProps) {
  const index = result.learning.lessons.findIndex((lesson) => lesson.quiz.id === quiz.id);
  const next = result.learning.lessons[index + 1];
  return (
    <FlatList
      data={result.feedback}
      keyExtractor={(item) => item.questionId}
      contentContainerClassName="gap-4 p-4 pb-12"
      ListHeaderComponent={
        <View className="gap-3">
          <LearningBackLink />
          <Text variant="title" className="text-2xl" accessibilityRole="header">
            Quiz results
          </Text>
          <View className="gap-3 rounded-card border border-border bg-surface p-4">
            <Text variant="caption">Attempt {result.attemptNumber}</Text>
            <Text variant="heading" className="text-2xl">
              {result.correctCount}/{result.questionCount} correct (
              {Math.floor(result.percentage * 10) / 10}%)
            </Text>
            <ProgressBar
              value={result.correctCount / Math.max(1, result.questionCount)}
              accessibilityLabel="Quiz attempt score"
              className="h-2"
            />
            <Text variant="caption">
              {result.learning.completed && result.learning.percentage < 80
                ? 'Your previous course completion is saved.'
                : `Course score: ${Math.floor(result.learning.percentage * 10) / 10}% · 80% overall to pass`}
            </Text>
          </View>
          {result.learning.completed ? (
            <Text variant="heading" className="rounded-card bg-primary/15 p-4 text-base">
              Course passed! {result.learning.awardedCoins} coins awarded.
            </Text>
          ) : (
            <Text variant="caption">
              Your best score is saved. Submit every quiz and reach 80% overall to pass.
            </Text>
          )}
        </View>
      }
      renderItem={({ item }) => {
        const question = quiz.questions.find((q) => q.id === item.questionId);
        return (
          <View className="gap-2 rounded-card border border-border bg-surface p-4">
            <StepStatus
              state={item.correct ? 'completed' : 'ready'}
              label={item.correct ? 'Correct' : 'Review this answer'}
            />
            <Text variant="heading" className="text-base leading-6">
              {question?.prompt}
            </Text>
            {!item.correct ? (
              <Text variant="caption">
                You chose:{' '}
                {question?.options
                  .filter((option) => item.selectedOptionIds.includes(option.id))
                  .map((option) => option.text)
                  .join('; ')}
              </Text>
            ) : null}
            <Text variant="body" className="leading-6">
              Correct answer:{' '}
              {question?.options
                .filter((o) => item.correctOptionIds.includes(o.id))
                .map((o) => o.text)
                .join('; ')}
            </Text>
            {item.explanation ? (
              <Text variant="body" className="leading-6 text-muted">
                {item.explanation}
              </Text>
            ) : null}
          </View>
        );
      }}
      ListFooterComponent={
        <View className="gap-3">
          {!quiz.finalQuiz && next ? (
            <LearningAction
              label="Next lesson"
              onPress={() => router.setParams({ quiz: undefined, lesson: next.id })}
            />
          ) : null}
          {!quiz.finalQuiz && !next ? (
            <LearningAction
              label="Final summary quiz"
              onPress={() =>
                router.setParams({ lesson: undefined, quiz: result.learning.finalQuiz.id })
              }
            />
          ) : null}
          <LearningAction
            variant={quiz.finalQuiz ? 'primary' : 'soft'}
            label="Course outline"
            onPress={() => router.setParams({ lesson: undefined, quiz: undefined })}
          />
          <LearningAction variant="soft" label="Retry quiz" onPress={onRetry} />
        </View>
      }
    />
  );
}
