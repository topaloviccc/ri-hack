import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { STORAGE_KEYS, storage } from '@/lib/storage';

const feedHintsKeys = { seen: ['courses', 'feedHintsSeen'] as const };

/** The Scroll tab's gesture instructions: shown until dismissed once on this device. */
export function useFeedHints() {
  const queryClient = useQueryClient();
  const { data: hasSeen } = useQuery({
    queryKey: feedHintsKeys.seen,
    queryFn: async () => (await storage.get(STORAGE_KEYS.feedHintsSeen)) === 'true',
    // Local storage never changes behind our back.
    staleTime: Infinity,
  });
  const markSeen = useMutation({
    mutationFn: () => storage.set(STORAGE_KEYS.feedHintsSeen, 'true'),
    // Hide immediately; a failed write only means the hints show again next launch.
    onMutate: () => queryClient.setQueryData(feedHintsKeys.seen, true),
  });
  return { isVisible: hasSeen === false, dismiss: () => markSeen.mutate() };
}
