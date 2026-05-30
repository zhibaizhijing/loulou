# Loulou P0 MVP Scope — 2026-05-19 Reprioritisation

**Date:** 2026-05-19
**Status:** Decisions locked 2026-05-19 (see §9). Supersedes the implicit Phase-1 scope in `2026-05-16-petbacker-dogwalking-mvp-design.md` for *launch* purposes (does not invalidate Phase-1 implementation in flight; see §10).
**Source:** product roadmap reprioritised after discussion of anti-飞单 (off-platform leakage), service-account push, response-time SLAs, and new-user retention.
**Launch target:** still 2026-09 (per `宠物寄养应用问题与范围定义0518.docx`).

> **Visuals.** All visual decisions follow `docs/superpowers/specs/2026-05-30-loulou-design-system.md` (Lou Lou Design System v1.0). If this P0 spec implies a different surface or layout from the design spec, the design spec wins for appearance only — behavior here remains authoritative.

> **Reading order:** Sections 1–4 = scope at three priority tiers. Section 5 details the *net-new* capabilities introduced by this reprioritisation (not present in the prior spec). Section 6 = data-model deltas. Section 7 = launch acceptance criteria. Section 8 = how to absorb this into the existing plan. Section 9 = open decisions. Section 10 = compatibility with the in-flight Phase-1 implementation.

---

## 1. Why this spec exists

The prior spec (`2026-05-16-petbacker-dogwalking-mvp-design.md`) framed Phase 1 as a **dog-walking owner-side vertical slice** — single service, mock payment, hidden walker mode, single-direction review. Other stories were deferred across Phases 2–8.

The reprioritised roadmap collapses that distinction. **P0 = launch**, and P0 is no longer a single-service slice. It now includes:

- All four core services (寄养, 日托, 遛狗, 上门) bookable on day one.
- Real money flow with platform escrow + automatic settlement.
- Dual-side reviews (both owner→caregiver and caregiver→owner).
- Anti-飞单 enforcement (keyword blocking, three-strike ban).
- Service-account (服务号) push for pet status updates (P0-strong / P1-firm).
- Response-time SLAs with automatic recovery (1h unanswered → re-recommend).
- Structured caregiver intake replacing pre-booking consultation.
- New-user first-order coupon + post-register search redirect.
- Backoffice ticketing for customer service.

In short, the prior Phase-1 surface is now a **prototype** relative to the launch P0 surface. The launch needs roughly the scope previously assigned to Phases 1+2+3+4+5+6 (selectively, with growth features carved out to P2).

---

## 2. Priority tier definitions

| Tier | Definition | If missing |
|---|---|---|
| **P0** | Cannot launch without it — trust, transaction, anti-leakage, first-time experience | No launch |
| **P1** | Experience enhancement + retention hook; strongly recommended; can ship within 2 weeks of P0 | Launch acceptable but weaker; ship inside first sprint after P0 |
| **P2** | Growth / incentive features; needs real usage data to tune | Ship after first month of live data |

---

## 3. P0 — Launch-required scope

### 3.1 Owner side (P0, ~14 stories)

| Story | Source (story-map ID + delta) | P0 requirement |
|---|---|---|
| Phone / WeChat one-tap registration | c1 | Account before transaction |
| Pet profile — basics (breed, age) | c7 (subset) | Caregiver needs this pre-accept |
| Location + service-type search | c2 | Core find path |
| Search results show key facts (distance / rating / price / availability) | c2 (deepened) | Decide without asking |
| Caregiver profile shows trust badges (certified, order count, positive-rate) | c3 (deepened) | Eliminate booking hesitation |
| Caregiver profile shows accepted pet types / size / max concurrent | **NEW (P0)** | Replaces pre-booking consultation; reduces support load |
| Online booking + payment | c4 | Transaction core |
| Platform-held escrow on payment | c4 (deepened) | Trust foundation |
| Mark service complete | c4 / c6 (gate) | Transaction terminus |
| Dual-side review (rating + text, both directions) | c6 + p11 | Trust system foundation; **p11 moved into P0 from prior P1** |
| In-app messaging (text + image) | c8 | Anti-飞单 core |
| Pre-booking free consultation entry (messaging before payment) | **NEW (P0)** | New-user comfort before paying |
| **1h unanswered → re-recommend other caregivers** | **NEW (P0)** | Anti-stall — prevents user dropout |
| Customer-service contact entry | c12 | Safety net |
| Order + payment record list | c9 | Basic accounting |
| **Post-register direct-to-search-results redirect** | **NEW (P0)** | Friction reduction |
| **First-order coupon auto-issued on registration** | **NEW (P0)** | First-booking incentive |

