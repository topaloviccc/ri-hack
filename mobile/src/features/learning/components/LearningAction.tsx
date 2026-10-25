import { Button, type ButtonProps } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export function LearningAction({ className, ...props }: ButtonProps) {
  return <Button {...props} className={cn('min-h-12 self-stretch', className)} />;
}
