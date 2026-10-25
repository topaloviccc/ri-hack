import type { ReactNode } from 'react';

import { Screen } from '@/components/layout/Screen';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { useAuth } from '@/features/auth';
import { InterestPicker } from './InterestPicker';
import { useInterests } from './interests.api';

export function InterestOnboardingGate({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const interests = useInterests(status === 'signedIn');
  if (status !== 'signedIn') return children;
  if (interests.isPending) return <LoadingState />;
  if (interests.isError) return <ErrorState onRetry={interests.refetch} />;
  if (!interests.data.onboardingComplete) {
    return (
      <Screen>
        <InterestPicker initialIds={interests.data.fieldIds} onboarding />
      </Screen>
    );
  }
  return children;
}
