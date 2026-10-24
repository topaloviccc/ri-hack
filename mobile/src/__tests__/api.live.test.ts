import { countriesApi, coursesApi, locationsApi } from '@/features/courses/api/courses.api';
import { eventsApi } from '@/features/events/api/events.api';
import { networkApi } from '@/features/network/api/network.api';
import { usersApi } from '@/features/users/api/users.api';
import { walletApi } from '@/features/wallet/api/wallet.api';

// Opt-in: uses only a disposable server loaded with backend's worldlearn-test-data.sql.
const live = process.env.RUN_LIVE_API_TESTS === '1' ? describe : describe.skip;

live('frontend adapters against Spring Boot and PostgreSQL', () => {
  // Expo's Jest preset replaces native fetch with stubbed native response classes.
  beforeAll(() => {
    globalThis.fetch = jest.requireActual('node-fetch');
  });

  it('reads actual DTOs and persists unlock, friend and dismissal mutations', async () => {
    const paid = '10000000-0000-0000-0000-000000000001';
    const started = '10000000-0000-0000-0000-000000000003';
    const me = await usersApi.me();
    expect(me.id).toBe(process.env.EXPO_PUBLIC_USER_ID);
    expect((await coursesApi.list({ collection: 'continue' }))[0]).toMatchObject({
      id: started,
      progress: 0.5,
    });
    expect(await countriesApi.getByCode('ME')).toMatchObject({ courseCount: 3, locationCount: 1 });
    expect((await locationsApi.list())[0].lat).toBe(42.424662);
    expect((await eventsApi.list({}))[0].title).toBe('Museum lecture');
    expect((await networkApi.listFeed())[0].userName).toBe('Alex Friend');
    expect((await networkApi.listLeaderboard())[0].completedThisWeek).toBe(1);
    expect(await walletApi.get()).toEqual({ balance: 100 });
    expect(await walletApi.unlockCourse({ courseId: paid, idempotencyKey: 'live-check' })).toEqual({
      balance: 60,
    });
    expect(await walletApi.unlockCourse({ courseId: paid, idempotencyKey: 'live-check' })).toEqual({
      balance: 60,
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
