import { Button, type ButtonProps } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export function LearningAction({
  className,
  disabled,
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <Button
      {...props}
      variant={variant}
      disabled={disabled}
      className={cn('min-h-12 self-stretch', disabled && 'opacity-60', className)}
      labelClassName={variant === 'primary' ? 'text-on-secondary' : undefined}
    />
  );
}
