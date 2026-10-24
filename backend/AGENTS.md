# Agent working agreement

Backend-only conventions for this learning application's Spring Boot repository.
Keep changes small enough to build, review, and demo during a hackathon.
Follow the existing codebase when it has an established pattern; these are
engineering guidelines, not a replacement for the product specification.

## Layout and ownership

Keep each feature's code together, with clear responsibilities inside it:

```text
<feature>/
  controller/   HTTP endpoints and request validation
  dto/          Request and response contracts
  service/      Use cases, business rules, authorization, transactions
  repository/   Persistence queries
  model/        Persistence entities and domain types
  mapper/       Reusable, explicit DTO/entity conversions when needed
  error/        Feature errors and API error translation when needed
```

- Follow the surrounding package layout when extending existing code. Do not
  reorganize unrelated packages to match this example or create empty layers.
- If the project has multiple modules, keep application startup, runtime config,
  and migration wiring in the runnable application module. Feature modules own
  their behavior. Shared API modules contain genuinely shared contracts, not
  feature internals. Do not introduce Maven modules just to mirror this repo.
- Keep dependencies directed: controller -> service -> repository. Controllers
  must not query repositories directly. Repositories must not construct HTTP
  responses. Share behavior through services or explicit contracts, not another
  feature's controller.
- Prefer concrete services with constructor-injected dependencies. Preserve
  existing service interfaces and `impl/` packages where used; introduce new
  interfaces for real boundaries or alternate implementations, not every class.

## Backend stack and dependency management

- Target **Java 21 LTS**, **Spring Boot 4.1.2**, **Spring AI 2.0.2**, and
  **Apache Maven 3.10.0** for this repository. Use Maven, not Gradle, unless the
  existing project already uses Gradle. Commit and use the Maven Wrapper to
  standardize the build tool version. Prefer stable GA versions, not milestones,
  release candidates, or snapshots. Update version pins only deliberately,
  after checking compatibility and running the relevant checks.
- Use the Spring Boot parent POM / managed dependency versions and import the
  Spring AI BOM. Do not independently pin Spring Framework, Spring Data,
  Hibernate, Jackson, or individual Spring AI modules without a concrete
  compatibility reason. Use Spring Boot 4-compatible starter coordinates.
- Build a **Spring Boot modular monolith**. Keep ordinary HTTP APIs and
  business logic in the application; use worker processes from the same
  codebase for background tasks when necessary. Do not add microservices,
  separate build modules, a new language runtime, or an orchestration platform
  merely for architectural symmetry.
- Use Spring MVC for REST endpoints, Spring Validation for input constraints,
  Spring Security for authentication/authorization, and Spring Data JPA where
  it fits the domain model. Use native SQL or JDBC for queries that are clearer
  or better supported outside JPA, including advanced spatial operations.
- Use **PostgreSQL** as the primary database, with **PostGIS** for geographic
  data and spatial indexing. Use relational constraints and transactions for
  authoritative state. Manage schema changes with **Flyway**; never rely on
  automatic ORM schema mutation in production. Validate spatial queries against
  PostgreSQL/PostGIS rather than an in-memory database substitute.
- Keep geographic identity and coordinates as application data, not as trusted
  output from an LLM. Resolve ambiguous locations through a verified
  geographic source; keep geocoding behind a service boundary. Expose
  map-friendly spatial APIs (for example, bounded viewport queries and GeoJSON)
  without coupling backend models to a particular mobile map library.
- Use **Spring AI** for model-provider integrations, prompts, and typed/structured
  output where appropriate. Keep model invocation behind services and validate
  untrusted model outputs. Do not call model APIs directly from controllers,
  repositories, or JPA entities. Keep model/provider choices configurable.
- Treat long-running or retryable operations as asynchronous when appropriate.
  Begin with durable database-backed jobs and a worker; include state, bounded
  retries, idempotency, and a way to observe failures. Never hold a database
  transaction open while waiting for an LLM or an external API.
- Use **S3-compatible object storage** for uploads/media. Keep credentials
  server-side and authorize access to private files; do not expose private
  object URLs or raw uploads through public API responses.
