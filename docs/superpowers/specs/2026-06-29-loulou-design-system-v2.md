# Loulou Design-System Spec v2 (Lou Lou · 露露 · 2026-06-29)

**Status:** authoritative for **all visuals + flow chrome** going forward. Supersedes `2026-05-30-loulou-design-system.md` (v1). v1 tokens and primitives remain valid — this doc layers on the new screens, flows, and behaviors introduced in the claude.ai Design System project refresh.

**Source bundle (canonical):** `claude.ai/design/p/d0e77521-a840-4bf3-b1ee-434b57e3296f` (project "Lou Lou Design System", owner: jt). Pull via `DesignSync` tool. The local `design/lou-lou-design-system/` folder is **stale** — do not rely on it. Re-pull components and screens from the claude.ai project when in doubt.

Where v1 and v2 conflict, v2 wins. Where this spec defines visuals and the P0 scope spec (`2026-05-19-loulou-p0-mvp-scope.md`) defines behavior, both must be satisfied.

---

## 1. What changed since v1

| Area | v1 | v2 |
|---|---|---|
| Screen count | 6 (Home/Detail/Activity/Bookings/Profile/BookingSheet) | 18+ (adds Messages, Pets, BookingRequest, BookingSummary, GuardianProfile, BookingFlow, SearchResults, FilterDrawer, SearchPickers, ReviewGuardian, ProcessGuide, OrderModify, PetReminderSheet, CancelPolicyModal, ServiceSwitchDrawer) |
| Booking model | single guardian / single request | **multi-guardian batch application** (basket → batch send → per-guardian accept/reject) |
| Orders tab | static list (`BookingsScreen`) | `BookingRequestScreen` (draft basket + sent apps grouped by batch + tabs 全部/待确认/待付款/待完成/已完成/已失效) |
| Guardian profile | none | sticky `GuardianBookingBar` w/ `ServiceSwitchDrawer` (service grouping by location) |
| Service categorization | flat list | **two colored groups:** 在守护者家 (purple #5B3A8F/#EDE5F7) for 寄养/日托; 在宠物主家 (green #2C7A4B/#E6F1EC) for 遛狗/上门喂养/伴宠留宿 |
| New-user pet flow | optional | `PetReminderSheet` blocks booking if no pet on file; opens `PetsScreen` overlay |
| Chat | basic bubbles | `ChatView` with application card header, status badge, shortcut row (修改订单/详情/去付款 or 详情/去评价), tip & review action sheets, quick-reply pills (申请见面 red outline / 打赏 amber outline) |
| Order data shape | id/service/pet/dates/status | adds `orderNo` (`LL` + 10 ts digits + 2 random), `batchId`, `batchTime`, `nights`, `price`, `dropoff`, `pickup`, `isPrimary`, `reviewed` |
| Mock simulation | none | guardian auto-accepts after 3s if primary or r2; extras auto-reject after 5s |

v1 tokens (colors / radii / shadows / spacing / type / motion) — **unchanged**. v1 primitives (`ll-cta`, `ll-card`, `ll-topnav`, `ll-hero-pill`, `ll-chips`, `ll-pet-stage`, `ll-attr-tag`, `ll-stat-tile`, `ll-progress-ring`, `ll-tab-bar`, `ll-rating-pill`, `ll-menu-row`, `ll-toggle`, `ll-bottom-sheet`) — **unchanged**.

---

## 2. New screens (full inventory)

Numbering picks up after v1 §3.

### 2.1 Tab bar (confirmed)

5 tabs (matches v1, icons re-confirmed from `app.jsx`):

| id | label | icon (regular) | icon (fill, active) | badge |
|---|---|---|---|---|
| `home`    | 首页     | `house`             | `house`             | — |
| `orders`  | 订单     | `receipt`           | `receipt`           | red dot when `ordersBadge=true` |
| `message` | 消息     | `chat-circle-dots`  | `chat-circle-dots`  | red dot when `chatBadge=true` |
| `guard`   | 守护时刻 | `paw-print`         | `paw-print`         | — |
| `me`      | 我的     | `user`              | `user`              | — |

Badge is an 8px circle, `#E63946`, 1.5px white border, positioned `top:-2 right:-3` on the icon stack. Label weight on active = 600.

### 2.2 HomeMarketplaceScreen

Unchanged structurally from v1. Tap a service card → resolve to `CHEN_YI_DATA` mock guardian. Tap search button → `SearchResultsScreen` overlay.

### 2.3 SearchResultsScreen (+ SearchPickers + FilterDrawer)

Overlay (no tab bar). Header reuses search query summary; results list = `ll-card` rows with pastel avatar + rating pill + price. Pick guardian → `GuardianProfileScreen`. `FilterDrawer` is a bottom sheet for `svcType / petType / dateRange / address`. `SearchPickers` exposes per-field bottom sheets used inline.

### 2.4 GuardianProfileScreen + GuardianBookingBar

Profile overlay (no tab bar). Sticky bottom bar:

- **Left:** service name (15px/800 ink) + 修改 button (12.5px/600 underlined `--ll-text-2`, opens `ServiceSwitchDrawer`).
- Below: `从 ¥{price}` 20px/800 ink + `/{unit}起` 12px `--ll-text-3`.
- **Right:** `立即预约` pill — 46px tall, ink bg, white text, 15px/700.

Bar surface `#fff`, top shadow `0 -1px 0 #EEEEF2, 0 -4px 16px rgba(0,0,0,0.07)`, padding `14px 16px 22px`.

### 2.5 ServiceSwitchDrawer

Bottom sheet, 86% max height, 20px top radius. Header: 38×4 grab + 16px/700 title `选择服务` + 30×30 round close (`#F0F0F5` bg, `x` icon).

Body: two grouped chip rows.

| Group | services | active solid | inactive bg | inactive fg |
|---|---|---|---|---|
| 在守护者家 | 寄养, 日托 | `#5B3A8F` | `#EDE5F7` | `#5B3A8F` |
| 在宠物主家 | 遛狗, 上门喂养, 伴宠留宿 | `#2C7A4B` | `#E6F1EC` | `#236B40` |

Chip: 40px tall, 18px h-padding, pill, font 14/700. Active prepends `ph-fill ph-check` (13px) before the label.

Group title: 12.5px/700, group `solid` color, 11px bottom margin, letter-spacing `0.02em`.

Below groups: `取消政策` row — `ph ph-shield-check` 17px + `取消政策` 14/600 + `查看详情` 12px `--ll-text-3` + caret. Tapping opens `CancelPolicyModal` (P1 — show toast in P0).

### 2.6 BookingFlowScreen

Full-screen, takes `guardian`, `initialService`, `initialDateRange`, `initialSchedule`, `myPets`. Form stage → success stage. Existing impl already aligned. New required props from app router:

- `onGoToOrders` — success CTA returns to `orders` tab and clears badge.
- `onGoHome` — secondary success path.
- `onSubmit(data)` — receives `data.additionalGuardians` (the recommended extras chosen during flow). App builds a primary order + N extra orders (`isPrimary=false`), assigns shared `batchId` + `batchTime`.

### 2.7 BookingRequestScreen (replaces simple bookings list)

Renders at `tab === 'orders'`. Three stacked sections:

**(a) Page header** — 22/800 ink `订单` + `OrderTabBar` underneath.

**(b) `OrderTabBar`** — horizontal scroll, tabs:

`全部 · 待确认 · 待付款 · 待完成 · 已完成 · 已失效`

Active tab: 13/700, color `#D97757`, bottom border `2.5px solid #D97757`. Inactive: 13/500, `--ll-text-3`. Strip bg `#fff`, bottom border `1px --ll-border`.

**(c) Draft section** (only on `全部` tab, only when `draftGuardians.length > 0`):

- `ConfigSection`: white card 16r, header `服务信息` + butter `草稿` chip. Service-type chip row (chips 30px, pill, ink/#F5F5FA inactive, 12.5/700-or-500). Below: 4 input rows (宠物 / 开始日期 / 结束日期 / 地点), label `--ll-text-3` 12.5/500 + right-aligned input 13.5/700 ink, 44px height, 1px border between rows.
- Selected guardians card: `已选守护者 (N 位)` header + `GuardianDraftRow` per guardian + dashed `继续添加守护者` row (48×48 plus circle + 13.5 `--ll-text-2`).
- Sticky submit button: 50px pill ink (or 25% ink when checked=0), `发送申请单  给 N 位守护者`.

`GuardianDraftRow`: 24px circular checkbox (ink fill + check when on, hairline outline when off) + 48px avatar + name 14/700 + amber star + rating 11.5/600 + service+price 12 `--ll-text-3` + 28×28 round remove button.

**(d) Apps list** — split into "active batches" + "historical".

Active batches: group by `batchId` (fallback id), sort batches newest first by `batchTime`, sort apps in batch by status priority `accepted(0) > pending(1) > in_progress(2)`. Header per batch: hairline + `{N分钟前发送 | N小时前发送 | M月D日发送 | 刚刚发送 | 已发送}` + hairline.

Historical: `completed | rejected | cancelled` under `历史订单` header.

Empty state: `暂无{tab}订单` 14px `--ll-text-3` centered 48/24 padding.

### 2.8 SentAppCard

White, 16r, shadow `0 2px 8px rgba(0,0,0,0.05)`. Tap = open summary unless inactive (rejected/cancelled).

Layout:

- Top row (14/14/10): 50px avatar (initial fallback) + name 15/700 + `StatusBadge` + service+dates 12.5 `--ll-text-3` + pet 12 `--ll-text-3` + right caret 16 (hidden if inactive).
- Status strip (0/14/10): 7px ping dot (`#F0B100`, anim ping 1.2s) for pending + `{sm.desc}` 12px.
- Action row (0/14/14):
  - `completed`: chat icon 44×36 outline + `再次预约` 36 outlined ink (calendar-plus 15 + label) + `写评论` 36 solid ink (star 15 + label).
  - `accepted`: `查看对话` 36 outline (chat icon 14 + label, `--ll-text-2`) + `立即付款` 36 solid `#2C7A4B`.
  - other active: `查看对话` 36 outline only.

`StatusBadge`: 11/700, padding `3px 9px`, pill.

| status | label | bg | fg | desc |
|---|---|---|---|---|
| `pending`     | 待确认 | `#FEF3C7` | `#B45309`        | 申请已发出，等待守护者接受 |
| `accepted`    | 待付款 | `#E6F1EC` | `#2C7A4B` (APP_GREEN) | 守护者已确认接单，请尽快付款 |
| `in_progress` | 待完成 | `#E3EEF7` | `#2F5F87`        | 服务进行中 |
| `completed`   | 已完成 | `#F0F0F5` | `#6B6B7A`        | 服务已完成，感谢信任 |
| `rejected`    | 已拒绝 | `#FFF0F0` | `#CC2200`        | 守护者暂时无法接受此申请 |
| `cancelled`   | 已取消 | `#F0F0F5` | `#6B6B7A`        | 订单已取消 |

`tabKey` mapping (for `OrderTabBar` filter): pending→待确认, accepted→待付款, in_progress→待完成, completed→已完成, rejected/cancelled→已失效.

### 2.9 MessagesScreen

Threads list — `--ll-card` row per `sentApp`: avatar + name + last message preview + time. Tap → `ChatView` overlay.

### 2.10 ChatView (full-screen overlay)

Vertical stack:

- **Top nav** 52px white, bottom hairline. 34px round back (ink, white caret-left 17). Avatar 32 + name 14/700 + 守护者 11 `--ll-text-3`. `dots-three` 22 `--ll-text-2` right.
- **Application card** (white wrap → bg-colored inner card 12r, 10/14): 40×40 butter tile + clipboard-text icon, then `{service} · {dateStart} – {dateEnd}` 13/700 + `{pet} · {area}` 11.5 `--ll-text-3` + `StatusBadge` right.
- **Shortcut row** (white, 10/14, bottom hairline, gap 8):
  - completed → `详情` outline + `去评价` ink solid.
  - other → `修改订单` outline + `详情` outline + `去付款` ink solid (calls `onOpenSummary`).
  - `ShortcutBtn` = 38px tall, 10r, icon 15 + 13/600 label.
- **Messages** scroller, bg `--ll-bg`, padding 14/14/8. `MsgBubble`:
  - System neutral: 12/`--ll-text-3` centered, 24px h-padding.
  - System action=`summary`: white card 12r 9/13 + 26×26 `#EEF1F4` tile w/ `ph-fill ph-pencil-simple` 14 + text 12.5/500 + right caret 12. Tap → open summary.
  - User: ink bg, white text, radius `18 18 4 18`, max 72%.
  - Guardian: white bg, `--ll-text`, radius `4 18 18 18`, max 72%, shadow `0 1px 4px rgba(0,0,0,0.06)`. Avatar 34 leading.
- **Quick-reply** (white, top hairline, 8/14/0):
  - active: `申请见面` red outline pill (#E63946 1.5px, transparent bg, 12.5/600). Tap presets the input.
  - completed: `打赏` amber outline pill (#D97706 1.5px, bg `#FFFBEB`, 12.5/600, `ph-fill ph-hand-coins` 15). Tap opens tip sheet.
- **Input bar** (white, 8/14/28): 40px pill input (`--ll-bg` bg, `--ll-border`, 14px) + 40 send round (ink when input present, border color when empty, `paper-plane-tilt` 18) + 40 plus round (white, 1.5px border, `plus` 20).
- **Plus menu popup** anchored bottom-right of plus button: 14r, shadow `0 4px 20px rgba(0,0,0,0.13)`, 32×32 tile per item (拍照 / 从相册选择).
- **Tip action sheet**: title `打赏守护者` 16/700 + sub `感谢 {name} 对 {pet} 的悉心照顾` 12.5 `--ll-text-3`. Grid 4×1, amounts `¥8 / ¥18 / ¥38 / ¥66`, button 54px tall, 12r, 1.5px hairline, 17/800 ink. On pick: send message `🧧 我给你发了一个 ¥X 的打赏，谢谢你的照顾！`.
- **Review action sheet**: title `评价本次服务` + 5 star toggles 30px (active `#F5B301`, inactive border). Submit button 50px ink pill `提交评价` → calls `onReview(app, stars)` + sends message `⭐ 我给本次服务打了 N 星好评，谢谢你！`.

### 2.11 BookingSummaryScreen

Already implemented (booking detail page). Adds `onModify(app)`, `onRebook(app)`, `onViewGuardian(g)` props. Re-book = open `BookingFlowScreen` with the same guardian and pre-filled service.

### 2.12 OrderModifyScreen

Full-screen modal layered above tab bar. Lets user change `service / dateStart / dateEnd` + write a message. On confirm: emits a system "summary" action message in chat (`您修改了订单（编号 {shortId}）：{service} · {dl}，等待守护者重新确认`), optionally appends the note as a user message, and replaces the order in `sentApps`.

`shortId` = first 8 chars of `app.id` with `app-` prefix stripped, fallback `000000`.

### 2.13 ReviewGuardianScreen

Full-screen, opened from a completed `SentAppCard`'s `写评论` action. Stars + tags + text. On submit: marks `reviewed: true` on the app, appends system message `您给本次服务打了 N 星好评，感谢您的反馈`.

### 2.14 ProcessGuideScreen

Full-screen overlay opened from a home help affordance. 4-step illustrated onboarding. `onStart` closes; `onClose` closes without progressing flow. Not blocking — purely informational.

### 2.15 PetReminderSheet + PetsScreen overlay

When user taps 立即预约 on `GuardianBookingBar` and `selectedGuardian.isNewUserFlow && userPets.length === 0`:

1. Show `PetReminderSheet` (bottom sheet): title `先填写宠物信息`, two CTAs:
   - `去填写` (primary ink) → close sheet, set `petsForBooking=true`, open `PetsScreen` overlay in `'add'` mode with `completeLabel='保存并继续预约'`.
   - `先逛逛` (secondary outline) → close sheet, continue to booking flow with no pets.
2. `PetsScreen` overlay (paddingTop 47, zIndex 40): when `onComplete` fires, close overlay and open `BookingFlowScreen` with `pendingBooking.guardian + pendingBooking.params`.

### 2.16 CancelPolicyModal

Modal opened from `ServiceSwitchDrawer`'s 取消政策 row. Three-tier policy text. P0 acceptable to render a toast and defer modal to P1.

### 2.17 ProfileScreen (Me)

Already redesigned. v2 confirms tabs row: `关于我 / 守护者反馈 / 我的宠物`. Tabs sticky, ink underline on active, 14/600 label.

### 2.18 PetsScreen

Standalone page used in two modes:

- `'list'` — view + edit existing pets.
- `'add'` — new-pet form, returns via `onComplete` when used in booking-reminder flow.

Props: `pets`, `onPetsChange`, `initialView`, `completeLabel?`, `onComplete?`, `onBack`.

---

## 3. Order data model (v2)

```ts
type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected' | 'cancelled'

interface Order {
  id: string                         // 'app-{ts}-{guardianId}-{rand4}'
  orderNo: string                    // 'LL' + last10 of ts + 2-digit random — user-facing
  guardian: GuardianRef
  isPrimary: boolean                 // primary = the one user explicitly picked
  service: ServiceType
  pet: string
  phone: string
  address: AddressRef | null
  dateStart: string                  // '5月28日'
  dateEnd: string | null             // '5月30日'
  area: string                       // human-readable composite
  status: OrderStatus
  batchId: string                    // 'batch-{ts}' — shared by primary + extras
  batchTime: Date                    // when the batch was submitted
  nights: number
  price: number                      // unit price at time of booking
  dropoff: TimeWindow | null
  pickup: TimeWindow | null
  messages: Message[]
  reviewed?: boolean
}

interface Message {
  id: number
  from: 'system' | 'user' | 'guardian'
  text: string
  time: string                       // 'HH:MM' or '4月12日'
  action?: 'summary'                 // when set, renders as a tappable card → onOpenSummary
}
```

This shape is the **mock-mode** shape. When the cloud cutover happens (Stage 1.M), the cloud-fn return type aligns to this; `phone`, `address`, `dropoff`, `pickup` migrate to dedicated tables.

---

## 4. Service grouping rule (new)

Whenever services need to be visually categorized (drawer, search filter, intake form, recommendations):

| Group label | Services | Token / hex (solid) | bg | fg |
|---|---|---|---|---|
| 在守护者家 | 寄养, 日托 | `#5B3A8F` | `#EDE5F7` | `#5B3A8F` |
| 在宠物主家 | 遛狗, 上门喂养, 伴宠留宿 | `#2C7A4B` | `#E6F1EC` | `#236B40` |

These are **two new accent palettes** not in v1's token table. Add as:

```
--ll-grp-host-solid:  #5B3A8F;
--ll-grp-host-bg:     #EDE5F7;
--ll-grp-owner-solid: #2C7A4B;
--ll-grp-owner-bg:    #E6F1EC;
--ll-grp-owner-fg-2:  #236B40;
```

App-green (`#2C7A4B`, bg `#E6F1EC`) doubles as the `accepted` status color and the 立即付款 CTA on `SentAppCard`. Reuse the same tokens.

Orange `#D97757` is the `OrderTabBar` active tab accent — single-use, not a brand color. Add as `--ll-accent-tab: #D97757` and treat as scoped to that component only.

Amber `#D97706` / `#FFFBEB` / `#B45309` for the tip pill — add as `--ll-accent-tip-*`, scoped.

Heart red `#E63946` stays logo-only **except** for two new exceptions:
- The 申请见面 quick-reply outline.
- The tab-bar badge dot.

Document both exceptions inline.

---

## 5. Mock-mode behavior contracts

These are mock-mode behaviors the design assumes. Mirror in `__USE_MOCK__` branches:

1. **Auto-accept / auto-reject simulation:** for each newly submitted `app`:
   - if `app.isPrimary === true` OR `app.guardian.id === 'r2'` → `setTimeout` 3000ms → status → `accepted`, append guardian welcome message, set `chatBadge=true` + `ordersBadge=true`.
   - else → `setTimeout` 5000ms → status → `rejected`.
   - Guard against double-firing with a `simulatedRef` `Set<id>`.
2. **Batch grouping:** all orders submitted in one booking-flow run share `batchId` and `batchTime`. List groups by these.
3. **Modify chat side-effect:** every modify confirm adds a `system` `action='summary'` message and bumps badges.
4. **Re-book:** opens `BookingFlowScreen` with the original guardian + service prefilled.
5. **Submit review:** stamps `reviewed:true`, appends system message, shows toast `评价已提交，感谢您的反馈 🌟`.

When the cloud cutover lands (Stage 1.M), these contracts must be reproduced server-side OR explicitly stubbed away (e.g. real guardians actually accept). Either way the client behavior must stay identical.

---

## 6. Components to add (`miniprogram/components/ll-*`)

Layer on top of v1's primitive set. None of these break v1:

| Component | Purpose |
|---|---|
| `ll-status-badge`        | wraps the `STATUS_META` palette → pill chip |
| `ll-order-tab-bar`       | horizontal scroll tabs with orange underline (`--ll-accent-tab`) |
| `ll-sent-app-card`       | the full `SentAppCard` chrome (avatar + status + actions) |
| `ll-guardian-draft-row`  | checkbox + avatar + rating + price row |
| `ll-config-section`      | draft service-info card with 4 input rows |
| `ll-shortcut-btn`        | 38px pill button for chat shortcut row |
| `ll-msg-bubble`          | renders system/user/guardian with optional `action='summary'` |
| `ll-quick-reply`         | red-outline 申请见面 / amber-outline 打赏 |
| `ll-tip-sheet`           | bottom sheet w/ 4 amounts → callback |
| `ll-review-sheet`        | 5-star + submit |
| `ll-service-switch-drawer` | grouped chip drawer + cancel-policy row |
| `ll-guardian-booking-bar`  | sticky bottom bar w/ 修改 + price + 立即预约 |
| `ll-pet-reminder-sheet`    | block-booking sheet |
| `ll-process-guide`         | 4-step onboarding overlay |
| `ll-cancel-policy-modal`   | (P1 — stub in P0) |

Each component is a TDesign-style WXML Component with `properties / methods / scoped WXSS`. Tokens-only — no inline hex except for the scoped accent tokens declared in §4.

---

## 7. Page mapping (v2)

| Design screen | Existing miniprogram page | Status in repo |
|---|---|---|
| `HomeMarketplaceScreen`   | `pages/home/index`              | ✅ aligned (v1) |
| `SearchResultsScreen`     | `pages/search-results/index`    | ✅ aligned (v1) |
| `FilterDrawer` + `SearchPickers` | sheets inside `search-results`  | ⚠️ stub — promote to design v2 |
| `GuardianProfileScreen`   | `pages/walker/index`            | ⚠️ needs `GuardianBookingBar` sticky + `ServiceSwitchDrawer` |
| `BookingFlowScreen`       | `pages/booking-new/index`       | ✅ aligned (v1) — re-verify `additionalGuardians` data |
| `BookingRequestScreen`    | `pages/bookings/index`          | ❌ **needs rebuild** — currently shows v1 simple list, must become the draft + tabs + batch view |
| `MessagesScreen`          | `pages/chat/index` (threads)    | ⚠️ partial — verify threads list shape |
| `ChatView`                | `pages/chat-thread/index` (new) OR existing chat detail | ❌ needs full v2 chrome: app card header, shortcut row, quick-reply, tip & review sheets |
| `BookingSummaryScreen`    | `pages/booking/index`           | ⚠️ extend w/ 修改订单 + 再次预约 entry points |
| `OrderModifyScreen`       | new `pages/order-modify/index`  | ❌ new |
| `ReviewGuardianScreen`    | `pages/review/index`            | ⚠️ verify shape matches v2 |
| `ProcessGuideScreen`      | new `pages/process-guide/index` | ❌ new (P0-J) |
| `PetsScreen` (`add` mode) | `pages/pets/index` (?mode=add)  | ⚠️ verify add-mode prop |
| `PetReminderSheet`        | sheet inside `pages/walker`     | ❌ new |
| `CancelPolicyModal`       | sheet inside `pages/walker`     | ❌ stub: P0 toast, P1 full modal |
| `ProfileScreen`           | `pages/me/index`                | ✅ aligned (v1) |
| `ActivityScreen` (守护时刻) | `pages/activity/index`          | ✅ aligned (v1) |

❌ = build in P0. ⚠️ = verify or extend. ✅ = no change.

---

## 8. Acceptance criteria (v2 additions)

A v2 page is "design-system compliant" when v1 criteria hold AND:

- [ ] `OrderStatus` palette uses the §2.8 table — no ad-hoc colors.
- [ ] Multi-guardian batch grouping uses `batchId`/`batchTime` exactly as §2.7.
- [ ] Service grouping in any picker uses the §4 group palettes.
- [ ] `申请见面` quick-reply uses `#E63946` outline — single-use exception.
- [ ] `打赏` quick-reply uses `--ll-accent-tip-*` tokens.
- [ ] `OrderTabBar` uses `--ll-accent-tab` (orange) — single-use exception.
- [ ] All mock-mode behaviors in §5 are reproduced behind `__USE_MOCK__`.
- [ ] Order data shape follows §3 — primary + extras share `batchId`, `orderNo` follows `LL{10}{2}` format.

---

## 9. Out of scope for this pass

- `CancelPolicyModal` — P0 ships a toast; full modal lands in P1.
- `ProcessGuideScreen` real illustrations — placeholder SVGs OK.
- `OrderModifyScreen` — wire up writeback path (must coordinate with `BookingFlowScreen` payload reuse).
- Real photography for `GuardianBookingBar` — placeholders OK.
- Bilingual rewrite of new chrome — defer to follow-up pass; CN-only for new flows is fine.

---

## 10. How to re-pull the source

```ts
DesignSync({ method: 'list_files',  projectId: 'd0e77521-a840-4bf3-b1ee-434b57e3296f' })
DesignSync({ method: 'get_file',    projectId: 'd0e77521-a840-4bf3-b1ee-434b57e3296f', path: 'ui_kits/wechat-mini-program/<file>.jsx' })
```

For larger sync (mirror the project into `design/lou-lou-design-system-v2/`), use the `superpowers:writing-skills` workflow or build a finalize_plan write list.