### 3.2 Caregiver side (P0, ~12 stories)

| Story | Source + delta | P0 requirement |
|---|---|---|
| Registration + real-name verification | p1 (subset) | Safety baseline |
| Indoor environment photos (≥3) | p1 (deepened) | Trust display |
| Publish service items + pricing | p2 | Supply core |
| **Structured intake — accepted pet types, size band, max concurrent, can-medicate** | **NEW (P0)** | Replaces consultation; surfaced on search/profile |
| Availability calendar — minimal (today on/off toggle) | p3 (radically simplified for P0) | Usability without full calendar UX |
| Accept / decline booking | p4 | Core acceptance flow |
| **24h no-response → auto-decline** | **NEW (P0)** | Owner-experience guard |
| Mark complete + receive payment | p6 | Earnings core |
| In-app messaging (text + image) | p8 | Anti-飞单 |
| Customer-service contact entry | p12 | Safety net |
| Earnings + withdrawal | p9 | Core money out |
| Dual-side review | p11 | Trust system; **promoted to P0** |

### 3.3 Platform / automation (P0, ~6 systems)

| System | Source + delta | P0 requirement |
|---|---|---|
| Funds escrow + 48h-after-review settlement | (new in this scope) | Money trust core |
| **Keyword interception in chat (phone numbers, WeChat IDs)** | **NEW (P0)** | Anti-飞单 enforcement |
| **Violation warning + 3-strike permanent ban** | **NEW (P0)** | Risk floor |
| **Backoffice ticket system (CS workflow + chat-log retrieval)** | **NEW (P0)** | Dispute handling baseline |
| **Auto-trigger re-recommend on 1h-no-reply** | **NEW (P0)** | Owner retention guard |
| **First-order coupon auto-issuance** | **NEW (P0)** | New-user activation |

Items removed/deferred from P0 versus the prior spec:
- Walker-mode demo shortcut (`pages/_walker`) — no place in P0; real caregiver auth supersedes
- Mock payment — replaced with real WeChat Pay merchant flow
- Hidden dev seed CTA — gated to dev builds only
- Live GPS — still out (P2/Phase 8)
- Tiered commission — replaced with **flat 15%** at launch (see P2)

---

## 4. P1 — Recommended fast-follow (within 2 weeks of P0)

| Tier | Story | Rationale |
|---|---|---|
| P1 | Pet profile expansion (vaccines, temperament, medical history) | Can prompt-fill after first booking |
| P1 | Cancel booking (cancel-only; modify-date is P2) | Simplest form ships P1 |
| P1 | Favourite caregivers | Retention hook |
| P1 | Service-account push for pet status (image + text) | Experience win; downgrade is in-app timeline (also P1) |
| P1 | In-app status timeline (fallback if 服务号 not done) | Replaces push when push not ready |
| P1 | Review with photo attachment | Text review first, photo later |
| P1 | Quick-reply templates (caregiver side) | Reduces reply time; promote to P0 if resource allows |
| P1 | Caregiver→pet/owner review visible to caregiver community only | Aids future caregiver decisioning |
| P1 | 服务号 authorisation prompt during onboarding | Soft, not enforced |

---

## 5. New capabilities introduced by this reprioritisation

These are **not present** in `2026-05-16-petbacker-dogwalking-mvp-design.md` and require fresh design.

### 5.1 Anti-飞单 enforcement (P0)

**Goal:** keep transactions on-platform. Detect and penalise off-platform contact attempts.

**Behaviours:**
- **Keyword interception** on send-message: regex match for 11-digit phone numbers, WeChat ID patterns (`vx`, `微信`, contiguous digits within Chinese context), QQ patterns, hand-off phrases ("加我", "私下联系"). Match → message rejected at server with a soft warning; not silently dropped.
- **Strike counter** per user: each rejection logs a `violation` record. Three strikes → permanent account suspension. Suspension blocks new bookings + login; existing bookings reconciled via CS.
- **Visibility:** UI shows a warning toast on rejection; user sees current strike count.
- **CS override:** support staff can clear strikes or escalate suspensions via backoffice.
- **False-positive handling:** allow-list addresses, vet clinic names, etc.; tunable via admin config collection.

