import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { courseKeys } from '@/features/courses/api/courses.queries';
import { apiRequest } from '@/lib/api-client';

export type LearningField = { id: string; label: string };
export type Interests = { fieldIds: string[]; onboardingComplete: boolean };
export const interestKey = ['interests'] as const;

export const interestsApi = {
  fields: () => apiRequest<LearningField[]>('/codebooks/fields'),
  get: () => apiRequest<Interests>('/users/me/interests'),
  save: (fieldIds: string[]) =>
    apiRequest<Interests>('/users/me/interests', { method: 'POST', body: { fieldIds } }),
};

export const useInterests = (enabled = true) =>
  useQuery({ queryKey: interestKey, queryFn: interestsApi.get, enabled });

export const useLearningFields = () =>
  useQuery({ queryKey: ['learning-fields'], queryFn: interestsApi.fields });

export function useSaveInterests() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: interestsApi.save,
    onSuccess: (saved) => {
      client.setQueryData(interestKey, saved);
      return client.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}
