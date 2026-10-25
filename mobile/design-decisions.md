# Design decisions

The app's design rules. Any value that doesn't match a token here is a likely mismatch.
Tokens live in code; this file records what they are, how to use them, and every decision or
exception made during design review so nothing gets re-asked.

Sources of truth: `src/lib/theme.ts` (colors), `tailwind.config.js` (fonts, radius),
`src/components/ui/*` (variants).

## 1. Tokens

### Colors (`src/lib/theme.ts`, used as Tailwind classes)

| Token | Light | Dark | Use |
|---|---|---|---|
| `background` | paleBlue `#e8f0f6` | night `#1c242c` | screen background, inset panels inside cards |
| `surface` | white | nightSurface `#2a3540` | cards, fields, sheets, pills |
| `border` | blueGray `#c5d7e5` | slate `#455666` | 1px card/field borders, dividers, image placeholders |
| `text` | slate `#455666` | gray `#e0dfdd` | primary text and icons |
| `muted` | darkGray `#8191a1` | darkGray | secondary text, inactive icons, placeholders |
| `primary` | orange `#ff9e45` | orange | primary actions, selection, progress, inline errors, emphasis |
| `secondary` | lightBlue `#96bbd6` | lightBlue | soft buttons (`/30`), chips, tints (`/15`–`/40`) |
| `on-primary` / `on-image` | white | white | text on primary fills / on photos |
| `on-secondary` | slate | slate | text on secondary fills |
| `overlay` | black | black | scrims, modal backdrops (`/40`), shadow color |
| `coin-rim` | butter `#ffd59e` | butter | coin icon only |
| `tabBar`, `map*` | — | — | JS-only (tab bar, Skia map) via `useThemeColors()` |

There are no separate success/warning/danger colors: `primary` doubles as the error/attention color.

### Typography (Plus Jakarta Sans; Instrument Serif italic; JetBrains Mono)

`Text` variants (`src/components/ui/Text.tsx`) — use these, not raw `font-*`/`text-*` combos:

| Variant | Font | Size | Use |
|---|---|---|---|
| `title` | Jakarta Bold | 3xl (30) | screen/page titles, hero titles |
| `heading` | Jakarta Bold | lg (18) | section headings, card titles |
| `body` | Jakarta Regular | base (16) | paragraphs |
| `label` | Jakarta SemiBold | sm (14) | buttons, chips, short labels |
| `caption` | Jakarta Regular | sm (14), `muted` | secondary info, hints, empty-state messages |
| `quote` | Instrument Serif Italic | 3xl | quotes |
| `mono` | JetBrains Mono | sm (14), `muted` | numbers, times, codes |

Observed size overrides: `text-xs` (chips, small meta), `text-base` on `label` (list-row titles),
`text-2xl` on `title`/`heading` (in-page titles, stat numbers), `text-xl` (lesson header).
Line heights: default, plus `leading-6`/`leading-7` for long-form reading (markdown, quiz).
Letter spacing: `tracking-tight` (welcome wordmark), `tracking-widest` (coupon code) only.
Native header titles and tab labels set `fontFamily` by name in JS (`PlusJakartaSans_700Bold`,
`_600SemiBold`).

### Spacing (Tailwind 4px scale)

- Screen side padding: `px-4` (16). Detail/sheet content: `p-4`; sheets and modals `p-5`; empty/error/loading states `p-6`.
- Card padding: `p-4` standard, `p-3` compact rows (list items with a thumbnail), `p-5` long-form reading cards.
- Gaps: `gap-1` text stacks · `gap-2` tight groups / section title → content · `gap-3` list items, rows · `gap-4`/`gap-5` page sections in a detail page · `gap-6`/`gap-8` top-level sections on a scroll page.
- List bottom padding: `pb-8` (tabs), `pb-10`/`pb-12` (stack pages).

### Radius (`tailwind.config.js`)

| Class | px | Use |
|---|---|---|
| `rounded-card` | 16 | cards, sheets (`rounded-t-card`), card-like pressables |
| `rounded-full` | ∞ | buttons, fields, chips, pills, avatars, segmented control, icon buttons |
| `rounded-xl` | 12 | inner panels and controls inside a card (quiz options, markdown blocks, icon tiles) |
| `rounded-lg` | 8 | image thumbnails in rows, small inset tiles |

`rounded-2xl` = 16px = same as `rounded-card`; always use `rounded-card`.

### Borders, shadows, elevation

- Border width: `border` (1px) everywhere; `border-2` for avatar rings, selected rings, dashed "add" targets; `border-l-4` markdown callout.
- Dividers: `border-t border-border` inside cards.
- Shadows (always with `shadow-overlay` color): `shadow-sm` small badges · `shadow-md` floating map controls · `shadow-lg` floating cards and controls over photos.

### Icons

Ionicons only (`@expo/vector-icons/Ionicons`). Outline style by default, filled for active/selected.
Sizes: 12 (micro badges) · 16 (inline with caption/label) · 18 (chevrons/back) · 20 (row leading icons) · 22–24 (icon buttons) · 28 (feature tiles) · 40 (coin lg).
Color: always pass a theme color (`useThemeColors()`), never omit it (defaults to black).

### Interaction and states

- Touch targets ≥ 44 (`min-h-11`, `h-11 w-11`).
- Press feedback: `active:opacity-70` on buttons/controls, `active:opacity-80` on pressable cards, `active:bg-secondary/10` on rows inside a card.
- Loading: `LoadingState` (primary spinner). Error: `ErrorState` (caption + "Try again"). Empty: `EmptyState` (heading + caption).
- Pending labels end with `…` (single ellipsis character).

### Motion

- Image fade-in 200ms (`ui/Image`).
- Overlays fade 220–250ms; swipe dismiss 200ms; easing `bezier(0.22, 1, 0.36, 1)` (ease-out, no bounce).
- All custom animation respects Reduce Motion.

### Dark mode

Every color comes from a token; `useThemeColors()` for JS consumers. No raw hex in components.

### Breakpoints

None. Phone-only layout; wide screens only cap modal width (`max-w-lg`).

## 2. Decisions

_Filled in during review._

## 3. Exceptions

_Filled in during review._
