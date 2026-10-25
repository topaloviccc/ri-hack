import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { CoinIcon } from '@/components/ui/CoinIcon';
import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/theme';
import { formatNumber, pluralize } from '@/utils/format';

export type LockBadgeProps = {
  cost: number;
  className?: string;
};

/** "🔒 🪙 120" on locked courses. */
export function LockBadge({ cost, className }: LockBadgeProps) {
  const colors = useThemeColors();
  return (
    <View
      accessible
      accessibilityLabel={`Locked. Unlock for ${pluralize(cost, 'coin')}`}
      className={cn(
        'flex-row items-center gap-1 self-start rounded-full bg-surface px-2 py-1 shadow-sm shadow-overlay',
        className,
      )}
    >
      <Ionicons name="lock-closed" size={12} color={colors.text} />
      <CoinIcon />
      <Text variant="label" className="text-xs">
        {formatNumber(cost)}
      </Text>
    </View>
  );
}
