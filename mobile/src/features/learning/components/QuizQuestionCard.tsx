import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/theme';
import type { QuizResponse } from '../api/learning.dto';

export type QuizQuestionCardProps = {
  question: QuizResponse['questions'][number];
  index: number;
  total: number;
  selected: string[];
  disabled: boolean;
  onChoose: (option: string) => void;
};
export function QuizQuestionCard({
  question,
  index,
  total,
  selected,
  disabled,
  onChoose,
}: QuizQuestionCardProps) {
  const colors = useThemeColors();
  const multiple = question.type === 'MULTIPLE_CHOICE';
  return (
    <View className="gap-4 rounded-card border border-border bg-surface p-4">
      <View className="gap-2">
        <Text variant="mono" className="text-xs text-text/80">
          QUESTION {index + 1} OF {total}
        </Text>
        <Text variant="heading" className="leading-7">
          {question.prompt}
        </Text>
        <Text variant="caption" className="text-text/80">
          {multiple ? 'Select all that apply' : 'Choose one answer'}
        </Text>
      </View>
      <View className="gap-2">
        {question.options.map((option) => {
          const checked = selected.includes(option.id);
          const icon = multiple
            ? checked
              ? 'checkbox'
              : 'square-outline'
            : checked
              ? 'radio-button-on'
              : 'radio-button-off';
          return (
            <Pressable
              key={option.id}
              accessibilityRole={multiple ? 'checkbox' : 'radio'}
              accessibilityState={{ checked, disabled }}
              accessibilityLabel={option.text}
              disabled={disabled}
              onPress={() => onChoose(option.id)}
              className={cn(
                'min-h-12 flex-row items-center gap-3 rounded-xl border p-3.5 active:opacity-80',
                checked ? 'border-primary bg-primary/15' : 'border-border bg-background/40',
              )}
            >
              <Ionicons name={icon} size={22} color={colors.text} />
              <Text variant="body" className="flex-1 leading-6">
                {option.text}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
