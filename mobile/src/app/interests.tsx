import { router } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { InterestPicker } from '@/features/interests/InterestPicker';
import { useInterests } from '@/features/interests/interests.api';

export default function InterestsScreen() {
  const interests = useInterests();
  if (interests.isPending) return <LoadingState />;
  if (interests.isError) return <ErrorState onRetry={interests.refetch} />;
  return (
    <Screen edgeToEdge>
      <InterestPicker initialIds={interests.data.fieldIds} onSaved={() => router.back()} />
    </Screen>
  );
}
