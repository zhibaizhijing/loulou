# Loulou Design-System Spec (Lou Lou · 露露 · v1.0)

> **SUPERSEDED 2026-06-29 by `2026-06-29-loulou-design-system-v2.md`.** v1 tokens + primitives below remain valid and load-bearing; v2 adds new screens (BookingRequest, ChatView, GuardianBookingBar, ServiceSwitchDrawer, PetReminderSheet, OrderModify, ReviewGuardian, ProcessGuide, etc.) + a multi-guardian batch booking model. Read v2 first for current scope.

**Status:** authoritative for **all visuals** going forward. Supersedes ad-hoc styling decisions in `2026-05-19-loulou-p0-mvp-scope.md`. Where the P0 spec defines *behavior* and this spec defines *appearance*, both must be satisfied.

**Source bundle:** `design/lou-lou-design-system/` (`README.md`, `colors_and_type.css`, `ui_kits/wechat-mini-program/`). Treat the JSX prototypes as **visual contracts**, not as code to copy. Recreate pixel-faithfully in TS + WXML + WXSS.

---

## 1. Brand statement

Loulou (露露) is a chic, modern, approachable pet-care marketplace on WeChat Mini-Program. Voice: warm, second-person, no fluff. Visuals: near-black ink `#22282C` against cool off-white `#F8F8FC`, butter-yellow and lavender pastels for emotional moments, flat surfaces, feather-light shadows. The heart-red `#E63946` from the logo is **never** used as a UI accent.

Bilingual rule: 中文 + EN side by side in section headers and chrome. Numerals stay in SF Pro Text (tabular) even inside Chinese strings (`45 min`, `¥150/晚`). Never machine-translate marketing taglines.

---

## 2. Design tokens (canonical)

All values are taken verbatim from `design/lou-lou-design-system/project/colors_and_type.css`. They must be exposed as **CSS custom properties** at `page` scope inside `miniprogram/app.wxss` and consumed by every component. **Never inline hex codes** — if a value is missing from the token set, raise it.

### Colors

| Token              | Value                     | Use                                                         |
|--------------------|---------------------------|-------------------------------------------------------------|
| `--ll-ink`         | `#22282C`                 | CTAs, dominant text, dark pills, custom tab-bar icons (on)  |
| `--ll-ink-press`   | `#1A1F23`                 | CTA pressed (`-10% L`)                                      |
| `--ll-ink-disabled`| `rgba(34,40,44,0.5)`      | CTA disabled                                                |
| `--ll-bg`          | `#F8F8FC`                 | Page background                                             |
| `--ll-surface`     | `#FFFFFF`                 | Cards                                                       |
| `--ll-border`      | `#EEEEF2`                 | Hairline dividers (1px, **not 1rpx**)                       |
| `--ll-text`        | `#1E1E24`                 | Primary text                                                |
| `--ll-text-2`      | `#6B6B7A`                 | Secondary, captions                                         |
| `--ll-text-3`      | `#A0A0B0`                 | Hint, placeholder, disabled                                 |
| `--ll-text-on-ink` | `#FFFFFF`                 | Text on dark CTAs                                           |
| `--ll-butter`      | `#FEE7A6`                 | Pastel — pet stages, tags                                   |
| `--ll-lavender`    | `#D8CAE8`                 | Pastel — pet stages, tags                                   |
| `--ll-mint`        | `#C7E8D8`                 | Optional pastel — category coding                           |
| `--ll-peach`       | `#FBD3C4`                 | Optional pastel — category coding                           |
| `--ll-success`     | `#3FAE6A`                 | Status only (e.g. toggle on, verified check)                |
| `--ll-warning`     | `#F0B100`                 | Star ratings, warning chips                                 |
| `--ll-danger`      | `#E5484D`                 | Destructive ("退出登录"). Not a primary surface.            |
| `--ll-info`        | `#5B7CFA`                 | Informational chips                                         |
| `--ll-heart`       | `#E63946`                 | **Logo only.** Never a UI accent.                           |

