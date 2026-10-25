# Connected frontend

Schema-backed features use the Spring Boot REST API through `src/lib/api-client.ts`.
See [backend/API.md](../backend/API.md) for endpoints and DTOs, and
[backend/SCOPE.md](../backend/SCOPE.md) for features outside the shared scope.

## Configure and run

1. Start PostgreSQL and the backend using [backend/DATABASE.md](../backend/DATABASE.md).
2. Provision application data. Users create accounts from the app's sign-up form.
   There is no production mock catalogue.
   For the optional local demo learner and wallet, use the manual setup script
   documented in [backend/DATABASE.md](../backend/DATABASE.md).
   The full optional demo dataset and test scenarios are in
   [backend/dev/README.md](../backend/dev/README.md).
3. Copy `.env.example` to `.env.local` in `mobile` and set the API URL:

   ```dotenv
   EXPO_PUBLIC_API_URL=http://192.168.1.20:8080/api
   ```

4. Run `npm ci`, then `npm start`. Reload after changing environment values.

Expo does not load `.env.example`; the values must be in `.env.local` (or another
supported `.env` file). Use the current Wi-Fi IPv4 address shown by `ipconfig`
on Windows, and update it if the computer changes networks.

Use the computer's LAN address for a phone, `http://10.0.2.2:8080/api` for an Android
emulator, or `http://localhost:8080/api` for a simulator/web on that computer.
The URL includes `/api`. See [Expo environment variables](https://docs.expo.dev/guides/environment-variables/).
After the welcome screen, signed-out users see the sign-in screen (log in or sign up).
The bearer token is kept in `expo-secure-store` (in memory only on web) and sent on
every request; a 401 discards it and returns to sign-in. Settings › Log out does the same.
Development builds display a setup notice when the API URL is missing;
those failures occur before `fetch` and therefore produce no network traffic.

Web CORS defaults allow `http://localhost:8081` and `http://127.0.0.1:8081`.
Set backend `CORS_ALLOWED_ORIGINS` to a comma-separated list for other web origins.
Expo Go's native requests are not subject to browser CORS. For a phone connection
failure, open `http://<computer-LAN-IP>:8080/api/countries` in the phone's browser
to check reachability. Keep both devices on the same network and allow the backend
through the computer's firewall if that URL cannot be reached.

## Live and demo data

| Data | Source |
| --- | --- |
| Courses, subjects, prices, learner counts, country/place identity and coordinates, progress and ownership | Backend |
| All 249 ISO alpha-2 countries/territories, English display names and image flag URLs | Production Liquibase reference data; images load directly from FlagCDN; no demo seed required |
| Wallet/unlocks, profiles/statistics, friendships, completion feed and leaderboard | Backend |
| Lessons/quizzes, submitted answers, best scores, reading progress, completion and coin rewards | Backend; optional sample lesson/quiz content is stored in PostgreSQL and labelled Demo |
| Benefits partners/countries/offers, coupon activation and history | Backend; demo partners are explicitly labelled |
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

Country responses include `flagUrl`, an absolute HTTPS URL such as
`https://flagcdn.com/w160/hr.png`. The adapter preserves the URL and the shared
`CountryFlag` component loads the image directly from FlagCDN. Code-only
profile/course records use the same hosted URL convention. No image files are
bundled and no backend image proxy is used. The phone needs internet access to
the CDN. Emoji flags are no longer used. Country lists include
zero-content countries with real zero counts. English names and ISO identifiers
are backend-owned; introductions remain explicitly labelled demo content.

The calendar defaults to all events. Selecting a city filters **demo city labels**
locally, not real geographic coverage. "My location" only selects that demo filter.
Registration always uses the server URL and is hidden if absent. Map pins/actions
use actual coordinates and are omitted when absent. Null durations display
"Not specified"; null progress hides the progress bar. Database subject labels
define Fields sections dynamically instead of the demo expert form's fixed list.

## Benefits and shared wallet

Open the gift button in the Home header. The original five tabs are preserved.
Routes are `/benefits`, `/benefits/offer/{id}`, `/benefits/offer/{id}/confirm`,
`/benefits/coupons`, and `/benefits/coupons/{id}`. Configure the same API URL and
viewer as the other connected screens; there are no runtime fallback offers.

Coupon cards open a simple confirmation: choose `Activate`, the server deducts
the offer's coin cost immediately and returns the coupon with a random code to
show at the counter. There are no quote, reservation, PIN/QR, or activation
recovery steps. Failed requests do not automatically retry; check My Coupons to
see whether an activation completed before leaving the screen.

The backend offer records provide public Unsplash image URLs for the six seeded
demo offers. The frontend loads those URLs directly; it has no bundled benefit
artwork fallback.

`GET /wallet` and course-unlock responses return
`{ balance, heldBalance, availableBalance }`. Benefit activations debit the
wallet immediately, so `heldBalance` remains zero and `availableBalance` equals
`balance` for this flow.

Benefits requests use `/benefits/partners?countryCode`,
`/benefits/countries?partnerId`, and `/benefits/offers` with AND-combined `q`,
`partnerId`, `countryCode`, `sort`, `page` and `size`. Sort values are `POPULAR`,
`PRICE_ASC`, `PRICE_DESC`, `NEWEST`. Lists consume `{ items, page, size, total }`.
Offer detail is `/benefits/offers/{id}`. Activation is an empty-body POST to
`/benefits/offers/{id}/activate`; the server validates the current offer and
balance and creates the coupon in one transaction. No activation request key
or local retry state is stored.

History is `/benefits/coupons?status=...&page=...&size=...` with `ACTIVE`,
`REDEEMED` legacy history, and `EXPIRED` entries. Details are
`/benefits/coupons/{id}`. Activation returns `{ coupon, wallet, serverNow }` and
refreshes the shared wallet and benefit caches. The app displays the random code
while the coupon is active; coupons expire after 15 minutes and their activation
cost is not refunded. Marking an active coupon as used moves it into the Used
history without another debit. “See all” opens the complete active partner list;
choosing a partner filters the benefits list. Commercial partner onboarding remains
a prerequisite outside this UI.

## Requests and caching

The client supplies headers, query encoding (including `ids=`), 204 handling,
a 15-second timeout, and normalized `ApiError` responses. Existing query retry rules
avoid retrying 4xx responses. Every session change (login, logout, 401) removes cached
server data, keeping only device-local settings. No upload flows were added.

Unlock retries reuse the sheet's `Idempotency-Key`. Success updates the cached wallet
and invalidates course queries. Friend requests update profile state and user lists.
Dismissals persist and refresh course queries; failures show an error and keep the
reel available. The viewer comes from `/users/me`, never the old mock `u0` ID.

## Verification

Lesson response `text` is Markdown source. The backend prefers
`lesson.content_json.markdown` and falls back to legacy JSON `text`. Native
rendering and local checklist/reveal interactions do not submit quiz answers or
change completion. Source files and supported extensions are documented in
[the Markdown contract](../backend/dev/content/MARKDOWN.md).

The player lives at `/course/[id]/learn`. Its adapters call
`/courses/{id}/learning` for outline/start, lesson completion, quiz reads and
answer submissions. JSON bodies go through the shared HTTP client. Answer keys
are returned only as feedback after submission. See
[backend/LEARNING.md](../backend/LEARNING.md) for the complete contract.
Mutation responses update the learning cache and invalidate course, user, wallet
and network queries. The UI uses the server's course completion and reward
result, including when an individual quiz scores 100% but the course still fails.
Unsubmitted answer selections are local form state; completed steps and attempts
survive leaving/reloading. No LLM calls or frontend grading mocks are involved.

Run `npm run typecheck`, `npm run lint`, and `npm test -- --runInBand`.
Screen tests mock backend-shaped HTTP responses while running actual adapters and
query/mutation hooks. Client tests cover headers, errors, empty filters and timeouts.

An opt-in live test requires a **disposable** backend/database loaded with
`backend/src/test/resources/db/worldlearn-test-data.sql`. This fixture truncates data;
never load it into a working database. With that isolated server on port 18080:

```powershell
$env:RUN_LIVE_API_TESTS='1'
$env:EXPO_PUBLIC_API_URL='http://localhost:18080/api'
$env:LIVE_API_TOKEN='<JWT for 00000000-0000-0000-0000-000000000001, signed with the server JWT_SECRET>'
npm test -- --runInBand --runTestsByPath src/__tests__/api.live.test.ts
```

It verifies reads plus persisted unlock, friend-request and dismissal writes.
Reload the disposable fixture before repeating this stateful test.
