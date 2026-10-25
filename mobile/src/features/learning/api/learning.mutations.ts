import { useMutation, useQueryClient } from '@tanstack/react-query';
import { learningApi } from './learning.api';
import type { LearningResponse, QuizAnswer } from './learning.dto';
import { learningKeys } from './learning.queries';
import { courseKeys } from '@/features/courses';
import { networkKeys } from '@/features/network';
import { userKeys } from '@/features/users';
import { walletKeys } from '@/features/wallet';

function useLearningSaved() {
  const client = useQueryClient();
  return async (data: LearningResponse) => {
    client.setQueryData(learningKeys.course(data.courseId), data);
    await Promise.all(
      [courseKeys.all, userKeys.all, walletKeys.all, networkKeys.all].map((key) =>
        client.invalidateQueries({ queryKey: key }),
      ),
    );
  };
}
export function useStartLearning(course: string) {
  const save = useLearningSaved();
  return useMutation({ mutationFn: () => learningApi.start(course), onSuccess: save });
}
export function useCompleteLesson(course: string) {
  const save = useLearningSaved();
  return useMutation({
    mutationFn: (lesson: string) => learningApi.completeLesson(course, lesson),
    onSuccess: save,
  });
}
export function useSubmitQuiz(course: string, quiz: string) {
  const save = useLearningSaved();
  return useMutation({
    mutationFn: ({ answers, key }: { answers: QuizAnswer[]; key: string }) =>
      learningApi.submit(course, quiz, answers, key),
    onSuccess: (result) => save(result.learning),
  });
}
