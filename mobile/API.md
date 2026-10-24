# Connected frontend

Schema-backed features use the Spring Boot REST API through `src/lib/api-client.ts`.
See [backend/API.md](../backend/API.md) for endpoints and DTOs, and
[backend/SCOPE.md](../backend/SCOPE.md) for features outside the shared scope.

## Configure and run

1. Start PostgreSQL and the backend using [backend/DATABASE.md](../backend/DATABASE.md).
2. Provision application data, including an `app_user` row and its `wallet` row.
   There is no default user or production mock catalogue.
   For the optional local demo learner and wallet, use the manual setup script
   documented in [backend/DATABASE.md](../backend/DATABASE.md).
   The full optional demo dataset and test scenarios are in
   [backend/dev/README.md](../backend/dev/README.md).
3. Copy `.env.example` to `.env.local` in `mobile` and set both values:

   ```dotenv
   EXPO_PUBLIC_API_URL=http://192.168.1.20:8080/api
   EXPO_PUBLIC_USER_ID=<existing app_user UUID>
   ```

4. Run `npm ci`, then `npm start`. Reload after changing environment values.

Use the computer's LAN address for a phone, `http://10.0.2.2:8080/api` for an Android
emulator, or `http://localhost:8080/api` for a simulator/web on that computer.
The URL includes `/api`. See [Expo environment variables](https://docs.expo.dev/guides/environment-variables/).
`EXPO_PUBLIC_USER_ID` supplies `X-User-Id`, with no authentication. Missing config
produces an error instead of silently choosing a mock user.
Development builds also display a setup notice when either setting is missing;
those failures occur before `fetch` and therefore produce no network traffic.

Web CORS defaults allow `http://localhost:8081` and `http://127.0.0.1:8081`.
Set backend `CORS_ALLOWED_ORIGINS` to a comma-separated list for other web origins.

## Live and demo data

| Data | Source |
| --- | --- |
| Courses, subjects, prices, learner counts, country/place identity and coordinates, progress and ownership | Backend |
| Wallet/unlocks, profiles/statistics, friendships, completion feed and leaderboard | Backend |
| Event identity, start time, venue/coordinates, organizer, description, free/paid status and registration link | Backend |
| Course/place/event images, location kinds/cities, country introductions and profile bios | Stable demo supplements, labelled in the UI |
| Event city/category/language and numeric paid-price examples | Stable demo supplements, labelled in list and details |
| Expert applications/statuses/certificates and weekly challenge | Explicitly labelled demos; expert changes are in memory only |
| Theme preference | Device storage |

Demo supplements use a stable ID hash, or country code for introductions. They never
replace backend records, coordinates, unlock prices, balances, ownership, learning
history or social state. Errors never fall back to mock records. Original mock
modules supply demo-only fields/test fixtures; the mock wallet/pricing implementation
has been removed.

The calendar defaults to all events. Selecting a city filters **demo city labels**
locally, not real geographic coverage. "My location" only selects that demo filter.
Registration always uses the server URL and is hidden if absent. Map pins/actions
use actual coordinates and are omitted when absent. Null durations display
"Not specified"; null progress hides the progress bar. Database subject labels
define Fields sections dynamically instead of the demo expert form's fixed list.

## Requests and caching

The client supplies headers, query encoding (including `ids=`), 204 handling,
a 15-second timeout, and normalized `ApiError` responses. Existing query retry rules
avoid retrying 4xx responses. No authentication/upload flows were added.

Unlock retries reuse the sheet's `Idempotency-Key`. Success updates the cached wallet
and invalidates course queries. Friend requests update profile state and user lists.
Dismissals persist and refresh course queries; failures show an error and keep the
reel available. The viewer comes from `/users/me`, never the old mock `u0` ID.

## Verification

Run `npm run typecheck`, `npm run lint`, and `npm test -- --runInBand`.
Screen tests mock backend-shaped HTTP responses while running actual adapters and
query/mutation hooks. Client tests cover headers, errors, empty filters and timeouts.

An opt-in live test requires a **disposable** backend/database loaded with
`backend/src/test/resources/db/worldlearn-test-data.sql`. This fixture truncates data;
never load it into a working database. With that isolated server on port 18080:

```powershell
$env:RUN_LIVE_API_TESTS='1'
$env:EXPO_PUBLIC_API_URL='http://localhost:18080/api'
$env:EXPO_PUBLIC_USER_ID='00000000-0000-0000-0000-000000000001'
npm test -- --runInBand --runTestsByPath src/__tests__/api.live.test.ts
```

It verifies reads plus persisted unlock, friend-request and dismissal writes.
Reload the disposable fixture before repeating this stateful test.
