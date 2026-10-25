import { router } from 'expo-router';
import { Pressable } from 'react-native';

import { CoinIcon } from '@/components/ui/CoinIcon';
import { Text } from '@/components/ui/Text';
import { useWalletQuery } from '@/features/wallet/api/wallet.queries';
import { cn } from '@/lib/cn';
import { formatCount } from '@/utils/format';

export type CoinBalanceProps = {
  /** Drop shadow for use over photos. */
  elevated?: boolean;
};

/** "🪙 340" pill for headers; opens the coins info sheet. */
export function CoinBalance({ elevated = false }: CoinBalanceProps) {
  const { data } = useWalletQuery();
  const balance = data ? formatCount(data.availableBalance) : '…';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={data ? `${data.availableBalance} coins` : 'Coins loading'}
      accessibilityHint="Shows what coins are for"
      onPress={() => router.push('/coins')}
      className={cn(
        'min-h-11 flex-row items-center gap-1.5 self-center rounded-full bg-surface px-3 active:opacity-70',
        elevated && 'shadow-lg shadow-overlay',
      )}
    >
      <CoinIcon />
      <Text variant="label">{balance}</Text>
    </Pressable>
  );
}
