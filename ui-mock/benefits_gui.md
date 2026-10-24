# WorldLearn — Benefits & Coupons: GUI-Only Frontend Specification

> **For Codex, Cursor, Claude Code, or another implementation agent**  
> **Scope:** React Native + TypeScript (Expo), **visual frontend and client-side demo interactions only**.  
> **Status:** Ready for a UI implementation pass. This is extracted from `BENEFITS_REWARDS_CODEX_SPEC.md` and the three-screen coupon mockup.  
> **Reference image:** `a_clean_ui_ux_app_mockup_image_showing_three_smart.png` (three phone screens: Benefits list, confirmation modal, active coupon). Additional provided references: `image.png` (profile page design), `image(1).png` (rewards), `image(2).png` (partner browsing).

## 1. Agent task and hard scope boundary

Implement a polished **Benefits** experience inside the existing mobile repository, matching the reference image and established app styling. First inspect the repository's navigation, typography, asset handling, UI primitives, colors, and dependencies; adapt to existing conventions rather than duplicating them.

**Build only:** screens, reusable presentation components, navigation wiring, locally seeded mock content, local filtering/search/sorting, confirmation modal, simulated coupon activation, QR/PIN demo presentation, a mock countdown, My Coupons screen, visual states, accessibility, and frontend tests where the repo already supports them.

**Do NOT build or change:** Spring Boot endpoints, PostgreSQL schema, Liquibase migrations, authentication, real wallet transactions or coin reservations, merchant portal, vendor validation, real coupon codes, backend data synchronization, geolocation permissions, push notifications, or any genuine merchant integrations. No server API calls should be required to run the demo.

Keep data access behind a small interface so the mock repository can later be replaced by a real API without rewriting visual components. **Demo actions must be conspicuously non-production**: nothing in this frontend creates a real discount, charges coins, or issues an authentic voucher.

## 2. Design principles

### Tokens

| Token | Value | Purpose |
|---|---|---|
| `accentOrange` | `#FF9E45` | Coin badges, primary CTA, small warm highlights |
| `neutralGray` | `#E0DFDD` | Borders, separators, disabled elements |
| `lightBlue` | `#96BBD6` | Selected filters, informative surfaces |
| `darkGray` | `#8191A1` | Secondary text and icons |
| `darkestBlue` | `#455666` | Headlines, main copy |
| `background` | `#FFFFFF` | Screens, large card surfaces |

### Visual treatment

- Bright, friendly white canvas, subtle blue-tinted surfaces, rounded corners, restrained orange accents.
- Cards with radius ~16–22 dp and subtle native-compatible shadow/elevation; do not add heavy gradients, outlines, or glass effects.
- Typical content padding: 16–20 dp horizontally; vertical section gaps: 16–24 dp; card-to-card gap: 10–14 dp.
- Readable hierarchy: page title about 26–30 sp bold; section titles 18–20 sp semibold; card title 14–16 sp semibold; supporting text 12–14 sp. Reuse project design tokens when available.
- Iconography must be consistent (prefer installed icon library). Prefer project image assets or generic non-branded illustrations; do not copy commercial logos or claim actual partnerships.
- Use `SafeAreaView` or existing safe-area utilities, keyboard-safe input behavior, and responsive layouts on narrow phones. Allow text resizing and avoid fixed card heights that truncate translations.
- Keep interactive hit areas at least ~44×44 dp and include explicit accessible labels.
- The **coupon design is a full-width horizontal ticket**, with image on the left, text in the middle, and an orange coin price pill on the right. **Do not use the two-column rewards grid** from the first inspiration image.

## 3. Navigation — preserve existing shell

The agreed bottom tabs are **Home (house), Scroll (sparkle), Calendar (calendar), Network (people), Courses (graduation cap)**. The visual mockup's alternative bottom bar is illustrative only. **Do not add Benefits as a sixth permanent tab or replace the existing five tabs.**

- Register `BenefitsList`, `MyCoupons`, and `ActiveCoupon` as nested stack screens using the existing navigator.
- Link to Benefits from an existing Home or profile/wallet shortcut, or create a simple `Benefits` entry point on Home if no suitable shortcut exists.
- From Benefits, a top-right shortcut or text link opens `My Coupons`.
- Back navigation returns to the prior screen and retains partner/country selections in the current browsing session.
- The confirmation UI should be a modal over the list, **not** a new bottom navigation destination.
- Never simulate activation automatically on tapping a card: first open the confirmation modal.

## 4. Screen A — Benefits browsing

**Visual reference:** leftmost phone in three-screen mockup.

### A. Header