**Out of scope for P0:** image-based contact detection (QR code OCR), audio detection.

### 5.2 Response-time SLA & auto-recommend (P0)

**Goal:** prevent owners abandoning a search because their first inquiry stalled.

**Behaviour:**
- Owner sends pre-booking inquiry → `inquiries` row created with `expiresAt = now + 1h`.
- Scheduled fn (every 5 min) finds expired-unanswered inquiries → triggers **re-recommend**: 服务号 push (P0 if available, else in-app notification) listing 3 alternative caregivers matching the same search criteria.
- Caregiver still receives the inquiry; if they reply later, owner sees normal flow.
- Counts toward caregiver "responsiveness" stat (visible to caregivers in their dashboard).

**Acceptance:** an owner whose first inquiry is ignored gets a re-recommend within 65 minutes.

### 5.3 Caregiver auto-decline at 24h (P0)

**Goal:** protect owner experience from caregivers who let booking requests rot.

**Behaviour:** booking `status = 'requested'` for 24h with no caregiver action → scheduled fn flips to `auto_declined`. Refund initiated. Owner notified with one-tap re-search CTA. Counts against caregiver acceptance-rate stat.

### 5.4 Structured caregiver intake (P0)

**Goal:** answer 90% of "can you take my dog?" questions without messaging.

**Required fields (collected during onboarding, editable later):**

```
acceptedPetTypes: ('dog' | 'cat' | 'small_animal')[]
acceptedSizeBands: ('xs' | 's' | 'm' | 'l' | 'xl')[]   // <5kg, 5–10, 10–20, 20–30, 30+
maxConcurrent: 1 | 2 | 3 | 4 | 5+
canMedicate: boolean
acceptsAggressive: boolean
acceptsPuppy: boolean      // <6 months
acceptsSenior: boolean     // >10 years
notes: string              // free-text caveats, ≤200 chars
```

Surfaced as filter chips on search results and as a fixed-position info card on caregiver profile.

### 5.5 First-order coupon & new-user flow (P0)

**Goal:** lower friction on first booking.

**Behaviours:**
- On first successful registration, server inserts a `coupons` row: `{ userId, code, type:'first_order', discount: 30, currency: 'CNY', validUntil: now+30d }`.
- Coupon automatically applied at checkout when first booking is placed (no code entry).
- Post-register router → `/pages/home?openSearch=1` with the search-results panel pre-rendered if any prior search params exist in session, else default to user-geolocation default tab.

### 5.6 Service-account (服务号) push — partial P0

**Goal:** asynchronous notifications when the mini-program is not open. Closes the two highest-emotion gaps without ballooning P0 scope.

**P0 triggers (must ship at launch):**
- `booking_accepted` — caregiver accepted owner's booking request. Decision-relief moment.
- `pet_status_update` — caregiver posted a status note + photo during service. Anxiety-relief moment.

**P0 plumbing:**
- 服务号 (Service Account) registered with WeChat — separate from 小程序 appid.
- Two `subscribe_message` templates approved by WeChat (1–7 day lead per template).
- `wx.requestSubscribeMessage` opt-in prompt at exactly two moments: immediately after first successful booking submission (for `booking_accepted`), and on the booking detail page first view (for `pet_status_update`).
- Cloud fn `sendSubscribeMsg` — idempotent per `(userId, templateId, triggerEventId)`. Refuses to double-send on cloud-fn retries.
- 服务号 authorisation guidance card on caregiver onboarding (P0) — soft prompt only; not a blocker.

**P1 triggers (deferred 2 weeks):**
- `booking_declined`, `booking_auto_declined`, `inquiry_recommend_alt` (1h re-recommend), `walk_report_posted` (general kind/owner has already had the pet-status push covering similar event for service kinds that use status updates), `review_reminder`, `ticket_updated`.

