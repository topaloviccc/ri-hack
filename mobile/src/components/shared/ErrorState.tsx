import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

export type ErrorStateProps = {
  message?: string;
  onRetry: () => void;
  className?: string;
};

export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <View className={cn('flex-1 items-center justify-center gap-3 p-6', className)}>
      <Text variant="caption" className="text-center">
        {message}
      </Text>
      <Button label="Try again" onPress={onRetry} className="self-center" />
    </View>
  );
}
