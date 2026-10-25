import { countriesApi, coursesApi, locationsApi } from '@/features/courses/api/courses.api';
import { eventsApi } from '@/features/events/api/events.api';
import { networkApi } from '@/features/network/api/network.api';
import { usersApi } from '@/features/users/api/users.api';
import { walletApi } from '@/features/wallet/api/wallet.api';
import { authSession } from '@/lib/auth-session';

// Opt-in: uses only a disposable server loaded with backend's worldlearn-test-data.sql.
// LIVE_API_TOKEN is a JWT for that data's viewer (00000000-0000-0000-0000-000000000001),
// signed with the server's JWT_SECRET; seeded test users have no password to log in with.
const LIVE_VIEWER_ID = '00000000-0000-0000-0000-000000000001';
const live = process.env.RUN_LIVE_API_TESTS === '1' ? describe : describe.skip;

live('frontend adapters against Spring Boot and PostgreSQL', () => {
  // Expo's Jest preset replaces native fetch with stubbed native response classes.
  beforeAll(() => {
    globalThis.fetch = jest.requireActual('node-fetch');
  });
  beforeEach(() =>
    authSession.set({ token: process.env.LIVE_API_TOKEN ?? '', userId: LIVE_VIEWER_ID }),
  );

  it('reads actual DTOs and persists unlock, friend and dismissal mutations', async () => {
    const paid = '10000000-0000-0000-0000-000000000001';
    const started = '10000000-0000-0000-0000-000000000003';
    const me = await usersApi.me();
    expect(me.id).toBe(LIVE_VIEWER_ID);
    expect((await coursesApi.list({ collection: 'continue' }))[0]).toMatchObject({
      id: started,
      progress: 0.5,
    });
    expect(await countriesApi.getByCode('ME')).toMatchObject({
      courseCount: 3,
      locationCount: 1,
      blurb: 'Mountains meet the sea.',
    });
    expect((await locationsApi.list())[0]).toMatchObject({
      lat: 42.424662,
      kind: 'museum',
      city: 'Kotor',
    });
    expect((await eventsApi.list())[0]).toMatchObject({
      title: 'Museum lecture',
      category: 'lecture',
      city: 'Kotor',
      language: 'en',
      isFree: true,
      priceEur: null,
    });
    expect((await networkApi.listFeed())[0].userName).toBe('Alex Friend');
    expect((await networkApi.listLeaderboard())[0].completedThisWeek).toBe(1);
    expect(await walletApi.get()).toEqual({ balance: 100, heldBalance: 0, availableBalance: 100 });
    expect(await walletApi.unlockCourse({ courseId: paid, idempotencyKey: 'live-check' })).toEqual({
      balance: 60,
      heldBalance: 0,
      availableBalance: 60,
    });
    expect(await walletApi.unlockCourse({ courseId: paid, idempotencyKey: 'live-check' })).toEqual({
      balance: 60,
      heldBalance: 0,
      availableBalance: 60,
    });
    expect((await coursesApi.getById(paid)).isUnlocked).toBe(true);
    expect(
      (await usersApi.sendFriendRequest('00000000-0000-0000-0000-000000000003')).relation,
    ).toBe('requested');
    await coursesApi.dismiss(paid);
    expect(
      (await coursesApi.list({ collection: 'feed' })).some((course) => course.id === paid),
    ).toBe(false);
  });
});
