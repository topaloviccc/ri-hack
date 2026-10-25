# Course recommendations

New accounts choose any number of database learning fields after registration.
Skipping saves an empty selection and completes onboarding. Existing accounts
keep their current flow and can change interests in **Settings → Learning interests**.
Selections and swipe feedback belong to the authenticated user and survive login
and app restarts. Updating interests replaces the complete selection atomically.

## Start semantic recommendations

Set `OPENAI_API_KEY` in the environment of the **backend process**, then restart
the backend. Never put this key in an `EXPO_PUBLIC_*` variable or commit it.
When started from `backend/`, the backend also loads the ignored `backend/.env`
file as plain `KEY=value` properties. Process environment variables take precedence.

```powershell
cd backend
# Set OPENAI_API_KEY securely in this terminal's environment before this command.
.\mvnw.cmd spring-boot:run
```

The default model is `text-embedding-3-small`, through Spring AI 2.0.2. Override
`EMBEDDING_MODEL` deliberately if needed. No OpenAI calls happen on swipes or feed
reads: the worker embeds public, published courses in the background, starting
10 seconds after boot. It processes one course every two seconds plus provider
latency. New courses and edited titles, descriptions or field labels are detected
automatically. The input is the title, description and sorted category labels,
limited to the first 2,000 characters to stay within the model's input budget.
Only course content is sent to OpenAI, never user interests or swipe histories.

See the [OpenAI embeddings guide](https://developers.openai.com/api/docs/guides/embeddings)
for the embedding model and API contract.

Vectors persist in PostgreSQL `real[]` columns, keyed by course, model and a hash
of the actual input. Editing content immediately excludes its old vector from
ranking, even before re-embedding. Missing vectors do not block browsing: category
matches, behavior and popularity still rank courses. Without a key, the worker
logs a warning and pauses; already cached vectors remain usable.

Set `EMBEDDING_WORKER_ENABLED=false` to pause generation explicitly. Tests disable
the worker and mock external providers. No API key is required to run the tests.

## Signals and ranking

Both `collection=recommended` and `collection=feed` use the same ranking:

- Selected categories: direct matches plus similarity to the category courses'
  average embedding.
- Right/open: positive semantic signal, weight 0.8.
- Left/dismiss: hide the course and reduce similar courses, weight -1.25.
- Down/next: 10+ seconds of foreground viewing adds a weak positive signal (0.2);
  a measured view shorter than 2.5 seconds adds a weak negative signal (-0.15).
  Intermediate viewing times are neutral. Hints, other screens and background
  time are excluded, and reported dwell time is capped at two minutes.
- Learning history: started courses add 0.6, completed courses add 1.0.
- Small popularity and unseen-course bonuses, and lower priority for completed
  courses. Every fifth item explores an uncovered category when available.

Explicit dismissals take precedence over positive signals. Feedback is bounded
per user/course: opening is a boolean and dwell time stores the maximum reported
view, so retries and repeated swipes do not amplify the profile without limit.
Similarity uses cosine similarity of normalized positive and negative centroids;
category behavior also works before vectors are available. Stable ID tie breaks
keep refreshes predictable.

The mobile feed keeps visited cards for the previous gesture, and asks for a
fresh ranking after saving each forward swipe or dismissal. It excludes cards
already visited in that feed session. Feed exhaustion offers a retry for new
courses rather than repeating the same course forever. Saving failures show an
error and leave the current card retryable.

The catalogue is intentionally small: ranking scans the published catalogue and
computes vector similarities in Java. This avoids requiring pgvector for the
existing PostgreSQL installation. A large catalogue should add bounded candidate
retrieval and vector indexes before scaling this implementation.

## Endpoints

All endpoints require a bearer token; no caller-supplied user ID is accepted.

| Method | Path | Contract |
| --- | --- | --- |
| GET | `/api/codebooks/fields` | Existing `{id,label}[]` category catalogue |
| GET | `/api/users/me/interests` | `{fieldIds: UUID[], onboardingComplete: boolean}` |
| POST | `/api/users/me/interests` | Body `{fieldIds: UUID[]}`; replaces interests; empty means skip/clear; returns saved state |
| POST | `/api/courses/{id}/feedback` | `{action: "OPEN" \| "NEXT", dwellMs: integer}`; 0–120000; 204 |
| POST | `/api/courses/{id}/dismiss` | Existing no-body action; 204 |

Feedback and dismissals require the course to be accessible to the viewer.
Unknown category IDs and invalid feedback are rejected without partial writes.

## Worker recovery

`course_embedding` doubles as a durable work queue. A short atomic statement
claims a two-minute lease using `FOR UPDATE SKIP LOCKED`. Provider calls happen
outside transactions. Failed or interrupted jobs become eligible when that lease
expires; after five attempts they stop. Model/content changes reset the job.
Completion checks the model, input hash and claim attempt, so stale workers cannot
overwrite newer claims. Warnings contain course IDs and exception types, never
provider response bodies or credentials.

Inspect progress without exposing vectors:

```sql
SELECT count(*) FILTER (WHERE embedding IS NOT NULL) AS ready,
       count(*) FILTER (WHERE embedding IS NULL AND attempts < 5) AS pending,
       count(*) FILTER (WHERE embedding IS NULL AND attempts >= 5) AS failed
FROM course_embedding;
```

After fixing a provider/account issue, explicitly retry exhausted jobs:

```sql
UPDATE course_embedding SET attempts=0,next_attempt_at=now()
WHERE embedding IS NULL AND attempts>=5;
```
