# Loulou Design-System Rollout v3

**Sister spec:** `docs/superpowers/specs/2026-07-05-loulou-design-system-v3.md`.
**Builds on:** `docs/superpowers/plans/2026-06-29-design-rollout-v2.md` (largely complete), and `docs/superpowers/plans/2026-05-19-loulou-p0-launch.md` (P0 stages).

Goal: bring the mini-program into strict conformance with the three v3 canonical primitives (`Button`, `Tag`, `StatusPill`) that shipped with the 2026-07-05 design refresh, plus land the `MessagesScreen` order-tag chip and the walker-page rich extras / booking summary cancel-modal follow-ups deferred from v2.

Convention: DSv3-X.Y task IDs. Track in `docs/superpowers/progress/2026-05-19-p0-progress.md`.

## 0. Snapshot

| Item | Count |
|---|---|
| Stages | 4 (DSv3-0 .. DSv3-3) |
| Discrete tasks | 12 |
| Primitive contracts affected | 3 (`ll-cta`, `ll-tag`, `ll-status-badge`) |
| Pages touched | 4 (`chat`, `booking`, `walker`, `bookings`) |
| Branch | `feat/design-v3` (off current `feat/p0-c` once merged) |

---

## Stage DSv3-0 — Primitive contracts (must land first)

### DSv3-0.1 — Extend `ll-cta` with `variant` + `size`

**File:** `miniprogram/components/ll-cta/index.ts`, `index.wxml`, `index.wxss`.

Add:

```ts
properties: {
  text:      { type: String,  value: '' },
  variant:   { type: String,  value: 'primary' },  // 'primary' | 'secondary' | 'ghost'
  size:      { type: String,  value: 'md' },       // 'sm' | 'md' | 'lg'
  block:     { type: Boolean, value: true },
  disabled:  { type: Boolean, value: false },
  loading:   { type: Boolean, value: false },
  // deprecated aliases (log warning on first use)
  full:      { type: Boolean, value: null },
  secondary: { type: Boolean, value: null },
  danger:    { type: Boolean, value: null },
}
```

Size mapping (per v3 spec §2.1):

| size | height | h-pad | font-size |
|------|--------|-------|-----------|
| `sm` | 72rpx  | 32rpx | 26rpx |
| `md` | 88rpx  | 48rpx | 30rpx |
| `lg` | 104rpx | 56rpx | 32rpx |

Variant WXSS classes: `ll-cta--primary` (ink bg + white), `ll-cta--secondary` (transparent bg + `--ll-text` + inset 3rpx `--ll-border`), `ll-cta--ghost` (transparent bg + `--ll-text-2`, no border).

Loading spinner: 28rpx, 4rpx border, `rgba(255,255,255,0.35)` with top-color = `#fff` on primary or `--ll-text` on secondary/ghost.

Backwards compatibility: when `full`, `secondary`, or `danger` are set, log a `console.warn('[ll-cta] deprecated prop …')` and map to the new API (`full` → `block`, `secondary` → `variant='secondary'`, `danger` → variant='primary' with danger-color override or new `variant='danger'` if we want to preserve).

### DSv3-0.2 — Add `ll-tag` primitive

**New:** `miniprogram/components/ll-tag/` (json + ts + wxml + wxss).

Props: `tone: 'butter' | 'lavender' | 'mint' | 'peach' | 'neutral'` (default `'butter'`).

Shape (per v3 spec §2.2):

```css
.ll-tag {
  display: inline-flex; align-items: center;
  height: 44rpx; padding: 0 16rpx;
  border-radius: var(--ll-radius-xs);
  font-size: 22rpx; font-weight: 600; line-height: 1;
  color: var(--ll-text);
  white-space: nowrap;
}
.ll-tag--butter   { background: var(--ll-butter); }
.ll-tag--lavender { background: var(--ll-lavender); }
.ll-tag--mint     { background: var(--ll-mint); }
.ll-tag--peach    { background: var(--ll-peach); }
.ll-tag--neutral  { background: var(--ll-bg); }
```

Slot for label. TS `Component` shell same pattern as `ll-status-badge`.

