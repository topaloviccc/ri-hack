import { router, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { UnlockCelebration } from '@/components/shared/UnlockCelebration';
import { CourseDetails } from '@/features/courses';

export default function CourseDetailsScreen() {
  // `celebrate` is set by the unlock sheet after a successful unlock.
  const { id, celebrate } = useLocalSearchParams<{ id: string; celebrate?: string }>();
  return (
    <Screen edgeToEdge>
      <CourseDetails id={id} />
      {celebrate ? (
        <UnlockCelebration
          label="Course unlocked!"
          onDone={() => router.setParams({ celebrate: undefined })}
        />
      ) : null}
    </Screen>
  );
}
