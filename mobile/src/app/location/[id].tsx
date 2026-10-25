import { useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { LocationDetails } from '@/features/courses';

export default function LocationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen edgeToEdge>
      <LocationDetails id={id} />
    </Screen>
  );
}
