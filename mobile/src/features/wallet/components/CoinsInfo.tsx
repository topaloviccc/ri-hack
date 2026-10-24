import { View } from 'react-native';

import { CoinIcon } from '@/components/ui/CoinIcon';
import { Text } from '@/components/ui/Text';
import { useWalletQuery } from '@/features/wallet/api/wallet.queries';

// TODO(hack): earning coins arrives with the backend. See BACKLOG.md.
export function CoinsInfo() {
  const { data } = useWalletQuery();
  return (
    <View className="items-center gap-3 p-6">
      <CoinIcon size="lg" />
      <Text variant="title" accessibilityRole="header">
        {data ? `${data.balance} coins` : 'Your coins'}
      </Text>
      <Text variant="body" className="text-center">
        Use coins to unlock courses. Ways to earn coins are coming soon.
      </Text>
    </View>
  );
}
