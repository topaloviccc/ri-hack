# Schema/frontend coverage and gaps

Sources: `../worldlearn.sql`, `../mobile/src/features/*/types.ts`, mock API adapters,
the current screens and the API implementation. The product specification is not used to expand this scope.
The reference SQL is unchanged. The initial integration covered shared behaviors;
explicitly requested country reference data and the lesson/quiz player extend it.
The learning/scoring policy is detailed in [LEARNING.md](LEARNING.md).

## Implemented overlap

| Frontend behavior | Schema backing |
| --- | --- |
| Home rows, course cards/details, reel feed, country/location filters, map coordinates | `course`, `course_version`, `difficulty`, `visibility`, `publication_status`, `course_field`, `field`, `course_place`, `place`, `country` |
| Lesson/quiz player, progress, grading and course completion | `course_entitlement`, `enrollment`, `enrollment_status`, `lesson`, `lesson_progress`, `quiz`, `question_type`, `question`, `answer_option`, `quiz_attempt`, `question_response`, `course_completion`, `course_completion_quiz_result`; transactional writes |
| Once-per-course promised completion reward | `course_completion_reward`, entitlement promise, wallet and ledger; atomic with completion |
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
| Country `blurb` | No introduction column. Country code/name and the added flag image path are production reference data; introductions remain demo content. |
| Location `kind`, `city`, `imageUrl` | `place` has no kind, city or image column. Its free-form `address` is not a reliable city field. |
| Course `imageUrl` | `cover_asset_id` references private storage metadata, not a public URL. Bucket/media URL resolution is excluded. |
| Profile `bio` | No `app_user.bio` column. Avatar URLs are supported because `avatar_url` exists. |
| Event `category`, `city`, `imageUrl`, `language`, numeric `priceEur` | No corresponding columns. `field_id` is a subject, not an event format/category. Schema only models `is_free`, exposed as `isFree`; a paid price is unknown. |
| City-filtered events | No structured city in event/place. The API lists events without treating an address/timezone as a city. The connected frontend explicitly labels its local city filters as demos. |
| Theme preference | Device-local setting with no schema column; no backend endpoint. |
| Mock IDs, duration-based prices, starting balance 250, relative event dates, hardcoded home/feed collections | Replaced with schema UUIDs, stored prices/balances/actual timestamps and SQL-derived collections. No mock catalogue data is seeded in production. |

## Schema-only features not implemented

- Identity providers, email verification, password reset, roles other than `USER`,
  privacy/blocking. Email/password signup and login with bearer JWTs are implemented
  (`005-auth.sql` adds `app_user.password_hash` and `role`).
- AI course generation, durable generation jobs, extraction, source grants/chunks,
  provenance, embeddings/pgvector, model integrations and workers.
- Uploads/media assets, buckets, private file delivery and presigned URLs.
- Course authoring/generation/import APIs, short-answer and matching question
  rendering/grading, spaced revision and scheduling. Choice/true-false quizzes,
  lesson progress, answer submission, completion and promised coin rewards are implemented.
- Course authoring/publication/version editing, prerequisites and concepts; no CRUD
  APIs beyond the actual frontend mutations. Existing version/status columns remain
  part of the selected schema but have no administration endpoints.
- Focus sessions, NFC tags/verified visits/rewards and explicit badge award workflows.
- Expert grants, course reviews, contribution rewards, content reports and audit events.
- Cosmetics, wallet reservations, refund/adjustment/credit/top-up APIs and rewards
  other than course completion. Benefits use
  the `BENEFIT_ACTIVATION` transaction type; other lookup labels do not imply
  implemented flows. Merchant self-service, payouts, real partner agreements,
  offline acceptance, geofencing and badge/visit eligibility remain deferred.
- Friend blocking. Requests can be sent, cancelled, accepted and declined, and friends
  removed; the Network tab lists incoming requests. Declined, cancelled and removed pair
  rows are reused for a new request.
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
keys remain as the structural relational model. Exhaustive source validation
was not recreated. The player enforces its answer/progression contracts and grades
questions in application code, including the explicitly chosen equal-question
80% rule (different from the reference's equal-quiz mean). The incremental Benefits
migration adds feature-specific state/amount/time constraints and explicit transactional validation.
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

The mobile app now uses the backend for shared data and mutations, as the signed-in user. The user chose to keep unsupported details explicitly
labelled as demo content, including images, bios, country introductions, location
types/cities, event categories/cities/languages/numeric paid prices, expert applications
and weekly challenges. These details do not create backend tables or integrations.

The event calendar defaults to all events; selecting a city filters its demo city
labels locally. Map/registration actions use actual backend coordinates and URLs.
Subject sections accept arbitrary database field labels; nullable coordinates,
durations and progress are handled explicitly. There is no fallback to mock records
when the server is unavailable. See [mobile/API.md](../mobile/API.md) for setup.
