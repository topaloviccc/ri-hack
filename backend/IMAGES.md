# Course and place cover photographs

Retrieved photographs are the primary covers for courses and places. The backend
searches Wikimedia Commons and uses a model to choose a relevant result. It never
accepts model-invented image URLs. Text generation and map validation remain
independent of image lookup: a missing photo does not invalidate a course.

## Setup

The existing server-side `OPENAI_API_KEY` enables search planning and selection.
Commons needs no additional API key. Optional `backend/.env` settings:

```dotenv
COVER_IMAGE_MODEL=gpt-4.1-mini
COVER_IMAGE_WORKER_ENABLED=true
IMAGE_SEARCH_USER_AGENT=OutThereCourseImages/1.0 (educational course covers)
```

Start Maven from `backend/` and restart after changing settings. The image model
is independently configurable; upgrading it does not change the course-writing
model. Selection uses file titles, descriptions and geographic context, rather
than a separate visual-verification model. No image generation API or storage
bucket is required. Production deployments can include contact information in
the descriptive user agent.

Restart applies `009-cover-images.sql`: nullable `cover_image` JSONB on courses
and places, and a durable image-job queue. Existing lessons, attempts, purchases
and metadata are preserved.

## Retrieval and attribution

The model proposes at most two short queries using the topic and verified place.
Commons returns up to six files per query. Candidates are deduplicated by page ID
and filtered for dimensions, JPEG/PNG/WebP type, author/source metadata and supported
CC BY, CC BY-SA, CC0 or public-domain licensing. Attribution HTML becomes plain text.
Media URLs must use HTTPS on exactly `upload.wikimedia.org` or `thumb.wikimedia.org`;
source pages must be Commons file pages. Licence URLs are checked against expected hosts.

The model selects an existing candidate ID or declines all candidates. It may write
a short caption, but the URL, source, author and licence come from Commons. The
chosen URL must respond to HEAD with HTTP 200 and an image content type; verification
does not follow redirects. URLs are hotlinked, with metadata stored in PostgreSQL.
Remote files can later disappear; the app keeps a neutral background rather than
substituting an unrelated photo. Source/author and licence links remain visible.

## Jobs and API behavior

New courses and resolved places enqueue image jobs atomically with publication.
They have priority over background discovery of missing covers on published public
courses and active places. Existing stored covers are never overwritten. Jobs are
unique per course/place, with QUEUED, RUNNING, READY, NOT_FOUND and FAILED states.

Claims use `FOR UPDATE SKIP LOCKED`, a unique token and a three-minute lease.
External calls happen outside database transactions. A successful image and target
update commit together. Expired workers cannot overwrite recovered jobs or existing
covers. Transient failures get at most three attempts; authorization failures stop
immediately. No suitable result becomes NOT_FOUND. Finished jobs are not rediscovered.
Missing model configuration pauses the worker.

Course/location responses, including nested course locations, include nullable
`coverImage` and Boolean `coverImagePending`. Image fields are `url`, `sourceUrl`,
`author`, `license`, `licenseUrl`, `caption`, `width`, `height`. Details poll every
three seconds while pending; lists poll every five seconds. Polling stops for
terminal states. Cards, reels, maps, place rows and detail screens use the real URL.
The mobile adapter no longer assigns random demo cover images. Other demo fields,
such as place kind/city, remain labelled.

Administrators can inspect the queue with:

```sql
SELECT state, count(*) FROM cover_image_job GROUP BY state;
```

After correcting configuration or changing the model, retry unsuccessful lookups explicitly:

```sql
UPDATE cover_image_job SET state='QUEUED', attempts=0, available_at=now(), message=NULL
WHERE state IN ('FAILED','NOT_FOUND');
```

## Verification

Commons HTTP-stub tests cover attribution cleanup, licensing, thumbnail hosts and
empty/error responses. Model tests reject invented candidate IDs and preserve real
URLs/credits. PostgreSQL integration tests cover discovery, publication/API mapping,
missing images, lease recovery and preserving existing covers. Scheduled provider
calls are disabled in ordinary tests. A live Java lookup for Trsat Castle also
selected a relevant photo, verified HTTP 200, and retained author/licence metadata.

References: [image metadata API](https://www.mediawiki.org/wiki/API:Imageinfo),
[search API](https://www.mediawiki.org/wiki/API:Search), and
[Commons reuse guidance](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia).
