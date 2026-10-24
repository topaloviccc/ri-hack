import { useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { UnlockSheet } from '@/features/wallet';

export default function UnlockCourseSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen edgeToEdge>
      <UnlockSheet courseId={id} />
    </Screen>
  );
}
