import { Header } from '@/components/layout/Header';
import { Screen } from '@/components/layout/Screen';
import { CoursesPanel } from '@/features/courses';
import { ProfileButton } from '@/features/users';
import { CoinBalance } from '@/features/wallet';

export default function CoursesScreen() {
  return (
    <Screen>
      <Header
        title="Courses"
        right={
          <>
            <CoinBalance />
            <ProfileButton />
          </>
        }
      />
      <CoursesPanel />
    </Screen>
  );
}
