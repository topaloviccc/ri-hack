import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useThemeColors } from '@/lib/theme';

const ICON_SIZE = 20;

export type InfoRowProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  /** Makes the row a link (chevron + press feedback). */
  onPress?: () => void;
};

/** Icon + label/value line for detail pages. */
export function InfoRow({ icon, label, value, onPress }: InfoRowProps) {
  const colors = useThemeColors();
  const content = (
    <>
      <Ionicons name={icon} size={ICON_SIZE} color={colors.primary} />
      <View className="flex-1">
        <Text variant="caption">{label}</Text>
        <Text variant="label" className="text-base">
          {value}
        </Text>
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={ICON_SIZE} color={colors.muted} /> : null}
    </>
  );

  if (!onPress) {
    return <View className="min-h-11 flex-row items-center gap-3">{content}</View>;
  }
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${label}: ${value}`}
      onPress={onPress}
      className="min-h-11 flex-row items-center gap-3 active:opacity-70"
    >
      {content}
    </Pressable>
  );
}
