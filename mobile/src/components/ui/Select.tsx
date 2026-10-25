import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { FlatList, Pressable } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/theme';

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  /** Shown greyed out with this note (e.g. "Pending"); not selectable. */
  disabledReason?: string;
};

export type SelectProps<T extends string> = {
  label: string;
  placeholder: string;
  options: readonly SelectOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  hasError?: boolean;
};

/** Field-styled trigger that opens a bottom panel of options. */
export function Select<T extends string>({
  label,
  placeholder,
  options,
  value,
  onChange,
  hasError = false,
}: SelectProps<T>) {
  const colors = useThemeColors();
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  const handlePick = (option: SelectOption<T>) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? 'none selected'}`}
        accessibilityHint="Opens a list of options"
        onPress={() => setIsOpen(true)}
        className={cn(
          'min-h-11 flex-row items-center justify-between rounded-full border bg-surface px-4 active:opacity-70',
          hasError ? 'border-primary' : 'border-border',
        )}
      >
        <Text variant="body" className={cn(!selected && 'text-muted')}>
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.muted} />
      </Pressable>

      <BottomSheet visible={isOpen} title={label} onClose={() => setIsOpen(false)}>
        <FlatList
          data={options}
          keyExtractor={(o) => o.value}
          renderItem={({ item }) => {
            const isSelected = item.value === value;
            const isDisabled = !!item.disabledReason;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected, disabled: isDisabled }}
                disabled={isDisabled}
                onPress={() => handlePick(item)}
                className="min-h-12 flex-row items-center justify-between px-4 active:bg-background"
              >
                <Text variant="body" className={cn(isDisabled && 'text-muted')}>
                  {item.label}
                </Text>
                {isDisabled ? <Text variant="caption">{item.disabledReason}</Text> : null}
                {isSelected ? <Ionicons name="checkmark" size={20} color={colors.primary} /> : null}
              </Pressable>
            );
          }}
        />
      </BottomSheet>
    </>
  );
}
