import type { ComponentRef, Ref } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/theme';

export type TextFieldProps = TextInputProps & {
  ref?: Ref<ComponentRef<typeof TextInput>>;
  className?: string;
};

export function TextField({ ref, className, ...props }: TextFieldProps) {
  const colors = useThemeColors();
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={colors.muted}
      className={cn(
        'min-h-11 rounded-full border border-border bg-surface px-4 font-sans text-base text-text',
        className,
      )}
      {...props}
    />
  );
}
