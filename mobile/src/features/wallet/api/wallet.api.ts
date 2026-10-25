import type { UnlockCourseInput, Wallet } from '@/features/wallet/types';
import { apiRequest } from '@/lib/api-client';

export const walletApi = {
  get: (): Promise<Wallet> => apiRequest('/wallet'),
  unlockCourse: ({ courseId, idempotencyKey }: UnlockCourseInput): Promise<Wallet> =>
    apiRequest(`/courses/${encodeURIComponent(courseId)}/unlock`, {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
    }),
};
