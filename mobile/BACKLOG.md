# Backlog — deferred on purpose

Everything we knowingly skipped. Code shortcuts carry `// TODO(hack):` or `// shortcut:` comments that point here.
When you defer something, add it here; when you build it, delete the line.

## Connected backend and demo boundaries
Core data and mutations now use Spring Boot. Setup, endpoint mapping and remaining
demo fields are documented in `API.md` and `../backend/SCOPE.md`.
- [ ] **Unsupported demo content** — images, bios, country introductions, location types/cities, event categories/cities/languages/paid prices, expert applications and weekly challenges remain visibly labelled demos by request. Replace them only after a schema/product decision.
- [ ] **Real event city filtering** — current city filters operate on demo city labels; the calendar defaults to all live events. The schema has no structured city field.
- [ ] **Verify mock content** — location coordinates and course facts were written from memory. Least certain: Ronda bullring, Las Ventas, Giverny, Camargue, Krka, St John Fortress, Our Lady of the Rocks, Skadar/Virpazar, Path of Philosophy, Jigokudani, Al-Muizz Street, Ranthambore, Sacsayhuaman, Qorikancha, Heron Island, Port Arthur, MCG, Strokkur, Thingvellir, Jökulsárlón, Etna, Blue Lagoon, Abu Simbel. Event coordinates are approximate too.

## Screens / features
- [ ] **Lesson player** — "Start course"/"Continue" on course details shows a "coming soon" alert (spec F3).
- [ ] **Edit profile** — button on your own profile shows "coming soon".
- [ ] **Profile privacy** — other people's profiles show completed courses to everyone; rules come with the backend.
- [ ] **Friend requests: accept/decline, unfriend, incoming requests** — only "send request" exists; it now persists in the backend.
- [ ] **Global leaderboard** — Leaderboards shows friends only, this week only.
- [ ] **Weekly challenge tap** — card does nothing when tapped; more than one challenge.
- [ ] **Feed "see all"** — feed card shows the 5 latest completions only.
- [ ] **Saved events / registered state, capacity** (spec F17) — Register just opens the external link.
- [ ] **Search** on Home (spec F2).
- [ ] **Spec's swipe-up "defer with cooldown"** on the explore card.

- [ ] **What an approved expert can do** — approval changes nothing yet (no profile badge, no course review; spec F14 `expert_field_grants`).
- [ ] **Expert requests: real upload, withdraw/edit, camera capture, several files** — the certificate is only picked locally; requests live in memory (`features/experts/api/experts.api.ts`).

- [ ] **Earning coins** — no credit/reward API yet; the displayed balance and unlock charges come from the backend. The coins sheet says "coming soon".

## Behaviour
- [ ] **Infinite feed** — Scroll feed is a finite list ending in "all caught up". Move to `useInfiniteQuery` with the real API.
- [ ] **Concepts without locations on the map** — country-level concepts only show via the selected-country card and Country page.

## Map
- [ ] **Real map tiles** — the Courses map is drawn with Skia from Natural Earth 50m outlines (no streets, no city labels). For street-level detail, move to MapLibre (needs development builds).
- [ ] **Pins can't start a pan** — a drag that begins on a pin doesn't move the map.
- [ ] **Clustering at scale** — `map/cluster.ts` is O(n²); fine for dozens of towns, switch to supercluster for thousands.
- [ ] **Country names/flags in other languages** — English names from Natural Earth.

## Platform / infra
- [ ] **Auth** — excluded from this integration; "me" comes from `/users/me` using the configured `EXPO_PUBLIC_USER_ID`. Tokens → `expo-secure-store` when authentication is added.
- [ ] **Development builds** — NFC needs a development build (`npx expo run:android` or `eas build --profile development`); Expo Go still runs everything else, just without NFC. MapLibre will need one too.
- [ ] **NFC on iOS** — `features/nfc` only listens on Android. iOS needs a paid Apple account (NFC entitlement) and a "Scan tag" button, since iOS can't read tags in the background.
- [ ] **NFC beyond the popup** — tags are only read and shown (spec F9). No visit check-in/badges/backend call, no "NFC is off" notice, and tapping a tag while the app is closed doesn't open it (needs an Android intent filter).
- [ ] **i18n** — English only; event languages are a hand-mapped list in `features/events/categories.ts`.
- [ ] **Map colours as a prop** — the map palette lives in `lib/theme.ts` tokens (`map*`); expose a per-map override if a screen ever needs a different scheme.
- [ ] **Jest Reanimated/Skia stubs** — `jest.setup.ts` stubs Reanimated because its v4 mock crashes; delete the stub when upstream fixes it.
- [ ] **App identity** — name/slug/scheme are still `mobile`; icons and splash are Expo defaults.
