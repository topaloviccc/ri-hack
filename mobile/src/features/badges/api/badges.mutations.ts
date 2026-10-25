import { useMutation, useQueryClient } from '@tanstack/react-query';

import { badgesApi } from './badges.api';
import { badgeKeys } from './badges.queries';
import { walletKeys } from '@/features/wallet';

export function useScanBadge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: badgesApi.scan,
    onSuccess: async (result) => {
      queryClient.setQueryData(badgeKeys.detail(result.badge.id), result.badge);
      // A first scan adds to the profile's badge list and pays coins.
      await Promise.all(
        [badgeKeys.all, walletKeys.all].map((key) =>
          queryClient.invalidateQueries({ queryKey: key }),
        ),
      );
    },
  });
}