**In-app timeline as complement (P0):**
- Status updates always also write a `serviceUpdates` row.
- Booking detail page renders a timeline of all updates regardless of push opt-in.
- Users who decline 服务号 opt-in still see all activity on app re-open.
- Mini badge count on app icon for unread items in `bookings` tab (uses `wx.setTabBarBadge`).

**Why partial:** ships the two notifications that drive pilot delight and retention (booking confirmation + pet status anxiety relief) while keeping P0 scope bounded. Remaining four triggers slot into the P1 stage with the same `sendSubscribeMsg` fn — additive, not refactored.

### 5.7 Backoffice CS ticket system (P0)

**Goal:** handle disputes without ad-hoc DMs.

**Scope at P0:**
- Tickets collection (per spec §6.3 below).
- Owner + caregiver app surfaces — categories, free-text + image upload, ticket history.
- Backoffice — minimal admin web (could be a separate mini-program "管理后台") to view queue, reply, retrieve chat log for a booking, mark resolved.
- SLA: 2h business-hour acknowledgement. Webhook to Lark/Feishu on new ticket.

### 5.8 Flat 15% commission (P0)

**Goal:** simplest defensible rate at launch; tier engine deferred.

**Behaviour:** every settled booking deducts 15% commission line from caregiver payout. Visible in earnings ledger. No per-caregiver overrides at P0; admin can set a global override constant.

### 5.9 Funds escrow (P0)

**Goal:** owner pays platform; caregiver paid only after evidence service is complete.

**State machine:**
```
unpaid → held (owner paid, funds with platform)
held   → released (auto-released 48h after both reviews submitted or completion confirmed, whichever later)
held   → refunded (cancellation policy or dispute outcome)
```

Refund triggers (P0):
- Caregiver auto-decline at 24h → full refund
- Caregiver explicit decline → full refund
- Owner cancel before acceptance → full refund
- Owner cancel after acceptance → policy-based refund (P0: 80% if >24h before, 50% if 12–24h, 0% if <12h; per-service overrides P1)
- Dispute escalated via CS → manual adjustment by admin

---

## 6. Data-model deltas vs prior spec

Prior spec's collections (`users`, `walkers`, `bookings`, `messages`, `reviews`, `walkReports`) are kept and extended. New collections are introduced.

### 6.1 Renamed / generalised
- `walkers` → `caregivers`. Adds: `serviceTypes[]`, `acceptedPetTypes[]`, `acceptedSizeBands[]`, `maxConcurrent`, `canMedicate`, `acceptsAggressive`, `acceptsPuppy`, `acceptsSenior`, `intakeNotes`, `responsiveness` (avg minutes to first reply), `acceptanceRate`, `orderCount`, `positiveRate`, `commissionRate` (default 0.15).
- `walkReports` → `serviceUpdates`. Polymorphic to any service type. Fields: `bookingId`, `media[]`, `notes`, `kind` (walk-summary, daycare-summary, boarding-checkin, etc.).
- `reviews` extended with `subjectType: 'caregiver' | 'owner' | 'pet'`, `direction: 'owner_to_caregiver' | 'caregiver_to_owner'`, `tags?: string[]`.

### 6.2 Extended
- `bookings` adds: `serviceType`, `nights?`, `visits?[]`, `payment: { state, amount, commission, payoutAmount, txId? }`, `couponId?`, `acceptanceDeadline` (now+24h on create), `autoDeclinedAt?`.
- `users` adds: `firstOrderUsedAt?`, `subscribeMsgOptIn: boolean`.
- `messages` adds: `flaggedAt?`, `flagReason?`, `blocked: boolean` (true if keyword match rejected the send).

### 6.3 New collections
- `inquiries` — `{ ownerId, caregiverId, openedAt, expiresAt, firstReplyAt?, status: 'open' | 'replied' | 'recommended_alt' }`.
- `coupons` — `{ ownerId, code, type, discount, currency, issuedAt, validUntil, usedOnBookingId? }`.
- `violations` — `{ userId, messageId, reason, strikeNumber, occurredAt, resolvedBy? }`.
- `tickets` — `{ openerId, openerRole, bookingId?, category, description, evidenceFileIds[], severity, status, slaDueAt, replies: [{by, text, at}] }`.
- `caregiverApplications` — `{ userId, realName, idVerificationResult, envPhotos[], status, submittedAt, reviewedBy?, reviewedAt? }`.
- `services` — `{ caregiverId, serviceType, priceUnit, basePrice, surcharges, active }`.
- `availability` — minimal P0: `{ caregiverId, today: boolean, manualOff?: string[] }`. Full calendar slots = P1.
- `payouts` (ledger) — `{ caregiverId, bookingId?, kind: 'credit'|'commission'|'payout'|'refund'|'adjustment', amount, balanceAfter, createdAt, txId? }`.
- `config` — singleton admin doc (full shape in §9.1): cancellation tiers, coupon engine + first-order defaults, anti-flight strike rules, inquiry SLA windows + recommend count, commission rate, quick-reply templates by service type, keyword patterns, allow-list.

