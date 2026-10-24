import { ActivityIndicator, View } from 'react-native';

import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/theme';

export type LoadingStateProps = { className?: string };

export function LoadingState({ className }: LoadingStateProps) {
  const colors = useThemeColors();
  return (
    <View
      className={cn('flex-1 items-center justify-center p-6', className)}
      accessibilityLabel="Loading"
    >
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}
