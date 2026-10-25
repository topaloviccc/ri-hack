# Backlog — deferred on purpose

Everything we knowingly skipped. Code shortcuts carry `// TODO(hack):` or `// shortcut:` comments that point here.
When you defer something, add it here; when you build it, delete the line.

## Connected backend and demo boundaries
Core data and mutations now use Spring Boot. Setup, endpoint mapping and remaining
demo fields are documented in `API.md` and `../backend/SCOPE.md`.
- [ ] **Expert applications are a frontend demo** — no backend table or endpoints; requests live in memory and certificates are not uploaded (uploads are out of scope).
- [ ] **Verify mock content** — location coordinates and course facts were written from memory. Least certain: Ronda bullring, Las Ventas, Giverny, Camargue, Krka, St John Fortress, Our Lady of the Rocks, Skadar/Virpazar, Path of Philosophy, Jigokudani, Al-Muizz Street, Ranthambore, Sacsayhuaman, Qorikancha, Heron Island, Port Arthur, MCG, Strokkur, Thingvellir, Jökulsárlón, Etna, Blue Lagoon, Abu Simbel. Event coordinates are approximate too.

## Screens / features
- [ ] **More question types** - single choice, multiple choice and true/false are implemented; short-answer and matching rendering/grading remain deferred.
- [ ] **Quiz drafts** - unsubmitted selections are local form state and are lost on exit/reload; submitted attempts and reading progress persist.
- [ ] **Course content authoring and generation** - current lesson/quiz text comes from an optional database seed; no LLM/import/authoring APIs.
- [ ] **Spaced revision** - incorrect-answer revision scheduling is not part of the course player.
- [ ] **Benefits device acceptance** — verify coupon activation/code display, narrow layouts, large font sizes, Android back and iOS modal behavior on physical devices. Automated checks do not establish device acceptance.
- [ ] **Benefits beyond the current slice** — public commercial partner onboarding, push expiry reminders, offline merchant acceptance and merchant administration are deliberately deferred.
- [ ] **Edit profile** — not built; the button is hidden on your own profile until it is.
- [ ] **Profile privacy** — other people's profiles show completed courses to everyone; rules come with the backend.
- [ ] **Friend requests: accept/decline, unfriend, incoming requests** — only "send request" exists; it now persists in the backend.
- [ ] **Global leaderboard** — Leaderboards shows friends only, this week only.
- [ ] **Feed "see all"** — feed card shows the 5 latest completions only.
- [ ] **Saved events / registered state, capacity** (spec F17) — Register just opens the external link.
- [ ] **Search** on Home (spec F2).
- [ ] **Spec's swipe-up "defer with cooldown"** on the explore card.

- [ ] **What an approved expert can do** — approval changes nothing yet (no profile badge, no course review; spec F14 `expert_field_grants`).
- [ ] **Expert requests: real upload, withdraw/edit, camera capture, several files** — the certificate is only picked locally; requests live in memory (`features/experts/api/experts.api.ts`).


## Behaviour
- [ ] **Infinite feed** — Scroll feed is a finite list ending in "all caught up". Move to `useInfiniteQuery` with the real API.
- [ ] **Concepts without locations on the map** — country-level concepts only show via the selected-country card and Country page.

## Map
- [ ] **Real map tiles** — the Courses map is drawn with Skia from Natural Earth 50m outlines (no streets, no city labels). For street-level detail, move to MapLibre (needs development builds).
- [ ] **Pins can't start a pan** — a drag that begins on a pin doesn't move the map.
- [ ] **Clustering at scale** — `map/cluster.ts` is O(n²); fine for dozens of towns, switch to supercluster for thousands.
- [ ] **Localized country names** — current country names are English ISO reference display names from the backend; image flags are implemented. Translated names remain deferred.

## Platform / infra
- [ ] **Persistent web sessions** — `expo-secure-store` has no web implementation, so the web build keeps its token in memory and signs out on reload.
- [ ] **Account recovery** — no password reset, email verification or profile/password editing.
- [ ] **Development builds** — Expo Go is enough today; NFC (spec F9) and MapLibre will need `eas build --profile development`.
- [ ] **i18n** — English only; event languages are a hand-mapped list in `features/events/categories.ts`.
- [ ] **Map colours as a prop** — the map palette lives in `lib/theme.ts` tokens (`map*`); expose a per-map override if a screen ever needs a different scheme.
- [ ] **Jest Reanimated/Skia stubs** — `jest.setup.ts` stubs Reanimated because its v4 mock crashes; delete the stub when upstream fixes it.
- [ ] **App identity** — name/slug/scheme are still `mobile`; icons and splash are Expo defaults.
- [ ] **Server-side undo for "less like this"** — Undo is a 4 s client-side window before `POST /courses/{id}/dismiss` is sent; a dismissal made just before the app is killed is lost. An un-dismiss endpoint would let the save happen immediately.
