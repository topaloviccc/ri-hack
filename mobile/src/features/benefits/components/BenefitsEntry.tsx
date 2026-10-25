import { router } from 'expo-router';

import { IconButton } from '@/components/ui/IconButton';

export function BenefitsEntry() {
  return (
    <IconButton
      icon="gift"
      accessibilityLabel="Open Benefits"
      onPress={() => router.push('/benefits')}
    />
  );
}
