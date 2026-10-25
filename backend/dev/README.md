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
| People / network | Accepted friends, a pending request to Jelena Bulatović, suggestions with mutual friends, completion feed and weekly leaderboard. Send Ivan PeroviÄ‡ a friend request and reload to verify persistence. |
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

## Optional Benefits samples

`benefits-seed.sql` is an independent, additive development seed, applied manually
after the backend's Benefits Liquibase migration. It does not need the full demo
catalogue. It reuses HR/ES/FR/IT/PT by ISO code, adds labelled demo partners/venues/offers,
and provisions a **separate** learner with 520 opening sample coins. It never resets
the original 250-coin Demo Learner, any purchases, or previously spent coins. A
wallet lock and once-only opening ledger credit preserve balances on reruns.

| Sample | Stable ID |
| --- | --- |
| Benefits learner | `b0000000-0000-4000-8000-000000000001` |
| Burek kod braće partner | `b1000000-0000-4000-8000-000000000001` |
| Zagreb venue | `b2000000-0000-4000-8000-000000000001` |
| Recuerdos del Sol, Barcelona venue | `b2000000-0000-4000-8000-000000000003` |
| Musée Atelier Lumière, Paris venue | `b2000000-0000-4000-8000-000000000004` |
| Caffè Piccolo, Rome venue | `b2000000-0000-4000-8000-000000000005` |
| Lisbon Postcard Club venue | `b2000000-0000-4000-8000-000000000006` |
| Adriatic Scoops, Split venue | `b2000000-0000-4000-8000-000000000007` |
| Free burek of your choice, HR, 150 coins | `b3000000-0000-4000-8000-000000000001` |
| Free Barcelona fridge magnet, ES, 100 coins | `b3000000-0000-4000-8000-000000000002` |
| 10% off a Paris museum exhibition, FR, 200 coins | `b3000000-0000-4000-8000-000000000003` |
| Free Roman cappuccino, IT, 90 coins | `b3000000-0000-4000-8000-000000000004` |
| Free Lisbon postcard set, PT, 80 coins | `b3000000-0000-4000-8000-000000000005` |
| Free gelato by the Adriatic, HR, 120 coins | `b3000000-0000-4000-8000-000000000006` |

From the repository root, with the database/backend already coordinated and running:

```powershell
docker cp backend/dev/benefits-seed.sql outthere-postgres:/tmp/outthere-benefits-seed.sql
docker exec outthere-postgres psql -U outthere -d outthere -v ON_ERROR_STOP=1 -f /tmp/outthere-benefits-seed.sql
```

The seed does not create merchant credentials. Its offers initially last 90 days;
rerunning refreshes catalogue copy, prices and locations while preserving the
original campaign dates, stock, status, existing coupons and wallet activity.
Changed offer terms/prices increment the terms version once; unchanged reruns
leave it alone. Samples have max-per-user 1. Names, coordinates, discounts and
tickets are illustrative and imply no real agreement.

Activating an offer immediately deducts its coin price and creates a coupon with a
random code. No quote, reservation, merchant setup, QR/PIN credential, or activation
retry key is required. Coupons expire after 15 minutes; expiry does not refund coins.
