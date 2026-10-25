import { useLocalSearchParams } from 'expo-router';

import { EmptyState } from '@/components/shared/EmptyState';
import { BenefitsFrame, RedeemConfirmModal } from '@/features/benefits';

export default function BenefitConfirmScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  return <BenefitsFrame>{typeof id === 'string' && id.trim() ? <RedeemConfirmModal offerId={id} /> : <EmptyState title="Offer not found" />}</BenefitsFrame>;
}