- Support recommendations initially with explicit user interests, course
  metadata, learning history, and understandable ranking logic. **Vector
  embeddings are optional**, not the whole recommendation strategy. Introduce
  PostgreSQL **pgvector** if semantic similarity or retrieval adds real value;
  combine it with structured preferences and behavioral signals rather than
  equating embedding similarity with personalization. Do not add a separate
  vector database or recommender service by default.
- Add infrastructure only for concrete needs. Prefer a single database,
  simple job processing, and ordinary observability before introducing Kafka,
  RabbitMQ, Kubernetes, a graph database, or Python-only ML services.
- Test database migrations, transaction boundaries, geographic queries,
  asynchronous retries, and security-sensitive persistence with integration
  tests where appropriate. Use Testcontainers with PostgreSQL and its required
  extensions for database-specific behavior. Mock external model/geocoding
  providers in ordinary tests; use explicitly opt-in live integration tests.

## DTOs, mapping, and use cases

- Keep API DTOs separate from persistence entities. Use descriptive request and
  response types; prefer records for new immutable contracts where the project
  supports them. Preserve existing class/builder DTOs when extending that flow.
- Keep controllers thin: bind and validate input, delegate, and choose the HTTP
  response. Services own business validation, access checks, and atomic writes.
  Use the existing exception/advice path for consistent API errors.
- Use explicit Java mapping. Simple conversions may use a private service helper
  or an existing DTO `from(...)` factory. Put reused or substantial conversion
  logic in a feature mapper. Follow the local convention without adding a
  mapping library or generic CRUD framework for a small feature.
- Mappers copy data; services load related entities, authorize operations, and
  orchestrate persistence. Keep database calls and business decisions out of
  mapping helpers. Do not return entities or lazy relationships as API payloads.
- For updates, load and modify the existing entity rather than reconstructing it
  from a partial DTO. Preserve IDs, ownership, audit fields, and relationships.
  Make omitted/null/empty-field behavior explicit and consistent with the API.
- Keep DTO validation, service normalization, entity fields, repository queries,
  and database constraints consistent. Apply schema changes through the target
  project's migration mechanism and include them in its migration wiring.
- Resolve the acting user through the existing identity provider/helper. Check
  resource access in the service and scope queries to the relevant user or
  resource; a caller-supplied ID is not proof of permission.

## Scope and collaboration

- Implement the smallest complete change. Reuse nearby patterns, keep unrelated
  cleanup out of the diff, and avoid speculative abstractions or dependencies.
  Complete affected callers, mappings, schema, and contracts together; minimal
  scope must still leave the code internally consistent and cleanly separated.
- Ask the user focused questions when requirements, API semantics, ownership,
  or tradeoffs materially affect the result. Inspect existing code first. Make
  routine reversible choices using local conventions and state key assumptions.
- Preserve the user's existing edits. Never commit automatically; commit only
  when the user explicitly requests it.

## Completion and review

- Before calling a change complete, review it as a separate pass. Encourage an
  independent agent review when available and proportionate to the change.
  Check layer boundaries, mapping completeness, update semantics, access/query
  isolation, compatibility, and unnecessary complexity. Resolve material findings.
- Run the relevant build/tests for changed behavior, including meaningful
  regression coverage for fixes. Use focused module checks where supported;
  include affected consumers when shared contracts change. Documentation-only
  edits need content and diff validation, not an application build.
- Inspect `git status --short`, `git diff --stat`, `git diff`, and
  `git diff --check`. Review staged changes and new untracked files separately;
  ordinary `git diff` does not show them. Confirm every intended file is present
  and no accidental files, unrelated edits, or dead code remain.
- Report what changed, which checks actually ran, and any unresolved limitations.
  Do not claim checks passed when they were skipped or blocked.

## Lessons learned

- Codebooks use a separate table per codebook with only `id` and `label`.
  The initial generic design assumed extra code, discriminator, and ordering
  columns; keep shared infrastructure in Java and follow this minimal table contract.

When a user correction or verified mistake reveals a reusable lesson, append a
short entry here: the mistake, its cause, and the concrete rule that prevents a
repeat. Keep lessons relevant to this project, avoid duplicates, and reconcile
them with existing guidance. Do not turn guesses or task history into rules.
