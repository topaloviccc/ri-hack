# Database setup

The application uses PostgreSQL through Spring JDBC. Liquibase runs the configured
master changelog at startup and records applied changes in its own tracking tables.
The master changelog includes `001-worldlearn.sql`, the frontend-backed subset of
`../worldlearn.sql`, followed by `002-iso-countries.sql` for production country
reference data and `003-hosted-country-flags.sql` for hosted flag image URLs.
The Benefits migrations (`002-benefits-redemption.sql`,
`003-benefits-instant-coupons.sql`, `004-benefit-remote-images.sql`) add the
coupon flow. `004-course-learning.sql` adds quizzes, answers, attempts and
completion rewards. Changesets retain their original names and identities
across both feature branches; the numeric prefixes are not globally unique.
See [SCOPE.md](SCOPE.md) for the included tables and intentional
omissions. UUIDs, defaults, keys and relationships follow the source schema;
CHECK constraints, stored functions and triggers are omitted from that initial subset.
The incremental Benefits changeset adds its own feature-specific constraints.
Subsequent changes belong in new changesets; do not edit an applied migration.

## Local PostgreSQL with Docker

From the repository root, start the database container:

```powershell
docker compose -f backend/compose.yaml up -d postgres
```

The Compose service creates database `outthere` with username and password
`outthere`, published on `localhost:5432`. These match the application's local
defaults. From `backend`, run `.\mvnw.cmd spring-boot:run` on Windows (or
`./mvnw spring-boot:run` on Unix) with Java 21. Liquibase runs
on startup. Stop the container while keeping its data with
`docker compose -f backend/compose.yaml down` from the repository root.

This subset needs ordinary PostgreSQL 16: decimal latitude/longitude are retained,
but the unused generated PostGIS point and vector tables are omitted. Neither
extension is required. Do not execute `worldlearn.sql` separately before startup;
it is a reference schema, not a second migration path. The initial changeset
targets a fresh database, not a database already populated from that file.

The source schema's lookup values and all 249 ISO 3166-1 alpha-2 countries and
territories are seeded in production. Country rows contain an uppercase `iso_code`,
English name in `label`, and `flag_url` such as `https://flagcdn.com/w160/hr.png`.
The frontend loads images directly from FlagCDN; no image files or bucket are
stored/managed by the backend. The device needs internet access to the CDN.
See [reference/README.md](reference/README.md) for sources and update guidance.
The country migration upserts by ISO code, preserving existing UUIDs, foreign keys
and application data. Restart an existing backend to apply it; do not reset the
database or rerun the optional demo seed just to obtain countries/flag URLs.

There are no production mock users, wallet credits, fields, courses or events. Provision application
data with SQL or an existing import process. Account creation is outside this
task, and there is no wallet-creation trigger: provisioning a user must also insert
a `wallet` row. The integration fixture in `src/test/resources/db/worldlearn-test-data.sql`
shows the relationships, but starts with destructive TRUNCATE statements and is
only for disposable test databases.

For an optional local demo learner (UUID `11111111-1111-4111-8111-111111111111`)
and wallet with 250 demo coins, run this manually from the repository root:

```powershell
Get-Content -Raw backend/dev/demo-learner.sql | docker exec -i outthere-postgres psql -U outthere -d outthere -v ON_ERROR_STOP=1
```

This script is outside Liquibase, adds no courses or events, and preserves the
existing balance on subsequent runs. It creates the opening ledger credit once.
Load `dev/demo-passwords.sql` to log in as `demo.learner@example.test` / `demo1234`.

For the full catalogue, geography, learning history, friends and events dataset,
see [dev/README.md](dev/README.md). The optional seed is additive and separate
from application migrations. Its scenario guide lists what can be tested in the app.

The full demo seed now includes answerable lesson/quiz content. Existing demo
databases can load `dev/demo-learning.sql` separately after the new migration,
without resetting learner history or balances. Learning content is optional demo
data, not production reference data. See [LEARNING.md](LEARNING.md) for commands,
the content shape, scoring policy and transactional completion/reward behavior.

Run `.\mvnw.cmd test` on Windows (or `./mvnw test` on Unix) from `backend`
with Java 21 and Docker available. Tests use
disposable PostgreSQL containers, apply Liquibase, and never use the configured
application database. API contracts and example requests are in [API.md](API.md).

## Benefits storage and server secrets

The incremental Benefits migrations add the catalogue and coupon tables, then simplify the earlier redemption schema. Coupons store a server-generated random code. Wallet debits and coupon creation happen in one transaction and are recorded using the `BENEFIT_ACTIVATION` transaction type. Benefit activation has no quote, reservation, merchant credential, or activation idempotency state. The shared wallet response retains `heldBalance` for API compatibility; it is always zero after the reservation table is removed.

The forward migration expires legacy held and cancelled coupons before removing reservation and merchant credential tables. Already redeemed rows keep their historical status. Existing coupon rows receive generated codes for schema consistency. Keep 001 and 002 immutable and apply future changes as incremental migrations.
Before an upgrade, take a database backup and verify it restores. Keep 001 immutable.
For recovery, prefer a forward migration or restore the pre-upgrade backup; do not
drop populated Benefits tables or erase captured ledger history to roll back an
application deployment. Historical partner/offers should be deactivated, not deleted.

The backend test command above applies the complete merged Liquibase changelog,
including Benefits, to disposable PostgreSQL databases and exercises the shared
wallet and course HTTP flows. Dedicated Benefits activation, upgrade/restart and
concurrency test classes are not currently committed. Mobile Benefits adapter and
screen tests use backend-shaped HTTP fixtures; they do not establish those server
guarantees.

## Connect to a cloud PostgreSQL database

Set the connection values in the environment where the application runs. `DB_URL`
must be a PostgreSQL JDBC URL; use the hostname, port, and database name supplied
by your provider. For example, when the provider requires TLS:

```text
DB_URL=jdbc:postgresql://db.example.com:5432/outthere?sslmode=require
DB_USERNAME=provided_username
DB_PASSWORD=provided_password
```

In PowerShell, set them for the current terminal before starting the app:

```powershell
$env:DB_URL = "jdbc:postgresql://db.example.com:5432/outthere?sslmode=require"
$env:DB_USERNAME = "provided_username"
$env:DB_PASSWORD = "provided_password"
```

Use the provider's required SSL settings and network access rules. In particular,
allow connections from the app's runtime network and keep credentials in the
deployment platform's secret or environment-variable configuration, not in source
control. Liquibase and application queries use the same configured database.