### Radii (px on a 750×1334 rpx baseline; 1rpx ≈ 0.5px on 375pt viewport)

| Token              | Value     | Use                                  |
|--------------------|-----------|--------------------------------------|
| `--ll-radius-lg`   | `12px`    | Large cards, sheets                  |
| `--ll-radius-md`   | `8px`     | List items, medium cards             |
| `--ll-radius-sm`   | `6px`     | Avatars, small cards                 |
| `--ll-radius-xs`   | `4px`     | Tags                                 |
| `--ll-radius-pill` | `999px`   | CTAs, chips, hero pill, rating pill  |
| `--ll-radius-none` | `0`       | Top nav, bottom tab bar              |

### Shadows (kept extremely light)

| Token              | Value                                | Use                          |
|--------------------|--------------------------------------|------------------------------|
| `--ll-shadow-card` | `0 2px 8px rgba(0,0,0,0.04)`         | Cards, floating tiles        |
| `--ll-shadow-pop`  | `0 4px 12px rgba(0,0,0,0.08)`        | Popovers, dropdowns, sheets  |
| `--ll-shadow-lift` | `0 8px 24px rgba(0,0,0,0.10)`        | Toasts, modal stacks         |

Forbidden: colored shadows, inner shadows, neumorphism, glassmorphism, gradients on backgrounds.

### Spacing — 4-pt scale (16px is the workhorse gutter)

`--ll-space-1: 4px`, `-2: 8px`, `-3: 12px`, `-4: 16px`, `-5: 20px`, `-6: 24px`, `-8: 32px`, `-10: 40px`, `-12: 48px`.

Section rhythm: title → 16px → content → 24px → next section.

### Layout

| Token              | Value     | Use                                                              |
|--------------------|-----------|------------------------------------------------------------------|
| `--ll-navbar-h`    | `64px`    | Top nav height                                                   |
| `--ll-tabbar-h`    | `49px`    | Bottom tab bar (designed at 78px including safe-area pad)        |
| `--ll-hit-min`     | `44px`    | Min touch target. 适老化-compatible.                              |
| `--ll-safe-x`      | `16px`    | Page side gutter                                                 |

### Typography

| Class      | Size  | Line  | Weight | Use                                                |
|------------|-------|-------|--------|----------------------------------------------------|
| `ll-h1`    | 28px  | 36px  | 700    | Page hero                                          |
| `ll-h2`    | 22px  | 30px  | 700    | Section / detail title                             |
| `ll-h3`    | 17px  | 24px  | 600    | Nav titles, list titles                            |
| `ll-body`  | 14px  | 22px  | 400    | Body, summary, secondary button text               |
| `ll-caption`| 12px | 18px  | 400    | Nicknames, time, helper                            |
| `ll-tab`   | 10px  | 14px  | 500    | Tab bar label                                      |
| `ll-tag`   | 11px  | 16px  | 600    | Tag, status chip                                   |

Font stack (apply on `page`):
```
-apple-system, "SF Pro Text", "PingFang SC", "Helvetica Neue",
"Microsoft YaHei", "Noto Sans SC", Roboto, "Segoe UI", Arial, sans-serif
```

Numerals always render in SF Pro Text via the stack ordering — never wrap digits in a separate font.

### Motion

- Easing: `cubic-bezier(0.2, 0, 0, 1)` (WeChat-leaning ease-out).
- Duration: `120ms` state changes, `240ms` sheets / nav transitions.
- Press: CTAs darken to `--ll-ink-press` **and** scale `0.985`. Never bouncy.
- Loading: black 24px spinner inside the CTA; the CTA keeps its background.

---

## 3. Component inventory (build under `miniprogram/components/ll-*`)

Mapped from `ui_kits/wechat-mini-program/components.jsx`. Each component is a TDesign-style WXML Component with `properties`, `methods`, scoped WXSS.

