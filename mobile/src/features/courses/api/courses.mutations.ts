import { useMutation, useQueryClient } from '@tanstack/react-query';

import { coursesApi } from '@/features/courses/api/courses.api';
import { courseGenerationKeys, courseKeys } from '@/features/courses/api/courses.queries';

export function useGenerateCourse(query: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => coursesApi.generate(query),
    onSuccess: (generation) =>
      queryClient.setQueryData(courseGenerationKeys.detail(query), generation),
    // Matching catalogue content blocks a new request; refresh results so it shows up.
    onError: () => queryClient.invalidateQueries({ queryKey: courseKeys.all }),
  });
}
