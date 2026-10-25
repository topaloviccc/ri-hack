import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { FeedToast as FeedToastKind } from '@/features/courses/hooks/useUndoableDismiss';
import { cn } from '@/lib/cn';

export type FeedToastProps = { kind: FeedToastKind; onUndo: () => void };

/** Bottom pill for the Scroll feed: "less like this" with Undo, or a save error. */
export function FeedToast({ kind, onUndo }: FeedToastProps) {
  const isDismissed = kind === 'dismissed';
  return (
    <View
      accessibilityLiveRegion="polite"
      className={cn(
        'absolute bottom-6 min-h-11 flex-row items-center gap-2 self-center rounded-full bg-text pl-4',
        isDismissed ? 'pr-1' : 'pr-4',
      )}
    >
      <Text variant="label" className="text-background">
        {isDismissed ? 'We’ll show less like this' : 'Couldn’t update your feed'}
      </Text>
      {isDismissed ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Undo, keep showing this course"
          onPress={onUndo}
          className="min-h-11 justify-center px-3 active:opacity-70"
        >
          <Text variant="label" className="text-primary">
            Undo
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
