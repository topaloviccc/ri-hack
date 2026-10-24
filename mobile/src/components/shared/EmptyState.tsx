import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

export type EmptyStateProps = {
  title: string;
  message?: string;
  className?: string;
};

export function EmptyState({ title, message, className }: EmptyStateProps) {
  return (
    <View className={cn('flex-1 items-center justify-center gap-1 p-6', className)}>
      <Text variant="heading" className="text-center">
        {title}
      </Text>
      {message ? (
        <Text variant="caption" className="text-center">
          {message}
        </Text>
      ) : null}
    </View>
  );
}
