# Schema/frontend intersection and gaps

Sources: `../worldlearn.sql`, `../mobile/src/features/*/types.ts`, the current screens,
and the API implementation.
The reference SQL is unchanged. This backend implements only shared
behaviors and the relational dependencies needed to read or write them.

## Implemented overlap

| Frontend behavior | Schema backing |
| --- | --- |
| Home rows, course cards/details, reel feed, country/location filters, map coordinates | `course`, `course_version`, `difficulty`, `visibility`, `publication_status`, `course_field`, `field`, `course_place`, `place`, `country` |
| Continue/progress and profile course lists | `course_entitlement`, `enrollment`, `enrollment_status`, `lesson`, `lesson_progress`, `course_completion`; read only for learning history |
| Wallet balance and unlock | `wallet`, `wallet_transaction`, `wallet_transaction_type`, `course_entitlement`; transactional writes |
| Benefits catalogue, direct coupon activation/code, history, expiry and immediate wallet debit | `partner`, `partner_venue`, `benefit_offer`, `offer_venue`, `coupon_redemption`; same persisted wallet and ledger |
| Less like this on reels | `user_course_preference.is_dismissed`; persistent write |
| Profiles, people search, suggested friends, send request | `app_user`, `friendship`, `friendship_status` |
| Completion activity, friends' weekly leaderboard, profile counts/streaks/country badges | Derived from `course_completion` + enrollment/course/country + friendships |
| Event calendar/list/details, venue coordinates, organizer and external registration | `event`, `event_status`, `place`, `app_user`; read only |
| Recommended row without AI | `user_interest`, `course_field`; explicit interest-weight ordering |

## Frontend-only data and behavior not implemented

| Gap | Why it cannot be backed by this schema |
| --- | --- |
| Expert applications: qualification title, pending/approved/rejected requests, rejection reason, certificate attachments | `expert_field` records granted expertise, not applications. There is no application table or approval workflow. File/bucket integration is also explicitly excluded. No request endpoints were invented. |
| Weekly challenge card, target, deadline and reward | No challenge definition or progress/reward model. No challenge endpoint. |
| Country `blurb` | `country` has only ID, ISO code and label. |
| Location `kind`, `city`, `imageUrl` | `place` has no kind, city or image column. Its free-form `address` is not a reliable city field. |
| Course `imageUrl` | `cover_asset_id` references private storage metadata, not a public URL. Bucket/media URL resolution is excluded. |
| Profile `bio` | No `app_user.bio` column. Avatar URLs are supported because `avatar_url` exists. |
| Event `category`, `city`, `imageUrl`, `language`, numeric `priceEur` | No corresponding columns. `field_id` is a subject, not an event format/category. Schema only models `is_free`, exposed as `isFree`; a paid price is unknown. |
| City-filtered events | No structured city in event/place. The API lists events without treating an address/timezone as a city. The connected frontend explicitly labels its local city filters as demos. |
| Theme preference | Device-local setting with no schema column; no backend endpoint. |
| Mock IDs, duration-based prices, starting balance 250, relative event dates, hardcoded home/feed collections | Replaced with schema UUIDs, stored prices/balances/actual timestamps and SQL-derived collections. No mock catalogue data is seeded in production. |

## Schema-only features not implemented

- Learner accounts/authentication, identity providers, email verification, general
  roles/privacy/blocking. `X-User-Id` is an untrusted caller choice, not an identity
  mechanism. Benefits owner checks use that declared context.
- AI course generation, durable generation jobs, extraction, source grants/chunks,
  provenance, embeddings/pgvector, model integrations and workers.
- Uploads/media assets, buckets, private file delivery and presigned URLs.
- Lesson player/content writes, quizzes/questions/options, grading, attempts,
  completion/reward writes, spaced revision and scheduling. Minimal lesson/history
  tables are present only to supply the progress and completion data already displayed.
- Course authoring/publication/version editing, prerequisites and concepts; no CRUD
  APIs beyond the actual frontend mutations. Existing version/status columns remain
  part of the selected schema but have no administration endpoints.
- Focus sessions, NFC tags/verified visits/rewards and explicit badge award workflows.
- Expert grants, course reviews, contribution rewards, content reports and audit events.
- Cosmetics, refund/adjustment/credit/top-up APIs and reward payments. Benefits use
  the `BENEFIT_ACTIVATION` transaction type; other lookup labels do not imply
  implemented flows. Merchant self-service, payouts, real partner agreements,
  offline acceptance, geofencing and badge/visit eligibility remain deferred.
- Friend accept/decline/cancel/remove actions and incoming request inbox. The frontend
  only sends requests. Declined/cancelled pair rows can be reused for a new request.
- Event save/registration/participant storage and capacity enforcement. The frontend
  opens an external registration link; the backend simply returns that stored link.

## Liquibase adaptation

`db/changelog/001-worldlearn.sql` contains the selected source tables and original
lookup UUIDs/labels, then the cyclic current-version foreign key and relevant indexes.
It is an initial migration for an empty database, not an upgrade over the raw SQL.

The included tables retain source columns except `app_user` authentication/role/
privacy/notification fields, `course.cover_asset_id`, the generated `place.location`
PostGIS column, and `wallet_transaction.reservation_id` plus its foreign key.
Those would otherwise require excluded subsystems. Decimal coordinates are enough
for the current map. No PostGIS or vector extension is installed. Other retained
columns (for example event capacity and version objectives) have no extra APIs.

In the initial 001 subset, source CHECK constraints and stored functions/triggers are omitted, including
validation, immutability, scoring, publication guards, financial link checks and
automatic wallet/reward creation. Primary keys, NOT NULL, unique keys and foreign
keys remain as the structural relational model. No equivalent range/format/state
validation was recreated for that initial subset. The incremental Benefits migration
adds feature-specific state/amount/time constraints and explicit transactional validation.
HTTP binding, missing-resource handling,
insufficient-balance behavior and idempotent unlocks implement the existing frontend
contract. The wallet use case updates balance and ledger itself because its trigger
was omitted. Do not assume direct SQL ledger inserts update a balance.

Benefits extends this baseline through incremental Liquibase changesets without
rewriting 001 or 002. Activation directly debits the wallet and creates a coupon
with a random code in one transaction. The old quote, reservation, and merchant
credential tables are removed by the forward migration. Optional samples remain
outside startup.

The generic codebook infrastructure now also supports explicit registered table
names and UUID IDs, so `field`/`difficulty` keep the source schema instead of being
copied into new numeric `codebook_*` tables. Existing numeric codebooks still work.

## Frontend integration

The mobile app now uses the backend for shared data and mutations, with viewer context
from `EXPO_PUBLIC_USER_ID`. The user chose to keep unsupported details explicitly
labelled as demo content, including images, bios, country introductions, location
types/cities, event categories/cities/languages/numeric paid prices, expert applications
and weekly challenges. These details do not create backend tables or integrations.

The event calendar defaults to all events; selecting a city filters its demo city
labels locally. Map/registration actions use actual backend coordinates and URLs.
Subject sections accept arbitrary database field labels; nullable coordinates,
durations and progress are handled explicitly. There is no fallback to mock records
when the server is unavailable. See [mobile/API.md](../mobile/API.md) for setup.