| Component         | Props                                                                  | Notes                                                                                       |
|-------------------|------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| `ll-cta`          | `text`, `disabled`, `loading`, `secondary`, `full`, `bind:tap`         | Pill 52px height, `--ll-ink` bg, white text. Secondary = white bg + 1px `--ll-border`.       |
| `ll-topnav`       | `title`, `back`, `transparent`, `bind:back`, slot:trailing             | 56px sticky, 40px dark round back button, centered title.                                    |
| `ll-hero-pill`    | `avatar`, `bind:bell`                                                  | Dark pill: avatar + paw badge + bell. Home only.                                             |
| `ll-chips`        | `items`, `active`, `bind:change`                                       | Pill chips. Active = ink bg + white text; inactive = white bg + hairline border.            |
| `ll-pet-stage`    | `title`, `sub`, `bg` (token name), `image`, `offset`, `bind:tap`       | Pastel "stage" card, image breaks top edge. Stack 2nd card with `offset: -22px` for overlap. |
| `ll-attr-tag`     | `label`, `value`, `bg`                                                 | Pastel block, two stacked lines.                                                             |
| `ll-stat-tile`    | `label`, `value`, `unit`, `bg`                                         | Pastel tile, tabular numerals.                                                               |
| `ll-progress-ring`| `percent`, `target`                                                    | SVG canvas, 4-stop pastel gradient stroke, ink-text center.                                  |
| `ll-tab-bar`      | `tabs`, `active`, `bind:change` (custom-tab-bar)                       | 5 tabs, regular icon → fill on active. Red 8px dot for badges.                               |
| `ll-rating-pill`  | `value`                                                                | Dark pill, 5 amber stars + tabular number.                                                   |
| `ll-card`         | (slot)                                                                 | `--ll-surface` + `--ll-radius-lg` + `--ll-shadow-card`.                                      |
| `ll-menu-row`     | `icon`, `label`, `badge`, `iconBg`, `danger`, `isLast`, `bind:tap`     | Settings/profile menu rows. Reused on Me page and sub-pages.                                 |
| `ll-toggle`       | `value`, `bind:change`                                                 | Bold check toggle (ink bg when on). 46×26 chrome.                                            |
| `ll-bottom-sheet` | `visible`, `title`, slot, `bind:close`                                 | Bottom sheet with grabber, 20px top radius.                                                  |

Each component renders **only** with design tokens — no hard-coded hex or px outside the token-→ variable substitution.

---

## 4. Iconography

The design system specifies **Phosphor Icons** (regular for chrome / inactive tabs, fill for active tab). WeChat Mini-Program cannot load the upstream font CDN reliably and `@phosphor-icons/web` is too large for the package quota.

**Decision:** ship a subset SVG sprite at `miniprogram/components/ll-icon/sprite.wxml` covering the icons used in the kit:

`house, sun, sneaker, hand-waving, moon-stars, receipt, chat-circle-dots, paw-print, paw-print-fill, user, bell, magnifying-glass, sliders-horizontal, plus, minus, caret-left, caret-right, caret-up, caret-down, check, check-circle, check-circle-fill, x, clock, map-pin, calendar-blank, ticket, share-network, gear, shield-check, info, currency-cny, qr-code, pencil-simple, phone, envelope-simple, chat-circle, headset, star, star-fill, cake, users, handshake`.

Icons inherit `color` from the parent (`fill: currentColor`). Sizes: `20 / 24 / 28 px` via `width`/`height` props. Stick to regular weight; reach for bold only inside primary CTAs.

Unicode dingbats (`★ ✓`) are still allowed for star ratings and inline check marks. **Emoji is not used in chrome.** Pet photography uses transparent-PNG hero shots over pastel stages (placeholders OK until shipping photos arrive).

---

## 5. Screen ↔ existing-page mapping

