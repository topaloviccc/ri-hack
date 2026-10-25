import { useState } from 'react';

import { useAuth } from '@/features/auth';
import { BadgeScanSheet, useBadgeScan } from '@/features/badges';
import { useNfcTagReader } from '@/features/nfc/hooks/useNfcTagReader';
import { tagCode } from '@/features/nfc/tag-code';

/** Mount once near the root: a tag held to the phone collects its badge and shows it. */
export function NfcTagListener() {
  const auth = useAuth();
  const scan = useBadgeScan();
  const [isOpen, setIsOpen] = useState(false);

  useNfcTagReader((tag) => {
    // Badges belong to an account; signed out, tags are ignored.
    if (auth.status !== 'signedIn') return;
    setIsOpen(true);
    scan.start(tagCode(tag));
  });

  return <BadgeScanSheet visible={isOpen} state={scan.state} onClose={() => setIsOpen(false)} />;
}
