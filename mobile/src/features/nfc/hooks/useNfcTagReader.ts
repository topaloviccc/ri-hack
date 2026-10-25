import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';

import { loadNfcModule, type NfcModule } from '@/features/nfc/nfc-module';
import { parseTag } from '@/features/nfc/parse-tag';
import type { NfcTag } from '@/features/nfc/types';

/** Listens for NFC tags while the app is in the foreground and hands each one to `onTag`. */
export function useNfcTagReader(onTag: (tag: NfcTag) => void) {
  // The native listener is registered once; it calls whatever handler the latest render passed.
  const onTagRef = useRef(onTag);
  useEffect(() => {
    onTagRef.current = onTag;
  }, [onTag]);

  useEffect(() => {
    let isActive = true;
    let nfc: NfcModule | null = null;

    const listen = async () => {
      const loaded = await loadNfcModule();
      if (!loaded || !isActive) return;
      const manager = loaded.default;
      if (!(await manager.isSupported())) return;
      await manager.start();
      if (!isActive) return;
      nfc = loaded;
      manager.setEventListener(loaded.NfcEvents.DiscoverTag, (event) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onTagRef.current(parseTag(event));
      });
      await manager.registerTagEvent();
    };
    // NFC is optional: devices without it (or with it switched off) just never see tags.
    listen().catch(() => {});

    return () => {
      isActive = false;
      if (!nfc) return;
      nfc.default.setEventListener(nfc.NfcEvents.DiscoverTag, null);
      nfc.default.unregisterTagEvent().catch(() => {});
    };
  }, []);
}
