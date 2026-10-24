# Codebooks

Codebooks are public, read-only lookup lists. Each codebook has its own table
containing exactly `id` and `label`. Controller, service, and repository beans
are shared; adding a codebook needs only a definition and a migration.

The WorldLearn schema definitions register `difficulties` -> `difficulty` and
`fields` -> `field`, preserving UUID IDs. Definitions can use
`super("fields", "field", true)` for an explicit schema table and UUID identifiers.
Existing definitions using the one-argument constructor retain numeric IDs and
the derived `codebook_*` table name. Only registered definitions choose tables;
HTTP input never selects an arbitrary SQL identifier.

Create a definition below the `ri.hack.outthere` package:

```java
package ri.hack.outthere.course.model;

import org.springframework.stereotype.Component;
import ri.hack.outthere.codebook.model.AbstractCodebook;

@Component
public final class CourseLevels extends AbstractCodebook {
    public CourseLevels() {
        super("course-levels");
    }
}
```

The table name is derived automatically: `course-levels` maps to
`codebook_course_levels`. Keys use lowercase kebab-case and at most 54
characters, keeping derived table names within PostgreSQL's 63-byte limit.
Duplicate registered keys fail startup. Only registered codebooks are exposed;
request input cannot select an arbitrary table.

Create and seed the table in a new Liquibase SQL changelog:

```sql
--liquibase formatted sql
--changeset outthere:001-course-levels
CREATE TABLE codebook_course_levels (
    id BIGINT PRIMARY KEY,
    label VARCHAR(255) NOT NULL
);

INSERT INTO codebook_course_levels (id, label) VALUES
    (1, 'Beginner'),
    (2, 'Intermediate'),
    (3, 'Advanced');
```

Include the file in `src/main/resources/db/changelog/db.changelog-master.xml`:

```xml
<include file="001-course-levels.sql" relativeToChangelogFile="true"/>
```

Use the existing Liquibase setup to manage tables and entries. IDs are stable
numbers or UUIDs assigned in migrations; update labels without changing IDs. Applied
migrations stay immutable: use new changesets for later changes. Other tables
can reference the codebook table's `id` directly with an ordinary foreign key.

The shared API exposes:

- `GET /api/codebooks` lists registered keys alphabetically.
- `GET /api/codebooks/course-levels` lists entries ordered by ID.
- `GET /api/codebooks/course-levels/1` returns `{"id":1,"label":"Beginner"}`.

Unknown keys and missing entries return HTTP 404 with Problem Detail responses.
Invalid IDs for the registered numeric/UUID type return HTTP 400. A registered codebook with an
empty table returns `[]`. Registering a codebook requires its table migration;
no tables are created automatically. Production registers only `fields` and
`difficulties`; difficulty labels are seeded from `worldlearn.sql`, and fields
remain empty until provisioned.

These endpoints have no write operations. Keep private or user-specific data
outside this shared mechanism.

Run `./mvnw test` with Java 21 and Docker available. Integration tests use
disposable PostgreSQL 16 containers and Liquibase migrations, including test-only
codebook tables. They do not use the configured application database.
