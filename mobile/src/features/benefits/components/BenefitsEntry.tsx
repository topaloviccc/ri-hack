import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable } from 'react-native';

import { useThemeColors } from '@/lib/theme';

export function BenefitsEntry() {
  const colors = useThemeColors();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Open Benefits"
      onPress={() => router.push('/benefits')}
      className="min-h-11 min-w-11 items-center justify-center rounded-full border-2 border-secondary bg-secondary shadow-sm active:opacity-70">
      <Ionicons name="gift" size={24} color={colors.onSecondary} />
    </Pressable>
  );
}
