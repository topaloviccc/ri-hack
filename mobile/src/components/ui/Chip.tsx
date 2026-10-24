import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

const VARIANTS = {
  secondary: { container: 'bg-secondary', label: 'text-on-secondary' },
  onImage: { container: 'border border-on-image/40 bg-overlay/30', label: 'text-on-image' },
  selected: { container: 'bg-primary', label: 'text-on-primary' },
  neutral: { container: 'bg-surface border border-border', label: 'text-text' },
} as const;

export type ChipVariant = keyof typeof VARIANTS;

export type ChipProps = {
  label: string;
  variant?: ChipVariant;
  className?: string;
};

export function Chip({ label, variant = 'secondary', className }: ChipProps) {
  const styles = VARIANTS[variant];
  return (
    <View className={cn('self-start rounded-full px-3 py-1', styles.container, className)}>
      <Text variant="label" className={cn('text-xs', styles.label)}>
        {label}
      </Text>
    </View>
  );
}
