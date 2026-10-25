# Local demo dataset

The local database is populated with optional mock data derived from the mobile
samples: content across 12 countries, 7 fields, 16 users, 49 courses, 94 places, 32 events and 83
learning histories. This data is outside Liquibase and is never seeded automatically
on production startup. Existing data is preserved; no tables are truncated.

All 249 ISO countries/territories, their English display names and image flags
are production reference data supplied automatically by Liquibase. Flag images
load directly from FlagCDN; only their URLs are stored. The demo script references those countries by ISO alpha-2 code and never
inserts or replaces them. See [../reference/README.md](../reference/README.md).

The configured viewer is **Demo Learner**,
`11111111-1111-4111-8111-111111111111`, with an initial 250 coins. Opening credit is
recorded once in the ledger. Re-running preserves purchases, balances, friendships,
dismissals and learning progress; it does not reset your testing session.

## Load or verify

Run from the repository root after the backend has applied its migrations:

```powershell
docker cp backend/dev/demo-data.sql outthere-postgres:/tmp/outthere-demo-data.sql
docker exec outthere-postgres psql -U outthere -d outthere -v ON_ERROR_STOP=1 -f /tmp/outthere-demo-data.sql
node backend/dev/check-demo.cjs
```

`check-demo.cjs` is read only and expects the backend on `localhost:8080/api`.
Override it with `DEMO_API_URL` if needed. The SQL uses stable IDs and one transaction.
It references migrated countries by ISO code, reuses fields by label and does not overwrite
existing records. To regenerate SQL after intentionally changing mobile mock samples,
run `node backend/dev/generate-demo-learning.cjs` followed by
`node backend/dev/generate-demo-data.cjs` with mobile dependencies installed.
The committed SQL can be loaded without Node or mobile dependencies.

## Hands-on scenarios

Fresh `demo-data.sql` includes short learning placeholders for the original 48 courses
and one substantial 30-minute course, **Mount Etna: life on a living volcano**.
The latter has four lessons with reflection activities and 18 questions. The target
duration is 20–40 minutes per whole course; no other full-length mocks are written.
For an existing seeded database, restart the backend and load `demo-learning.sql`
separately; see [../LEARNING.md](../LEARNING.md) for exact commands.
It preserves balances, existing learning history and edited content.

Open the app as Demo Learner. Exact UUIDs are in [demo-scenarios.json](demo-scenarios.json).

| Area | What to try |
| --- | --- |
| Home | Continue shows five courses with progress. Popular and Recommended have real SQL-derived data. |
| Learn | Open the already-owned **Mount Etna volcanic ecosystems**, select Start course, then Start learning. Read, submit each quiz and finish the summary quiz. Wrong answers can be retried; best attempts and 80% of all questions determine passing. |
| Completion reward | A newly passed course pays its promised reward once. Reload, retry a quiz and check that no second reward is paid. Existing seeded completed histories receive no retrospective credit. |
| Courses / map | Browse 249 countries with full English names, ISO codes and image flags; demo courses cover twelve countries. Other countries show zero counts and empty course lists. Browse subject sections, clustered pins and location sheets. |
| Paid unlock | **Alhambra and Moorish geometry** costs 100 coins. Unlock it, check the reduced balance, then reopen it to confirm persistent ownership. |
| Free unlock | **Doñana wetlands & the Iberian lynx** costs zero and starts locked. Unlock without spending coins. |
| Insufficient funds | **Thorrablot: Iceland midwinter feast** costs 1,000 coins. The unlock sheet should explain the shortfall. |
| Owned, not started | **Mount Etna volcanic ecosystems** is already unlocked with no progress. |
| Archived ownership | **Owned archived course example** is private and archived, but remains accessible through the learner's entitlement and Continue/profile rows. |
| Missing optional metadata | **Optional metadata example** has no duration/country/subject. Its linked place has no coordinates, so it has no map pin or map-opening action. |
| Unpublished course | **Unpublished demo course (hidden)** is deliberately absent from public browsing and returns 404 for this learner. |
| Profile | Five completed courses across five countries, five-day initial streak, five courses in progress. |
| People / network | Accepted friends, a pending request to Jelena Bulatović, suggestions with mutual friends, completion feed and weekly leaderboard. Send Ivan Perović a friend request and reload to verify persistence. |
| Scroll | Dismiss a reel and reload; it should remain absent. One course was initially dismissed to exercise the filter. |
| Calendar | Events use actual stored dates, initially today and upcoming days. Select a dotted date, open details/maps, or follow a sample registration link. |

Events keep their original seed dates on subsequent runs. Registration URLs and all
content are samples, not real bookings or verified travel/learning information.
Course grants/completion history are seeded examples, not earned quiz rewards.

## Still outside the implemented backend

Short-answer/matching questions, spaced revision, course authoring/LLM generation,
friend accept/decline, profile editing and event registration storage remain unavailable. Expert requests
and the weekly challenge remain labelled frontend demos. Course/place/event images, city filters and
other unsupported presentation details remain labelled demos as previously chosen.

Reload Expo Go after seeding. `mobile/.env.local` selects the demo viewer and the
computer's LAN API URL; update that URL if the computer's Wi-Fi address changes.