- Left: `Benefits` heading.
- Right: pill containing a small orange coin graphic and **`520 coins`** in demo mode; source from mock wallet state, not a hardcoded label.
- Optional adjacent link/icon `My coupons` (must be discoverable, even if not pictured).

### B. Search

- Wide rounded search input with magnifier icon and placeholder `Search benefits`.
- Search across offer title, subtitle/description, and partner name, case-insensitive.
- Clear control appears once text is entered.
- An optional filter/sliders icon may appear to the right, but **Partner** and **Country** filters must be visible without entering a hidden menu.

### C. Filters

- Rounded `Partner ▾` chip and `Country ▾` chip below the search bar.
- Selecting either opens an accessible bottom sheet/modal with a radio-style list; **one partner** and **one country** at a time for MVP, or `All`.
- Selection is reflected in the chip (`City Café`, `Croatia`), with a clear/reset affordance.
- Filters combine with AND; search further narrows matching offers.
- **Country is the country where an offer can be redeemed**, not the partner's corporate location and not the user's GPS position.
- No location permission prompt is allowed.
- Partner sheet may show a small partner avatar; country sheet shows country name and optional emoji flag. Country names should remain readable without the flag.

### D. Popular partners

- Section header `Popular partners` with `See all` on right.
- Horizontal `FlatList`/`ScrollView` of circular partner emblems and captions.
- Example names: `Cacao`, `Mlinar` (illustrative label only), `Museum Shop`, `City Café`.
- Use simple generic images/emblems instead of trademarks unless assets are explicitly provided and licensed.
- Selecting a partner applies the same partner filter used by the filter chip. Selected partner has an understated highlight/border.
- `See all` opens the partner picker.

### E. Coupon list

- Section header `All coupons`; trailing sorting control (`Popular first` by default).
- Use vertically stacked **nearly full-width horizontal coupon cards**, each with:
  - image thumbnail (square-ish, ~96×96 dp on typical phone, responsive on smaller widths);
  - title in one or two lines;
  - one-line subtitle/offer conditions;
  - partner name + redeemable country chip(s), ideally on a compact second row;
  - right-aligned, orange-toned pill with a coin icon, amount, `coins`;
  - optional ticket-edge notches that do not interfere with text or touch targets.
- Whole card tappable; add accessible action text `View / redeem [offer]` for non-gesture access.
- Suggested demo offers:

| ID | Title | Subtitle | Partner | Country | Coins | Image suggestion |
|---|---|---|---|---|---:|---|
| `coffee-hr` | Free coffee at City Café | Any hot drink (S or M) | City Café | Croatia | 120 | Coffee cup |
| `museum-it` | 20% off museum gift shop | On selected souvenirs | Museum Shop | Italy | 180 | Museum/statue |
| `pastry-fr` | Free pastry with any drink | Croissant, muffin or donut | Cacao | France | 150 | Croissant |
| `bakery-hr` | 2-for-1 bakery item | Choose from selected items | Local Bakery | Croatia | 200 | Fresh bread |

The mock catalog may use placeholder local/remote images approved for demo; provide graceful fallback illustrations when unavailable.

### F. Browse states

- Initial mock content loads immediately or with a short deterministic simulated loading state.
- Empty search/filter: `No benefits found` plus `Clear filters` button.
- Disabled/expired/sold-out fixture: muted card and readable status label; selection explains why unavailable.
- Insufficient coins: allow opening card and seeing details, but disable the confirmation action and show `You need X more coins` (mock only).
- Support pull-to-refresh only if it provides meaningful local fixture reset; do not fake a live network sync.

## 5. Screen B — Redeem confirmation modal

**Visual reference:** center phone in mockup. Backdrop dims Benefits; rounded white modal centered/bottom-sheet as appropriate to device dimensions.

- Title: `Redeem this coupon?`
- Display selected coupon photo, title, subtitle, partner, redeemable country, and orange coin price.
- Display available wallet coins from mock state (starting at **520**), and remaining **available** coins after *simulated hold*: for 120 coins show **400**.
- Text must reflect the intended future reservation policy, not incorrectly imply instant permanent spending. Suggested copy:
  > `120 coins will be held while this coupon is active. If it expires unused, they'll become available again.`
- Show conditions `One-time use`, `Valid for 15 minutes after activation`, `At participating locations`.
- Actions: `Cancel` (secondary outlined) and **`Activate coupon`** (filled orange).
- Cancel closes modal and leaves mock balance and mock coupons unchanged.
- Confirm uses a local mock action to generate a demo coupon, adds it to My Coupons, reduces mock **available** balance by holding its cost, closes modal, and navigates to Active Coupon.
- Disable button during simulated activation to prevent accidental double taps. The same button press must only create one mock coupon.
- If offer is ineligible or mock available coins are too low: disable activation, show clear reason and available balance.
- Modal dismissible by accessible close icon, Android back, or cancel button. Avoid dismissing through accidental taps when an action is underway.

