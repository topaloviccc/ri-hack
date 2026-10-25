# Backend API

Base path: `/api`; default local URL: `http://localhost:8080`.
IDs are UUID strings, not the frontend's mock IDs (`u0`, `c1`, etc.).
Requests and responses use JSON. Times use ISO 8601 UTC. Nullable source columns
remain nullable; unsupported frontend fields are omitted, as listed in [SCOPE.md](SCOPE.md).

Every endpoint except `POST /auth/signup` and `POST /auth/login` requires
`Authorization: Bearer <token>`. Tokens are HS256 JWTs whose subject is the
`app_user` id, valid for 30 days and signed with `JWT_SECRET` (a local-only default
is built in; every shared deployment must set it). The viewer is always the token's
user; there is no default "me" user. A missing, expired or invalid token returns 401.
Logout is client-side: the app discards its token. The mobile frontend uses these
endpoints and reads `EXPO_PUBLIC_API_URL` (including `/api`).
Display details (images, introductions, bios, place kinds/cities, event categories,
languages and prices) are stored columns; see [mobile/API.md](../mobile/API.md) for
configuration and the remaining frontend demo (expert applications).
Browser CORS allows localhost/127.0.0.1 on port 8081 by default; configure additional
origins with the backend `CORS_ALLOWED_ORIGINS` environment variable.

| Method | Path | Parameters / result |
| --- | --- | --- |
| POST | `/auth/signup` | `{firstName,lastName,username,email,password,timezone}`; 201 `{token,user: User}`. New users have role `USER` and a wallet holding the 500-coin signup bonus (`app.auth.signup-bonus-coins`) |
| POST | `/auth/login` | `{email,password}`; `{token,user: User}`. Wrong email or password: 401 `Invalid email or password` |
| GET | `/courses` | `collection=continue\|popular\|recommended\|feed`, `countryCode`, `locationId`, `ids`; `Course[]` |
| GET | `/courses/{id}` | `Course` |
| POST | `/courses/{id}/unlock` | Required `Idempotency-Key` header, no body; `Wallet` |
| POST | `/courses/{id}/dismiss` | No body; 204; persists the reel's "less like this" action |
| GET | `/countries` | All 249 ISO countries/territories, including zero-content rows; `Country[]`, ordered by English name |
| GET | `/countries/{code}` | Uppercase ISO alpha-2 code; `Country` |
| GET | `/locations` | Optional `countryCode`, `ids`; `Location[]` |
| GET | `/locations/{id}` | `Location` |
| GET | `/wallet` | `Wallet`: `{ "balance": 520, "heldBalance": 120, "availableBalance": 400 }` |
| GET | `/users` | Optional `query`, `relation=friend\|requested\|incoming\|none`, `suggested=true`; `User[]` excluding viewer |
| GET | `/users/me` | Viewer profile; `User` |
| GET | `/users/{id}` | `User` |
| POST | `/users/{id}/friend-requests` | No body; updated `User` with `relation="requested"` |
| POST | `/users/{id}/friend-requests/accept` | `{id}` sent the viewer a pending request; no body; updated `User` with `relation="friend"`. 409 when there is no such request |
| POST | `/users/{id}/friend-requests/decline` | As accept; `relation="none"`, and either user may send a new request later |
| POST | `/users/{id}/friend-requests/cancel` | The viewer withdraws their own pending request to `{id}`; `relation="none"`. 409 when there is none |
| POST | `/users/{id}/unfriend` | Either friend ends an accepted friendship; `relation="none"`. 409 when not friends |
| GET | `/network/feed` | Latest five friends' completions; `FeedItem[]` |
| GET | `/network/leaderboard` | Friends and viewer, this UTC week; `LeaderboardEntry[]` |
| GET | `/events` | All non-cancelled events, ordered by actual start time; `Event[]` |
| GET | `/events/{id}` | `Event` |
| GET | `/codebooks` | Registered keys: `difficulties`, `fields` |
| GET | `/codebooks/{key}` | `{id,label}[]` with original UUID IDs |
| GET | `/codebooks/{key}/{id}` | One `{id,label}` |

