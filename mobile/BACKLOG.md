# Backlog — deferred on purpose

Everything we knowingly skipped. Code shortcuts carry `// TODO(hack):` or `// shortcut:` comments that point here.
When you defer something, add it here; when you build it, delete the line.

## Waiting on the database
The backend schema is in progress. When it lands: swap every `features/*/api/*.api.ts` body for api-client calls, align `types.ts` with the DTOs, delete the `*.mock.ts` files and `utils/mock-delay.ts`, and write `API.md`.
- [ ] **api-client request function** — `lib/api-client.ts` only has `ApiError`. Needs base URL from `EXPO_PUBLIC_API_URL` (`lib/env.ts`), auth header, timeout, normalized errors.
- [ ] **Cross-feature mock joins** — `features/network/api/network.api.ts` reads users/courses mock data to fill names and titles. The real API should return those fields; delete the imports then.
- [ ] **Verify mock content** — location coordinates and course facts were written from memory. Least certain: Ronda bullring, Las Ventas, Giverny, Camargue, Krka, St John Fortress, Our Lady of the Rocks, Skadar/Virpazar, Path of Philosophy, Jigokudani, Al-Muizz Street, Ranthambore, Sacsayhuaman, Qorikancha, Heron Island, Port Arthur, MCG, Strokkur, Thingvellir, Jökulsárlón, Etna, Blue Lagoon, Abu Simbel. Event coordinates are approximate too.

## Screens / features
- [ ] **Lesson player** — "Start course"/"Continue" on course details shows a "coming soon" alert (spec F3).
- [ ] **Edit profile** — button on your own profile shows "coming soon".
- [ ] **Profile privacy** — other people's profiles show completed courses to everyone; rules come with the backend.
- [ ] **Friend requests: accept/decline, unfriend, incoming requests** — only "send request" exists (mock, resets on restart).
- [ ] **Global leaderboard** — Leaderboards shows friends only, this week only.
- [ ] **Weekly challenge tap** — card does nothing when tapped; more than one challenge.
- [ ] **Feed "see all"** — feed card shows the 5 latest completions only.
- [ ] **Saved events / registered state, capacity** (spec F17) — Register just opens the external link.
- [ ] **Search** on Home (spec F2).
- [ ] **Spec's swipe-up "defer with cooldown"** on the explore card.

- [ ] **What an approved expert can do** — approval changes nothing yet (no profile badge, no course review; spec F14 `expert_field_grants`).
- [ ] **Expert requests: real upload, withdraw/edit, camera capture, several files** — the certificate is only picked locally; requests live in memory (`features/experts/api/experts.api.ts`).

- [ ] **Earning coins** — no way to earn coins yet; balance starts at 250 (mock). The coins sheet says "coming soon".
- [ ] **Real wallet ledger** — balance, unlocks and idempotency keys live in `features/wallet/api/wallet.mock.ts`; the courses mock reads lock state and prices from it. Server should own both (spec F6).

## Behaviour
- [ ] **"Less like this" persistence** — swipe-left only hides the reel locally (lost on reload). Needs a mutation + feed invalidation.
- [ ] **Infinite feed** — Scroll feed is a finite list ending in "all caught up". Move to `useInfiniteQuery` with the real API.
- [ ] **Concepts without locations on the map** — country-level concepts only show via the selected-country card and Country page.

## Map
- [ ] **Real map tiles** — the Courses map is drawn with Skia from Natural Earth 50m outlines (no streets, no city labels). For street-level detail, move to MapLibre (needs development builds).
- [ ] **Pins can't start a pan** — a drag that begins on a pin doesn't move the map.
- [ ] **Clustering at scale** — `map/cluster.ts` is O(n²); fine for dozens of towns, switch to supercluster for thousands.
- [ ] **Country names/flags in other languages** — English names from Natural Earth.

## Platform / infra
- [ ] **Auth** — no `(auth)` group, no login; "me" is mock user `u0`. Tokens → `expo-secure-store` per CLAUDE.md §6.
- [ ] **Development builds** — Expo Go is enough today; NFC (spec F9) and MapLibre will need `eas build --profile development`.
- [ ] **i18n** — English only; event languages are a hand-mapped list in `features/events/categories.ts`.
- [ ] **Map colours as a prop** — the map palette lives in `lib/theme.ts` tokens (`map*`); expose a per-map override if a screen ever needs a different scheme.
- [ ] **Jest Reanimated/Skia stubs** — `jest.setup.ts` stubs Reanimated because its v4 mock crashes; delete the stub when upstream fixes it.
- [ ] **App identity** — name/slug/scheme are still `mobile`; icons and splash are Expo defaults.