## 6. Screen C — Active coupon code

**Visual reference:** rightmost phone in mockup.

### Hero ticket

- Header back arrow and `Active coupon`.
- Large white coupon/ticket card with photo banner, generic partner icon, partner name, offer name, and subtitle.
- Status pill: `Ready to redeem` (green or neutral positive), `Used`, `Expired`, or `Cancelled`.
- Large **QR code area** is the primary visual, with sufficient quiet zone/contrast.
- Under QR: `Show this code to the vendor`.
- Divider `or` then fallback `PIN 482913` in large spaced/tabular digits, with optional copy icon.
- Demo QR and PIN must be **clearly labeled** as nonfunctional placeholders somewhere on screen (e.g. `Demo code — not valid in stores`). Do not create a QR encoding a real merchant URL or invent a working partner redemption system.

### Time and rules

- Light-blue expiry strip with clock icon: `Valid for 15 minutes` and countdown `14:56` (dynamic in local demo).
- List below: `One-time use only`, `Only at participating locations`, `If scanning isn't available, the vendor can enter the PIN manually`.
- Countdown is based on stored mock `expiresAt - Date.now()`, not decrementing a counter on each interval; recompute on app focus. At zero, mark `Expired` and visually disable/hide the usable code.
- In demo mode, when an unused coupon expires, release the simulated hold back to available coins; show an explanatory info message. **This is not a real transaction**.
- No customer-facing `Mark as used` action. Do not pretend the vendor verified redemption. If a `Used` example is needed to test UI, provide a fixture or development-only state selector, visibly labeled as demo.
- Navigating back and reopening from `My Coupons` should show the **same** mock coupon/code and remaining time, not create another or re-hold coins.

**QR implementation:** If a QR rendering library compatible with the existing Expo dependencies is already installed, render an encoded synthetic payload such as `DEMO-WORLDLEARN-<local-id>`; otherwise show a visually convincing static QR-placeholder asset with `Demo only` label and keep the display component swappable. Synthetic PIN values are for preview only and must not be described as secure or redeemable.

## 7. Screen D — My Coupons

Reachable from Benefits top header or existing wallet/profile entry point.

- Screen heading `My coupons`.
- Segmented control/tabs: `Active`, `Used`, `Expired` (may include cancelled under Expired/Cancelled).
- Full-width mini ticket cards with partner, offer title, status, coin amount, issued/expiry data.
- Active item reopens **same** Active Coupon record.
- Used/expired entries open read-only detail; show status and do not show functional scan/PIN.
- Empty states: `No active coupons yet` and CTA `Browse benefits`.
- Demo may include pre-populated used/expired fixtures for screenshot/testing, visually differentiated from user-created items.

## 8. Mock data types and local state

Keep fake application data in a dedicated `mockBenefitsRepository` or equivalent. Example types (adapt to existing types):

```ts
type CountryCode = 'HR' | 'IT' | 'FR';
type CouponStatus = 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';

type Partner = {
  id: string;
  name: string;
  logoAsset?: unknown;
};

type BenefitOffer = {
  id: string;
  partnerId: string;
  title: string;
  subtitle: string;
  description?: string;
  countryCodes: CountryCode[];
  priceCoins: number;
  imageAsset?: unknown;
  status: 'AVAILABLE' | 'SOLD_OUT' | 'EXPIRED';
  popularityRank?: number;
};

type DemoCoupon = {
  id: string;
  offerId: string;
  priceCoins: number;
  status: CouponStatus;
  issuedAt: string;
  expiresAt: string;
  demoQrPayload: string;
  demoPin: string;
};

type BenefitsUiState = {
  availableCoins: number;
  selectedPartnerId: string | null;
  selectedCountryCode: CountryCode | null;
  searchQuery: string;
  sort: 'POPULAR' | 'PRICE_ASC' | 'PRICE_DESC' | 'NEWEST';
  coupons: DemoCoupon[];
};
```

- Initial `availableCoins = 520` (demo only).
- `activateDemoCoupon(offerId)` checks mock balance and status, creates one coupon, holds its price in *local demo state*, and sets `expiresAt = now + 15 minutes`.
- Distinguish `availableCoins` from held mock value; on demo expiry return held amount to available balance. Avoid permanent wallet mutation or linking the demo to a production wallet screen.
- Ensure state remains coherent across navigation. React context/Zustand/Redux/other existing state library are acceptable; **use what the repo already uses**.
- Optional persistence for local demo state is not necessary. If adding it, never store real redemption secrets and treat all data as disposable fixtures.
- Keep filtering as pure selectors/functions so tests can cover search, country, partner, and sort combinations.

