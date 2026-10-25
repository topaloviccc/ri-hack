import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '@/components/layout/Screen';

export function BenefitsFrame({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Screen edgeToEdge>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ paddingBottom: insets.bottom }}>
        {children}
      </KeyboardAvoidingView>
    </Screen>
  );
}
