import { useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { CountryDetails } from '@/features/courses';

export default function CountryScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  return (
    <Screen edgeToEdge>
      <CountryDetails code={code} />
    </Screen>
  );
}
