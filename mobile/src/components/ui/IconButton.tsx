import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/theme';

const ICON_SIZE = 22;

export type IconButtonProps = PressableProps & {
  icon: ComponentProps<typeof Ionicons>['name'];
  /** Required: icon-only buttons have no visible text. */
  accessibilityLabel: string;
  className?: string;
};

/** 44px round icon button (headers, toolbars). Primary icon on surface by default. */
export function IconButton({ icon, className, ...props }: IconButtonProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        'h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-70',
        className,
      )}
      {...props}
    >
      <Ionicons name={icon} size={ICON_SIZE} color={colors.primary} />
    </Pressable>
  );
}
