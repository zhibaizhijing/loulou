# Loulou Design-System Rollout Plan

**Sister spec:** `docs/superpowers/specs/2026-05-30-loulou-design-system.md` (authoritative for tokens and component contracts).
**Builds on:** `docs/superpowers/specs/2026-05-19-loulou-p0-mvp-scope.md`, `docs/superpowers/plans/2026-05-19-loulou-p0-launch.md`.

Goal: apply the Lou Lou design system to every existing page in the mini-program while keeping `__USE_MOCK__ = true`. No behaviour changes — visual + structural restyle only.

## 0. Snapshot

| Item                                      | Count |
|-------------------------------------------|-------|
| Stages                                    | 6     |
| Discrete tasks                            | 14    |
| Pages to reskin                           | 15    |
| New components (`ll-*`)                   | 13    |
| Branch                                    | `feat/design-system` (off `main`)         |

Convention: tasks below match the IDs maintained in `docs/superpowers/progress/2026-05-19-p0-progress.md`. When a task lands, tick it in the progress file and append a changelog entry.

---

## Stage DS-0 — Foundation (must land first)

Owner-side and caregiver-side pages cannot reskin until tokens + primitives exist.

### DS-0.1 — Wire design tokens

- Edit `miniprogram/app.wxss`: declare every `--ll-*` custom property at `page { ... }` scope. Set page bg = `--ll-bg`, font stack = canonical stack, color = `--ll-text`.
- Add `ll-h1 / ll-h2 / ll-h3 / ll-body / ll-caption / ll-tag` helper classes alongside.
- Add a small TDesign override block at the bottom: `.t-button--primary { background: var(--ll-ink) }`, `.t-tag { border-radius: var(--ll-radius-xs) }`, etc. Only override what the design demands — leave behaviour intact.

### DS-0.2 — Icon system (`ll-icon`)

- Create `miniprogram/components/ll-icon/{index.json,index.ts,index.wxml,index.wxss}`.
- Properties: `name: string`, `size: number` (default 24), `color: string` (default `currentColor`), `weight: 'regular' | 'fill' | 'bold'` (default regular).
- Icons stored in `miniprogram/components/ll-icon/icons.ts` as a map: `{ name: { regular: '<svg path data>', fill?: '...' } }`. Cover the 40+ icons listed in spec §4.
- WXML renders an inline `<image src="data:image/svg+xml,..." />` (or `<rich-text>` SVG). Verify on iOS + Android in WeChat dev tools.

### DS-0.3 — Primitive components

Build under `miniprogram/components/ll-*`, exposing the API listed in spec §3:

- `ll-cta`, `ll-card`, `ll-topnav`, `ll-hero-pill`, `ll-chips`, `ll-pet-stage`, `ll-attr-tag`, `ll-stat-tile`, `ll-progress-ring`, `ll-rating-pill`, `ll-menu-row`, `ll-toggle`, `ll-bottom-sheet`.
- Each ships its own `.test.ts` using `miniprogram-simulate` — verify `properties → className` mapping and that token references resolve. Tests must pass before any page consumes the component.
- `ll-progress-ring` uses an inline SVG with a 4-stop linear gradient (`#FEE7A6 → #D8CAE8 → #C7E8D8 → #FBD3C4`); fall back to single-color stroke on platforms where gradients don't render.

### DS-0.4 — Custom tab bar

Replace `miniprogram/custom-tab-bar/`:

- 5 tabs: `首页 / 订单 / 消息 / 守护时刻 / 我的`.
- Owner mode: tabs map to `/pages/home`, `/pages/bookings`, `/pages/chat`, `/pages/activity` (new placeholder), `/pages/me`.
- Caregiver mode: tabs swap to `/pages/caregiver-home`, `/pages/caregiver-inbox`, `/pages/chat`, `/pages/caregiver-earnings`, `/pages/me`. Source of truth = the `mode` field on the cached user.
- Active icon weight = `fill`; inactive = `regular`. Active label gets weight 600. Badges = 8px `--ll-heart` (allowed exception per design — red dot in `app.jsx` uses `#E63946`) with 1.5px white border.
- Update `app.json.tabBar.list` to match (still required by WeChat even with `custom: true`).

