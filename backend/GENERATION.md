# Search and on-demand course generation

The Courses screen searches titles, descriptions/topics and subject labels through
`GET /api/courses?query=...`. Search combines a case-insensitive literal title
substring with PostgreSQL English full-text matching (including word stemming).
Subject matching uses a case-insensitive literal substring. Existing collection,
country, location, ownership and publication filters still apply. Blank search
retains normal browsing; input is trimmed, whitespace-normalized and limited to
200 characters. Search does not call a model or require embeddings.

An empty successful search displays exactly one creation row. Tapping **Create
course** submits the searched topic; typing or searching alone never generates
content. The saved job is restored when searching the same topic again, including
after an app restart. Creation can continue while the user leaves the screen.

## Server setup

Set these environment variables in the backend process, or put plain `KEY=value`
entries in the ignored `backend/.env` and start Maven from `backend/`. Environment
variables take precedence over that file. Restart after changing configuration:

```dotenv
OPENAI_API_KEY=your-server-side-key
COURSE_GENERATION_MODEL=gpt-4.1-mini
GEOCODER_URL=https://geocode.maps.co
GEOCODER_API_KEY=your-maps-co-key
GEOCODER_AUTH_MODE=query
GEOCODER_MIN_INTERVAL_MS=1000
GEOCODER_USER_AGENT=OutThere/1.0 (your contact information)
```

`COURSE_GENERATION_MODEL` is optional and shown with its default. The model must
support Chat Completions structured outputs. `GEOCODER_URL` is required and has
no public-service default. The maps.co base URL is `https://geocode.maps.co`,
without `/search` or the API key appended. Use `GEOCODER_AUTH_MODE=query` for maps.co:
its search endpoint was observed returning a missing-key 401 for authenticated
header requests while the same key worked as its documented `api_key` parameter.
The backend adds and encodes this parameter itself; never log request URLs or
provider exception messages. Other providers can use `GEOCODER_AUTH_MODE=header`
(the default) to send `Authorization: Bearer`. The default request spacing is 1,000 ms for the
free plan. This limit applies per backend instance; multiple instances sharing a
key need a shared rate limiter. A self-hosted Nominatim-compatible endpoint can
omit `GEOCODER_API_KEY` and adjust `GEOCODER_MIN_INTERVAL_MS` to its allowed rate.
The base URL must serve `/search`. Requests are serial and bounded by HTTP timeouts. Missing
model or geocoder configuration returns a readable 409 when creation is requested;
catalogue search continues working. Credentials stay on the server.

Liquibase applies `007-course-generation.sql` at startup. It adds durable jobs,
geocoder identities/attribution and the seven standard subjects if absent.
`008-generation-repair.sql` adds the durable limit for one automatic correction
per creation run. Restart the backend to apply it; existing job IDs are preserved.
No demo seed is necessary for generation. No migration modifies existing lessons,
attempts, purchases or country records.

## Authoring and validation

The model receives [the complete Markdown authoring template](src/main/resources/prompts/course-generation.md)
as its system prompt, the searched topic as user input, and the JSON schema derived
from `GeneratedCourse`. This JSON envelope contains metadata, objectives, 1–5 real
place names, 3–5 ordered Markdown lessons with paired quizzes, and one final quiz.
Lesson Markdown follows [the existing format](dev/content/MARKDOWN.md).
The provider's structured-output schema enforces lesson/quiz/option counts,
supported question types, difficulty values, country-code syntax and individual
duration ranges. The final quiz uses a separate schema definition (5–8 questions)
from lesson quizzes (2–4), even though both share a Java record. These requirements
are sent as native JSON Schema constraints for both generation and correction;
they are not only prose instructions checked after generation.
Every successful output must include a description, a known country and subject,
country-association rationale, difficulty, a 20–40 minute total estimate, lesson
estimates, complete questions, answer keys and explanations. Paired quizzes have
2–4 questions; the final has 5–8. Only the player's three supported choice question
types are accepted. Place names must appear in lesson material and at least one
place must be assessed. These structural checks cannot independently verify every
educational fact or the model's judgment about dominant country association.
Place mentions ignore accents and punctuation, and any supported Markdown heading
level is accepted; valid lessons do not have to start with exactly `## `.

Parsed model output is saved before validation, so a rejected draft remains
available for server-side diagnosis without being published or exposed through
the job API. Validation failures include the specific field/quiz or place index
and an application-authored reason. The old generic validation message discarded
this distinction between content errors, missing places and ambiguous map results.

