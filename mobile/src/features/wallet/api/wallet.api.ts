import type { UnlockCourseInput, Wallet } from '@/features/wallet/types';
import { apiRequest } from '@/lib/api-client';

export const walletApi = {
  get: (): Promise<Wallet> => apiRequest('/wallet', { viewer: true }),
  unlockCourse: ({ courseId, idempotencyKey }: UnlockCourseInput): Promise<Wallet> =>
    apiRequest(`/courses/${encodeURIComponent(courseId)}/unlock`, {
      method: 'POST',
      viewer: true,
      headers: { 'Idempotency-Key': idempotencyKey },
    }),
};
