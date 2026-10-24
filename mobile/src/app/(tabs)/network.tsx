import { Header } from '@/components/layout/Header';
import { Screen } from '@/components/layout/Screen';
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
            <CoinBalance />
            <ProfileButton />
          </>
        }
      />
      <NetworkPanel />
    </Screen>
  );
}
