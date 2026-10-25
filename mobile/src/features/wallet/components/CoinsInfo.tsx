import { View } from 'react-native';

import { CoinIcon } from '@/components/ui/CoinIcon';
import { Text } from '@/components/ui/Text';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { useWalletQuery } from '@/features/wallet/api/wallet.queries';
import { pluralize } from '@/utils/format';

export function CoinsInfo() {
  const { data, isPending, isError, error, refetch } = useWalletQuery();
  if (isPending) return <LoadingState />;
  if (isError)
    return (
      <ErrorState
        message={error.message}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  return (
    <View className="items-center gap-3 p-6">
      <CoinIcon size="lg" />
      <Text variant="title" accessibilityRole="header">
        {pluralize(data.availableBalance, 'available coin')}
      </Text>
      <Text variant="body" className="text-center">
        Use coins to unlock courses or redeem Benefits. Submit every quiz and score at least 80%
        overall to earn the course completion reward, paid once per course.
      </Text>
      {data.heldBalance > 0 ? (
        <Text variant="caption">{pluralize(data.heldBalance, 'coin')} on hold</Text>
      ) : null}
      <Text variant="caption" className="text-center">
        Coins are virtual, not cash.
      </Text>
    </View>
  );
}
