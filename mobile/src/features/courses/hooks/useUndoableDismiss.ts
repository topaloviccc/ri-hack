import { useEffect, useRef, useState } from 'react';

import { useDismissCourse } from '@/features/courses/api/courses.mutations';

// The backend has no "undo dismiss" endpoint, so the save waits until the undo window closes.
const UNDO_WINDOW_MS = 4000;

export type FeedToast = 'dismissed' | 'error';

/** "Less like this" with Undo: hides the reel at once and saves it when the toast closes. */
export function useUndoableDismiss() {
  const { mutate } = useDismissCourse();
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [toast, setToast] = useState<FeedToast>();
  const pendingId = useRef<string>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const unhide = (id: string) => setHiddenIds((ids) => ids.filter((hidden) => hidden !== id));

  function showToast(kind: FeedToast) {
    setToast(kind);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      save();
      setToast(undefined);
    }, UNDO_WINDOW_MS);
  }

  function save() {
    const id = pendingId.current;
    pendingId.current = undefined;
    if (!id) return;
    mutate(id, {
      onError: () => {
        unhide(id);
        showToast('error');
      },
    });
  }

  const dismiss = (id: string) => {
    save(); // A second swipe ends the previous undo window.
    pendingId.current = id;
    setHiddenIds((ids) => [...ids, id]);
    showToast('dismissed');
  };

  const undo = () => {
    const id = pendingId.current;
    pendingId.current = undefined;
    clearTimeout(timer.current);
    setToast(undefined);
    if (id) unhide(id);
  };

  // Leaving the feed closes the undo window, so the pending choice is still saved.
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      save();
    },
    // save reads only refs and the stable mutate; it must run once, on unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return { hiddenIds, toast, dismiss, undo };
}
