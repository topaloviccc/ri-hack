import { queryOptions, useQuery } from '@tanstack/react-query';
import { learningApi } from './learning.api';

export const learningKeys = {
  all: ['learning'] as const,
  course: (id: string) => [...learningKeys.all, 'course', id] as const,
  quiz: (course: string, quiz: string) => [...learningKeys.course(course), 'quiz', quiz] as const,
};
export const learningOptions = (id: string) =>
  queryOptions({ queryKey: learningKeys.course(id), queryFn: () => learningApi.get(id) });
export const useLearningQuery = (id: string) => useQuery(learningOptions(id));
export const useQuizQuery = (course: string, quiz: string) =>
  useQuery(
    queryOptions({
      queryKey: learningKeys.quiz(course, quiz),
      queryFn: () => learningApi.quiz(course, quiz),
    }),
  );
