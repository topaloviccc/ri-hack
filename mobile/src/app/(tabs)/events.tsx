import { Header } from '@/components/layout/Header';
import { Screen } from '@/components/layout/Screen';
import { BenefitsEntry } from '@/features/benefits';
import { EventsPanel } from '@/features/events';
import { ProfileButton } from '@/features/users';
import { CoinBalance } from '@/features/wallet';

export default function EventsScreen() {
  return (
    <Screen>
      <Header
        title="Events"
        right={
          <>
            <BenefitsEntry />
            <CoinBalance />
            <ProfileButton />
          </>
        }
      />
      <EventsPanel />
    </Screen>
  );
}
