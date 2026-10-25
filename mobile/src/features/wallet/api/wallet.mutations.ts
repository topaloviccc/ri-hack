import { useMutation, useQueryClient } from '@tanstack/react-query';

import { courseKeys } from '@/features/courses';
import { benefitsKeys } from '@/features/benefits';
import { walletApi } from '@/features/wallet/api/wallet.api';
import { walletKeys } from '@/features/wallet/api/wallet.queries';
import type { UnlockCourseInput } from '@/features/wallet/types';

export function useUnlockCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UnlockCourseInput) => walletApi.unlockCourse(input),
    onSuccess: (wallet) => {
      queryClient.setQueryData(walletKeys.detail(), wallet);
      // Lock state shows on every course list and details page.
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: courseKeys.all }),
        queryClient.invalidateQueries({ queryKey: benefitsKeys.all }),
      ]);
    },
    onError: () => queryClient.invalidateQueries({ queryKey: walletKeys.all }),
  });
}