`ids` accepts comma-separated UUIDs or repeated parameters. `ids=` returns an empty
list. Course ID requests preserve caller order and skip unknown IDs. Other course
filters combine with AND. Invalid UUIDs, missing required headers, invalid signup
fields and unknown course collections return 400. A taken username or email
(case-insensitive) returns 409. Missing resources return 404; conflicting friend requests
or reused paid-purchase keys return 409; insufficient coins return 402. Domain errors
use `application/problem+json` with `status` and `detail`.

## Response fields

| Type | Fields |
| --- | --- |
| Course | `id`, `title`, `subject`, `countryCode`, `countryName`, `locations: Location[]`, `description`, `learnerCount`, `estimatedMinutes`, `difficulty`, `progress`, `unlockCost`, `isUnlocked`, `imageUrl` |
| Country | `code`, `name`, `flagUrl`, `courseCount`, `locationCount`, `blurb` |
| Location | `id`, `name`, `countryCode`, `countryName`, `lat`, `lng`, `imageUrl`, `kind`, `city` |
| User | `id`, `name`, `handle`, `avatarUrl`, `countryCode`, `stats: {completedCount,streakDays,countriesCount}`, `badgeCountryCodes`, `inProgressCourseIds`, `completedCourseIds`, `relation` (`me`, `friend`, `requested` = viewer sent a pending request, `incoming` = viewer received one, `none`), `mutualFriendsCount`, `bio` |
| FeedItem | `id`, `userId`, `userName`, `userAvatarUrl`, `courseId`, `courseTitle`, `completedAt` |
| LeaderboardEntry | `rank`, `userId`, `userName`, `userAvatarUrl`, `completedThisWeek`, `isMe` |
| Event | `id`, `title`, `startsAt`, `venue`, `lat`, `lng`, `description`, `organizer`, `isFree`, `registrationUrl`, `imageUrl`, `category`, `city`, `language`, `priceEur` |

The display details added by `006-content-details` are all nullable. Image fields are
public URLs the client loads directly. Location `kind` is one of `monument`, `nature`,
`museum`, `venue`, `site`; event `category` is one of `lecture`, `workshop`, `exhibition`,
`film`, `sport`, `other`. Neither is constrained in the database, so clients treat unknown
codes generically. Event `city` is the venue place's city. `priceEur` is null for free
events and for paid events with no stored price; `language` is a BCP 47 tag.

Country `code` is the uppercase ISO 3166-1 alpha-2 identifier, for example `HR`.
`name` is the full English display name, for example `Croatia`. `flagUrl` is an
absolute HTTPS image URL such as `https://flagcdn.com/w160/hr.png`; clients load
the image directly from FlagCDN. There is no backend flag-image endpoint.
The country reference catalogue is supplied by production Liquibase migration
`002-iso-countries.sql`, independently of optional demo content;
`003-hosted-country-flags.sql` migrates flag paths to hosted URLs. The device
needs internet access for flags, while country names/counts use the backend. See
[reference/README.md](reference/README.md) for data sources and maintenance.

`subject` is the alphabetically first linked field label, or null, since the schema
allows several fields and the frontend displays one. Field labels are database data,
not restricted to the frontend's hardcoded `Subject` union. Difficulty labels become
lowercase. Course metadata comes from `course`; the published version selects catalogue
eligibility. `learnerCount` counts distinct enrolled users. An entitlement sets
`isUnlocked`; a zero price alone does not grant ownership. `unlockCost` comes directly
from `course.price_coins`, never the mock duration formula.

`progress` is null before opening a course, otherwise the completed lesson fraction
for the most recently enrolled version; a completed enrollment reports 1. A version
with no lessons reports null. `continue` uses opened, incomplete enrollments. Public
browsing requires a published current version and an unarchived public course;
course owners can also retrieve their archived/private courses. Public country
counts exclude those additional owned courses. Archive behavior is a catalogue rule,
not an access-control implementation.

`popular` returns up to five courses ordered by distinct completers in the past
30 days, then total enrolled users. `recommended` orders public courses by summed
matching `user_interest.weight`, with stable ID tie-breaking. With no interests it
uses that stable order. `feed` orders public courses by creation date. Both omit
the viewer's dismissed courses. These are SQL rules with no AI or external service.

