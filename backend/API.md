# Backend API

Base path: `/api`; default local URL: `http://localhost:8080`.
IDs are UUID strings, not the frontend's mock IDs (`u0`, `c1`, etc.).
Requests and responses use JSON. Times use ISO 8601 UTC. Nullable source columns
remain nullable; unsupported frontend fields are omitted, as listed in [SCOPE.md](SCOPE.md).

Viewer-specific endpoints require `X-User-Id: <existing app_user UUID>`.
This is caller-supplied context, with no authentication, authorization, token,
role or privacy enforcement. There is no default "me" user. Countries, locations,
events and codebooks do not require the header. The mobile frontend now uses these
endpoints. It reads `EXPO_PUBLIC_API_URL` (including `/api`) and `EXPO_PUBLIC_USER_ID`.
Unsupported fields remain explicitly labelled demo content, per the chosen integration
policy. See [mobile/API.md](../mobile/API.md) for configuration and demo boundaries.
Browser CORS allows localhost/127.0.0.1 on port 8081 by default; configure additional
origins with the backend `CORS_ALLOWED_ORIGINS` environment variable.

| Method | Path | Parameters / result |
| --- | --- | --- |
| GET | `/courses` | `collection=continue\|popular\|recommended\|feed`, `countryCode`, `locationId`, `ids`; `Course[]` |
| GET | `/courses/{id}` | `Course` |
| POST | `/courses/{id}/unlock` | Required `Idempotency-Key` header, no body; `{ "balance": 60 }` |
| POST | `/courses/{id}/dismiss` | No body; 204; persists the reel's "less like this" action |
| GET | `/countries` | All 249 ISO countries/territories, including zero-content rows; `Country[]`, ordered by English name |
| GET | `/countries/{code}` | Uppercase ISO alpha-2 code; `Country` |
| GET | `/locations` | Optional `countryCode`, `ids`; `Location[]` |
| GET | `/locations/{id}` | `Location` |
| GET | `/wallet` | `{ "balance": 100 }` |
| GET | `/users` | Optional `query`, `relation=friend\|requested\|none`, `suggested=true`; `User[]` excluding viewer |
| GET | `/users/me` | Viewer profile; `User` |
| GET | `/users/{id}` | `User` |
| POST | `/users/{id}/friend-requests` | No body; updated `User` with `relation="requested"` |
| GET | `/network/feed` | Latest five friends' completions; `FeedItem[]` |
| GET | `/network/leaderboard` | Friends and viewer, this UTC week; `LeaderboardEntry[]` |
| GET | `/events` | All non-cancelled events, ordered by actual start time; `Event[]` |
| GET | `/events/{id}` | `Event` |
| GET | `/codebooks` | Registered keys: `difficulties`, `fields` |
| GET | `/codebooks/{key}` | `{id,label}[]` with original UUID IDs |
| GET | `/codebooks/{key}/{id}` | One `{id,label}` |

`ids` accepts comma-separated UUIDs or repeated parameters. `ids=` returns an empty
list. Course ID requests preserve caller order and skip unknown IDs. Other course
filters combine with AND. Invalid UUIDs, missing required headers and unknown course
collections return 400. Missing resources return 404; conflicting friend requests
or reused paid-purchase keys return 409; insufficient coins return 402. Domain errors
use `application/problem+json` with `status` and `detail`.

## Response fields

| Type | Fields |
| --- | --- |
| Course | `id`, `title`, `subject`, `countryCode`, `countryName`, `locations: Location[]`, `description`, `learnerCount`, `estimatedMinutes`, `difficulty`, `progress`, `unlockCost`, `isUnlocked` |
| Country | `code`, `name`, `flagUrl`, `courseCount`, `locationCount` |
| Location | `id`, `name`, `countryCode`, `countryName`, `lat`, `lng` |
| User | `id`, `name`, `handle`, `avatarUrl`, `countryCode`, `stats: {completedCount,streakDays,countriesCount}`, `badgeCountryCodes`, `inProgressCourseIds`, `completedCourseIds`, `relation`, `mutualFriendsCount` |
| FeedItem | `id`, `userId`, `userName`, `userAvatarUrl`, `courseId`, `courseTitle`, `completedAt` |
| LeaderboardEntry | `rank`, `userId`, `userName`, `userAvatarUrl`, `completedThisWeek`, `isMe` |
| Event | `id`, `title`, `startsAt`, `venue`, `lat`, `lng`, `description`, `organizer`, `isFree`, `registrationUrl` |

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

Wallet unlocks lock the user's wallet, read the stored course price, write a ledger
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

## Example requests

With a provisioned database and real UUIDs:

```powershell
$viewerId = '<app_user UUID>'
$courseId = '<course UUID>'
Invoke-RestMethod 'http://localhost:8080/api/courses?collection=continue' -Headers @{'X-User-Id'=$viewerId}
Invoke-RestMethod "http://localhost:8080/api/courses/$courseId/unlock" -Method Post -Headers @{'X-User-Id'=$viewerId; 'Idempotency-Key'='purchase-001'}
Invoke-RestMethod 'http://localhost:8080/api/countries'
```
