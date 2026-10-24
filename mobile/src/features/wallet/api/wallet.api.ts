import { MOCK_COURSES } from '@/features/courses/api/courses.mock';
import { mockUnlockCost, walletState } from '@/features/wallet/api/wallet.mock';
import type { UnlockCourseInput, Wallet } from '@/features/wallet/types';
import { ApiError } from '@/lib/api-client';
import { mockDelay } from '@/utils/mock-delay';

// TODO(hack): mock backend. The real wallet is a server-side append-only ledger; swap these
// bodies for api-client calls (sending the idempotency key as a header). See BACKLOG.md.
export const walletApi = {
  get: async (): Promise<Wallet> => {
    await mockDelay();
    return { balance: walletState.balance };
  },
  unlockCourse: async ({ courseId, idempotencyKey }: UnlockCourseInput): Promise<Wallet> => {
    await mockDelay();
    // A retry of an unlock that already went through returns the same result, no second charge.
    const previous = walletState.processedKeys.get(idempotencyKey);
    if (previous !== undefined) return { balance: previous };

    const course = MOCK_COURSES.find((c) => c.id === courseId);
    if (!course) throw new ApiError(404, 'Course not found');
    if (walletState.unlockedCourseIds.has(courseId)) {
      throw new ApiError(409, 'You already unlocked this course.');
    }
    const cost = mockUnlockCost(course.estimatedMinutes);
    if (walletState.balance < cost) throw new ApiError(402, 'Not enough coins.');

    walletState.balance -= cost;
    walletState.unlockedCourseIds.add(courseId);
    walletState.processedKeys.set(idempotencyKey, walletState.balance);
    return { balance: walletState.balance };
  },
};
