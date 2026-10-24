# Mobile app

Expo SDK 58 · Expo Router · TypeScript · NativeWind · TanStack Query. Rules: `CLAUDE.md`. Product: `PROJECT.md`. Deferred work: `BACKLOG.md`.

## Run on your phone
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
