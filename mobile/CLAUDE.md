# CLAUDE.md — Mobile App Rules

Standing rules for the **mobile frontend only**. Hackathon topic: *promoting learning in the age of AI*.
Product idea, features and domain live in `PROJECT.md` (read it first). Deferred work lives in `BACKLOG.md`.
If a rule blocks progress, propose a change instead of silently breaking it.

## 1. Stack
React Native via **Expo** (managed workflow) · TypeScript (`strict`) · **Expo Router** (file-based) · TanStack Query · TanStack Form if needed · Tailwind via **NativeWind**.
Must run on iOS and Android. No web-only APIs or DOM elements. Prefer Expo SDK packages (`npx expo install`); ask before adding any other dependency.

## 2. Golden rules
1. **Modular and reusable.** One job per piece. Second copy → extract. Don't pre-abstract single-use code.
2. **API calls follow §5 exactly.** Components never call `fetch`.
3. **Server state lives in TanStack Query.** Never copy query data into `useState`.
4. **Dependencies flow downward** (§4). Lower layers never import higher ones.
5. **Type all boundaries** (props, API, route params). No `any`.
6. **Every async screen handles loading, error (with retry) and empty.**
7. **Small files.** ~150 lines or more than one responsibility → split.

## 3. Structure
```
src/
  app/                    # Expo Router screens + _layout.tsx files (thin!)
    (auth)/  (tabs)/      # route groups
  components/ui/          # primitives: Button, TextField, Card, Sheet...
  components/layout/      # Screen (safe area + padding), Header, TabBar
  components/shared/      # cross-feature composites: EmptyState, ErrorState, ListItem
  features/<feature>/
    api/                  # <f>.api.ts, <f>.queries.ts, <f>.mutations.ts
    components/  hooks/  types.ts
    index.ts              # the feature's public API
  lib/                    # api-client, query-client, storage, cn, env
  hooks/  utils/  types/  # generic only
```
- Create folders and files only when something goes in them. Follow existing layout; don't reorganize unrelated code.
- Import features only via `index.ts`. Features never import other features' internals; shared code moves to `components/shared`, `hooks` or `utils`.
- Use the `@/` alias. No `../../../`.

## 4. Component hierarchy
`app (screens) → features → shared → layout → ui` (each layer imports only layers to its right).

| Layer | Job | Fetches data? | Knows domain? |
|---|---|---|---|
| app | route → screen: read params, compose features | via feature hooks | yes |
| features | domain UI | yes, via feature hooks | yes |
| shared / layout | reusable composites, screen structure | no, props only | no |
| ui | pure, styled, accessible primitives | no | no |

- **Containers** (in features) call hooks and handle loading/error/empty; **presentational** components take props and emit callbacks only.
- Screen files contain no business logic or large JSX.
- **Reuse:** check `ui/` and `shared/` before creating a component. One component with `variant`/`size` props, not copies. Prefer `children`/composition over many boolean props. Primitives extend RN props (`PressableProps`, `TextInputProps`...), accept `className` (merged with `cn()`), and forward refs on inputs. Stateful reused logic → `useXxx` hook; pure logic → `utils/`.
- Every screen is wrapped in the shared `Screen` layout component (safe areas, padding, keyboard handling).

## 5. API
- **One client:** `lib/api-client.ts` owns base URL (from `env.ts`), headers, auth token, timeout, and throws a normalized `ApiError(status, message, details)`.
- On a physical device `localhost` is the phone, not your laptop: the base URL comes from `EXPO_PUBLIC_API_URL` (LAN IP or tunnel).
- **Per feature, three files:**
  - `*.api.ts` — plain typed functions per endpoint, REST naming: `list`, `getById`, `create`, `update`, `remove`. Map backend shapes here, never in components.
  - `*.queries.ts` — key factory + `queryOptions` + `useXxxQuery` hooks.
  - `*.mutations.ts` — `useXxx` mutation hooks that always invalidate/update affected keys.
```ts
export const lessonKeys = {
  all: ['lessons'] as const,
  list: (f?: LessonFilters) => [...lessonKeys.all, 'list', f ?? {}] as const,
  detail: (id: string) => [...lessonKeys.all, 'detail', id] as const,
};
export const lessonQueryOptions = (id: string) =>
  queryOptions({ queryKey: lessonKeys.detail(id), queryFn: () => lessonsApi.getById(id) });
```
- Never inline query keys. Reuse `queryOptions` in hooks and in `queryClient.prefetchQuery` (e.g. prefetch details on list item press-in).
- Request/response types mirror the backend DTO names (see `API.md`); UI-friendly domain types are mapped in `*.api.ts`.
- **Contract changes are atomic:** when an endpoint changes, update its types, api function, query keys, invalidations and callers in the same change.
- Update semantics are explicit: send PATCH bodies that match the backend's handling of omitted vs `null` vs empty fields.
- `lib/query-client.ts`: sensible `staleTime`, no retry on 4xx, and wire `focusManager` to `AppState` and `onlineManager` to NetInfo (RN has no window focus/online events).
- Optimistic updates only when UX clearly needs them.
- Backend not ready → mocks go **inside** `*.api.ts` so swapping is a one-file change.
- Once the first feature exists, it is the reference implementation for this pattern.

