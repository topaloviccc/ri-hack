import { useRef, useState } from 'react';
import { FlatList, View } from 'react-native';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Text } from '@/components/ui/Text';
import type { LearningResponse } from '@/features/learning/api/learning.dto';
import { useQuizQuery } from '@/features/learning/api/learning.queries';
import { useSubmitQuiz } from '@/features/learning/api/learning.mutations';
import { QuizFeedback } from './QuizFeedback';
import { QuizQuestionCard } from './QuizQuestionCard';
import { LearningBackLink } from './LearningBackLink';
import { LearningAction } from './LearningAction';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DemoNotice } from '@/components/shared/DemoNotice';

const requestKey = () => `quiz-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export type QuizPlayerProps = { learning: LearningResponse; quizId: string };
export function QuizPlayer({ learning, quizId }: QuizPlayerProps) {
  const query = useQuizQuery(learning.courseId, quizId);
  const submit = useSubmitQuiz(learning.courseId, quizId);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const key = useRef(requestKey());
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={query.refetch} />;
  const quiz = query.data;
  if (submit.data)
    return (
      <QuizFeedback
        quiz={quiz}
        result={submit.data}
        onRetry={() => {
          setAnswers({});
          key.current = requestKey();
          submit.reset();
        }}
      />
    );
  const choose = (question: string, option: string, multiple: boolean) => {
    key.current = requestKey();
    setAnswers((previous) => {
      const selected = previous[question] ?? [];
      return {
        ...previous,
        [question]: multiple
          ? selected.includes(option)
            ? selected.filter((id) => id !== option)
            : [...selected, option]
          : [option],
      };
    });
  };
  const answered = quiz.questions.filter(
    (question) => (answers[question.id]?.length ?? 0) > 0,
  ).length;
  const ready = quiz.questions.length > 0 && answered === quiz.questions.length;
  return (
    <FlatList
      data={quiz.questions}
      keyExtractor={(item) => item.id}
      contentContainerClassName="gap-5 p-4 pb-12"
      ListHeaderComponent={
        <View className="gap-3">
          <LearningBackLink disabled={submit.isPending} />
          <Text variant="mono" className="text-xs text-text">
            {quiz.finalQuiz ? 'FINAL SUMMARY' : 'LESSON QUIZ'}
          </Text>
          <Text variant="title" className="text-2xl" accessibilityRole="header">
            {quiz.title}
          </Text>
          {learning.lessons.some((lesson) => lesson.demo) ? (
            <DemoNotice>quiz content</DemoNotice>
          ) : null}
          <View className="gap-2 rounded-card bg-secondary/20 p-4">
            <Text variant="label">
              {answered} of {quiz.questions.length} questions answered
            </Text>
            <ProgressBar
              value={answered / Math.max(1, quiz.questions.length)}
              accessibilityLabel="Quiz answer progress"
              className="h-2"
            />
            <Text variant="caption" className="text-text/80">
              Take your time. Only your best attempt counts.
            </Text>
          </View>
        </View>
      }
      renderItem={({ item, index }) => (
        <QuizQuestionCard
          question={item}
          index={index}
          total={quiz.questions.length}
          selected={answers[item.id] ?? []}
          disabled={submit.isPending}
          onChoose={(option) => choose(item.id, option, item.type === 'MULTIPLE_CHOICE')}
        />
      )}
      ListFooterComponent={
        <View className="gap-3">
          {submit.isError ? <Text accessibilityRole="alert">{submit.error.message}</Text> : null}
          <LearningAction
            label={submit.isPending ? 'Submitting...' : 'Submit quiz'}
            disabled={!ready || submit.isPending}
            onPress={() =>
              submit.mutate({
                key: key.current,
                answers: quiz.questions.map((q) => ({
                  questionId: q.id,
                  optionIds: answers[q.id] ?? [],
                })),
              })
            }
          />
        </View>
      }
    />
  );
}
