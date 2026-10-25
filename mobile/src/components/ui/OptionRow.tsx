import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';

import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/theme';

export type OptionRowProps = {
  label: string;
  isSelected: boolean;
  /** Shown greyed out with this note (e.g. "Pending"); not selectable. */
  disabledReason?: string;
  onPress: () => void;
  className?: string;
};

/** One selectable line in a single-choice list, with a check on the chosen one. */
export function OptionRow({
  label,
  isSelected,
  disabledReason,
  onPress,
  className,
}: OptionRowProps) {
  const colors = useThemeColors();
  const isDisabled = !!disabledReason;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      className={cn(
        'min-h-12 flex-row items-center justify-between px-4 active:bg-background',
        className,
      )}
    >
      <Text variant="body" className={cn(isDisabled && 'text-muted')}>
        {label}
      </Text>
      {isDisabled ? <Text variant="caption">{disabledReason}</Text> : null}
      {isSelected ? <Ionicons name="checkmark" size={20} color={colors.primary} /> : null}
    </Pressable>
  );
}
