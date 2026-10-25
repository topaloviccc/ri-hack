import { useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { BadgeScanPage } from '@/features/badges';

/** Opened by Android when a mobile://nfc/<code> tag is tapped while the app isn't in front. */
export default function NfcTagScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  return (
    <Screen edgeToEdge>
      <BadgeScanPage code={code} />
    </Screen>
  );
}