The design kit reorganizes the app around **5 tabs**: 首页 / 订单 / 消息 / 守护时刻 / 我的. Owner mode is the default tab set; caregiver mode reuses the same tab bar with the same five entries (rename in the future is acceptable; for now map `守护时刻` to caregiver-mode home).

| Design screen           | Existing page(s)                                                  | Pass                          | Notes                                                                                              |
|-------------------------|-------------------------------------------------------------------|-------------------------------|----------------------------------------------------------------------------------------------------|
| `HomeMarketplaceScreen` | `pages/home/index`                                                | Owner — pass A                | Hero pill, bilingual headline, service-type row, category chips, stacked pet-stage cards.          |
| `SearchResultsScreen`   | `pages/home` filtered view                                        | Owner — pass A                | Apply same chrome; result rows = `ll-card` rows with avatar pastel + rating pill.                  |
| `GuardianProfileScreen` | `pages/walker/index`                                              | Owner — pass A                | Hero image area, rating pill, attribute tags, sticky booking bar with min-price + dark CTA.        |
| `BookingFlowScreen`     | `pages/booking-new/index`                                         | Owner — pass A                | Service-type sheet, time wheel sheet, mock-pay modal stays (`wx.showModal`).                       |
| `BookingsScreen`        | `pages/bookings/index`                                            | Owner — pass A                | Card rows with status chip; pastel emoji tile; dashed "New Booking" row hidden behind permission.  |
| `BookingSummaryScreen`  | `pages/booking/index`                                             | Owner — pass A                | Apply status pills (`Unpaid` / `Held` / `Released` / `Refunded`) using pastel + dark-fg.           |
| `MessagesScreen`        | `pages/chat/index`                                                | Owner — pass A                | Use `ll-card`; chat-bubble component updates to design tokens.                                     |
| `ActivityScreen`        | New `pages/activity/index` (P0 follow-up) OR `caregiver-earnings` | Caregiver — pass B            | For owners: out of P0 scope (deferred). For caregivers: earnings page already exists; restyle.     |
| `ProfileScreen` (main)  | `pages/me/index`                                                  | Owner — pass A                | Top profile card, 关于我 / 守护者反馈 / 我的宠物 tab, menu rows for guardian / coupons / invite.    |
| `PetsScreen`            | Sub-route of `pages/me`                                           | Owner — pass A                | Show `ll-menu-row`-style pet list + add-pet pill.                                                  |
| `BecomeGuardianPage`    | `pages/caregiver-apply/index`                                     | Caregiver — pass B            | Dark hero, two `ll-card`s (benefits / requirements), sticky CTA.                                   |
| Caregiver inbox/home    | `pages/caregiver-inbox`, `pages/caregiver-home`                   | Caregiver — pass B            | Reuse owner Bookings list chrome; status chips map to caregiver semantics.                         |
| Caregiver earnings      | `pages/caregiver-earnings`                                        | Caregiver — pass B            | Stat tiles + `ll-progress-ring` for "today's balance vs cap"; ledger as `ll-card` rows.            |
| Custom tab bar          | `miniprogram/custom-tab-bar`                                      | Pass A (lands first)          | 5 tabs, `ll-icon` icons, badges via 8px red dot.                                                   |

Pages **not** in the design kit (e.g. `pages/review`, `pages/caregiver-services`, `pages/caregiver-service-edit`, `pages/caregiver-calendar`) follow the same token system. They reuse `ll-card`, `ll-cta`, `ll-menu-row`, `ll-topnav` but do not get a bespoke restyle.

---

## 6. Layout rules

