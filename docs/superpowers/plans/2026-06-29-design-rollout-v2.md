# Loulou Design-System Rollout v2

**Sister spec:** `docs/superpowers/specs/2026-06-29-loulou-design-system-v2.md`.
**Builds on:** `docs/superpowers/specs/2026-05-30-loulou-design-system.md` (v1 tokens + primitives still valid) and `docs/superpowers/plans/2026-05-19-loulou-p0-launch.md` (P0 stages).

Goal: ship every new screen, flow, and interaction introduced by the refreshed claude.ai Design System project (`d0e77521-a840-4bf3-b1ee-434b57e3296f`) in the mini-program. Keep `__USE_MOCK__ = true`. Behavior changes are in-scope this time (multi-guardian batch, batch grouping, auto-accept/reject mock, chat shortcuts, modify/review entry points).

Convention: tasks below match the IDs maintained in `docs/superpowers/progress/2026-05-19-p0-progress.md`. Tick + changelog on completion.

## 0. Snapshot

| Item | Count |
|---|---|
| Stages | 5 (DSv2-0 .. DSv2-4) |
| Discrete tasks | 18 |
| New `ll-*` components | 15 |
| New pages | 2 (`order-modify`, `process-guide`) |
| Branch | `feat/design-v2` (off `feat/p0-c` once merged) |

---

## Stage DSv2-0 — Foundation

### DSv2-0.1 — Token additions

In `miniprogram/app.wxss`:

```css
page {
  /* …existing v1 tokens… */
  --ll-grp-host-solid:  #5B3A8F;
  --ll-grp-host-bg:     #EDE5F7;
  --ll-grp-owner-solid: #2C7A4B;
  --ll-grp-owner-bg:    #E6F1EC;
  --ll-grp-owner-fg-2:  #236B40;

  --ll-accent-tab:        #D97757; /* OrderTabBar only */
  --ll-accent-tip-solid:  #D97706;
  --ll-accent-tip-bg:     #FFFBEB;
  --ll-accent-tip-fg:     #B45309;

  /* Status palette (SentAppCard + StatusBadge) */
  --ll-status-pending-bg:     #FEF3C7;
  --ll-status-pending-fg:     #B45309;
  --ll-status-accepted-bg:    var(--ll-grp-owner-bg);
  --ll-status-accepted-fg:    var(--ll-grp-owner-solid);
  --ll-status-progress-bg:    #E3EEF7;
  --ll-status-progress-fg:    #2F5F87;
  --ll-status-completed-bg:   #F0F0F5;
  --ll-status-completed-fg:   #6B6B7A;
  --ll-status-rejected-bg:    #FFF0F0;
  --ll-status-rejected-fg:    #CC2200;
}
```

### DSv2-0.2 — Order data shape (mock store)

Update `miniprogram/services/orders.ts` mock branch to emit `orderNo`, `batchId`, `batchTime`, `nights`, `price`, `dropoff`, `pickup`, `isPrimary`, `reviewed` per spec §3. Bump `miniprogram/mocks/orders.ts` seed accordingly.

Add helper `mintOrderNo()`: `'LL' + String(Date.now()).slice(-10) + String(rand10..99)`.

### DSv2-0.3 — Auto-accept/reject simulation (mock)

In `miniprogram/services/orders.ts` mock branch, after each `submitOrder()`:
- Use a module-local `Set<string>` to dedup.
- `setTimeout(3000)` flip primary (or guardian id `r2`) → `accepted`, append `system: 'guardian welcomed'` + a guardian welcome message. Bump unread badges via the service event bus.
- `setTimeout(5000)` flip extras → `rejected`.

Wire the badge bumps through `miniprogram/services/notifications.ts` (already exposes `setOrdersBadge`, `setChatBadge`).

### DSv2-0.4 — Component shells (no behavior yet)

Create empty WXML/WXSS/JS/JSON files for every component in spec §6. Each compiles + renders an empty `<view/>` so pages can import them while the team fills bodies in parallel.

---

## Stage DSv2-A — Reusable v2 components

Each lands as its own commit; each ships a `.test.ts` (`miniprogram-simulate`) that verifies the rendered DOM matches the design fixture.

### DSv2-A.1 — `ll-status-badge`

Props: `status: OrderStatus`. Maps to `STATUS_META` via CSS variables (one class per status). Pill, 11/700, padding `3px 9px`. Test: every status renders the right label.

### DSv2-A.2 — `ll-order-tab-bar`

Props: `tabs: string[]`, `active: string`, `bind:change`. Horizontal scroll, no scrollbar. Active = `--ll-accent-tab` 700 + 2.5px bottom border same color. Inactive = `--ll-text-3` 500. Strip bottom hairline.

### DSv2-A.3 — `ll-sent-app-card`