---

## Stage DS-A — Owner pages

Land each as its own commit. Each page replaces inline hex/px with `--ll-*` tokens and switches generic `<view>` chrome to `ll-*` components.

### DS-A.1 — Home (`pages/home`)

- Replace the page chrome with: `ll-hero-pill` row, bilingual hero (`Pamper Your Pet, Every Day` over CN auxiliary), service-type row (`首页 §服务` with 5 pastel rounded squares), `ll-chips` for category filter, two stacked `ll-pet-stage` cards.
- Existing walker grid moves below — same data, restyled as `ll-card` rows with `ll-rating-pill` + `ll-attr-tag` row.
- Keep current filter chips (size + medication toggle) as `ll-chips`.

### DS-A.2 — Walker detail (`pages/walker`)

- Hero image area (280px, `--ll-radius-lg`, ink shadow).
- Title block: name (`ll-h2`) over `ll-body` subtitle. `ll-rating-pill` floats top-right.
- Three `ll-attr-tag` blocks (Pet Type / Coat / Time → in this app: Service / Areas / Capacity).
- Description card (`ll-card` with `Description` header).
- Intake card (already exists for P0-A) restyled with token system + section header `What I accept · 守护范围`.
- Sticky bottom: min-price block + `ll-cta` "Book Service · 立即预约".

### DS-A.3 — Booking flow (`pages/booking-new`)

- `ll-topnav` with back, title "New booking · 新增预约".
- Form sections become `ll-card` blocks with bilingual headers.
- Service-type picker rendered as `ll-chips` (compact) with current variant inline-form below.
- Dog picker: `ll-menu-row` per saved dog + dashed "Add dog · 添加宠物" button.
- Date/time pickers: keep TDesign primitives, restyle via overrides.
- Bottom sticky `ll-cta`: "Confirm · 下一步" → triggers `wx.showModal` (unchanged; the `"Pay"` confirmText fix from `b5cbe64` stays).

### DS-A.4 — Booking detail (`pages/booking`)

- `ll-topnav` with back and title "Booking · 预约详情".
- Top status pill maps `PaymentState` → tone:
  - `unpaid`   → `--ll-butter` bg, `--ll-text`
  - `held`     → `--ll-mint` bg
  - `released` → `--ll-mint` bg + `✓` glyph
  - `refunded` → `--ll-lavender` bg
- Schedule, dog, caregiver, amount blocks → `ll-card` with `ll-h3` header per section.
- Refund preview row uses `--ll-text-2` for fine print; refund amount in `--ll-text` tabular numerals.

### DS-A.5 — Bookings list (`pages/bookings`)

- Page header: `ll-h1` "Bookings · 预约" + caption `${count} upcoming appointments`.
- Each row = `ll-card` with: pastel emoji-or-image tile (`60×60`, `--ll-radius-md`), title (`ll-h3`), clock-icon + when, place caption, status pill on right.
- Status pill bg map:
  - `requested` / `pending` → `--ll-butter`
  - `accepted` / `confirmed` → `#E6F1EC` (light mint variant)
  - `scheduled` → `--ll-lavender`
  - `completed` → `--ll-mint`
  - `cancelled` / `declined` → `#F0F0F5` (neutral) + `--ll-text-2`
- Dashed "New Booking · 新预约" row at the bottom — owner only.

### DS-A.6 — Chat / Messages (`pages/chat`)

- `ll-topnav` with caregiver name + status caption.
- Bubble component: `chat-bubble` updates colors:
  - Inbound (other person): `--ll-surface` bg, `--ll-text`, `--ll-radius-md`, `--ll-shadow-card`.
  - Outbound (me): `--ll-ink` bg, `--ll-text-on-ink`, `--ll-radius-md` with bottom-right radius reduced.
- Input dock: `--ll-surface`, `--ll-border` top hairline, `ll-cta` send button (compact, not full-width).

### DS-A.7 — Me / Profile (`pages/me`)

