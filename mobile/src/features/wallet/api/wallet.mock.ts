import { MOCK_SECTION_IDS } from '@/features/courses/api/courses.mock';
import { ME_ID, MOCK_USERS } from '@/features/users/api/users.mock';

// TODO(hack): in-memory stand-in for the server-side wallet ledger; resets on restart. The courses
// mock reads `isCourseUnlocked` and `mockUnlockCost` from here so both features agree. Delete
// with the mocks. See BACKLOG.md.

const STARTING_BALANCE = 250;
const MIN_COST = 40;
const MAX_COST = 200;
const COINS_PER_MINUTE = 0.8;
const COST_STEP = 10;

/** Mock pricing by length: 15 min -> 40, 120 min -> 100, 240 min -> 190. */
export const mockUnlockCost = (estimatedMinutes: number) =>
  Math.min(
    MAX_COST,
    Math.max(MIN_COST, Math.round((estimatedMinutes * COINS_PER_MINUTE) / COST_STEP) * COST_STEP),
  );

const me = MOCK_USERS.find((u) => u.id === ME_ID);

export const walletState = {
  balance: STARTING_BALANCE,
  // Courses you have started or finished are already yours.
  unlockedCourseIds: new Set<string>([
    ...MOCK_SECTION_IDS.continue,
    ...(me?.completedCourseIds ?? []),
  ]),
  /** idempotency key -> balance after that unlock, so retries never charge twice */
  processedKeys: new Map<string, number>(),
};

export const isCourseUnlocked = (courseId: string) => walletState.unlockedCourseIds.has(courseId);