Props: `app: Order`, `bind:opensummary`, `bind:openchat`, `bind:rebook`, `bind:writereview`. Reproduces §2.8 exactly: avatar (initial fallback), name, badge, dates+pet, status strip with ping dot for pending, action row variant per status.

### DSv2-A.4 — `ll-guardian-draft-row` + `ll-config-section`

Together render the draft basket card. `ll-config-section` exposes `config: {service, pet, dateStart, dateEnd, area}` + `bind:change`. Service chips: ink solid when active, `#F5F5FA` inactive. 4 input rows: label minWidth 62, right-aligned input 13.5/700.

### DSv2-A.5 — `ll-shortcut-btn` + `ll-msg-bubble`

`ll-shortcut-btn`: props `icon`, `label`, `primary` (default false). 38px, 10r, icon 15 + label 13/600.

`ll-msg-bubble`: props `msg`, `photo`, `app`, `bind:opensummary`. Branches:
- `system` no action → centered 12 `--ll-text-3`.
- `system` action=`summary` → tappable card per §2.10.
- `user`/`guardian` bubble shapes per §2.10.

### DSv2-A.6 — `ll-quick-reply`

Props: `mode: 'meet' | 'tip'`, `bind:tap`. `meet` = red `#E63946` outline `申请见面`. `tip` = amber tokens `打赏`.

### DSv2-A.7 — `ll-tip-sheet` + `ll-review-sheet`

Bottom-sheet primitives. `ll-tip-sheet` props: `visible`, `guardianName`, `petName`, `bind:pick`. Amounts hardcoded `[8,18,38,66]`. `ll-review-sheet` props: `visible`, `bind:submit`. 5-star toggle. Submit pill 50px ink.

### DSv2-A.8 — `ll-service-switch-drawer`

Props: `services: SvcRef[]`, `value: ServiceType`, `bind:pick`, `bind:close`, `bind:policy`. Two groups per spec §4. Active chip uses group's solid; inactive uses group bg + group fg. Footer row `取消政策`.

### DSv2-A.9 — `ll-guardian-booking-bar`

Props: `guardian: Guardian`, `initialService?: ServiceType`, `bind:book(svcId)`. Renders sticky bar per §2.4 + manages internal `svcId` state + opens `ll-service-switch-drawer` on `修改`.

### DSv2-A.10 — `ll-pet-reminder-sheet`

Bottom sheet props: `visible`, `bind:viewpets`, `bind:continue`, `bind:dismiss`. Title + two CTAs (去填写 ink solid, 先逛逛 outline).

### DSv2-A.11 — `ll-process-guide`

Full-screen overlay. Props: `steps: Step[]`, `bind:close`, `bind:start`. 4-step illustrated walkthrough, paginated.

### DSv2-A.12 — `ll-cancel-policy-modal` (stub for P0)

Renders a toast in P0. Real modal land in P1.

---

## Stage DSv2-B — Rebuild Orders tab (BookingRequestScreen)

### DSv2-B.1 — Rebuild `pages/bookings/index`

Replace existing simple list with the §2.7 layout:
- Header bar w/ 22/800 `订单` + `ll-order-tab-bar`.
- Draft section (only on 全部 tab, only when `draftGuardians.length > 0`):
  - `ll-config-section`
  - `已选守护者 (N 位)` card with `ll-guardian-draft-row` per draft + dashed `继续添加守护者` row → navigates to home.
  - Submit pill `发送申请单  给 N 位守护者`.
- Apps list: group by `batchId`, sort newest-first, sort within batch (accepted/pending/in_progress). Historical section under `历史订单`.
- Empty: `暂无{tab}订单`.

State source: `services/orders.ts` reactive store (existing `useOrdersStore`). Draft basket lives in a new `services/draftBasket.ts` store with localstorage persistence.

### DSv2-B.2 — Draft basket service

`services/draftBasket.ts`:
- `getDraftGuardians(): GuardianRef[]`
- `addGuardian(g)`
- `removeGuardian(id)`
- `getConfig() / updateConfig(field, value)`
- `clearAfterSend(ids: string[])`
- Persist to `wx.setStorage` key `loulou:draft:v1`.

Hook into `pages/home` and `pages/search-results`: tapping `加入申请单` on a guardian card calls `addGuardian` + toast `{name} 已加入申请单`.

### DSv2-B.3 — Multi-guardian submit

On submit pill tap → call `services/orders.ts:sendBatch(checkedIds, config)`. The service mints one batch (`batchId = 'batch-'+Date.now()`), creates one `Order` per checked guardian (`isPrimary` true for the user-explicitly-picked primary if any; else first), assigns shared `batchTime`. Returns the list.

---

## Stage DSv2-C — Chat overhaul (ChatView)

### DSv2-C.1 — Build `pages/chat-thread/index` (new) OR refactor existing detail

Renders §2.10: top nav, application card, shortcut row, message list, quick-reply, input bar, plus-menu popup, tip & review sheets. Navigated to from:
- `pages/chat/index` thread row tap.
- `pages/bookings/index` `查看对话` button.

