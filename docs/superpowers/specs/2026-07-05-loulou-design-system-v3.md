# Loulou Design-System Spec v3 (Lou Lou · 露露 · 2026-07-05)

**Status:** authoritative for **all visuals + primitive contracts** going forward. Supersedes `2026-06-29-loulou-design-system-v2.md` (v2). Both v1 and v2 remain valid where their guidance is not contradicted here.

**Source bundle (canonical, refreshed 2026-07-05):**

- Disk mirror: `design/lou-lou-design-system/` — freshly synced by user on 2026-07-05.
- Live project: `claude.ai/design/p/d0e77521-a840-4bf3-b1ee-434b57e3296f` — re-pull via `DesignSync` for latest.

Where v2 and v3 conflict, v3 wins.

---

## 1. What changed since v2

| Area | v2 (2026-06-29) | v3 (2026-07-05) |
|---|---|---|
| Canonical primitives | none — `ui_kits/*.jsx` treated as reference | 3 official token-driven React primitives ship as compiled `_ds_bundle.js`: `Button`, `Tag`, `StatusPill`. Each has `<Name>.jsx` + `<Name>.d.ts` + `<name>.html` preview under `components/`. |
| Order-status status codes | `pending / accepted / in_progress / completed / rejected / cancelled` | Same six repo-side, but the **StatusPill primitive uses `progress` (not `in_progress`)** as its enum member. Adapter needed at the UI layer. |
| Prototype vs. production | ambiguous | `ui_kits/wechat-mini-program/` is explicitly a **runnable reference app**, not a consumer of the compiled bundle. Production code should read tokens from `colors_and_type.css` and reuse the `components/` primitives — the ui_kits JSX is a design contract, not code to import. |
| Design system window namespace | undocumented | `window.LouLouDesignSystem_d0e775 = { Button, Tag, StatusPill }` — the `d0e775` suffix comes from the project id. |
| Screen JSX depth | 6 substantive screens (~350KB total) | Screens grew ~30% each (~500KB total). Most growth is in per-service pricing / extras copy under GuardianProfileScreen (80KB), BookingFlowScreen (88KB), BookingRequestScreen (76KB), BookingSummaryScreen (54KB). No new tabs or high-level flows added — only depth. |
| MessagesScreen chrome | 2-row header (title + icon actions) | Same, **plus per-thread `orderTag` chip** with `ph ph-clipboard-text` icon + service/date, green `#EAF3EE`/`#2C7A4B` when active or gray `#F0F0F5`/`text-3` when completed. Live threads keep a green dot indicator; static threads (张敏 / 李伟 / Loulou 平台 / 王芳) remain as demo placeholder rows. |
| Design tokens (`colors_and_type.css`) | v1 baseline | **Unchanged from v1.** No new tokens introduced by v3. |

v1 primitives (`ll-cta`, `ll-card`, `ll-topnav`, `ll-hero-pill`, `ll-chips`, `ll-pet-stage`, `ll-attr-tag`, `ll-stat-tile`, `ll-progress-ring`, `ll-tab-bar`, `ll-rating-pill`, `ll-menu-row`, `ll-toggle`, `ll-bottom-sheet`) and v2 primitives (15 new `ll-*` components under §2.6 of the v2 spec) — **all unchanged**.

---

## 2. Canonical primitives (new in v3)

The design system now ships three officially-blessed, strongly-typed React primitives in `design/lou-lou-design-system/project/components/`. They are the **contract** for their respective UI surfaces; every mini-program equivalent must match their prop shape and visual output.

### 2.1 `Button`

```ts
interface ButtonProps {
  children?: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'   // default 'primary'
  size?: 'sm' | 'md' | 'lg'                     // default 'md'
  block?: boolean                                // stretch to container width
  disabled?: boolean
  loading?: boolean                              // inline spinner + block
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
}
```

Sizing:

| size | height | padding | font-size |
|------|--------|---------|-----------|
| `sm` | 36px | 0 16px | 13px |
| `md` | 44px | 0 24px | 15px |
| `lg` | 52px | 0 28px | 16px |

Variants:

- **primary**: `bg: --ll-ink` → disabled `--ll-ink-disabled`; `color: --ll-text-on-ink`
- **secondary**: `bg: transparent`; `color: --ll-text` (disabled `--ll-text-3`); `inset 0 0 0 1.5px --ll-border`
- **ghost**: `bg: transparent`; `color: --ll-text-2` (disabled `--ll-text-3`)

Loading spinner: 14×14, 2px border, `rgba(255,255,255,0.35)` with top-color = `#fff` for primary or `--ll-text` for secondary/ghost. Animation `ll-btn-spin 0.8s linear infinite`.

Radius: `--ll-radius-pill` (999px). Font-family: `var(--font-sans)`. Transition: `background 120ms ease, transform 120ms ease`.

**Mini-program mapping:** `ll-cta` gets extended with `variant` (`primary`|`secondary`|`ghost`) and `size` (`sm`|`md`|`lg`) props to match. Existing `ll-cta` calls default to `variant=primary size=md`, so no breaking change.

### 2.2 `Tag`

```ts
interface TagProps {
  children?: ReactNode
  tone?: 'butter' | 'lavender' | 'mint' | 'peach' | 'neutral'  // default 'butter'
}
```

Shape: 22px height, 0 8px pad, `--ll-radius-xs` (4px), font 11/600, color `--ll-text`.