- Page bg `--ll-bg`. Cards are flat `--ll-surface` + `--ll-shadow-card` — borders are reserved for hairline dividers only.
- Top nav 64px, sticky. Bottom tab bar 49px chrome + safe-area pad (78px total visual). Both have radius 0.
- CTAs that close the action (Book Service, Pay, Log) pin **24px above bottom safe area**.
- Min touch target **44 × 44 px**. Around clickable icons leave a 16px halo per 适老化 rules.
- Pet-stage cards stack with `-24px` (24rpx) negative top margin for editorial overlap.
- Section rhythm: title → 16px → content → 24px → next section.
- **Never** use a gradient on the page background. The only gradient in the system is the 4-stop pastel ring used by `ll-progress-ring`.

---

## 7. Bilingual rule (CN + EN coexistence)

The design uses CN as the primary chrome (`选择服务`, `订单`, `守护者反馈`) with EN auxiliary lines (`Pamper Your Pet, Every Day`, `Book Service`). Apply as follows:

1. **Tab bar:** CN only (`首页 / 订单 / 消息 / 守护时刻 / 我的`).
2. **Section headers, modal titles, status chips:** CN primary, optional EN secondary line in `--ll-text-2`, `--ll-caption-size`.
3. **CTAs:** keep the original locale of the surrounding screen. Owner pages default CN (`立即预约`); existing P0 EN strings (`Book Service`, `Pay`, `Cancel Booking`) remain on screens that started as EN-only — translate in a follow-up pass.
4. **Numbers / units:** always SF Pro Text. Never wrap digits in PingFang.
5. **Error toasts** stay in the language of the page (`extractMessage` is locale-agnostic — no string changes needed).

For this pass: add CN headers and the bilingual hero where the moodboard explicitly shows them. Do **not** rewrite all existing EN copy.

---

## 8. Assets

Place into `miniprogram/assets/ll/`:

- `logo.png` — copy from `design/lou-lou-design-system/project/assets/logo.png`.
- Pet hero placeholders: until photography arrives, use a transparent PNG of a pastel-tinted paw silhouette (or empty box) — **never** an emoji rendered as text.
- Icon sprite at `miniprogram/components/ll-icon/icons.ts` (SVG path data exported as a map). Source: re-draw from the Phosphor regular set, or convert the strokes used in `icons.jsx`.

No CDN-fetched fonts. System font stack only — `PingFang SC` is on-device on iOS/macOS; Android falls back to Microsoft YaHei / Noto Sans SC.

---

## 9. Acceptance criteria

A page is "design-system compliant" when **all** of the following hold:

- [ ] All colors, radii, shadows, spacings, type sizes reference `--ll-*` tokens; no hex / px literals in WXSS aside from `1px` dividers.
- [ ] Section rhythm honored (title → 16px → content → 24px).
- [ ] CTAs are `ll-cta` (or render-identical) — never raw `<button class="cta">`.
- [ ] Cards use `ll-card` or token-equivalent — no ad-hoc surfaces.
- [ ] Top nav is `ll-topnav` (when present).
- [ ] Tab bar (when shown) is the custom 5-tab `ll-tab-bar`.
- [ ] No emoji in chrome; SVG icons via `ll-icon` only.
- [ ] No saturated colors outside `--ll-success` / `--ll-warning` / `--ll-danger` / `--ll-info` and the pastel set.
- [ ] Bilingual headers added where moodboard prescribes.
- [ ] `npm run typecheck` + `npm run test` green.

---

## 10. Out of scope (will follow in a later pass)

- Bilingual rewrite of every existing EN string.
- Real pet photography (placeholder PNG OK).
- `ActivityScreen` for owners (walk tracking is post-P0).
- Booking-flow recommendation/success screens (BookingFlowScreen has 3 states; we ship state 1 only this pass — states 2 & 3 land with P0-D).
- Coupons / Invite / Settings sub-pages — show menu rows now, build sub-pages with P0-J / P0-K.
- Replacing `tdesign-miniprogram` primitives. We keep TDesign for compound widgets (`t-tabs`, `t-tab-panel`, `t-stepper`, `t-input`, `t-picker`) and override their styling with `--ll-*` overrides in `app.wxss`.