### 6.4 DB rules
- World-read: `caregivers`, `services`, `reviews`.
- Server-only: everything else.
- Client write: none. All mutations via cloud fns.

---

## 7. Launch acceptance criteria (P0 done = launch-ready)

A build is P0-complete when **all** of the following pass on the live CloudBase env with non-seeded data (real test accounts):

1. **End-to-end success path, multi-service**
   - Owner registers (WeChat) → lands on search results → applies coupon → books a 寄养 service → pays via WeChat Pay → caregiver accepts within 24h → service completes → both reviews submitted → 48h later caregiver receives 85% payout.
   - Repeat for 日托, 遛狗, 上门 with appropriate booking forms.

2. **Anti-飞单**
   - Sending "我的手机是13800138000" via chat returns rejected + first strike recorded.
   - Three rejections → account suspended, login blocked, banner displayed.
   - Allow-list entry permits a flagged but legitimate string (e.g., 24-hour hotline number).

3. **Response SLA**
   - Inquiry left unanswered 1h → owner receives re-recommend with 3 alternative caregivers within 65 min.
   - Caregiver inaction 24h on booking request → auto-decline, refund initiated, owner notified.

4. **Structured intake**
   - A search filter on `serviceType=寄养 & sizeBand=l & canMedicate=true` returns only caregivers whose intake fields match.
   - Caregiver profile shows the intake card above price grid.

5. **Trust badges**
   - Profile renders 认证 / order count / positive rate / responsiveness from caregiver doc; values match underlying counts within 5 min of the triggering event.

6. **Payment + escrow**
   - Mock-pay code removed. Real WeChat Pay sandbox transaction completes; funds appear in escrow ledger; payout fires at T+48h.
   - Refund tested for each policy bucket.

7. **CS**
   - Owner submits ticket with two evidence images; ticket appears in backoffice queue; admin reply persists; chat log for the booking retrievable.

8. **Compliance baselines**
   - PIPL consent flow on first launch.
   - Privacy policy reachable from `/pages/me`.
   - ICP filing verified for `wxab4f24c2c7243737`.
   - WeChat Pay 商户号 issued and bound.

9. **Mock removed**
   - `__USE_MOCK__` constant deleted or hardcoded false. No `miniprogram/mocks/` directory in build. No mock banner.

10. **Observability**
    - Funnel events firing for register, search, view-caregiver, start-booking, complete-booking, send-message, submit-review, ticket-open.
    - CloudBase cost dashboard configured with daily alert.

---

## 8. Absorbing this into the existing plan

The plan file `docs/superpowers/plans/2026-05-16-petbacker-dogwalking-mvp.md` currently maps Tasks 1–37 to Phase 1 (mock-mode dog-walking slice) and Tasks 38–110 to later phases. P0 launch now requires features previously scheduled across Phase 2, 3, 4, 5, 6 — selectively. Suggested re-plan approach:

### 8.1 Stay-the-course portion (Phase 1 as built)
Phase 1 Tasks 1–37 + Stage 1.5M (Tasks 98–104) are **not wasted**. They build the foundation (services layer, error contract, page state helper, dog-walking flow, mock infrastructure) that the broader P0 surface still uses. Existing in-flight session continues on these.

