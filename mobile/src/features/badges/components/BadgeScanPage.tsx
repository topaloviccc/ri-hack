import { useEffect } from 'react';
import { ScrollView } from 'react-native';

import { BadgeScanResult } from '@/features/badges/components/BadgeScanResult';
import { useBadgeScan } from '@/features/badges/hooks/useBadgeScan';

export type BadgeScanPageProps = { code: string };

/** Where a tag lands when it opened the app (mobile://nfc/<code>): collects it straight away. */
export function BadgeScanPage({ code }: BadgeScanPageProps) {
  const { state, start } = useBadgeScan();

  // Arriving here is the scan itself, so collect once per code; repeats are harmless server-side.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => start(code), [code]);

  return (
    <ScrollView contentContainerClassName="p-4 pb-10">
      <BadgeScanResult state={state} />
    </ScrollView>
  );
}
