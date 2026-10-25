import { useEffect, useRef, useState } from 'react';

// The backend has no "undo dismiss" endpoint, so the save waits until the undo window closes.
const UNDO_WINDOW_MS = 4000;

export type FeedToast = 'dismissed' | 'error';

type Pending = { id: string; restore: () => void };

/**
 * "Less like this" with Undo. The caller hides the card at once; `save` runs when the toast
 * closes, on the next dismissal, or when the feed unmounts. `save` must be stable.
 */
export function useUndoableDismiss(save: (id: string) => Promise<void>) {
  const [toast, setToast] = useState<FeedToast>();
  const pending = useRef<Pending>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function showToast(kind: FeedToast) {
    setToast(kind);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      flush();
      setToast(undefined);
    }, UNDO_WINDOW_MS);
  }

  function flush() {
    const item = pending.current;
    pending.current = undefined;
    if (item) save(item.id).catch(() => showToast('error'));
  }

  const dismiss = (id: string, restore: () => void) => {
    flush(); // A second dismissal ends the previous undo window.
    pending.current = { id, restore };
    showToast('dismissed');
  };

  const undo = () => {
    const item = pending.current;
    pending.current = undefined;
    clearTimeout(timer.current);
    setToast(undefined);
    item?.restore();
  };

  // Leaving the feed closes the undo window, so the pending choice is still saved.
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      flush();
    },
    // flush reads only refs and the stable `save`; it must run once, on unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return { toast, dismiss, undo, showError: () => showToast('error') };
}