### DSv2-C.2 — Wire shortcut row

- `修改订单` → navigate to `pages/order-modify?orderId=...`.
- `详情` → navigate to `pages/booking?orderId=...` (= summary).
- `去付款` → navigate to `pages/booking?orderId=...&action=pay` → triggers pay modal on mount.
- `去评价` → opens `ll-review-sheet`.

### DSv2-C.3 — Wire quick-reply

- `申请见面` → set input value to `您好，我们能提前见面熟悉一下吗`.
- `打赏` → open `ll-tip-sheet`. On pick, send message `🧧 我给你发了一个 ¥X 的打赏，谢谢你的照顾！`.

### DSv2-C.4 — System action=`summary` bubble

When chat receives a `system` message with `action: 'summary'`, render the tappable card and on tap navigate to `pages/booking?orderId=...`.

---

## Stage DSv2-D — Guardian profile + booking guards

### DSv2-D.1 — Sticky `ll-guardian-booking-bar` on `pages/walker`

Inject the bar at page bottom. Hide when keyboard open. Tap `修改` → service switch drawer. Tap `立即预约` → pet reminder check (DSv2-D.2) → `pages/booking-new` with `walkerId`, `service`, prefilled dates.

### DSv2-D.2 — Pet reminder gate

In `pages/walker`, before navigating to booking:
1. Read `userPets` from `services/pets.ts`.
2. If `selectedGuardian.isNewUserFlow === true && userPets.length === 0` → show `ll-pet-reminder-sheet`.
3. On `去填写` → navigate to `pages/pets?mode=add&returnTo=booking-new&...`.
4. On `先逛逛` → continue to booking.

`pages/pets`: support `mode=add` query param. When `returnTo` is set, after `保存` redirect to the booking target with original params preserved.

### DSv2-D.3 — Cancel policy stub

Tap `取消政策` row inside `ll-service-switch-drawer` → `wx.showToast({title:'取消政策详情建设中', icon:'none'})`. (Full modal in P1.)

---

## Stage DSv2-E — Summary, Modify, Review, Guide

### DSv2-E.1 — Extend `pages/booking` (Summary)

Add 修改订单 + 再次预约 CTAs. Both navigate:
- 修改订单 → `pages/order-modify?orderId=...`.
- 再次预约 → `pages/booking-new?walkerId={guardian.id}&service={service}` w/ prefilled dates.

### DSv2-E.2 — New `pages/order-modify/index`

Form mirroring `BookingFlowScreen`'s form stage but limited to: service (chips), dateStart, dateEnd, message. Confirm → `services/orders.ts:modifyOrder(orderId, changes)` which:
- Replaces the order in the store.
- Appends `system` message with `action:'summary'`.
- If `message` non-empty, appends as `user` message.
- Bumps badges.
- Shows toast `修改已提交，已发送提醒给守护者` and returns to chat.

### DSv2-E.3 — Verify `pages/review`

Match §2.13 shape. Submit calls `services/orders.ts:submitReview(orderId, {stars, tags, text})`. Appends system message + sets `reviewed:true` + toast `评价已提交，感谢您的反馈 🌟`.

### DSv2-E.4 — New `pages/process-guide/index`

4-step pager. Tap CTA on the home help affordance to open. `完成` and `跳过` both go back.

---

## Acceptance gate (per stage)

After each stage:

1. `npm run typecheck` — clean.
2. `npm run test` — green.
3. `scripts/screenshots-all.ts` — capture every affected page.
4. **Visual diff against the design**: pull the corresponding `.jsx` via `DesignSync` and compare element-by-element (token use, spacing, copy, status palette). No drift > 2px on layout; no off-token colors; no missing interactions.
5. Update `docs/superpowers/progress/2026-05-19-p0-progress.md`: tick boxes, snapshot counts, changelog line.
6. Commit per stage. Stage `DSv2-A` may bundle component commits.

## Parallelism rules

- DSv2-0.* lands first, in order.
- DSv2-A.* parallel (one component per agent OK), once DSv2-0 done.
- DSv2-B / DSv2-C / DSv2-D / DSv2-E can run in parallel once their consumed components from DSv2-A are merged.

## Risks

- **Mock store rebuilds wipe local draft basket.** Persist to `wx.setStorage`; restore on app start.
- **Auto-accept timer leaks.** Use `simulatedRef` (module-local `Set`) + clear on app teardown.
- **Tab badge desync.** Source of truth = `services/notifications.ts`. All bumps go through it.
- **`additionalGuardians` payload from `BookingFlowScreen`.** Currently mocked as `null`; if recommendation widget isn't wired, the batch still works with N=1.
- **Visual regression on v1 pages.** Add screenshot snapshots for Home / Me / Activity / Walker before starting DSv2-B; re-run after each stage.