### 8.2 P0 launch-additions (to be planned next)
After Phase 1 mock loop is demoable, write a new plan `2026-05-19-loulou-p0-launch.md` covering, in approximate order:
1. Rename `walkers` → `caregivers` + add intake fields (Phase 3 Task 51 promoted; Phase 2 Tasks 38–43 expand into structured intake).
2. Real caregiver onboarding with real-name verification (Phase 2 Tasks 38–42, 46).
3. Multi-service modelling — boarding, daycare, house-visit (Phase 3 Tasks 51–56).
4. Real WeChat Pay + escrow + flat 15% commission + payout (Phase 4 Tasks 57–66, with commission engine simplified to a constant).
5. Anti-飞单 — keyword filter + strikes + suspension (new tasks; expand current Task 90 chat moderation into multi-task sub-stage).
6. Response-time SLA — inquiry collection + scheduled re-recommend fn (new tasks).
7. 24h auto-decline (new task within Phase 2 Task 45).
8. Service-account push (Phase 6 Tasks 73–74) + in-app timeline fallback.
9. First-order coupon + post-register redirect (new tasks).
10. Customer-service ticketing (Phase 5 Tasks 67–69, expanded).
11. PIPL consent, ICP, 商户号 confirmation (Cross-cutting Tasks 88, 89; existing).
12. Stage 1.M cloud activation + mock removal.

Some Phase-1 simplifications must be **undone** before launch (clearly listed in §3.3 above): walker-mode flag, mock pay, demo seed CTA. Stage 1.M (Tasks 105–110) already removes mocks; walker-mode flag removal happens within Phase 2 (Task 50).

### 8.3 P1 follow-on
After P0 ships, a P1 plan covers favourites, modify-cancel, pet-profile depth, photo reviews, push if downgraded, etc. Roughly Phases 6 + leftover Phase 5 items.

### 8.4 P2 deferred
Tiered commission, loyalty, repeat-order discounts, zero-bad-review rewards — left as growth backlog under Phase 7.

---

## 9. Decisions resolved 2026-05-19

| # | Question | Decision | Implementation note |
|---|---|---|---|
| 1 | Launch type at 2026-09 | **Closed pilot, one city, invited testers** | 50–100 体验成员; public listing deferred to Q4/Q1 2027 |
| 2 | 服务号 push at P0 or P1 | **Partial P0** — push for **booking-accepted** + **pet-status update** at P0 (highest-emotion triggers). Remaining triggers (re-recommend, walk-report-posted, review-reminder, ticket-update) at P1. In-app timeline complements push for users who haven't opted in. | See §5.6 (revised) |
| 3 | Photo review at P0 or P1 | **P1** — text-only reviews at P0 | Defers image moderation surface |
| 4 | Quick-reply templates at P0 or P1 | **P0** — ship with templates | Pairs with 1h response SLA; templates per service type in `config` |
| 5 | Cancellation thresholds | **Config-driven**, default Strict bucket (80/50/0 at 24h/12h) | Stored in `config.cancellation.tiers`; engine reads N tiers dynamically |
| 6 | Coupon value | **Config-driven**, default 30 CNY off | Stored in `config.coupon.firstOrder.value` |
| 7 | Strike threshold | **Config-driven**, default 3 strikes → permanent ban | `config.antiFlight.strikeLimit` |
| 8 | Re-recommend count | **Config-driven**, default 3 | `config.inquirySla.recommendCount` |
| 9 | Coupon engine TYPE | **Multi-type dispatch engine** built once | Supports `fixed` / `pctWithCap` / `fixedWithMinSpend`; coupon doc carries `type` field; defaults to `fixed` |
| 10 | Image-based 飞单 detection | **Out of P0** | Text keyword filter only at P0; revisit at month 2 if leakage signal emerges; data-model `messages.imageFlagged?` reserved for additive retrofit |
| 11 | Backoffice surface | **CloudBase console + Lark/Feishu webhook** | New ticket → Lark `#cs-tickets`. Admin replies via `replyTicket` cloud fn invoked from console. Migrate to admin 小程序 around month 2 if volume warrants. |

### 9.1 Config-driven principle

Where a decision is a tunable value rather than a structural choice, store it in the singleton `config` doc (§6.3) and read it at runtime. Default values shipped in code; production values tuned via CloudBase console without redeploy.

