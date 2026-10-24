import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

// Matches py-3 so the overlay header sits where a regular one would.
const OVERLAY_EXTRA_TOP = 12;

export type HeaderProps = {
  title?: string;
  right?: ReactNode;
  /** Floats over full-bleed content with no background. */
  overlay?: boolean;
};

export function Header({ title, right, overlay = false }: HeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className={cn(
        'flex-row items-center justify-between px-4 py-3',
        overlay && 'absolute left-0 right-0 top-0 z-10',
      )}
      // box-none: an overlay header must not swallow swipes on the content beneath it.
      pointerEvents={overlay ? 'box-none' : 'auto'}
      style={overlay ? { paddingTop: insets.top + OVERLAY_EXTRA_TOP } : undefined}
    >
      {title ? (
        <Text variant="title" accessibilityRole="header">
          {title}
        </Text>
      ) : (
        <View />
      )}
      {right ? <View className="flex-row items-center gap-2">{right}</View> : null}
    </View>
  );
}
