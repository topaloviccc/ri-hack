import { View } from 'react-native';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Text } from '@/components/ui/Text';
import type { ScanResponse } from '@/features/badges/api/badges.dto';
import { BadgeStory } from '@/features/badges/components/BadgeStory';
import { pluralize } from '@/utils/format';

export type BadgeScanState =
  | { status: 'scanning' }
  | { status: 'not-badge' }
  | { status: 'error'; onRetry: () => void }
  | { status: 'done'; result: ScanResponse };

export type BadgeScanResultProps = { state: BadgeScanState };

/** What a scanned tag turned out to be: a newly collected badge, a repeat, or not a badge. */
export function BadgeScanResult({ state }: BadgeScanResultProps) {
  switch (state.status) {
    case 'scanning':
      return <LoadingState />;
    case 'not-badge':
      return <Text variant="body">This tag isn&apos;t an Out There badge.</Text>;
    case 'error':
      return <ErrorState message="Couldn't collect this badge." onRetry={state.onRetry} />;
    case 'done': {
      const { result } = state;
      const coins = result.awardedCoins > 0 ? ` · +${pluralize(result.awardedCoins, 'coin')}` : '';
      const status = result.newlyCollected
        ? `Added to your profile${coins}`
        : 'Already in your collection';
      return (
        <View className="gap-3">
          <Text variant="heading" className="rounded-card bg-primary/15 p-3 text-base">
            {status}
          </Text>
          <BadgeStory badge={result.badge} />
        </View>
      );
    }
  }
}
