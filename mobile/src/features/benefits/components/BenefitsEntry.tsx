import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable } from 'react-native';

import { useThemeColors } from '@/lib/theme';

export function BenefitsEntry() {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open Benefits"
      onPress={() => router.push('/benefits')}
      className="h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-70"
    >
      <Ionicons name="gift" size={22} color={colors.primary} />
    </Pressable>
  );
}
