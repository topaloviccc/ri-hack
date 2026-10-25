import { NfcTagSheet } from '@/features/nfc/components/NfcTagSheet';
import { useNfcTagReader } from '@/features/nfc/hooks/useNfcTagReader';

/** Mount once near the root: pops up the contents of any NFC tag held to the phone. */
export function NfcTagListener() {
  const { tag, dismiss } = useNfcTagReader();
  return <NfcTagSheet tag={tag} onClose={dismiss} />;
}