## 6. State
| State | Lives in |
|---|---|
| backend data | TanStack Query |
| which item / screen (IDs) | route params |
| filters, tabs, search text | screen state (route params if it must survive navigation/deep links) |
| forms | TanStack Form or local state |
| UI-only (open, pressed) | `useState` |
| global client (theme, auth user, toasts) | small, split React Contexts |
| persisted | auth tokens → `expo-secure-store`; non-sensitive prefs → AsyncStorage, via `lib/storage.ts` only |

Derive values instead of storing them; no `useEffect` to sync derivable state. Ask before adding a store.

## 7. Navigation and security
Expo Router only: navigate with `<Link>` / `router`, read params with `useLocalSearchParams` and validate/type them. Use typed routes. Layouts in `_layout.tsx`; group flows with `(auth)`, `(tabs)`. Auth gating happens in layouts with `<Redirect>`, not inside screens. Provide error boundaries for route segments, at least at root.
Hiding UI or gating screens is UX only; the backend enforces access. `EXPO_PUBLIC_*` vars are bundled into the app: no secrets in them. Never store tokens in AsyncStorage.

## 8. TypeScript
No `any` (use `unknown` + narrowing). No `!` without a comment. Props type `<Component>Props` above the component. Discriminated unions for status data. `const` objects + derived unions instead of `enum`. Named exports only (except where Expo Router requires default exports for screens/layouts).

## 9. Styling (NativeWind)
- NativeWind `className` only; `StyleSheet`/`style` only where NativeWind can't (e.g. animated values). Conditional classes via `cn()`.
- Colors/radius/fonts are theme tokens in the Tailwind config; no arbitrary hex in components. Variants as a typed `const` map inside the primitive.
- Remember RN layout: flexbox is column by default, no CSS grid, no `hover:`. All text must be inside `<Text>`.
- Class list repeated 3+ times → component. Dark mode via tokens + `useColorScheme` from the start.
- Respect safe areas (`react-native-safe-area-context`) and the keyboard (`KeyboardAvoidingView` / keyboard-aware scroll) on every input screen.

## 10. Code quality
- Naming: `PascalCase` components (file = name), `useX` hooks, `onX` props, `handleX` handlers, `is/has/can` booleans, `UPPER_SNAKE` constants.
- Early returns; no nested ternaries in JSX. No magic values. Comments explain why. No dead code or stray `console.log`.
- Interactive elements use `Pressable` with pressed feedback. Touch targets ≥ 44×44. Set `accessibilityRole` and `accessibilityLabel` (always on icon-only buttons). Don't break with large font scaling.
- Long or dynamic lists use `FlatList` (or FlashList if added), never `.map()` inside `ScrollView`. Stable ID `keyExtractor`, never index.
- Mutation buttons show pending state and disable. Give success/failure feedback.
- Platform differences via `Platform.select` or `.ios.tsx`/`.android.tsx`, used sparingly.
- `useMemo`/`useCallback`/`React.memo` only for real cost (list items and their callbacks are the usual exception).

## 11. Scope and collaboration
- Make the smallest complete change. Reuse nearby patterns; keep unrelated cleanup out of the diff. Minimal still means consistent: no half-updated callers or types.
- Inspect existing code first. Ask focused questions only when requirements, API semantics or tradeoffs materially change the result; otherwise make the reversible choice and state the assumption.
- Preserve the user's existing edits. **Never commit** unless explicitly asked.
- **Hackathon mode:** thinnest working vertical slice first (screen → container → API → UI), then widen. Shortcuts are fine **inside** a feature, never across §4 or §5. Mark them `// TODO(hack): what/why`. When unsure, pick the option that's easier to delete. The demo device is the priority platform.
- **Anything deferred** ("later", stubbed, spec field skipped) gets a line in `BACKLOG.md` in the same change; remove the line when it's built.

## 12. Completion and review
- Review the change as a separate pass (independent agent review when available and worth it). Check: layer boundaries and `index.ts` imports, no duplication (existing `ui/`/`shared/` reused), API via the three-file pattern with factory keys, contract consistency, loading/error/empty states, safe areas/keyboard, accessibility, no `any`/`console.log`/dead code.
- Actually run typecheck and lint (and tests if present) for changed code. For UI changes, say whether it was checked on a simulator/device; if not, say so. Docs-only edits need content and diff review, not a build.
- Inspect `git status --short`, `git diff --stat`, `git diff`, `git diff --check`; review staged and untracked files separately. Confirm every intended file is present and nothing accidental is.
- Report what changed, which checks actually ran, any new reusable piece, and unresolved limitations. Never claim a check passed when it was skipped or blocked.

**Context:** idea → `PROJECT.md` · deferred → `BACKLOG.md` · API integration → `API.md` · backend contracts → `../backend/API.md` · Expo SDK notes → `AGENTS.md` · commands: dev `npm start` · lint `npm run lint` · typecheck `npm run typecheck` · test `npm test` · all `npm run check`

## 13. Lessons learned
When a user correction or verified mistake reveals a reusable lesson, append a short entry: the mistake, its cause, and the rule that prevents a repeat. Keep entries project-relevant, avoid duplicates, reconcile with the rules above. Never turn guesses or task history into rules.

- **Don't `git checkout`/`git restore` files to undo work.** The repo's only commit is the Expo template scaffold, so restoring a file reverts it to the template, not to your last edit (this wiped `package.json` once). Undo by editing.
