import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useThemeColors } from '@/lib/theme';

const HINTS = [
  { icon: 'arrow-down', label: 'Swipe down', action: 'Next course' },
  { icon: 'arrow-up', label: 'Swipe up', action: 'Previous course' },
  { icon: 'arrow-back', label: 'Swipe left', action: 'Show less like this' },
  { icon: 'arrow-forward', label: 'Swipe right', action: 'Open the details' },
] as const;

export type FeedGestureHintsProps = { onDismiss: () => void };

/** First-visit overlay explaining the feed's swipe gestures. */
export function FeedGestureHints({ onDismiss }: FeedGestureHintsProps) {
  const colors = useThemeColors();
  return (
    <View className="absolute inset-0 justify-center bg-overlay/60 p-6">
      <Card className="gap-4 p-5">
        <Text variant="heading" accessibilityRole="header">
          How the feed works
        </Text>
        {HINTS.map((hint) => (
          <View key={hint.icon} className="flex-row items-center gap-4">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-secondary/30">
              <Ionicons name={hint.icon} size={22} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text variant="label">{hint.label}</Text>
              <Text variant="caption">{hint.action}</Text>
            </View>
          </View>
        ))}
        <Button label="Got it" onPress={onDismiss} className="self-stretch" />
      </Card>
    </View>
  );
}