- Top profile card: `--ll-surface`, avatar silhouette (or `pravatar` URL if available), display name (`ll-h2`), location caption, `ll-cta` "Edit profile · 编辑资料".
- Tabs row: `关于我 / 守护者反馈 / 我的宠物` — sticky, ink underline on active.
- Menu rows: `ll-menu-row` with icons + `iconBg = --ll-ink` for "Become a guardian · 成为守护者", plain bg for others.
- Coupons / Invite / Settings / About sub-pages: add as new pages (`pages/coupons`, `pages/invite`, `pages/settings`, `pages/about`) — sub-page restyle deferred per spec §10.

---

## Stage DS-B — Caregiver pages

### DS-B.1 — Apply (`pages/caregiver-apply`)

- Dark hero block: `--ll-ink` bg, paw icon in `--ll-butter`, title `Become a guardian · 成为守护者`, sub-line in `rgba(255,255,255,0.7)`.
- Two `ll-card` blocks below: "Benefits · 守护者权益" and "Requirements · 申请条件".
- Sticky bottom `ll-cta` "Apply now · 立即申请".
- Existing 6-step wizard (P0-A) wraps inside this chrome — each step becomes an `ll-card` page with `ll-topnav` and "Next" `ll-cta`.

### DS-B.2 — Home / inbox / earnings (`caregiver-home`, `caregiver-inbox`, `caregiver-earnings`)

- `caregiver-home`: top status card (online / paused toggle = `ll-toggle`), quick-stats row using `ll-stat-tile` (today bookings / unread / earnings).
- `caregiver-inbox`: same row chrome as owner Bookings list, status pill semantics swap (`requested` becomes the actionable state).
- `caregiver-earnings`: hero card with current balance (`ll-h1` tabular), `ll-progress-ring` for "weekly cap" (placeholder 75%), `ll-stat-tile` row for credits / commission / payouts / refunds, ledger as `ll-card` rows with kind icon.

### DS-B.3 — Calendar, services, service-edit

- Use `ll-card` + `ll-cta` + `ll-menu-row` only — no bespoke chrome.
- Calendar slot picker keeps TDesign primitive, restyled with token overrides.

---

## Stage DS-C — Wiring + final pass

### DS-C.1 — Link from P0 spec + plan

- Add a "Visuals" pointer block at the top of `docs/superpowers/specs/2026-05-19-loulou-p0-mvp-scope.md` and `docs/superpowers/plans/2026-05-19-loulou-p0-launch.md`: "All visual decisions follow `2026-05-30-loulou-design-system.md`. If this spec conflicts with the design spec, the design spec wins for appearance only."

### DS-C.2 — Verify

- `npm run typecheck` clean.
- `npm run test` green (existing 169+ unit tests must still pass; add component tests as part of DS-0.3).
- Manual on `miniprogram-automator`: screenshot Home, Bookings, Me, Walker, BookingNew. Diff against `design/lou-lou-design-system/project/screenshots/` for sanity (visual diff is informational, not gating).

### DS-C.3 — Update progress + commit

- Tick each DS-* task in `docs/superpowers/progress/2026-05-19-p0-progress.md` (new §"Design system rollout (2026-05-30)").
- Append changelog entry per DS- stage.
- Commit in stages: `feat(design): tokens + primitives`, `feat(design): owner pages`, `feat(design): caregiver pages`, `docs(design): spec + plan`.
- PR title: `feat(design-system): apply Lou Lou design tokens across all pages`.

---

## Parallelism rules

- DS-0.* lands first, in order.
- DS-A.* can be parallelised (page-by-page) once primitives exist.
- DS-B.* depends on DS-0.* but is independent of DS-A.
- DS-C.* lands last.

## Risks

- **Icon sprite size.** Phosphor full set is large; subset must fit under the 2MB main package limit. Strategy: store SVG path data in a TS map, not as `<image>` files.
- **`miniprogram-simulate` + custom components.** Token resolution depends on the parent page importing `app.wxss`. Tests must mount via the page wrapper, not in isolation.
- **TDesign override creep.** Don't override TDesign internals broadly; only the surface-level classes called out in DS-0.1. Component-level fixes go inline on the call site.
- **Two-mode tab bar.** Owner/caregiver tab swap depends on `pages/me` driving the mode flip — confirm mode persists across `wx.reLaunch` (storage-backed in P0-A).
