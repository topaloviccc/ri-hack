import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OptionRow } from '@/components/ui/OptionRow';
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
  const insets = useSafeAreaInsets();
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

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={() => setIsOpen(false)}
          className="flex-1 bg-overlay/40"
        />
        <View
          className="rounded-t-card bg-surface pt-4"
          style={{ paddingBottom: insets.bottom + 8 }}
        >
          <Text variant="heading" className="px-4 pb-2" accessibilityRole="header">
            {label}
          </Text>
          <FlatList
            data={options}
            keyExtractor={(o) => o.value}
            renderItem={({ item }) => (
              <OptionRow
                label={item.label}
                isSelected={item.value === value}
                disabledReason={item.disabledReason}
                onPress={() => handlePick(item)}
              />
            )}
          />
        </View>
      </Modal>
    </>
  );
}
