import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';

import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

const VARIANTS = {
  primary: { container: 'bg-primary px-5', label: 'text-on-primary' },
  soft: { container: 'bg-secondary/30 px-4', label: 'text-text' },
} as const;

export type ButtonProps = PressableProps & {
  label: string;
  variant?: keyof typeof VARIANTS;
  icon?: ReactNode;
  className?: string;
  labelClassName?: string;
};

export function Button({
  label,
  variant = 'primary',
  icon,
  className,
  labelClassName,
  ...props
}: ButtonProps) {
  const styles = VARIANTS[variant];
  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        'min-h-11 flex-row items-center justify-center gap-1.5 self-start rounded-full active:opacity-70',
        styles.container,
        className,
      )}
      {...props}
    >
      {icon}
      <Text variant="label" className={cn(styles.label, labelClassName)}>
        {label}
      </Text>
    </Pressable>
  );
}
