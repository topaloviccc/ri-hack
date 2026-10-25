import { View } from 'react-native';

import { cn } from '@/lib/cn';

export type ProgressBarProps = {
  /** 0..1 */
  value: number;
  className?: string;
  accessibilityLabel?: string;
};

export function ProgressBar({ value, className, accessibilityLabel }: ProgressBarProps) {
  const percent = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      className={cn('h-1.5 overflow-hidden rounded-full bg-border', className)}
    >
      <View className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
    </View>
  );
}
