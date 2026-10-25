import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { useThemeColors } from '@/lib/theme';

type ActiveFilter = { key: string; label: string; onClear: () => void };

export type ActiveFilterChipsProps = { filters: ActiveFilter[] };

/** One removable chip per applied filter; nothing when no filter is set. */
export function ActiveFilterChips({ filters }: ActiveFilterChipsProps) {
  const colors = useThemeColors();
  if (filters.length === 0) return null;
  return (
    <View className="flex-row flex-wrap gap-2 px-4">
      {filters.map(({ key, label, onClear }) => (
        <Button
          key={key}
          label={label}
          variant="soft"
          accessibilityLabel={`Remove filter ${label}`}
          icon={<Ionicons name="close" size={16} color={colors.text} />}
          onPress={onClear}
        />
      ))}
    </View>
  );
}
