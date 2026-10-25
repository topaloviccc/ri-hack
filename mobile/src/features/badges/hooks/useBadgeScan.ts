import { useState } from 'react';

import { useScanBadge } from '@/features/badges/api/badges.mutations';
import type { BadgeScanState } from '@/features/badges/components/BadgeScanResult';
import { ApiError } from '@/lib/api-client';

const NOT_FOUND = 404;

/** Collects the badge behind a scanned code and describes how it went. */
export function useBadgeScan() {
  const scan = useScanBadge();
  // A tag that carries no code is known not to be a badge without asking the server.
  const [hasNoCode, setHasNoCode] = useState(false);

  /** `code` is null when the tag carries nothing badge-like. */
  const start = (code: string | null) => {
    scan.reset();
    setHasNoCode(code === null);
    if (code !== null) scan.mutate(code);
  };

  const describe = (): BadgeScanState => {
    if (hasNoCode) return { status: 'not-badge' };
    if (scan.isSuccess) return { status: 'done', result: scan.data };
    if (scan.isError) {
      if (scan.error instanceof ApiError && scan.error.status === NOT_FOUND)
        return { status: 'not-badge' };
      const code = scan.variables;
      return { status: 'error', onRetry: () => scan.mutate(code) };
    }
    return { status: 'scanning' };
  };

  return { state: describe(), start };
}
