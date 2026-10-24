import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { courseQueryOptions } from '@/features/courses/api/courses.queries';

/** Navigates to a course and lets callers warm its detail query on press-in. */
export function useOpenCourse() {
  const queryClient = useQueryClient();
  return {
    prefetchCourse: (id: string) => queryClient.prefetchQuery(courseQueryOptions(id)),
    openCourse: (id: string) => router.push({ pathname: '/course/[id]', params: { id } }),
  };
}
