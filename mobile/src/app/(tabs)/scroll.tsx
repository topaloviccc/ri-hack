import { Header } from '@/components/layout/Header';
import { Screen } from '@/components/layout/Screen';
import { BenefitsEntry } from '@/features/benefits';
import { CourseFeed } from '@/features/courses';
import { ProfileButton } from '@/features/users';
import { CoinBalance } from '@/features/wallet';

export default function ScrollScreen() {
  return (
    <Screen edgeToEdge>
      <CourseFeed />
      <Header
        overlay
        right={
          <>
            <BenefitsEntry elevated />
            <CoinBalance elevated />
            <ProfileButton elevated />
          </>
        }
      />
    </Screen>
  );
}
