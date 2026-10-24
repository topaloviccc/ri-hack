import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

export type SegmentedControlProps<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <View
      accessibilityRole="tablist"
      className={cn('flex-row rounded-full bg-secondary/40 p-1', className)}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(option.value)}
            className={cn(
              'min-h-11 flex-1 items-center justify-center rounded-full active:opacity-70',
              isSelected && 'bg-primary',
            )}
          >
            <Text variant="label" className={cn(isSelected && 'text-on-primary')}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
