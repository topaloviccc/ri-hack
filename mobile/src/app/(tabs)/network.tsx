import { Header } from '@/components/layout/Header';
import { Screen } from '@/components/layout/Screen';
import { BenefitsEntry } from '@/features/benefits';
import { NetworkPanel } from '@/features/network';
import { ProfileButton } from '@/features/users';
import { CoinBalance } from '@/features/wallet';

export default function NetworkScreen() {
  return (
    <Screen>
      <Header
        title="Network"
        right={
          <>
            <BenefitsEntry />
            <CoinBalance />
            <ProfileButton />
          </>
        }
      />
      <NetworkPanel />
    </Screen>
  );
}
