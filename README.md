# OutThere / WorldLearn

An Expo mobile learning app connected to a Spring Boot backend and PostgreSQL.
The current implementation covers the intersection of `worldlearn.sql` and the
existing frontend. It is a local demo with email/password accounts, optional
OpenAI course embeddings, and no bucket integration.

Course recommendations use interests selected after signup, swipe feedback and
learning history. Set `OPENAI_API_KEY` on the backend to enable background course
embedding with `text-embedding-3-small`; categories and behavior also work while
embeddings are pending. Interests can be skipped or edited in Settings. See
[recommendation setup and behavior](backend/RECOMMENDATIONS.md).

## Current state

| Area | Implemented through the backend | Remaining demo content / limitations |
| --- | --- | --- |
| Courses | Title/topic search, on-demand LLM generation with verified places, retrieved cover photos, catalogue, filters, recommendations, reels and ordered lesson/quiz player | Optional seeded lesson/quiz content is demo material; generation needs configured model and geocoder |
| Learning history | Saved reading progress, submitted attempts, best-question scoring, completion, statistics, streaks and country badges | Unsubmitted selections are local; short-answer/matching questions and spaced revision are deferred |
| Geography | Full ISO country catalogue, English names, image flags, places, coordinates, map counts and course links | Country introductions and location types/cities/images are labelled demos |
| Wallet | Stored balance, paid/free unlocks and once-per-course completion rewards with retry protection | Demo opening credit is seeded; no top-up API |
| Benefits | Offer catalogue, coupon activation, codes, history and shared wallet debit | Optional sample partners are labelled Demo; public partner onboarding is deferred |
| People / network | Profiles, people search, suggestions, friend requests, friends' completion feed and weekly leaderboard | Bios are demos |
| Events | Stored titles, dates, descriptions, venues, coordinates, organizers, free/paid status and external registration URLs | Categories, cities/filters, languages, images and numeric paid prices are labelled demos; registration opens a sample external link |
| Experts / challenges | No backend implementation | Entire flows remain explicitly labelled frontend demos; expert requests are kept in memory only |
| Settings | Theme preference persists on the device | Profile editing is unavailable |

**Sample content and a real backend are different things:** the optional demo
catalogue lives in PostgreSQL and uses real HTTP requests. Supported mutations
persist after reload. Unsupported fields/workflows display `Demo:` in the UI.
Failed backend requests never fall back to mock records.

Courses now follow **lesson → quiz → lesson → quiz → final summary quiz**.
Submitting a quiz unlocks the next lesson even with a low score. Retries are
unlimited; the best attempt per quiz counts. Every question has equal weight and
**80% or more correct overall** passes once every step is complete. Completion
awards the entitlement's promised coins once per course. See
[backend/LEARNING.md](backend/LEARNING.md) for contracts and sample-content format.

For an existing demo database, restart the backend and load
`backend/dev/demo-learning.sql` using the commands in that guide. This adds the
new sample lessons/quizzes while preserving your wallet and learning history.
Fresh `demo-data.sql` loads already include this content. No LLM integration is used.

Liquibase creates the selected schema at startup. The initial schema subset omits
source CHECK constraints and stored validation functions/triggers; primary keys,
foreign keys, unique keys and NOT NULL columns remain. `worldlearn.sql` is a
reference document: do not execute it separately before starting the application.

Countries are production reference data: Liquibase's `002-iso-countries.sql`
supplies all **249 ISO 3166-1 alpha-2 countries and territories**, English display
names and flag image URLs. `003-hosted-country-flags.sql` switches those URLs to
FlagCDN, for example `https://flagcdn.com/w160/hr.png`. The app loads flags directly
from that service on country pages/lists, maps, course/place details and
profiles/badges. No flag image files are stored in the repository or backend;
the phone needs internet access to FlagCDN. No bucket configuration is needed.
Countries with no content still appear with zero counts. Only country introductions
remain demo supplements. Sources and update instructions are in
[backend/reference/README.md](backend/reference/README.md).

For an existing local database, restart the backend to apply the new migration,
then reload Expo. Country UUIDs and their links are preserved; no database reset
or demo reseed is required. Fresh installations receive the same country catalogue
automatically, even if the optional demo seed is never loaded.

## Prerequisites

- Java 21, with `JAVA_HOME` pointing to that JDK. Maven is provided by the wrapper.
- Node.js 24.x, version 24.3.0 or newer; Node.js 22.x, version 22.13.0 or newer, also works.
- Docker Desktop / Docker Engine with Compose, running Linux containers.
- Expo Go supporting SDK 58 on the demo phone, or a compatible simulator/emulator.
- Available ports: PostgreSQL **5432**, backend **8080**, Expo **8081**.

Commands below use PowerShell on Windows and start at the repository root unless
stated otherwise. On macOS/Linux, use `./mvnw` instead of `.\mvnw.cmd` and
`cp .env.example .env.local` instead of `Copy-Item`.

## First local run

### 1. Start PostgreSQL

```powershell
docker compose -f backend/compose.yaml up -d postgres
```

This creates a PostgreSQL 16 database named `outthere`, with local username and
password `outthere`. Docker stores its data in a named volume.

### 2. Start the backend in its own terminal

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Leave this terminal running. Wait for the application to finish starting;
Liquibase must create the tables before the demo seed can run. The API root is
`http://localhost:8080/api`.

Connection defaults are in `backend/src/main/resources/application.properties`.
Override them with `DB_URL`, `DB_USERNAME` and `DB_PASSWORD` if using a different
PostgreSQL instance. Use a fresh database for the initial Liquibase migration.

