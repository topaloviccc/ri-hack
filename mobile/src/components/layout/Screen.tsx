import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/lib/cn';

export type ScreenProps = {
  children: ReactNode;
  /** Full-bleed screens (e.g. the reel feed) draw under the status bar. */
  edgeToEdge?: boolean;
  className?: string;
};

// The tab bar owns the bottom inset, so Screen only pads the top.
// TODO(hack): add KeyboardAvoidingView here when the first input screen lands. See BACKLOG.md.
export function Screen({ children, edgeToEdge = false, className }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className={cn('flex-1 bg-background', className)}
      style={{ paddingTop: edgeToEdge ? 0 : insets.top }}
    >
      {children}
    </View>
  );
}
