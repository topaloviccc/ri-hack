import { View } from 'react-native';

import { CoinIcon } from '@/components/ui/CoinIcon';
import { Text } from '@/components/ui/Text';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { useWalletQuery } from '@/features/wallet/api/wallet.queries';

// TODO(hack): earning coins arrives with the backend. See BACKLOG.md.
export function CoinsInfo() {
  const { data, isPending, isError, error, refetch } = useWalletQuery();
  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState message={error.message} onRetry={() => { void refetch(); }} />;
  return (
    <View className="items-center gap-3 p-6">
      <CoinIcon size="lg" />
      <Text variant="title" accessibilityRole="header">
        {data.availableBalance} available coins
      </Text>
      <Text variant="body" className="text-center">
        Use coins to unlock courses or activate Benefits. Ways to earn coins are coming soon.
      </Text>
      <Text>Posted balance: {data.balance} coins</Text>
      <Text variant="caption" className="text-center">Coins are virtual, not cash.</Text>
    </View>
  );
}
