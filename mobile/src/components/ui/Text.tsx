import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from '@/lib/cn';

const VARIANTS = {
  title: 'font-sans-bold text-3xl text-text',
  heading: 'font-sans-bold text-lg text-text',
  body: 'font-sans text-base text-text',
  label: 'font-sans-semibold text-sm text-text',
  caption: 'font-sans text-sm text-muted',
  quote: 'font-serif-italic text-3xl text-text',
  mono: 'font-mono text-sm text-muted',
} as const;

export type TextVariant = keyof typeof VARIANTS;

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  className?: string;
};

export function Text({ variant = 'body', className, ...props }: TextProps) {
  return <RNText className={cn(VARIANTS[variant], className)} {...props} />;
}
