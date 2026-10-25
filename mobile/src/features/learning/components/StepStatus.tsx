import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { useThemeColors } from '@/lib/theme';
import type { LearningStepState } from '../progress';

export type StepStatusProps = { state: LearningStepState; label?: string };
export function StepStatus({ state, label }: StepStatusProps) {
  const colors = useThemeColors();
  const icon =
    state === 'completed' ? 'checkmark-circle' : state === 'locked' ? 'lock-closed' : 'play-circle';
  const text =
    label ?? (state === 'completed' ? 'Completed' : state === 'locked' ? 'Locked' : 'Ready');
  return (
    <View className="flex-row items-center gap-1.5">
      <Ionicons name={icon} size={16} color={colors.text} />
      <Text variant="label" className="text-xs">
        {text}
      </Text>
    </View>
  );
}
