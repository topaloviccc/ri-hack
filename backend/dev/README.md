# Local demo dataset

The local database is populated with optional mock data derived from the mobile
samples: 12 countries, 7 fields, 16 users, 48 courses, 94 places, 32 events and 83
learning histories. This data is outside Liquibase and is never seeded automatically
on production startup. Existing data is preserved; no tables are truncated.

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
It reuses countries/fields by their unique ISO codes/labels and does not overwrite
existing records. To regenerate SQL after intentionally changing mobile mock samples,
run `node backend/dev/generate-demo-data.cjs` with mobile dependencies installed.
The committed SQL can be loaded without Node or mobile dependencies.

## Hands-on scenarios

Open the app as Demo Learner. Exact UUIDs are in [demo-scenarios.json](demo-scenarios.json).

| Area | What to try |
| --- | --- |
| Home | Continue shows five courses with progress. Popular and Recommended have real SQL-derived data. |
| Courses / map | Browse twelve countries and subject sections, clustered location pins, country pages and location sheets. Some event venues have no linked courses, exercising the empty state. |
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

The lesson player, grading/completion writes, earning coins, friend accept/decline,
profile editing and event registration storage remain unavailable. Expert requests
and the weekly challenge remain labelled frontend demos. Images, city filters and
other unsupported presentation details remain labelled demos as previously chosen.

Reload Expo Go after seeding. `mobile/.env.local` selects the demo viewer and the
computer's LAN API URL; update that URL if the computer's Wi-Fi address changes.