Backgrounds:
- `butter` → `--ll-butter` (#FEE7A6)
- `lavender` → `--ll-lavender` (#D8CAE8)
- `mint` → `--ll-mint` (#C7E8D8)
- `peach` → `--ll-peach` (#FBD3C4)
- `neutral` → `--ll-bg` (#F8F8FC)

**Mini-program mapping:** existing pastel tags (in `ll-attr-tag`, service chips, feature tags on `SearchResultsScreen` GuardianCard) must all resolve to this palette. Any tag using non-`Tag` tones (e.g. off-token pastels) needs to move to `neutral` or one of the four sanctioned pastels.

### 2.3 `StatusPill`

```ts
interface StatusPillProps {
  status?: 'pending' | 'accepted' | 'progress' | 'completed' | 'rejected'
  children?: ReactNode   // override default label
}
```

Palette + default label:

| status | bg | fg | label |
|---|---|---|---|
| `pending`   | `#FEF3C7` | `#B45309` | 待确认 |
| `accepted`  | `#E6F1EC` | `#2C7A4B` | 待付款 |
| `progress`  | `#E3EEF7` | `#2F5F87` | 待完成 |
| `completed` | `#F0F0F5` | `#6B6B7A` | 已完成 |
| `rejected`  | `#FFF0F0` | `#CC2200` | 已失效 |

Shape: 11/700 font, 4px 9px pad, `--ll-radius-pill`, `whiteSpace: nowrap`.

**Note the enum change from v2:** design uses `progress` (not `in_progress`). Also `cancelled` is not a status here — cancelled orders collapse into `rejected` for pill display.

**Mini-program mapping:** existing `ll-status-badge` supports `pending/accepted/in_progress/completed/rejected/cancelled` — a superset. Add an adapter so `in_progress → progress` and `cancelled → rejected` when rendering via the design-canonical palette. Repo BookingStatus semantics stay intact.

---

## 3. Prototype vs. production distinction

The updated `README.md` §5 clarifies the boundary:

> The `ui_kits/wechat-mini-program/` prototype predates these primitives and renders its own inline equivalents via in-browser Babel; **it is a runnable reference app, not a consumer of the compiled bundle.**

Implication for our mini-program:

- **`components/*.jsx`** = design contract. Match the prop shape, sizing, and palette exactly in the `ll-*` equivalents.
- **`ui_kits/wechat-mini-program/*.jsx`** = visual reference for full screen composition. Match the layout, copy, and interaction patterns — but reproduce inline styles as WXSS + design tokens, not by importing the JSX.
- **`preview/*.html`** = self-contained token cards (colors, radii, shadows, spacing, type, chips, tabbar, topnav). Read these to sanity-check any styling decision.

`_ds_bundle.js` compiles the three `components/` primitives. In WeChat MP we can't consume the compiled bundle at runtime (React vs. Skyline), so we reimplement each primitive as an `ll-*` Component whose contract mirrors the prop shape.

---

## 4. Screen-level changes since v2

None of the top-level flows changed. Screen JSX files grew because per-service pricing / extras copy expanded, not because new tabs or components were added. The v2 flow inventory (§2.1–§2.18 in v2 spec) is **still authoritative** for screen structure and behavior.

Notable expansions worth reflecting in the mini-program follow-up:

### 4.1 `MessagesScreen` — order-tag chip in thread rows

New: each thread row for a live guardian conversation now shows a small pill under the name:

```
[icon: clipboard-text 11px] {service} · {dateStart}(–{dateEnd})?
```

- Active thread: bg `#EAF3EE`, fg `#2C7A4B` (green).
- Completed thread: bg `#F0F0F5`, fg `--ll-text-3` (gray).
- Icon: `ph ph-clipboard-text`, 11px, same fg.

Applies to threads with status `accepted / in_progress / completed`. Static placeholder threads (张敏, 李伟, Loulou 平台, 王芳) render without the chip.

Also: the header is now **two rows**:
1. Row 1: 52px height, `消息` title centered, 36px spacers left+right.
2. Row 2: right-aligned action buttons (magnifying-glass, headset), 36px round, `rgba(34,40,44,0.06)` bg.

### 4.2 `GuardianProfileScreen` — grew from 73KB → 80KB

Growth is in per-species care info + per-service pricing detail (already tracked as follow-up in v2 §"Remaining gaps"). Key content addition:

- `CARE_INFO` and `VISIT_INFO` per-pet-type copy (dog/cat/hamster/rabbit/bird)
- `ROW_PICKUP`, `ROW_VISIT`, `ROW_MEDICATE`, `ROW_EMERGENCY(p)`, `ROW_LONGTERM`, `ROW_DELAY`, `ROW_DELAY_VISIT` — extra-fee row builders shared across 寄养/日托/上门喂养 tabs

No new tabs. Structure remains: header + hero photo + name/rating/area + tabs (信息/评价/服务) + sticky booking bar.

### 4.3 `BookingFlowScreen` — grew from 76KB → 88KB

New content: `BF_MY_PETS`, `BF_EXTRAS`, `BF_RECS` mock arrays; walk-time slot pickers; per-service form variants (A: date range for 寄养/日托/伴宠留宿, B: schedule for 遛狗/上门喂养). Stage flow unchanged: form → recommendation → success.

### 4.4 `BookingSummaryScreen` — grew from 51KB → 54KB

New content: `BS_SVC_ICON` map + `bsCancelDate()` helper + `BsCancelOrderModal` (three tiers: 全额退款 / 部分扣款 / 多日订单 — matches v2 §"remaining gaps" cancel modal).

### 4.5 `BookingRequestScreen` — grew to 76KB

Detail additions in status desc / batch grouping / draft basket. No structural change from v2.

### 4.6 `HomeMarketplaceScreen` — grew to 32KB

Detail additions in `DateRangePickerSheet` / `SchedulePickerSheet` / `FieldPickerSheet` and `ProcessGuideScreen` — the guide overlay in the home JSX now includes 7 fully-fleshed step cards with per-perk chips, scroll-reveal deck animation, and `继续下滑或点按卡片展开后续步骤` hint. Already implemented in `pages/process-guide` (verified 2026-06-29).

---

## 5. Repo primitives that need updating

To bring the mini-program into strict conformance with the v3 canonical primitives:

### 5.1 `ll-cta` — extend

Add two properties, both with backward-compatible defaults:

- `variant: 'primary' | 'secondary' | 'ghost'` (default `'primary'`)
- `size: 'sm' | 'md' | 'lg'` (default `'md'`)

Height / padding / font-size mapping matches §2.1 exactly. `secondary` variant replaces the current ad-hoc "outlined" pattern (used by 修改订单 / 再次预约 in the booking summary — should migrate to `<ll-cta variant="secondary" />`). `ghost` variant replaces text-only buttons like 全部 / 修改 links.

The existing `disabled` and `loading` props are kept; the `full` prop is renamed to `block` (with `full` kept as a deprecated alias) to match the primitive contract.

### 5.2 `ll-tag` — new (or fold into `ll-attr-tag`)

Add a tone-driven tag primitive with the five sanctioned tones. This replaces the ad-hoc pastel spans scattered across `SearchResultsScreen` GuardianCard (feature tags), `walker` intake tags, etc.

Prop: `tone: 'butter' | 'lavender' | 'mint' | 'peach' | 'neutral'` (default `'butter'`).

Existing `ll-attr-tag` is a stacked-block (label + value) which is a different shape — keep it. The new `ll-tag` is a single-line inline chip.

### 5.3 `ll-status-badge` — adapter

Repo `BookingStatus` = `requested / accepted / declined / in_progress / completed / cancelled`.
Design `StatusPill.status` = `pending / accepted / progress / completed / rejected`.

Adapter (already partially in `miniprogram/utils/orderStatus.ts`):

- `requested` → `pending`
- `declined` → `rejected`
- `cancelled` → `rejected` (was `cancelled` in v2; changed for v3 conformance)
- `in_progress` → `progress`
- `accepted`, `completed` → unchanged

Update `ll-status-badge` to accept the design's 5 canonical statuses on the wire, and internally map the repo's 6 states to those five.

---

## 6. Acceptance criteria (v3 additions)

A page is "v3 design-system compliant" when v1+v2 criteria hold AND:

- [ ] Every CTA is `<ll-cta variant="…" size="…" />` — no inline `<view class="cta">`, no raw `<button>`. Variants map exactly per §2.1.
- [ ] Every inline pastel chip is `<ll-tag tone="…" />` — no off-token pastels in chip backgrounds.
- [ ] Every order-status pill maps via the §5.3 adapter — `progress` (not `in_progress`), `rejected` (not `cancelled`) on the wire.
- [ ] `MessagesScreen` thread rows show the order-tag chip per §4.1.
- [ ] `pages/booking` summary sub-page and `pages/booking-new` still work — status enum change is UI-adapter-only.

---

## 7. Out of scope for v3

Same as v2 §10 plus:

- Consuming the compiled `_ds_bundle.js` at runtime in the mini-program (React runtime incompatibility). Reimplement each primitive as an `ll-*` Component.
- Auto-generating rpx values from `colors_and_type.css` px values. Continue to hand-map at design boundary (1rpx ≈ 0.5px on 375pt viewport).
- Fully replicating per-species `CARE_INFO` / extra-fee schedule on `pages/walker`. Continues to be tracked as v2 §"Remaining gaps" for a dedicated session.

---

## 8. How to re-pull the source

```bash
# From the local mirror (fastest, always up-to-date after user syncs)
cat design/lou-lou-design-system/project/components/Button/Button.jsx
cat design/lou-lou-design-system/project/ui_kits/wechat-mini-program/GuardianProfileScreen.jsx

# From the live claude.ai project (guarantees latest)
DesignSync({ method: 'list_files',  projectId: 'd0e77521-a840-4bf3-b1ee-434b57e3296f' })
DesignSync({ method: 'get_file',    projectId: 'd0e77521-a840-4bf3-b1ee-434b57e3296f', path: 'components/Button/Button.jsx' })
```

Always cross-check the local mirror timestamp against the live project before authoring changes.