### DSv3-0.3 — Adapt `ll-status-badge` to canonical enum

**File:** `miniprogram/components/ll-status-badge/index.ts`.

The component's `status` prop should accept the design's 5 canonical statuses:
`pending / accepted / progress / completed / rejected`.

Internal mapping already lives in `miniprogram/utils/orderStatus.ts` — extend it:

```ts
export const REPO_TO_DESIGN_STATUS: Record<BookingStatus, StatusPillStatus> = {
  requested:   'pending',
  accepted:    'accepted',
  in_progress: 'progress',
  completed:   'completed',
  declined:    'rejected',
  cancelled:   'rejected',
}

export type StatusPillStatus = 'pending' | 'accepted' | 'progress' | 'completed' | 'rejected'
```

WXSS: rename CSS class hook `.ll-sb--in_progress` → `.ll-sb--progress` and delete `.ll-sb--cancelled` (rejected handles both). Add a compatibility shim in the TS observer so `status='in_progress'` is silently mapped to `progress` for backwards compat (until callers migrate).

---

## Stage DSv3-A — Consumer page migrations

Once primitives are in, migrate the pages that need them.

### DSv3-A.1 — Migrate `pages/booking` summary to `ll-cta variant`

Current CTAs (from v2 audit):
- `bs-cta bs-cta--ghost` → `<ll-cta variant="ghost" size="md">`
- `bs-cta bs-cta--ink`   → `<ll-cta variant="primary" size="md">`
- `bs-cta bs-cta--danger`→ **retain danger** as raw ghost + red color (design has no danger variant; use a plain button with `--ll-danger` color)

Also update the icon-preceded 修改订单 / 再次预约 buttons to use `<ll-cta variant="secondary" size="md">` + inline icon slot.

### DSv3-A.2 — Migrate `SentAppCard` action row to `ll-cta`

**File:** `miniprogram/components/ll-sent-app-card/index.wxml`.

Current:
- `.ll-sac-act--icon` → `<ll-cta variant="ghost" size="sm">` (icon-only, no label — needs new `iconOnly` treatment or just keep as a raw view)
- `.ll-sac-act--outline` (再次预约) → `<ll-cta variant="secondary" size="sm">`
- `.ll-sac-act--solid` (写评论) → `<ll-cta variant="primary" size="sm">`
- `.ll-sac-act--outline-2` (查看对话) → `<ll-cta variant="ghost" size="sm">`
- `.ll-sac-act--pay` (立即付款) → **retain as green** — design has `accepted`-green solid button; not a canonical variant. Keep raw view with `--ll-status-accepted-fg` bg.

### DSv3-A.3 — `pages/chat` shortcut row uses `ll-cta variant`

Currently uses `ll-shortcut-btn` custom component. Verify whether replacing with `<ll-cta variant="secondary" size="sm">` (for outline shortcut buttons) + `<ll-cta variant="primary" size="sm">` (for 去付款) preserves the 15px icon inline. If not, keep `ll-shortcut-btn` but sync its WXSS with the `ll-cta` variant tokens.

### DSv3-A.4 — Replace ad-hoc pastel chips with `ll-tag`

Sweep:
- `pages/search-results` GuardianCard feature tags (托付过 lavender, 认证 mint, etc.)
- `pages/walker` intake tags in the info tab
- `pages/booking-new` extras "在守护者家" / "在宠物主家" chips

Each becomes `<ll-tag tone="lavender">托付过</ll-tag>` etc. Preserve semantic categorization (relation → lavender, credential → mint, service → butter, facility → neutral).

---

## Stage DSv3-B — MessagesScreen thread chip

### DSv3-B.1 — Add `orderTag` chip to thread rows

**File:** `miniprogram/pages/chat/index.ts` + `index.wxml` + `index.wxss` (threads-list mode only).

For each thread that maps to an accepted / in_progress / completed booking, compute:

```ts
orderTag: `${SERVICE_TYPE_LABEL[booking.serviceType]} · ${fmtDate(booking.date)}${booking.dropoffEnd ? `–${fmtDate(booking.dropoffEnd)}` : ''}`
done: booking.status === 'completed'
```

