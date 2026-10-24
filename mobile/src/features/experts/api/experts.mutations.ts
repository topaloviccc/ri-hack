import { useMutation, useQueryClient } from '@tanstack/react-query';

import { expertsApi } from '@/features/experts/api/experts.api';
import { expertRequestKeys } from '@/features/experts/api/experts.queries';
import type { CreateExpertRequest } from '@/features/experts/types';

export function useCreateExpertRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExpertRequest) => expertsApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expertRequestKeys.all }),
  });
}