## 9. Suggested component hierarchy

```text
features/benefits/
  screens/
    BenefitsListScreen.tsx
    MyCouponsScreen.tsx
    ActiveCouponScreen.tsx
  components/
    BenefitsHeader.tsx
    BenefitSearchBar.tsx
    BenefitFilterChip.tsx
    BenefitsFilterSheet.tsx
    PopularPartnerList.tsx
    PartnerAvatar.tsx
    BenefitCouponCard.tsx
    RedeemConfirmModal.tsx
    CouponTicket.tsx
    CouponQrPin.tsx
    CouponCountdown.tsx
    CouponStatusBadge.tsx
    MyCouponCard.tsx
    BenefitsEmptyState.tsx
  data/
    demoOffers.ts
    mockBenefitsRepository.ts
  hooks/
    useBenefitsDemo.ts
  types/
    benefits.ts
  utils/
    filterBenefits.ts
    formatCoins.ts
    formatCountdown.ts
  __tests__/
    ...
```

Adapt folder names, route definitions, and component primitives to project conventions. Avoid adding packages unnecessarily.

## 10. Interactions and acceptance walkthrough

1. Open Benefits from Home/profile shortcut; see `520 coins`, search, two filters, partners, and **four wide coupons**.
2. Tap `Partner` → choose `City Café`; only that partner's offers show.
3. Tap `Country` → choose `Croatia`; filters combine; search further filters results.
4. Clear filters, tap `Free coffee at City Café`; confirmation shows cost `120 coins` and remaining mock available balance `400 coins`.
5. Tap `Cancel`; modal closes, balance still `520`, no new coupon.
6. Open same offer, tap `Activate coupon`; new **demo** active ticket appears with QR placeholder, PIN, status, and countdown; available balance shows `400` in demo state.
7. Return to Benefits, open `My coupons`; the active ticket is present. Reopen it: **same** coupon, not new one.
8. Fast-forward a development-only mock clock or use a seeded expired ticket; coupon enters Expired, code no longer appears usable, mock held coins become available again.
9. Select an insufficient-balance example by lowering test fixture balance; confirm CTA is disabled with clear explanation.
10. Test narrow screen, large font, screen reader and Android back gesture.

## 11. UI-only test checklist

- [ ] Main five-tab bar remains unchanged and Benefits is accessible.
- [ ] Full-width **horizontal** coupon ticket styling matches mockup.
- [ ] All demo values are driven by fixture/state, not hardcoded in components.
- [ ] Partner and country filters, text search and sorting combine predictably.
- [ ] Filters persist when navigating back from a coupon.
- [ ] Empty and unavailable states render correctly.
- [ ] Confirmation modal shows selected offer and available balance after simulated hold.
- [ ] Cancel does not modify state; confirm produces exactly one mock coupon per press.
- [ ] Active coupon shows QR **demo** placeholder, fallback PIN and live countdown.
- [ ] Reopening from My Coupons does not generate another ticket.
- [ ] Expiry updates status and releases local mock hold.
- [ ] No real wallet/API/network side effects, no Liquibase/backend changes.
- [ ] VoiceOver/TalkBack labels, keyboard interaction, reduced motion and dynamic type work reasonably.

## 12. Deliverables and stopping point

Agent should deliver **frontend code only**, fixture assets/mock data, navigation integration, relevant component tests, and a short `README` explaining how to preview the GUI. Run relevant format/typecheck/test commands already defined by the repo; report what ran and remaining failures. Provide screenshots if the existing tooling supports them.

**Stop before** wiring real API endpoints, integrating backend wallet, generating secure production QR/PIN credentials, implementing partner/vendor operations, or writing any DB migrations. Those belong to the later backend phase in `BENEFITS_REWARDS_CODEX_SPEC.md`.

### Copy-ready starting prompt

> Read `BENEFITS_GUI_FRONTEND_CODEX_SPEC.md` and implement **only the React Native GUI** for Benefits, filtering, coupon confirmation, Active Coupon QR/PIN demo, and My Coupons. Match `a_clean_ui_ux_app_mockup_image_showing_three_smart.png`, preserve our existing five-tab navigation and styling, use typed mock data/local state, and do not alter backend, wallet, or Liquibase files. Inspect the repo first, implement the screens, and run frontend tests.