### 3. Load demo data from another terminal at the repository root

```powershell
docker cp backend/dev/demo-data.sql outthere-postgres:/tmp/outthere-demo-data.sql
docker exec outthere-postgres psql -U outthere -d outthere -v ON_ERROR_STOP=1 -f /tmp/outthere-demo-data.sql
```

This optional script supplies content across 12 countries, 7 subjects, 16 users, 49 courses,
94 places, 32 events and 83 learning-history records. One course is intentionally
unpublished. Demo Learner starts with **250 coins**, progress, completions, friends
and pending/suggested connections.

The original samples include four lesson–quiz pairs and a five-question final
summary quiz. One additional full-length sample, **Mount Etna: life on a living
volcano**, takes about 30 minutes, with four longer lessons, reflection activities
and 18 questions. It is free and already granted to Demo Learner. The course
duration target is 20–40 minutes total; other samples remain short placeholders.
All samples use real submission, grading and reward endpoints. The main lesson
material is Markdown, rendered natively with rich formatting, tappable reflection
checklists and expandable examples. See the [authoring format](backend/dev/content/MARKDOWN.md).

The 249 country reference records and hosted flag URLs come from the application
migrations, not this demo script.

The seed is separate from Liquibase and does not run automatically. It is additive:
re-running does not reset purchases, balances, friendships or dismissals. Event dates
are relative to their first seed run and remain stored afterward. The script uses
the committed SQL; regenerating it or installing frontend packages is not necessary
to load it.

### 4. Install and configure the frontend

```powershell
cd mobile
npm ci
Copy-Item .env.example .env.local
```

Edit `mobile/.env.local`:

```dotenv
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_WIFI_IP:8080/api
```

Replace `YOUR_COMPUTER_WIFI_IP` with the computer's LAN IPv4 address (find it using
`ipconfig` on Windows). Keep the `/api` suffix. For a physical phone, `localhost`
points to the phone, so use the computer's Wi-Fi address. An Android emulator can
use `http://10.0.2.2:8080/api`; an iOS simulator or web browser on the computer can
use `http://localhost:8080/api`.

Sign up in the app, or load `backend/dev/demo-passwords.sql` and log in as
`demo.learner@example.test` / `demo1234` (see [backend/dev/README.md](backend/dev/README.md)).
A missing URL stops requests before the network; development builds show a setup notice.

`.env.local` is ignored by Git. Each teammate must create their own file and use
the address of the computer running their backend. Do not copy another developer's
Wi-Fi address unchanged.

### 5. Start Expo in the frontend terminal

```powershell
npm start -- --lan
```

Keep the phone and computer on the same Wi-Fi and scan the QR code in Expo Go.
Both the backend and Expo terminals must stay running. Reload Expo Go after
changing `.env.local` or loading demo data.

`--` passes arguments from npm to Expo; `--lan` exposes the Expo development server
on the local network. It does not start the backend or expose port 8080 through an
Expo tunnel. The phone must be able to reach the computer's backend address too.

## Verify and test

From the repository root, with the seeded backend running:

```powershell
node backend/dev/check-demo.cjs
```

This read-only API check verifies the catalogue, geography, events, profiles,
social data, wallet and seeded edge cases. See [the hands-on scenario guide](backend/dev/README.md)
for paid/free unlocks, insufficient funds, missing metadata, archived ownership,
friend requests and persistent dismissals.

Backend automated tests (Java 21 and Docker required), from `backend`:

```powershell
.\mvnw.cmd test
```

Frontend checks, from `mobile`:

```powershell
npm run typecheck
npm run lint
npm test -- --runInBand
```

Backend tests use disposable PostgreSQL containers. Most frontend tests stub HTTP
responses while exercising real adapters and screens. The separate live integration
test is opt-in; its setup is described in [mobile/API.md](mobile/API.md).
Do not load the destructive test fixture into the working demo database.

## Subsequent runs and troubleshooting

- Start PostgreSQL, start the backend, then run `npm start -- --lan` in `mobile`.
  Dependency installation, environment-file creation and seeding are first-run steps.
- Stop the backend/Expo with Ctrl+C. Stop PostgreSQL from the root with
  `docker compose -f backend/compose.yaml down`; its data is retained. Adding
  `--volumes` deletes the local database, so omit it when preserving test progress.
- No API traffic: check `.env.local`, reload the app, and inspect the development
  setup notice. A missing configuration value throws before `fetch`.
- Connection refused: confirm the backend is running on port 8080 and the phone can
  reach the configured computer IP. Expo and the backend are separate servers.
- User/wallet 404: load the demo seed and check the configured UUID.
- Empty screens: seed the database and reload; choose a dotted calendar date for events.
- Browser CORS: default allowed origins are `http://localhost:8081` and
  `http://127.0.0.1:8081`. Configure backend `CORS_ALLOWED_ORIGINS` for other web origins.
- Port 5432 occupied: use a different published PostgreSQL port in Compose and set
  the corresponding backend `DB_URL`.

## Further documentation

- [Backend endpoint contracts](backend/API.md)
- [Course player, scoring and demo learning content](backend/LEARNING.md)
- [Course search, generation setup and job contracts](backend/GENERATION.md)
- [Course/place cover photo search and attribution](backend/IMAGES.md)
- [Frontend integration and demo boundaries](mobile/API.md)
- [Schema/frontend scope and omissions](backend/SCOPE.md)
- [Database configuration](backend/DATABASE.md)
- [Demo data and testing scenarios](backend/dev/README.md)
- [Codebook infrastructure](backend/CODEBOOKS.md)
- [Remaining frontend work](mobile/BACKLOG.md)
