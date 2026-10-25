import { useMutation, useQueryClient } from '@tanstack/react-query';

import { benefitsApi } from '@/features/benefits/api/benefits.api';
import { benefitsKeys } from '@/features/benefits/api/benefits.queries';
import type { CouponMutation } from '@/features/benefits/types';
import { walletKeys } from '@/features/wallet';

export function useReconcileBenefits() {
  const client = useQueryClient();
  return (result?: CouponMutation) => {
    if (result) {
      client.setQueryData(walletKeys.detail(), result.wallet);
      client.setQueryData(benefitsKeys.coupon(result.coupon.id), {
        ...result.coupon, serverNow: result.serverNow,
      });
    }
    return Promise.all([
      client.invalidateQueries({ queryKey: benefitsKeys.all }),
      client.invalidateQueries({ queryKey: walletKeys.all }),
    ]);
  };
}

export function useActivateCoupon() {
  const reconcile = useReconcileBenefits();
  return useMutation({ mutationFn: benefitsApi.activate, onSuccess: reconcile,
    networkMode: 'always', retry: false,
    onError: () => { void reconcile(); },
  });
}

export function useMarkCouponUsed() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ couponId }: { couponId: string }) => benefitsApi.markUsed(couponId),
    onSuccess: (coupon) => {
      client.setQueryData(benefitsKeys.coupon(coupon.id), coupon);
      return client.invalidateQueries({ queryKey: benefitsKeys.all });
    },
    retry: false,
  });
}