Render under the name row:

```xml
<view wx:if="{{item.orderTag}}" class="ml-thread-order-tag {{item.done ? 'is-done' : ''}}">
  <ll-icon name="clipboard-text" size="22" color="{{item.done ? '#A0A0B0' : '#2C7A4B'}}"/>
  <text>{{item.orderTag}}</text>
</view>
```

WXSS:

```css
.ml-thread-order-tag {
  display: inline-flex; align-items: center; gap: 8rpx;
  background: #EAF3EE; color: #2C7A4B;
  border-radius: 12rpx; padding: 2rpx 14rpx;
  font-size: 21rpx; font-weight: 600;
  margin: 8rpx 0;
}
.ml-thread-order-tag.is-done {
  background: #F0F0F5; color: var(--ll-text-3);
}
```

### DSv3-B.2 — Two-row MessagesScreen header

Split the current top bar into:
- Row 1: 104rpx height, `消息` title centered, 72rpx spacers.
- Row 2: right-aligned magnifying-glass + headset (each 72rpx round `rgba(34,40,44,0.06)` bg).

Removes the current single-row layout. WXSS + WXML update.

### DSv3-B.3 — Static placeholder threads

Add 4 demo threads (张敏, 李伟, Loulou 平台, 王芳) at the bottom of the list when `threads.length < 4`. These are non-tappable placeholders — no `onOpenChat` binding.

---

## Stage DSv3-C — Deferred v2 follow-ups

Now that we're back on the design, land the biggest gaps from v2 §"Remaining bigger gaps".

### DSv3-C.1 — `pages/walker` per-service extras panel

Read the `CARE_INFO` / `VISIT_INFO` maps + `ROW_PICKUP / ROW_VISIT / ROW_MEDICATE / ROW_EMERGENCY / ROW_LONGTERM / ROW_DELAY / ROW_DELAY_VISIT` row builders from `design/lou-lou-design-system/project/ui_kits/wechat-mini-program/GuardianProfileScreen.jsx`.

Implement as an expandable panel per service in the `服务` tab: base fee row + info tap (opens per-species care-info modal) + extras list. Extras rows use `ll-tag` + `ll-icon`.

### DSv3-C.2 — `pages/booking` cancel modal

Read `BsCancelOrderModal` from `design/lou-lou-design-system/project/ui_kits/wechat-mini-program/BookingSummaryScreen.jsx` (3 tiers: 全额退款 / 部分扣款 / 多日订单).

Replace the current `wx.showModal` cancel confirmation with a bespoke bottom-anchored card that shows the 3 tiers with icons (check-circle green / warning amber / calendar-blank blue).

### DSv3-C.3 — `pages/booking-new` extras stepper

Extras section currently uses inline stepper. Compare against `BF_EXTRAS` + stepper in `BookingFlowScreen.jsx`. Verify parity or update.

---

## Acceptance gate (per stage)

1. `npm run typecheck` — clean.
2. `npm run test` — green.
3. `scripts/screenshots-all.ts` — capture every affected page.
4. Visual diff against `design/lou-lou-design-system/project/ui_kits/wechat-mini-program/*.jsx` — token references, prop shape, palette must match.
5. Update `docs/superpowers/progress/2026-05-19-p0-progress.md` — tick + changelog.
6. Commit per stage.

## Parallelism

- DSv3-0.* land first, in order.
- DSv3-A.* parallel once primitives are in.
- DSv3-B.* independent of DSv3-A — can run in parallel.
- DSv3-C.* each is a big self-contained job — dispatch as separate agents if needed.

## Risks

- **`ll-cta` deprecation churn**: every page importing `ll-cta` might break if we're strict about the API change. Ship `full`/`secondary`/`danger` as deprecated aliases with runtime warnings for one release.
- **StatusPill enum drift**: some tests probably assert `in_progress` on the wire. Update `utils/orderStatus.ts` first, then update tests.
- **Tag / attr-tag confusion**: keep `ll-attr-tag` (stacked block) separate from new `ll-tag` (single-line chip). Don't merge.
