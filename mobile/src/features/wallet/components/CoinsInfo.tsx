import { View } from 'react-native';

import { CoinIcon } from '@/components/ui/CoinIcon';
import { Text } from '@/components/ui/Text';
import { useWalletQuery } from '@/features/wallet/api/wallet.queries';

export function CoinsInfo() {
  const { data } = useWalletQuery();
  return (
    <View className="items-center gap-3 p-6">
      <CoinIcon size="lg" />
      <Text variant="title" accessibilityRole="header">
        {data ? `${data.balance} coins` : 'Your coins'}
      </Text>
      <Text variant="body" className="text-center">
        Use coins to unlock courses. Submit every quiz and score at least 80% overall to earn the
        course completion reward, paid once per course.
      </Text>
    </View>
  );
}