```ts
// shape committed to code; values overridable in config doc
type Config = {
  cancellation: { tiers: { hoursBeforeStart: number; refundPct: number }[] }
  coupon: {
    firstOrder: {
      type: 'fixed' | 'pctWithCap' | 'fixedWithMinSpend'
      value: number
      capCNY?: number
      minSpendCNY?: number
      validDays: number
    }
  }
  antiFlight: { strikeLimit: number; banAction: 'permanent' | 'temporary' }
  inquirySla: { unansweredMinutes: number; recommendCount: number }
  commission: { rate: number }   // default 0.15
  quickReplies: { byServiceType: Record<string, string[]> }
}
```

`config` read once per page load + cached for 5 min. Mutations to config require admin-openid via `assertAdmin`.

### 9.2 Open product calls deferred to backlog (not blocking plan rewrite)

- Coupon-abuse heuristics (multi-account creation to harvest first-order discount). Watch metric post-launch.
- Service-account opt-in moment exact UX. Detail at the time push lands (P1).
- Admin override path for unbanning a 3-strike user. Initial implementation = manual `violations` record edit via console. Formal flow when P1 admin 小程序 lands.

---

## 10. Compatibility with in-flight Phase-1 implementation

The current Claude session (other terminal) is building the prior Phase-1 scope: dog-walking owner-side, mock pay, walker-mode demo, single-direction review. **Do not interrupt it.** That work is still load-bearing — it builds the services layer, error contract, page state helper, dog-walking flow, and mock infrastructure (Stage 1.5M) which the broader P0 surface reuses unchanged.

The boundary:

| In-flight (keep) | Replaced for P0 launch (do later) |
|---|---|
| Services layer with `__USE_MOCK__` | Mock removed (Stage 1.M Task 110) |
| `walkers` collection name | Rename to `caregivers` (Phase 3 Task 51) |
| Mock pay UI | Replaced by real WeChat Pay (Phase 4) |
| Demo walker-mode flag | Replaced by real caregiver auth (Phase 2 Task 50) |
| Single-direction review (owner→walker) | Extended to dual-direction (Phase 6 Task 78) |
| Inline `dog-form` | Promoted to a pet entity (Cross-cutting Task 97) |
| Free-text chat | Server-side keyword interception added (Phase 6 / new Stage) |
| 30-min walks only | Multi-service forms (Phase 3 Task 55) |

The in-flight session does **not** need to know about this new scope. When it finishes Phase 1 (through Stage 1.M), the next planning cycle picks up the additions defined here.

---

## 11. Comparison summary — prior spec vs this spec

| Topic | Prior spec (2026-05-16) | This spec (2026-05-19) |
|---|---|---|
| Launch scope | Owner-side dog-walking slice, demo only | Multi-service two-sided launch-ready P0 |
| Payment | Mock UI | Real WeChat Pay with escrow |
| Reviews | Single-direction | Dual-direction at P0 |
| Caregiver auth | Demo session flag | Real-name verified onboarding |
| Anti-飞单 | Not in scope | Keyword filter + 3-strike ban at P0 |
| Response SLAs | Not in scope | 1h inquiry re-recommend + 24h auto-decline at P0 |
| Caregiver intake | Bio + photos | Bio + photos + structured pet capacity fields |
| New-user flow | Default home | Coupon-issued, search-redirect, 30-day validity |
| 服务号 push | Phase 6 | Partial P0 (booking-accepted + pet-status); remaining triggers P1 |
| Customer service | Phase 5 | P0 |
| Commission | Tiered / deferred | Flat 15% at P0; tiers at P2 |
| GPS / live tracking | Phase 8 | Still P2/Phase 8 |
| i18n | Phase 8 | Still out |

This spec **does not** invalidate the prior spec's architecture (Hybrid client-reads-DB / writes-through-fn, error contract, mock toggle). It expands the scope of what counts as launch.

---

## 12. Next actions

1. ~~Lock open decisions in §9~~ — **done 2026-05-19**.
2. Draft `docs/superpowers/plans/2026-05-19-loulou-p0-launch.md` reflecting the locked decisions.
3. Update risks doc (`docs/superpowers/risks/2026-05-18-loulou-risks.md`) — anti-飞单 keyword false positives, coupon abuse, response-SLA gameability, ticket SLA staffing (now founder-on-Lark), leakage risk from no image OCR at P0.
4. Confirm 商户号 application timing — critical path for 2026-09 closed pilot.
5. Set up Lark/Feishu `#cs-tickets` channel + webhook URL before backoffice plumbing lands.
