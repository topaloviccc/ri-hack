# Production country reference data

Countries are reference data, shipped by Liquibase in every environment. They are
independent of the optional catalogue and demo learner.

`countries.json` contains all **249 ISO 3166-1 alpha-2** country/territory codes and
their English display names. Names use `common_name` where available, otherwise
`name`, from the [pycountry ISO data snapshot](https://github.com/pycountry/pycountry/blob/e974d00d5ead823a48d6944a6df1696e95e507e3/src/pycountry/databases/iso3166-1.json),
derived from Debian's iso-codes project. This projection was made on 2026-10-25;
the upstream data is distributed under LGPL 2.1, included in
[ISO-DATA-LICENSE.txt](ISO-DATA-LICENSE.txt). Only code/name data is used; no
pycountry library is installed. Names are English display names rather than
formal constitutional titles. Alpha-3 codes, numeric codes, subdivisions and
translations are not currently exposed by the app.

`002-iso-countries.sql` adds `country.flag_url` and upserts these codes, names and
image paths. New rows use deterministic UUID v5 IDs; existing rows keep their
UUIDs and references. It updates names/flags by ISO code and does not delete
application records. The original `001-worldlearn.sql` remains unchanged. No
schema CHECK constraints, validation functions or triggers are added.

`003-hosted-country-flags.sql` converts the original backend-relative paths into
absolute HTTPS URLs: `https://flagcdn.com/w160/{lowercase-alpha2}.png`. It leaves
already-customized URLs unchanged. The previous changeset remains unchanged
because it has already been applied to local databases.

The frontend loads flag images directly from
[FlagCDN / Flagpedia](https://flagpedia.net/download/api). No flag files are
stored in the repository, app bundle or backend package. No bucket, credentials,
image proxy or startup download is involved. The phone needs internet access to
FlagCDN; hosted images introduce an external availability dependency. Names and
ISO codes remain database reference data and do not depend on the CDN.

To update the reference catalogue, review the ISO changes, update this snapshot
and flag URLs, and add a **new** Liquibase changeset. Do not rewrite an
already applied changeset or generate production countries from mobile demos.
Migration tests cover fresh startup, existing country/user references, balances
and the hosted URL contract without requiring internet access in automated tests.
