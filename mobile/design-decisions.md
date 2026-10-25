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
`_600SemiBold`); stack headers get it from `useStackScreenOptions()`.

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
- Disabled: `Button` dims itself to `opacity-50`.
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

Resolved during the final design review (2026-10-25, branch `design/final-review`). Each one is
now a rule; don't re-open without a reason.

### Surfaces and shape
- **Cards** are `rounded-card` (16px) + `border border-border` + `bg-surface` everywhere, Benefits included (was 24px borderless). Prefer the `Card` primitive.
- **Inner panels** inside a card (price pill, compact offer panel, coupon-code box, quiz options) use `rounded-xl` (12px).
- **Image thumbnails** in rows/cards use `rounded-lg` (8px) everywhere, Benefits artwork included.
- **Icon buttons** are 44px circles (`h-11 w-11 rounded-full`), icon 22px. Header icon buttons use `bg-surface` with a `primary` icon, no shadow (Home's Benefits button matches the coin pill).

### Typography and color
- **Secondary text** is the `caption` variant (`muted`). No `text-text/80` overrides.
- **List-row titles** are `label` + `text-base`. No extra `font-sans-bold` on labels.
- **No uppercase/mono eyebrows.** Step and context labels ("Lesson 01", "Question 2 of 5", "Pause & think") are sentence-case `caption`. `mono` is for numbers, times and codes only.
- **Inline errors and blocking reasons** are `caption` + `text-primary`, with `accessibilityRole="alert"` or a polite live region.

### Components and states
- **Primary button label** is `on-primary` (white) everywhere; no per-feature label color.
- **Disabled buttons** dim to `opacity-50`, applied once in the `Button` primitive. No ad-hoc disabled opacity in screens.
- **Press feedback**: pressable cards `active:opacity-80`; buttons, links and small controls `active:opacity-70`.
- **Images** always go through `ui/Image` (200ms fade, NativeWind className). No direct `expo-image` in features.
- **Icons** always get an explicit theme color.

### Layout
- **Section heading → content** gap is `gap-2`. Items inside the section keep the list gap (`gap-3`).

### Navigation chrome
- **Stack headers** share `useStackScreenOptions()` (`src/hooks`): `primary` back arrow, Jakarta Bold title, `background` header. Every nested `Stack` uses it.
- **Tab headers** always show, right to left: avatar, coin pill, Benefits button. Over photos (Scroll) all three use `elevated`.

### Copy
- **Sentence case** for titles, sections, buttons and chips ("My coupons", "Most popular", "Course"). Proper nouns (Benefits) keep their capital.
- **Tab labels match their screen title** ("Events", not "Calendar").
- **Text links** are capitalized and `text-primary` ("Search", "See all", "Check request status").
- **Pending labels** end with the `…` character, never `...`.

### Scope
- **Weekly challenge removed** from Network (out of scope): card, demo API/query/mock/type, test and docs.

## 2b. Interaction rules (from the UX review)

Approved in full after the design pass. These are behaviour rules, with the shared piece to use.

### Structure
- **No pressable inside a pressable row/card** unless it is the row's own trailing action (Add/Accept on person rows). Secondary actions go on the detail page or into `accessibilityActions`.
- **No modal over a modal.** A sheet lists its choices inline with `OptionRow` (`ui/OptionRow`, also used inside `Select`).
- **No card-in-card or duplicate titles.** A screen with a native header doesn't repeat the title as a heading.
- **List → detail → action.** Tapping an item opens its detail page (prefetched on press-in); the detail page holds the action (Redeem → confirm).

### Controls
- **Icon-only buttons** use `ui/IconButton` (44px circle, surface, primary icon, required `accessibilityLabel`).
- **Active filters** show as removable chips (`ActiveFilterChips`), one "Clear all" in the filter sheet. Never several buttons that open the same sheet.
- **Screen-level actions** (e.g. My coupons) sit in the header right, before the coin pill.
- **Don't show controls for unbuilt features** (Edit profile is hidden, not "Coming soon").
- **Status is not a disabled button**: show it as a `Chip` ("Friends").

### Feedback and confirmation
- **Destructive or irreversible actions** confirm with `confirmDestructive()` (`utils/confirm`): native Alert, Cancel + destructive button. Used for unfriend, Mark as used, Log out.
- **Errors** show inline as orange captions (or in the toast for background actions). `Alert` is only for confirmations and system-level failures (opening files/links).
- **State changes** show in the control itself (label change, `…` while pending).
- **Background, undoable actions** use a bottom toast with **Undo** (Scroll's "less like this"; client-side undo window, saved when the toast closes).
- **Success after navigation** needs no extra message when the destination shows the result.

### Forms and modals
- **Validation timing**: nothing before the first submit; after it, errors show under each field (`components/shared/FormField`) and update live. Field border turns `primary`. Client rules mirror the backend.
- **Sheets and pickers close** on backdrop tap, Android back, and an explicit Done/Cancel.

### Content
- **Counts use `pluralize()`** (`utils/format`): "1 course", "2 courses".
- **Coins are exact numbers** with grouping (`formatNumber`: "1,240 coins") everywhere, header pill included. Compact `formatCount` ("1.2k") is only for social counts (learners).
- **Backend enum codes are never shown raw**: map them to labels (`features/benefits/labels.ts`).
- **Dates and times** use `utils/date` (`formatDayHeading`, `formatTime`, `formatDateTime`), never `toLocaleString()`.
- **Long text**: titles on cards/heroes get `numberOfLines` (2–3); open-ended lists on a focused screen are capped with `listWithMore()` and the full list lives on the detail page.

## 3. Exceptions

Intentional differences. Don't flag these.

- **Welcome screen logo gradient** (`WelcomeScreen.tsx`): 18 hardcoded blue→orange hex stops. It's the brand mark, not UI, so it doesn't follow the theme.
- **Unlock celebration lock** (`UnlockCelebration.tsx`): its own `rounded-2xl`, `rounded-t-full`, `border-8` shapes. It's an illustration, not UI.
- **Benefits coupon card tint** (`BenefitCouponCard.tsx`): `bg-primary/10` + `border-primary/20` instead of a plain surface card, so it reads as a coupon (no side notches). Radius, thumbnail and type follow the standard rules.
