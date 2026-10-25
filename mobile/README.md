# Mobile app

Expo SDK 58 · Expo Router · TypeScript · NativeWind · TanStack Query. Rules: `CLAUDE.md`. Product: `PROJECT.md`. Deferred work: `BACKLOG.md`.

## Run on your phone
Configure the backend URL and viewer UUID in `.env.local` first; see
[API.md](API.md) and [.env.example](.env.example). Core screens use the backend;
unsupported details remain visibly labelled demo content.

Course details now open a lesson/quiz player with saved progress, a final summary
quiz, unlimited retries and server grading. Every question counts equally; the
best attempt per quiz counts and 80% overall passes after all steps are complete.
The backend pays the promised completion reward once per course. Lesson and quiz
text comes from optional database sample content, visibly labelled Demo; no LLM
is called. Existing databases need the new learning migration and
`backend/dev/demo-learning.sql`; see [the learning guide](../backend/LEARNING.md).

The course path uses photo covers, clear locked/ready/completed cards, and one
Start/Continue action. Content progress includes the final quiz and is separate
from the overall quiz score. Completed history remains visibly completed.
Course durations target **20–40 minutes total**. The one full-length mock is
**Mount Etna: life on a living volcano**: 30 minutes across four sectioned lessons,
reflection activities and 18 questions. It is already granted to Demo Learner.
Other courses retain short placeholder text; their estimates are target metadata.

Lesson material is interpreted as Markdown using a pure JavaScript parser and
native components. Headings, emphasis, lists, tables, callouts, links/images and
code blocks render directly in the reader. Reflection checklists are tappable;
worked examples expand on demand. Quiz grading is unchanged. See the
[Markdown authoring guide](../backend/dev/content/MARKDOWN.md) for future content.

Countries now use the full production catalogue of 249 ISO 3166-1 alpha-2 countries
and territories. The backend supplies English display names, ISO codes, counts
and image flag URLs. Flags load directly from FlagCDN and are shown throughout
country browsing, maps, courses/places and profiles/badges. Country introductions
remain labelled demo text. No flag image files or bucket are stored locally;
the phone needs internet access to FlagCDN. No CDN credentials are required.
For an existing checkout, restart the backend to apply the country migrations
through `003-hosted-country-flags.sql` and reload Expo; no database reset or demo reseed is needed. Full setup is in the
[root README](../README.md), and data sources are in
[backend/reference/README.md](../backend/reference/README.md).

1. Install **Expo Go** (iOS App Store / Google Play). It must support SDK 58.
2. `npm install`
3. `npm start` and scan the QR code (iOS: Camera app, Android: Expo Go). Phone and laptop on the same Wi-Fi; otherwise `npx expo start --tunnel`.

## Checks
| Command | What |
|---|---|
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (expo config) |
| `npm test` | Jest + React Native Testing Library smoke tests (`src/__tests__`) |
| `npm run check` | all three |
| `npm run format` | Prettier (sorts Tailwind classes) |

## Theme
Colors live in `src/lib/theme.ts` (light + dark) and reach Tailwind as CSS variables: use `bg-primary`, `text-muted`, etc.
Fonts: Plus Jakarta Sans (`font-sans*`), Instrument Serif (`font-serif`, `font-serif-italic`), JetBrains Mono (`font-mono*`).
