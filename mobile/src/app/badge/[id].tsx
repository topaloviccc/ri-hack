import { useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { BadgeDetails } from '@/features/badges';

export default function BadgeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen edgeToEdge>
      <BadgeDetails id={id} />
    </Screen>
  );
}