For content or geographic validation failures, the worker sends the previous
complete draft plus the precise failure back to the model for ONE correction.
The corrected draft must pass all content and geocoding checks again. The repair
of content or place data preserves previously valid course/lesson time estimates when the
lesson count is unchanged, so an unrelated location correction cannot introduce
an arithmetic inconsistency in that metadata. Timing-specific corrections may
change those estimates. The repair
budget is persisted before the call and cannot reset on a lease recovery or server
restart. The lease extends to eight minutes for the correction call. A subsequent
validation failure becomes FAILED with its specific reason. An explicit user retry
starts a fresh run and resets the correction budget. The prompt recommends only
the necessary 1–3 clear sites, with exact place-name mentions in lesson/quiz text;
one site satisfies the contract. Invalid or ambiguous geography is never silently
accepted or removed from an already authored quiz.

The model may return `refusalReason` with null course fields when the topic cannot
be dominantly connected to one country, is unsafe, or is too ambiguous. Refusal
reasons display in the row and do not create courses or invoke the geocoder.
Provider refusals with empty content receive a generic visible refusal message.
Truncated output is treated as a failure and retried, never published.

Place lookups are restricted to the chosen country and checked against the
provider's returned country code, OSM identity, valid coordinates and address.
Zero or multiple results, wrong-country results and duplicate resolved identities
reject the course. Coordinates are never supplied by the model. Verified places
are linked through `course_place`, visible in course geography and usable by the
existing map/location flows. Provider attribution is retained and displayed in
location details. An existing active place with the same provider identity and
country is reused; archived or conflicting-country identities are rejected.

All course/version/lesson/quiz/question/option/place writes and the READY job
transition occur in one transaction after the external calls finish. Generated
courses are public, marked `human_verified=false`, and cost a fixed **100 coins**
to unlock, with zero completion reward. The creator uses the existing purchase,
unlock and start flow. Creation itself has no fee, and existing course prices stay
unchanged. Successful content uses the same grading, progress and player endpoints as
other courses, and becomes eligible for the existing embedding worker.
Course publication also queues independent cover-image lookups for the course and
its resolved places. Real photos and attribution are filled asynchronously; image
lookup failures never undo a valid course. See [cover photo setup](IMAGES.md).

## Job API and recovery

All endpoints require the signed-in user's bearer token; job lookups are scoped
to that user. The client cannot choose a creator ID, coordinates, price or reward.

| Method | Path | Behavior |
| --- | --- | --- |
| POST | `/api/course-generations` | Body `{ "query": "Kotor maritime heritage" }`; returns 202 and a job |
| GET | `/api/course-generations?query=...` | Restore the current user's saved job for a topic; empty body when absent |
| GET | `/api/course-generations/{id}` | Read an owned job; 404 for another user's job |

Job shape: `{ id, query, state, message, courseId }`. States are `QUEUED`,
`RUNNING`, `READY`, `REFUSED`, `FAILED`. The app polls active jobs every two
seconds and refreshes course/country/place queries after success.

Whitespace-normalized, case-insensitive topics are idempotent per user. Repeated
POSTs return the same job and eventual course. One active job per user is enforced
by a database unique index and a short user-row lock. Existing matching catalogue
content prevents a new generation request. Different users may independently
request equivalent topics; cross-user semantic deduplication is not implemented.

A worker claims jobs with `FOR UPDATE SKIP LOCKED` and a five-minute lease. Model
and HTTP timeouts are shorter than that lease. Transient failures recover after
the lease expires, up to three attempts; parsed model output is retained so a
geocoder retry does not call the model again. A restart can recover expired work.
Publication checks a unique lease token under a row lock so an old worker cannot
publish over a recovered attempt. Invalid content/geography gets the one bounded
correction described above before failing.
Provider 401/403 errors also fail immediately, with the provider and relevant
setting names shown in the job message; transient transport errors keep bounded
retries. Logs contain only the failed stage, HTTP status and exception type.
An explicit retry of a FAILED job clears the draft and starts a fresh bounded run.
Refused jobs remain refused; the user can search a more specific topic.

## Verification

`CourseGenerationIntegrationTests` exercises real PostgreSQL migrations/search,
job ownership and idempotency, publication into the existing player, refusals,
lease recovery, retry bounds and transactional rollback. `PlaceGeocoderTests`
uses a local HTTP stub for successful, missing, ambiguous, wrong-country and
invalid-coordinate responses. `GeneratedCourseValidatorTests` checks model
contract validation and strict provider-schema shape. Mobile `CourseSearch.test.tsx`
tests explicit creation, persisted refusals, retries and search errors.
Ordinary tests mock model calls; live provider calls are not part of the suite.

The integration follows [Spring AI's structured output API](https://docs.spring.io/spring-ai/reference/api/structured-output/converters.html),
[official OpenAI documentation for structured outputs and refusals](https://developers.openai.com/api/docs/guides/structured-outputs),
and [Nominatim's search API](https://nominatim.org/release-docs/latest/api/Search/).
Maps.co authentication and throttling follow [its API documentation](https://geocode.maps.co/docs/).
