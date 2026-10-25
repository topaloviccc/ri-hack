# Course learning

The player uses PostgreSQL lessons and quizzes through real HTTP requests. The
optional seed supplies sample content in the same tables a future generation
process would populate. It does not call an LLM. Content marked `demo` is visibly
labelled in the app; progress, grading, completion and coin rewards are real.

## Course structure and import shape

`004-course-learning.sql` adds the source schema's `question_type`, `quiz`,
`question`, `answer_option`, `quiz_attempt`, `question_response`,
`course_completion_quiz_result` and `course_completion_reward` tables.
Existing `lesson`, enrollment, entitlement, completion and wallet tables are reused.
No source CHECK constraints, validation triggers or stored functions are installed.

An answerable version has ordered lessons (`lesson.position`), one quiz per
lesson (`quiz.lesson_id`), and exactly one final quiz (`quiz.lesson_id IS NULL`).
The sequence is lesson 1, quiz 1, lesson 2, quiz 2, ..., final summary quiz.
Lesson `content_json` uses `{ "format": "markdown", "markdown": "## Section...", "demo": true, "estimatedMinutes": 6 }`.
Lesson time estimates are optional. The native Markdown renderer supports headings,
emphasis, lists, tables, callouts, hosted images/links, code blocks, tappable
reflection checklists and expandable worked examples. Top-level headings retain
the reading-card layout. The response's `text` field contains Markdown source;
legacy JSON `text` remains supported. See the [Markdown authoring contract](dev/content/MARKDOWN.md).
The outline returns `estimatedMinutes` from the pinned course version, alongside
each lesson's estimate. The target is **20–40 minutes for an entire course**,
including its lessons, reflection and quizzes, not 20–40 minutes per lesson.
Future imported content can omit `demo` or set it false. Questions use ordered
prompts and `answer_option` rows with `is_correct`; explanations appear after
submission. On-demand course generation populates the same structure through the
Courses search flow; see [generation setup and contracts](GENERATION.md).

The player supports `SINGLE_CHOICE`, `MULTIPLE_CHOICE` and `TRUE_FALSE`.
Multiple choice requires the exact correct option set, with no partial credit.
`SHORT_ANSWER` and `MATCHING` remain schema codebook values but their rendering
and grading are deferred. Attempting an unsupported question type returns 409.
`grading_json` is retained but unused by these choice-based question types.

## Progress, scoring and rewards

- The learner must own the course. Unlocking and starting are separate operations.
  Starting creates/reuses an enrollment and pins its version; a later published
  version does not replace that enrollment's content.
- Marking a lesson read unlocks its quiz. Submitting the quiz unlocks the next
  lesson, regardless of its score. Every lesson and quiz is required, including
  the final quiz. Future lesson text and quiz questions remain unavailable until
  their preceding steps have been completed.
- Retries are unlimited. The best submitted attempt per quiz counts, measured by
  the number of fully correct questions. A weaker retry cannot lower the score.
- **Every question counts equally across all quizzes.** Passing requires all
  lessons read, all quizzes submitted and `correct_count * 5 >= question_count * 4`.
  The comparison happens before percentage rounding. A final quiz with more
  questions therefore has proportionately more influence.
- This is an explicit product change from `worldlearn.sql`, whose original
  stored functions average quizzes equally. That reference file is not executed.
  Completion `score_sum_numerator` now records correct questions and
  `score_sum_denominator` records total questions; `quiz_count` is still stored.
- A first passing submission saves completion, the best-attempt snapshot for
  every quiz, enrollment completion and the promised coin reward atomically.
  Reward amount comes from the entitlement's acquisition-time promise, not a
  subsequently edited course reward. A course pays at most once per learner,
  across versions and retries. Zero rewards create a marker without a ledger row.
- Starts, lesson writes and submissions lock the learner's wallet first, using
  the same order as purchases. Repeat submissions with the same idempotency key
  and answers return the existing attempt; changed answers/quiz with that key
  return 409. A failed transaction saves neither answers nor completion/reward.
- Course progress bars measure read lessons plus submitted quizzes. Reading and
  submitting every step can reach 100% of content while an overall failing score
  still requires a quiz retry. Passed courses leave Continue and appear in the
  existing completion/profile/network queries.

Old seeded completion history remains historical sample data. Retaking an already
completed sample course does not backfill coin rewards. New completed attempts
and rewards are saved through the player. Unsubmitted quiz selections are local
form state and are lost on exit/reload; submitted attempts and step progress persist.

## HTTP contracts

All paths below start with `/api/courses/{courseId}/learning` and require the
signed-in user's bearer token.

| Method | Suffix | Result |
| --- | --- | --- |
| GET | empty | Course outline, pinned version/enrollment, available lesson text, step locks, best scores, completion and reward amounts |
| POST | `/start` | Idempotently start/resume; return updated outline |
| POST | `/lessons/{lessonId}/complete` | Mark an available lesson read; return updated outline |
| GET | `/quizzes/{quizId}` | Available quiz prompts and option IDs/text; no answer keys or explanations |
| POST | `/quizzes/{quizId}/attempts` | Grade a complete submission; return attempt score, per-question feedback and updated outline |

Submission requires `Idempotency-Key` and a JSON body:

```json
{
  "answers": [
    { "questionId": "question-uuid", "optionIds": ["selected-option-uuid"] }
  ]
}
```

Every question must appear exactly once; option IDs must belong to that question.
Single choice and true/false require one selected option. Incomplete or malformed
answers return 400. Locked steps, unowned/unstarted courses, unavailable course
content and conflicting submission keys return 409. No client-supplied scores,
completion flags or reward amounts are accepted.

## Local sample content

Fresh setup: apply migrations and load `dev/demo-data.sql` as described in the
root README. It includes the original 48 short sample courses plus one full-length
course: **Mount Etna: life on a living volcano**. The new course has four longer
lessons and reflection activities, 12 lesson-quiz questions and six final questions.
Its estimated workload is 30 minutes; it is free and granted to Demo Learner.
Across 49 courses there are 196 lessons, 245 quizzes and 642 questions.
See [the sample content notes](dev/content/etna/README.md) for sources and timing.
Draft courses stay hidden; owned archived courses remain available.

Existing demo database: restart the backend to apply `004-course-learning.sql`,
then run from the repository root:

```powershell
docker cp backend/dev/demo-learning.sql outthere-postgres:/tmp/outthere-demo-learning.sql
docker exec outthere-postgres psql -U outthere -d outthere -v ON_ERROR_STOP=1 -f /tmp/outthere-demo-learning.sql
```

This adds learning content, provisions the new long course, and replaces only old
lesson placeholders. It normalises known sample duration estimates to 20–40 minutes;
the deliberate missing-duration example remains null. Known unedited legacy demo
bodies are upgraded to explicit Markdown format without changing quiz records. It
preserves edited content, attempts, progress, balances and completed history.
Sample content is optional and never runs as a production migration.

To regenerate committed sample SQL after intentional content changes:

```powershell
node backend/dev/generate-demo-learning.cjs
node backend/dev/generate-demo-data.cjs
```

Mobile dependencies must be installed for regeneration; loading the committed
SQL requires no Node packages. Reseeding preserves existing question/option rows;
new authored content should use a new version rather than modifying attempted
content. The sample facts are demonstration material, not reviewed courseware.

Open **Mount Etna: life on a living volcano** (already owned and not started in a fresh
seed), select Start course, then Start learning. Read a lesson, answer its quiz,
and proceed through the final summary. Try a wrong answer, a retry, leaving and
returning, and completion at or above 80%. The wallet, profile statistics and
network views refresh after saved learning activity.
