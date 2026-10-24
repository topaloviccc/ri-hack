import { useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { EventDetails } from '@/features/events';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen edgeToEdge>
      <EventDetails id={id} />
    </Screen>
  );
}