Profiles count distinct completed courses. Country badges are derived from the
countries of completed courses, matching the frontend's definition; they are not
`user_badge` awards. Streaks count consecutive local dates with completions in the
profile user's stored timezone; yesterday's streak stays active until today's end.
Pending friend requests in either direction map to `requested`, because the
frontend has no separate incoming-request state. Accepted friendships are undirected.
Suggestions use mutual friends (up to ten), excluding the viewer and accepted friends.
Leaderboard ties use name then UUID, assign sequential ranks, and include zero scores;
the week begins Monday 00:00 UTC and repeated versions of a course count once.

Wallet unlocks lock the user's wallet, check available funds after unexpired Benefits
holds, read the stored course price, write a ledger
debit, update the balance, and insert an entitlement atomically. Paid retries with
the same key return the current wallet balance; reusing that key for a different
course returns 409. Already-owned courses return the current balance without a
second debit, including with a different key. Free acquisition writes an entitlement
and no ledger row, so its retry guarantee is course ownership, not a stored key.
Unlock does not create/open an enrollment; starting the course player does.
The `/courses/{id}/learning` endpoints now provide ordered lessons/quizzes, answer
submission, persisted progress, question-based 80% completion and promised coin
rewards. See [LEARNING.md](LEARNING.md) for paths, JSON contracts and retry rules.
There are no arbitrary credit/top-up, generation or course-authoring APIs.

## Benefits and coupons

All routes below include the `/api` prefix. Learner routes require the bearer token.
Catalogue and history pages use `{items,page,size,total}`; coin amounts are integers.
Country filters refer to eligible venue countries through `place.country_id`, not
the partner's headquarters or the learner's location. Filters combine with AND.
Sort values are `POPULAR`, `PRICE_ASC`, `PRICE_DESC`, and `NEWEST`; page is zero-based
and size must be 1-50. Cards may include unavailable offers with explicit availability.

| Method | Path | Contract |
| --- | --- | --- |
| GET | `/benefits/partners?countryCode=HR` | Active partners with discoverable offers |
| GET | `/benefits/countries?partnerId={id}` | Countries with eligible venues/offers |
| GET | `/benefits/offers?q=&partnerId=&countryCode=&sort=&page=&size=` | Filtered offer page, deterministic ordering with ID tie-breaker |
| GET | `/benefits/offers/{id}` | Offer, terms, eligible countries/venues and availability |
| POST | `/benefits/offers/{id}/activate` | Empty request body; immediately deducts the offer price and returns `{coupon,wallet,serverNow}` with the generated code |
| GET | `/benefits/coupons?status=&page=&size=` | Viewer history; statuses `ACTIVE`, `REDEEMED` (legacy history), and `EXPIRED` |
| GET | `/benefits/coupons/{id}` | Viewer-owned coupon and its generated redemption code |
| POST | `/benefits/coupons/{id}/mark-used` | Marks an active, unexpired viewer-owned coupon as `REDEEMED`; no additional wallet debit |

Wallet responses keep the shared shape `{balance,heldBalance,availableBalance}`; benefit activations do not hold coins, so `heldBalance` is zero. Coupons contain `id`, `status`, the offer snapshot, `priceCoins`, `issuedAt`, `expiresAt`, `redemptionCode`, and `serverNow`. Activating a coupon posts a negative `BENEFIT_ACTIVATION` ledger entry and updates the wallet in the same transaction. Codes are generated on the server. Coupons expire after 15 minutes; the activation charge is not refunded on expiry.

Errors use ProblemDetail with stable `code`: 400 malformed input, 404 missing offer/coupon, 402 `INSUFFICIENT_COINS`, and 409 unavailable or sold-out offer. See [dev/README.md](dev/README.md) for sample data and [DATABASE.md](DATABASE.md) for schema details.
## Example requests

With a provisioned database and real UUIDs:

```powershell
$login = @{ email = 'demo.learner@example.test'; password = 'demo1234' } | ConvertTo-Json
$auth = @{ Authorization = 'Bearer ' + (Invoke-RestMethod 'http://localhost:8080/api/auth/login' -Method Post -ContentType 'application/json' -Body $login).token }
$courseId = '<course UUID>'
Invoke-RestMethod 'http://localhost:8080/api/courses?collection=continue' -Headers $auth
Invoke-RestMethod "http://localhost:8080/api/courses/$courseId/unlock" -Method Post -Headers ($auth + @{'Idempotency-Key'='purchase-001'})
Invoke-RestMethod 'http://localhost:8080/api/countries' -Headers $auth
```
