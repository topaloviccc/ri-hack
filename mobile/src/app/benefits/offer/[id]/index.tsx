import { useLocalSearchParams } from 'expo-router';

import { EmptyState } from '@/components/shared/EmptyState';
import { BenefitDetails, BenefitsFrame } from '@/features/benefits';

export default function BenefitDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  return <BenefitsFrame>{typeof id === 'string' && id.trim() ? <BenefitDetails offerId={id} /> : <EmptyState title="Offer not found" />}</BenefitsFrame>;
}
