import { router } from 'expo-router';

import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/cn';

export type BenefitsEntryProps = {
  /** Drop shadow for use over photos. */
  elevated?: boolean;
};

/** Header button into Benefits; shown in every tab header. */
export function BenefitsEntry({ elevated = false }: BenefitsEntryProps) {
  return (
    <IconButton
      icon="gift"
      accessibilityLabel="Open Benefits"
      onPress={() => router.push('/benefits')}
      className={cn(elevated && 'shadow-lg shadow-overlay')}
    />
  );
}
