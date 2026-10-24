import { Screen } from '@/components/layout/Screen';
import { CoinsInfo } from '@/features/wallet';

export default function CoinsSheet() {
  return (
    <Screen edgeToEdge>
      <CoinsInfo />
    </Screen>
  );
}
