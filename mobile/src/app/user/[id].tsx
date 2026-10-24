import { useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { ProfileView } from '@/features/users';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen edgeToEdge>
      <ProfileView userId={id} />
    </Screen>
  );
}
