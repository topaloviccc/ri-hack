import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/theme';

const SIZES = { sm: 16, md: 22, lg: 40 } as const;
const STAR_RATIO = 0.55;

export type CoinIconProps = {
  size?: keyof typeof SIZES;
  className?: string;
};

/** The app's coin: an orange disc with a lighter rim and a star. Decorative. */
export function CoinIcon({ size = 'sm', className }: CoinIconProps) {
  const colors = useThemeColors();
  const px = SIZES[size];
  return (
    <View
      accessible={false}
      importantForAccessibility="no"
      className={cn(
        'items-center justify-center rounded-full border-2 border-coin-rim bg-primary',
        className,
      )}
      style={{ width: px, height: px }}
    >
      <Ionicons name="star" size={Math.round(px * STAR_RATIO)} color={colors.coinRim} />
    </View>
  );
}
