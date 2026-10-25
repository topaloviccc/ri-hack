import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';

export type FormFieldProps = {
  /** Visible label; omit when the input's placeholder already names it. */
  label?: string;
  error?: string;
  children: ReactNode;
};

/** An input with its optional label and inline validation message. */
export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <View className="gap-2">
      {label ? <Text variant="label">{label}</Text> : null}
      {children}
      {error ? (
        <Text variant="caption" className="text-primary" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
