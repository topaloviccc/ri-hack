import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from './courses.api';
import { courseKeys } from './courses.queries';

export function useDismissCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: coursesApi.dismiss,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: courseKeys.all }),
  });
}
