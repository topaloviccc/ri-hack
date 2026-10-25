import { useLocalSearchParams } from 'expo-router';

import { EmptyState } from '@/components/shared/EmptyState';
import { ActiveCoupon, BenefitsFrame } from '@/features/benefits';

export default function CouponScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  return <BenefitsFrame>{typeof id === 'string' && id.trim() ? <ActiveCoupon couponId={id} /> : <EmptyState title="Coupon not found" />}</BenefitsFrame>;
}
