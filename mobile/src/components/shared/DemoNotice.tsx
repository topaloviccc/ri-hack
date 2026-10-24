import type { ReactNode } from 'react';
import { Text } from '@/components/ui/Text';

export function DemoNotice({ children }: { children: ReactNode }) {
  return <Text variant="caption">Demo: {children}</Text>;
}
