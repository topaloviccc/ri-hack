import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable } from 'react-native';
import { Text } from '@/components/ui/Text';
import { useThemeColors } from '@/lib/theme';

export function LearningBackLink({ disabled = false }: { disabled?: boolean }) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Course outline"
      disabled={disabled}
      onPress={() => router.setParams({ lesson: undefined, quiz: undefined })}
      className="min-h-11 flex-row items-center gap-2 self-start active:opacity-70"
    >
      <Ionicons name="arrow-back" size={18} color={colors.text} />
      <Text variant="label">Course outline</Text>
    </Pressable>
  );
}
