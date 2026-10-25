import {
  MOCK_COUNTRIES,
  MOCK_COURSES,
  MOCK_FEED_IDS,
  MOCK_LOCATIONS,
  MOCK_SECTION_IDS,
} from '@/features/courses/api/courses.mock';
import type { CourseResponse } from '@/features/courses/api/courses.dto';
import { MOCK_EVENTS } from '@/features/events/api/events.mock';
import { MOCK_FEED, MOCK_WEEKLY_COMPLETIONS } from '@/features/network/api/network.mock';
import { ME_ID, MOCK_USERS } from '@/features/users/api/users.mock';
import { createBenefitsFixture } from '@/test-support/benefits-fixture';

const initialOwned = [
  ...MOCK_SECTION_IDS.continue,
  ...(MOCK_USERS.find((u) => u.id === ME_ID)?.completedCourseIds ?? []),
];
let owned = new Set(initialOwned);
export const isTestCourseUnlocked = (id: string) => owned.has(id);

export const httpResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  }) as Response;

/** Backend-shaped HTTP fixture: adapters and query/mutation hooks run unchanged. */
export function installApiFixture(options: { balance?: number; heldBalance?: number } = {}) {
  owned = new Set(initialOwned);
  let balance = options.balance ?? 250;
  const benefits = createBenefitsFixture({ getBalance: () => balance, spendCoins: (amount) => { balance -= amount; } });
  const wallet = () => {
    const heldBalance = options.heldBalance ?? 0;
    return { balance, heldBalance, availableBalance: balance - heldBalance };
  };
  const processed = new Set<string>();
  const dismissed = new Set<string>();
  const users = MOCK_USERS.map(({ bio: _bio, ...user }) => ({ ...user }));
  const countryName = (code: string) => MOCK_COUNTRIES.find((n) => n.code === code)?.name ?? code;
  const locations = MOCK_LOCATIONS.map(
    ({ kind: _kind, city: _city, imageUrl: _image, ...site }) => ({
      ...site,
      countryName: countryName(site.countryCode),
    }),
  );
  const course = (id: string): CourseResponse => {
    const row = MOCK_COURSES.find((c) => c.id === id);
    if (!row) throw new Error(`Unknown fixture course ${id}`);
    const { imageUrl: _image, locationIds, ...rest } = row;
    return {
      ...rest,
      countryName: countryName(row.countryCode),
      locations: locations.filter((l) => locationIds.includes(l.id)),
      progress: row.progress ?? null,
      unlockCost: 40,
      isUnlocked: owned.has(id),
    };
  };

  const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
  fetchMock.mockImplementation(async (input, init) => {
    const url = new URL(String(input));
    const path = url.pathname.replace(/^\/api/, '');
    const params = url.searchParams;
    const method = init?.method ?? 'GET';
    if (path.startsWith('/benefits/')) return benefits.handle(url, init, wallet());
    if (path === '/wallet') return httpResponse(wallet());
    if (/^\/courses\/[^/]+\/unlock$/.test(path) && method === 'POST') {
      const id = path.split('/')[2];
      const key = new Headers(init?.headers).get('Idempotency-Key') ?? '';
      if (!processed.has(key) && !owned.has(id)) {
        if (wallet().availableBalance < 40) return httpResponse({ detail: 'Not enough coins' }, 402);
        balance -= 40;
        owned.add(id);
        processed.add(key);
      }
      return httpResponse(wallet());
    }
    if (/^\/courses\/[^/]+\/dismiss$/.test(path) && method === 'POST') {
      dismissed.add(path.split('/')[2]);
      return httpResponse(undefined, 204);
    }
    if (path === '/courses') {
      const ids = params.get('ids');
      const collection = params.get('collection');
      let rows = MOCK_COURSES.map((c) => course(c.id));
      if (ids !== null) rows = ids ? ids.split(',').map(course) : [];
      if (params.has('countryCode'))
        rows = rows.filter((c) => c.countryCode === params.get('countryCode'));
      if (params.has('locationId'))
        rows = rows.filter((c) => c.locations.some((l) => l.id === params.get('locationId')));
      if (collection === 'continue')
        rows = rows.filter((c) => MOCK_SECTION_IDS.continue.includes(c.id));
      if (collection === 'popular')
        rows = rows.sort((a, b) => b.learnerCount - a.learnerCount).slice(0, 5);
      if (collection === 'feed')
        rows = MOCK_FEED_IDS.filter((id) => !dismissed.has(id)).map(course);
      return httpResponse(rows);
    }
    if (path.startsWith('/courses/')) return httpResponse(course(path.split('/')[2]));
    const countries = MOCK_COUNTRIES.map(({ blurb: _blurb, ...country }) => ({
      ...country,
      flagUrl: `https://flagcdn.com/w160/${country.code.toLowerCase()}.png`,
      courseCount: MOCK_COURSES.filter((c) => c.countryCode === country.code).length,
      locationCount: locations.filter((l) => l.countryCode === country.code).length,
    })).sort((a, b) => a.name.localeCompare(b.name));
    if (path === '/countries') return httpResponse(countries);
    if (path.startsWith('/countries/'))
      return httpResponse(countries.find((c) => c.code === path.split('/')[2]));
    if (path === '/locations')
      return httpResponse(
        locations.filter(
          (l) => !params.has('countryCode') || l.countryCode === params.get('countryCode'),
        ),
      );
    if (path.startsWith('/locations/'))
      return httpResponse(locations.find((l) => l.id === path.split('/')[2]));
    if (path === '/users') {
      let rows = users.filter((u) => u.id !== ME_ID);
      if (params.has('relation')) rows = rows.filter((u) => u.relation === params.get('relation'));
      if (params.get('suggested') === 'true')
        rows = rows.filter((u) => u.relation === 'none' || u.relation === 'requested');
      return httpResponse(rows);
    }
    if (path.endsWith('/friend-requests') && method === 'POST') {
      const user = users.find((u) => u.id === path.split('/')[2]);
      if (!user) return httpResponse({ detail: 'User not found' }, 404);
      user.relation = 'requested';
      return httpResponse(user);
    }
    if (path.startsWith('/users/'))
      return httpResponse(
        users.find((u) => u.id === (path === '/users/me' ? ME_ID : path.split('/')[2])),
      );
    if (path === '/network/feed')
      return httpResponse(
        MOCK_FEED.slice(0, 5).map((f) => ({
          id: f.id,
          userId: f.userId,
          userName: users.find((u) => u.id === f.userId)?.name ?? '',
          userAvatarUrl: null,
          courseId: f.courseId,
          courseTitle: course(f.courseId).title,
          completedAt: new Date().toISOString(),
        })),
      );
    if (path === '/network/leaderboard')
      return httpResponse(
        Object.entries(MOCK_WEEKLY_COMPLETIONS)
          .sort((a, b) => b[1] - a[1])
          .map(([id, count], index) => ({
            rank: index + 1,
            userId: id,
            userName: users.find((u) => u.id === id)?.name ?? '',
            userAvatarUrl: null,
            completedThisWeek: count,
            isMe: id === ME_ID,
          })),
      );
    const events = MOCK_EVENTS.map((e) => {
      const starts = new Date();
      starts.setDate(starts.getDate() + e.dayOffset);
      starts.setHours(...(e.time.split(':').map(Number) as [number, number]), 0, 0);
      return {
        id: e.id,
        title: e.title,
        startsAt: starts.toISOString(),
        venue: e.venue,
        lat: e.lat,
        lng: e.lng,
        description: e.description,
        organizer: e.organizer,
        isFree: e.priceEur === null,
        registrationUrl: e.registrationUrl,
      };
    });
    if (path === '/events') return httpResponse(events);
    if (path.startsWith('/events/'))
      return httpResponse(events.find((e) => e.id === path.split('/')[2]));
    throw new Error(`Unhandled fixture request: ${method} ${path}`);
  });
  globalThis.fetch = fetchMock;
  return fetchMock;
}
