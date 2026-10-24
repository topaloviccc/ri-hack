import { MOCK_COURSES } from '@/features/courses/api/courses.mock';
import { walletApi } from '@/features/wallet/api/wallet.api';
import { isCourseUnlocked, mockUnlockCost, walletState } from '@/features/wallet/api/wallet.mock';

jest.mock('@/utils/mock-delay', () => ({ mockDelay: () => Promise.resolve() }));

const lockedCourses = MOCK_COURSES.filter((c) => !isCourseUnlocked(c.id));

describe('mockUnlockCost', () => {
  it('scales with length within 40..200', () => {
    expect(mockUnlockCost(15)).toBe(40);
    expect(mockUnlockCost(120)).toBe(100);
    expect(mockUnlockCost(1000)).toBe(200);
  });
});

describe('walletApi.unlockCourse', () => {
  it('charges once per idempotency key and unlocks the course', async () => {
    const course = lockedCourses[0];
    const cost = mockUnlockCost(course.estimatedMinutes);
    const before = walletState.balance;

    const first = await walletApi.unlockCourse({ courseId: course.id, idempotencyKey: 'k1' });
    const retry = await walletApi.unlockCourse({ courseId: course.id, idempotencyKey: 'k1' });

    expect(first.balance).toBe(before - cost);
    expect(retry.balance).toBe(first.balance);
    expect(isCourseUnlocked(course.id)).toBe(true);
  });

  it('refuses when the balance is too low', async () => {
    walletState.balance = 0;
    await expect(
      walletApi.unlockCourse({ courseId: lockedCourses[1].id, idempotencyKey: 'k2' }),
    ).rejects.toThrow('Not enough coins.');
    expect(isCourseUnlocked(lockedCourses[1].id)).toBe(false);
  });
});
