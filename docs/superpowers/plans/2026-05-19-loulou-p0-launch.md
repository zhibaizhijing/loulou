# Loulou P0 Launch Plan + P1 Follow-on (Closed Pilot, 2026-09)

**Date:** 2026-05-19
**Companion spec:** `docs/superpowers/specs/2026-05-19-loulou-p0-mvp-scope.md` (decisions locked §9)
**Design spec + rollout plan:** `docs/superpowers/specs/2026-05-30-loulou-design-system.md` + `docs/superpowers/plans/2026-05-30-design-rollout.md` — all visual + component decisions live there.
**Predecessor plan:** `docs/superpowers/plans/2026-05-16-petbacker-dogwalking-mvp.md` (Phase 1 dog-walking slice, Tasks 1–110)
**Launch target:** closed pilot, single city, 50–100 invited testers, 2026-09
**This plan is outline-level.** Detailed TDD-step bodies emerge when each P0 stage enters implementation; mirrors the depth of Phase 2–8 outlines in the predecessor plan.

> **Indexing.** Tasks numbered **111 – 199** to continue flat numbering from predecessor plan. Stages tagged **P0-A through P0-M** for launch-required work, **P1-A through P1-G** for fast-follow. Cross-references to predecessor tasks use `prior Task N` notation.

---

## 1. Relationship to predecessor plan

Phase 1 (predecessor Tasks 1–37 + Stage 1.5M 98–104 + Stage 1.M 105–110) is **not wasted**. It builds the foundation this plan extends:

| Phase 1 produced | P0 reuses unchanged | P0 modifies |
|---|---|---|
| Services layer + pages + components (browse, profile, booking, chat, walk-report, review) | yes | rename `walker*` → `caregiver*`; add multi-service variants |
| `FnResult` / `AppError` contract | yes | — |
| `usePageState` helper | yes | — |
| Mock infrastructure (Stage 1.5M) | yes — dev/demo loop | removed before pilot (Phase 1 Stage 1.M Task 110) |
| Demo walker-mode + flat reviews + single service + mock pay | — | **fully replaced** by P0-B / P0-C / P0-G / Phase 2 Task 50 |

Execution sequencing: predecessor Phase 1 finishes (Stages 1.0 → 1.M) **before** P0 stages start, except for non-engineering critical-path prereqs (§3) which start immediately.

---

## 2. Existing-plan tasks that P0 absorbs

These predecessor tasks (originally outline-level, Phase 2–8) are now P0-required. Brief is locked in this plan when the scope shifts; otherwise the predecessor outline holds.

| Predecessor task | Absorbed into P0 stage | Scope change |
|---|---|---|
| 38 (caregivers + applications + services + availability collections) | P0-B | Add intake fields per spec §5.4 |
| 39 (`applyCaregiver`) | P0-B | unchanged |
| 40 (`submitCertification`) | P0-B | unchanged |
| 41 (Tencent Faceid integration) | P0-B | unchanged |
| 42 (`approveApplication` / `rejectApplication`) | P0-B | unchanged |
| 43 (`publishService` / `updateService` / `unpublishService`) | P0-B | adds priceUnit per service type |
| 44 (`setAvailability` / `getAvailability`) | P0-B | P0 minimum = "today on/off" toggle, not full calendar; full calendar = P1 |
| 45 (booking state machine requested → accepted/declined + 24h auto-decline) | P0-E | 24h auto-decline now in scope |
| 46 (caregiver onboarding wizard) | P0-B | adds intake step |
| 47 (caregiver dashboard) | P0-B | unchanged |
| 48 (caregiver self-edit profile) | P0-B | adds intake editor |
| 49 (calendar editor) | **P1** | demoted — P0 only needs the toggle |
| 50 (migrate walker-mode → real caregiver auth) | P0-B | unchanged |
| 51 (data migration walkers → caregivers) | P0-A | + serviceType[] backfill |
| 52 (per-service-type pricing units) | P0-A | unchanged |
| 53 (service-type tabs on home) | P0-A | unchanged |
| 54 (service-type filter + GPS) | P0-A | unchanged |
| 55 (per-service booking-new variants) | P0-A | unchanged |
| 56 (booking schema multi-service fields) | P0-A | unchanged |
| 57 (商户号 onboarding) | **§3 prereq** | started Day 0 |
| 58 (real payment cloud fn) | P0-C | unchanged |
| 59 (escrow state model) | P0-C | unchanged |
| 60 (`releasePayment` T+48h) | P0-C | settlement key = both reviews submitted OR completion confirmed |
| 61 (`refundPayment`) | P0-C | unchanged |
| 62 (ledger + earnings + withdrawal fns) | P0-C | unchanged |
| 63 (caregiver earnings page) | P0-C | unchanged |
| 64 (owner payment record page) | P0-C | no invoice export at P0 |
| 65 (commission engine) | P0-L | simplified to fixed 15% reading from `config` |
| 66 (money idempotency) | P0-C | unchanged |
| 67 (tickets + `createTicket`) | P0-I | unchanged |
| 68 (CS page owner + caregiver) | P0-I | unchanged |
| 69 (admin queue + playbook) | P0-I | implementation = Lark webhook + CloudBase console; no admin UI |
| 70 (background check integration) | **P1** | optional at P0 — real-name + ID + env photos enough for pilot |
| 71 (insurance partner integration) | **deferred** | post-P1 |
| 72 (optional insurance line in checkout) | **deferred** | post-P1 |
| 73 (subscribe-message templates) | P0-J (partial) | only 2 templates at P0 (`booking_accepted`, `pet_status_update`); 4 more at P1-A |
| 74 (subscribe-msg trigger wiring) | P0-J / P1-A | partial at P0 |
| 75 (favourites) | **P1-E** | unchanged |
| 76 (cancellation policy + refund calc) | P0-C | config-driven tier engine per spec §9.1 |
| 77 (modify booking flow) | **deferred to P2** | per spec §3 |
| 78 (bi-directional review) | P0-G | promoted from Phase 6 |
| 79 (quick-reply templates) | P0-H | promoted from Phase 6 |
| 87 (analytics event taxonomy) | P0-M | unchanged |
| 88 (staging vs prod env separation) | P0-M | unchanged |
| 89 (PIPL consent + privacy + data export/delete) | P0-K | unchanged |
| 90 (chat content moderation Tencent CMS) | P0-D | scoped at P0 to **keyword regex only**; OCR deferred per §9 row 10 |
| 91 (image compression + lifecycle) | P0-M | unchanged |
| 92 (telemetry / cost monitoring) | P0-M | unchanged |
| 93 (brand theming) | **P1** | not launch-blocking |
| 94 (DB index list + migrations) | P0-M | unchanged |
| 95 (onboarding funnel analytics) | P0-M | unchanged |
| 96 (pilot launch criteria checklist) | P0-M | this plan's §6 expands it |
| 97 (multi-pet / multi-species data model) | **P1** | dogs only at P0; cat support P1 |

Tasks NOT mentioned (80–86 Phases 7–8) remain post-launch.

---

## 3. Critical-path prereqs — start Day 0, non-engineering

These have lead times that block engineering. Start immediately, in parallel with Phase 1 implementation.

### Prereq-1: WeChat Pay 商户号 application
- mp.weixin.qq.com → 微信支付 → apply
- Need verified business entity, ICP, bank account
- Lead time 2–6 weeks
- Owner: founder / operations
- Blocks: P0-C (real payments) — entire stage cannot start without merchant ID

### Prereq-2: WeChat 服务号 registration + template approval
- mp.weixin.qq.com → 公众平台 → 注册服务号 (subject must match 小程序 entity)
- After registration, draft 2 templates: `booking_accepted`, `pet_status_update`
- Each template approval lead 1–7 days
- Owner: founder / operations
- Blocks: P0-J

### Prereq-3: Tencent Cloud Faceid product enabled
- console.cloud.tencent.com → 实名认证 → 开通 Faceid
- Get API keys; store in CloudBase env config
- Lead time ~1 day
- Blocks: P0-B Task 41 (predecessor)

### Prereq-4: ICP filing for `wxab4f24c2c7243737`
- mp.weixin.qq.com → check 备案 status; submit if absent
- Lead time 7–20 days
- Owner: founder / operations
- Blocks: any public preview (体验版 distribution)

### Prereq-5: Lark/Feishu `#cs-tickets` workspace + webhook URL
- Create channel; generate incoming webhook URL; store in CloudBase env config
- Lead time minutes
- Blocks: P0-I

### Prereq-6: Caregiver recruitment pipeline
- Identify pilot city + districts
- Outreach plan; target ≥50 pre-vetted caregivers
- Founder-led concierge sourcing acceptable for pilot
- Lead time **weeks to months** — start now
- Blocks: meaningful pilot launch (not technical blocker; product blocker)

### Prereq-7: Legal review
- Privacy policy + 用户协议 + 服务协议
- Background-check legality if introduced at P0 (not in plan; if needed, this is a prereq)
- PIPL compliance review for ID storage, data export/delete
- Lead time 1–2 weeks
- Blocks: P0-K (privacy flow can't ship without policy text)

---

## 4. Execution order (gantt-style)

```
Day 0 ────────────► Phase 1 (in flight, ends ~Day 30) ────► P0 stages ────► Pilot (Sep)
                    └─ Stage 1.M cutover (Day 30 ish)            │
                                                                 ├─ P0-A multi-service foundation
                                                                 ├─ P0-B caregiver onboarding
                                                                 ├─ P0-C real payments      (gated by 商户号)
                                                                 ├─ P0-D anti-飞单
                                                                 ├─ P0-E response SLAs
                                                                 ├─ P0-F new user flow
                                                                 ├─ P0-G dual reviews
                                                                 ├─ P0-H quick-reply
                                                                 ├─ P0-I CS tickets
                                                                 ├─ P0-J push partial      (gated by 服务号)
                                                                 ├─ P0-K PIPL & legal
                                                                 ├─ P0-L config engine
                                                                 └─ P0-M pre-launch        (gates pilot)

[parallel through whole window]   §3 prereqs (商户号, 服务号, Faceid, ICP, Lark, recruitment, legal)
```

Stages within P0 can largely run in parallel after P0-A + P0-B foundation lands. Suggested dependency order:
- **P0-A → P0-B** (multi-service rename before caregiver onboarding adds intake fields)
- **P0-B → P0-C** (caregivers must exist before payments hit caregiver ledger)
- **P0-C → P0-G** (escrow released after dual reviews; review fn touches payout state)
- **P0-A → P0-D, P0-E, P0-F, P0-H, P0-I, P0-J, P0-L** in parallel as bandwidth allows
- **P0-K (legal)** can land anywhere before P0-M
- **P0-M** is the final gate

---

## 5. P0 Stages — outline

### Stage P0-A — Multi-service foundation (Tasks 51–56 from predecessor)

**Goal:** generalise the Phase-1 walker model into a multi-service caregiver model. Owner-side search supports four services. Booking forms variant by service.

Tasks (predecessor outline applies, lightly adjusted):
- 51 walkers → caregivers data migration, add `serviceTypes[]`
- 52 per-service-type pricing units (perWalk / perVisit / perNight / perDay)
- 53 service-type tabs on home page (`寄养 / 日托 / 遛狗 / 上门`)
- 54 GPS location + caregiver detail with live "today on/off" status
- 55 per-service booking-new variants (boarding check-in/out, daycare date-list, house-visit time slots)
- 56 booking schema multi-service fields

### Stage P0-B — Caregiver onboarding & self-service (Tasks 38–48, 50 from predecessor; structured intake added per spec §5.4)

**Goal:** real caregiver applications, certification, profile editing, simple availability toggle.

Tasks (predecessor outline applies, modifications listed):
- 38 collections + types + structured intake fields per spec §5.4
- 39 `applyCaregiver` cloud fn
- 40 `submitCertification` (real name, ID, indoor photos ≥3)
- 41 Tencent Faceid integration
- 42 admin review fns (admin = openid allow-list in `config`)
- 43 `publishService` / `updateService` / `unpublishService` with priceUnit per service type
- 44 P0-minimum availability: `today: boolean` toggle only; `getAvailability(caregiverId)` returns it; bookings respect it
- 46 caregiver onboarding wizard — steps: intro → real-name+ID → env photos → services → **intake card** → service area → submit
- 47 caregiver dashboard (Today / Requests / Calendar-readonly)
- 48 caregiver self-edit profile, including intake editor
- 50 migrate walker-mode → real caregiver auth (`assertCaregiverOfBooking(openid, bookingId)`); delete `pages/_walker` + `utils/walkerMode.ts`

**New tasks introduced at P0-B:**
- **Task 111: Intake fields surfaced on search + caregiver profile.**
  - **Files:** modify `caregiverService.list` query to apply intake filters; modify `pages/home/` filter chips; modify `pages/caregiver/` to render intake info card above price grid.
  - **Story:** spec §5.4
  - **Tests:** filter `acceptedSizeBands=l && canMedicate=true` returns only matching caregivers.

### Stage P0-C — Real payments + escrow + commission + refunds (Tasks 57–64, 66 from predecessor; 65 moved to P0-L; 76 added)

**Goal:** mock pay removed; real WeChat Pay sandbox→prod; escrow + 48h settle + refund engine.

Tasks (predecessor outline applies, modifications listed):
- (Task 57 = §3 prereq; not engineering)
- 58 `createPayment` cloud fn + `wx.requestPayment` client integration
- 59 escrow state model (`payment.state ∈ unpaid|held|released|refunded`)
- 60 `releasePayment` scheduled fn (T+48h post-complete OR both reviews submitted)
- 61 `refundPayment` cloud fn — full + partial refunds per policy
- 62 ledger collection (`payouts`) + `getEarnings` + `requestWithdrawal` cloud fns
- 63 caregiver earnings page
- 64 owner payment record page (no invoice export at P0)
- 66 money-layer idempotency (every money fn requires `idempotencyKey`)
- 76 cancellation policy + refund calc — engine reads tiers from `config.cancellation.tiers` (per spec §9.1)

### Stage P0-D — Anti-飞单 enforcement (new tasks 112–115)

**Goal:** detect off-platform contact attempts in chat, enforce three-strike ban, log violations.

- **Task 112: Keyword regex engine + `config.antiFlight.keywordPatterns` schema**
  - **Files:** new `cloudfunctions/shared/antiFlight.ts`, modify `config` doc
  - **Goal:** patterns list = phone regex (11 digits prefixed by Chinese context), WeChat ID heuristics, "加我"/"私下" hand-off phrases, QQ patterns. Stored in `config` so tunable. Allow-list also in config.
  - **Tests:** match positives + allow-list negatives.

- **Task 113: `sendMessage` cloud fn — keyword check + reject**
  - **Files:** modify `cloudfunctions/sendMessage/` (predecessor Task 27)
  - **Goal:** message scanned before persist. If matched → reject with `code: 'BLOCKED'`, record `violations` row, return new strike count to client. Owner-side UI shows toast + strike count.
  - **Tests:** clean message persists; phone-number rejected; strike increments.

- **Task 114: Strike enforcement + suspension cloud fn `enforceViolation`**
  - **Files:** new `cloudfunctions/enforceViolation/`, modify `cloudfunctions/shared/assert.ts`
  - **Goal:** strike count ≥ `config.antiFlight.strikeLimit` → set user `status = 'suspended'`, all auth checks reject suspended users, send 服务号 / in-app ban notification.
  - **Tests:** N-th strike suspends; suspended user cannot send messages, cannot book, cannot login.

- **Task 115: Violation UI (owner + caregiver)**
  - **Files:** modify chat composer (`pages/chat/`) for soft warning + strike toast; new `pages/banned/` for suspended-account state
  - **Goal:** visible warning + count; banned-state page shows reason + CS contact CTA.

### Stage P0-E — Response SLAs (new tasks 116–120)

**Goal:** 1h inquiry re-recommend + 24h booking auto-decline.

- **Task 116: `inquiries` collection + entry point**
  - **Files:** new `inquiries` collection (per spec §6.3); modify `pages/caregiver/` for "consult before booking" CTA; new `cloudfunctions/createInquiry/`
  - **Goal:** owner opens inquiry → row created with `expiresAt`; caregiver receives via chat thread.
  - **Tests:** insert + expiry timestamp accurate.

- **Task 117: 1h-no-reply re-recommend scheduled fn**
  - **Files:** new `cloudfunctions/recommendAlternates/` (scheduled trigger every 5 min)
  - **Goal:** find inquiries with `expiresAt < now && status === 'open'` → query `caregivers` for alternates matching same service-type + area + intake → emit in-app notification + 服务号 push (P1) → status = `recommended_alt`.
  - **Tests:** stalled inquiry triggers recommend; replied inquiry does not.

- **Task 118: 24h booking auto-decline scheduled fn (extends predecessor Task 45)**
  - **Files:** modify `cloudfunctions/acceptBooking/` to set `acceptanceDeadline = createdAt + 24h`; new `cloudfunctions/autoDeclineBookings/` (scheduled every 15 min)
  - **Goal:** bookings with `status='requested' && acceptanceDeadline < now` → flip to `auto_declined`, trigger refund, notify owner.
  - **Tests:** 24h expiry triggers state change; pre-deadline booking unaffected.

- **Task 119: Caregiver "responsiveness" stat aggregation**
  - **Files:** new `cloudfunctions/recomputeResponsiveness/` (scheduled hourly), modify `caregivers` schema with `responsiveness: { avgMinutes, sampleSize }`
  - **Goal:** rolling avg of first-reply time on inquiries; displayed on caregiver profile.

- **Task 120: Owner notification UX — re-recommend & auto-decline**
  - **Files:** modify `pages/bookings/` to surface auto-declined notifications; new `pages/recommend-alt/` (or modal)
  - **Goal:** owner sees recommended caregivers within app on first re-open; clear UX path back to search.

### Stage P0-F — New-user flow + first-order coupon (new tasks 121–124)

**Goal:** lower friction on first booking with auto-coupon + post-register redirect.

- **Task 121: `coupons` collection + multi-type engine**
  - **Files:** new `coupons` collection, new `cloudfunctions/shared/couponEngine.ts` with dispatch on `type ∈ ('fixed' | 'pctWithCap' | 'fixedWithMinSpend')`
  - **Goal:** `applyCoupon(amount, coupon)` returns `{ discount, finalAmount, valid }`. Default values from `config.coupon.firstOrder` (per spec §9.1).
  - **Tests:** all three types return correct math.

- **Task 122: First-order coupon auto-issuance cloud fn**
  - **Files:** modify `cloudfunctions/login/` (predecessor Task 9) — on `isNewUser`, insert coupon row with config defaults
  - **Tests:** new login creates one coupon; repeat login does not duplicate.

- **Task 123: Post-register search redirect**
  - **Files:** modify `app.ts` boot — if `isNewUser` and no last route, route to `/pages/home?openSearch=1`
  - **Tests:** new-user boot routes to home with search panel; returning user goes to last route.

- **Task 124: Coupon application UI in checkout**
  - **Files:** modify `pages/booking-new/` to apply available coupon automatically + show discount line; cloud fn `createBooking` records `couponId` + marks coupon `usedOnBookingId`
  - **Tests:** discount displayed; coupon idempotently consumed.

### Stage P0-G — Dual-direction reviews (Task 78 from predecessor, promoted)

**Goal:** caregiver reviews owner + pet; visibility rules enforced.

- 78 reviews collection extended (`subjectType`, `direction`, `tags?`); new `pages/review-of-owner/`; modify `submitReview` cloud fn; modify owner profile to show caregiver-side reviews only to other caregivers.

**New task at P0-G:**
- **Task 125: Review-visibility ACL in services**
  - **Files:** modify `reviewService.listForCaregiver` (owner-readable); new `reviewService.listForOwner` (caregiver-readable only); cloud fn `getReviewsForOwner` with role check
  - **Goal:** owners cannot read caregiver-side reviews of other owners; caregivers can.

### Stage P0-H — Quick-reply templates (Task 79 from predecessor, promoted)

**Goal:** caregiver-side reply templates per service type.

- 79 template config in `config.quickReplies.byServiceType`; modify `pages/chat/` composer to surface templates; caregiver can customise per their own profile (overrides in their caregiver doc).

### Stage P0-I — CS tickets + Lark webhook backoffice (Tasks 67–69 from predecessor, scoped to console+Lark)

- 67 `tickets` collection + `createTicket` cloud fn (per spec §6.3)
- 68 support page (owner + caregiver entries from booking detail + profile)
- 69 admin queue replaced with:
  - **Lark webhook fire on ticket create** — cloud fn `notifyLark` with `{ ticketId, summary, severity, deepLink }`
  - **Admin reply cloud fn `replyTicket`** — admin invokes via CloudBase console "调试" panel; passes `{ ticketId, replyText }`; record appended to `tickets.replies[]`
  - **Chat-log retrieval cloud fn `getBookingChatLog`** — admin invokes from console
  - **Playbook doc** — `docs/runbooks/incident-response.md` (new file) with response templates

### Stage P0-J — 服务号 push partial (P0 scope — 2 templates)

**Goal:** push notifications for booking-accepted + pet-status updates (the highest-emotion events).

- **Task 73 partial: register 2 templates** (`booking_accepted`, `pet_status_update`) — done as §3 prereq before stage starts
- **Task 74 partial: `sendSubscribeMsg` cloud fn + trigger wiring**
  - **Files:** new `cloudfunctions/sendSubscribeMsg/`, modify `cloudfunctions/acceptBooking/`, modify `cloudfunctions/submitServiceUpdate/`
  - **Goal:** idempotent send per `(userId, templateId, eventId)`; fail-soft (no exception if user has not opted in)

**New tasks at P0-J:**
- **Task 126: Subscribe-message opt-in UX**
  - **Files:** modify `pages/booking-new/` (post-submit prompt for `booking_accepted` template); modify `pages/booking/` (first-view prompt for `pet_status_update`); track opt-in state in `users.subscribeMsgOptIn`
  - **Goal:** prompts exactly twice per user; not nagging.

- **Task 127: In-app timeline + badge complement**
  - **Files:** new `serviceUpdates` rendering on `pages/booking/`; tab-badge update on `pages/bookings/` for unread items
  - **Goal:** users without push opt-in still see all activity.

### Stage P0-K — PIPL consent + privacy + ICP (Tasks 88–89 from predecessor + new acceptance)

- 89 PIPL consent flow on first launch; privacy policy page; data export + delete cloud fns
- 88 staging/prod env separation (refresh from predecessor)
- (ICP confirmation = §3 prereq)
- Legal-reviewed text in `pages/privacy/` (await §3 prereq-7)

### Stage P0-L — Config singleton + admin reads (new tasks 128–130)

**Goal:** all tunable values live in one doc per spec §9.1. Read once per page load + 5-min cache. Admin writes through cloud fn.

- **Task 128: `config` collection + initial doc + types**
  - **Files:** new `cloudfunctions/initConfig/` (one-off seed), modify `miniprogram/models/index.ts` with Config type, new `miniprogram/services/configService.ts` (5-min cache)
  - **Goal:** singleton doc per spec §9.1 shape.

- **Task 129: Config readers in engines**
  - **Files:** modify `couponEngine.ts`, `antiFlight.ts`, refund engine, recommend fn — all read from `config` not from constants
  - **Tests:** changing a config value changes behavior with no redeploy.

- **Task 130: `updateConfig` admin cloud fn**
  - **Files:** new `cloudfunctions/updateConfig/`
  - **Goal:** admin allow-list write only; emits Lark webhook on change for audit.

### Stage P0-M — Pre-launch hardening + cutover (Tasks 87, 91, 92, 94, 95, 96 from predecessor; new acceptance)

- 87 analytics event taxonomy (register, search, view-caregiver, start-booking, complete-booking, send-message, submit-review, ticket-open, push-opt-in, coupon-redeem)
- 91 image client-side compression + lifecycle (CloudBase storage rules)
- 92 telemetry + cost monitoring + Lark alert
- 94 DB index list — new indexes for `caregivers(serviceType, area, rating)`, `bookings(ownerId, date)`, `bookings(caregiverId, status, acceptanceDeadline)`, `messages(bookingId, createdAt)`, `inquiries(caregiverId, expiresAt)`, `violations(userId, occurredAt)`
- 95 onboarding funnel analytics
- 96 launch checklist (this plan §6)
- **Task 131: Sandbox → prod cutover for WeChat Pay** (manual)
- **Task 132: Final E2E happy-path against live + multi-service**
- **Task 133: Mock module sweep** — verify Stage 1.M Task 110 has removed all `miniprogram/mocks/` and `__USE_MOCK__` paths

---

## 6. P0 Pre-launch Checklist (acceptance gates)

Mirror spec §7. Build is P0-complete when **every** item passes against live (not mock) CloudBase, on a real device, with non-seeded accounts:

- [ ] Owner registration → coupon issued → search redirect → multi-service browse → boarding/daycare/walking/house-visit each bookable → real WeChat Pay → caregiver accepts within 24h → service completes → both reviews → caregiver receives 85% payout T+48h
- [ ] Anti-飞单: phone-number message rejected; 3 strikes → suspension; allow-list permits legit string
- [ ] Response SLAs: stalled inquiry → re-recommend within 65 min; 24h caregiver inaction → auto-decline + refund
- [ ] Structured intake: filter narrows caregivers; profile renders intake card
- [ ] Trust badges: 认证 + order count + positive-rate + responsiveness all live values
- [ ] Real payments: mock removed; sandbox + prod transactions verified; all refund buckets tested
- [ ] CS: ticket created → Lark webhook fires → admin replies via console → ticket retrievable; chat-log lookup works
- [ ] PIPL consent on first launch; privacy policy reachable; data export + delete fns work
- [ ] ICP filing confirmed; 商户号 bound; 服务号 registered with 2 approved templates
- [ ] 服务号 push: opt-in works at 2 moments; booking-accepted + pet-status notifications received on real device
- [ ] In-app timeline + tab-badge: non-opted-in user sees all activity on re-open
- [ ] Mock removed: no `__USE_MOCK__` references; no `miniprogram/mocks/` directory
- [ ] Observability: funnel events firing; cost dashboard alert configured
- [ ] Quick-reply templates work on caregiver side
- [ ] Config singleton: cancellation thresholds, coupon value, strike limit, recommend count, commission rate all read from `config`
- [ ] At least 50 vetted caregivers in pilot district (product gate, not engineering)
- [ ] Founder + ≥1 CS responder rotating Lark `#cs-tickets` coverage
- [ ] Legal sign-off on privacy + service agreement
- [ ] 体验版 distribution channel + tester invitation list ready

---

## 7. P1 Follow-on Plan — fast follow within 2 weeks of P0

### Stage P1-A — 服务号 push expansion (4 remaining triggers)

- **Task 134: Approve 4 additional templates** (`booking_declined`, `inquiry_recommend_alt`, `review_reminder`, `ticket_updated`). 1–7 day lead per template (start during P0-J).
- **Task 135: Trigger wiring** — modify `declineBooking`, `recommendAlternates`, `autoDeclineBookings`, `releasePayment`, `replyTicket` to call `sendSubscribeMsg`.
- **Task 136: Opt-in moments expansion** — prompt at booking-decline and at first inquiry creation.

### Stage P1-B — Photo reviews

- **Task 137: Review schema + UI photo support** — extend `reviews.photos[]`; modify `pages/review/` composer; image moderation via Tencent CMS on submit.
- **Task 138: Review rendering with photos** — modify `pages/caregiver/` review list to show photo thumbnails + lightbox.

### Stage P1-C — Pet profile expansion

- **Task 139: Vaccine + temperament + medical-history fields** — extend `Dog` shape; new `pages/pet-profile/` for full editing; prompt-fill modal after first booking complete.

### Stage P1-D — Cancel booking UI

- **Task 140: Cancel CTA + policy preview** — modify `pages/booking/` to show cancel-with-refund preview; wire to existing `cancelBooking` + `refundPayment` fns.

### Stage P1-E — Favourite caregivers

- **Task 141: `favourites` collection + service + UI toggle** — predecessor Task 75 absorbed.
- **Task 142: Favourites list page** — new `pages/favourites/`.

### Stage P1-F — Full availability calendar

- **Task 143: Calendar editor** — predecessor Task 49; full month view replacing "today on/off" toggle.
- **Task 144: Availability search filter** — owners filter by "available on date X".

### Stage P1-G — Caregiver→pet/owner private review

- **Task 145: Owner review visibility tightening** — caregiver-side reviews of owners visible only to other caregivers; ACL enforced server-side; aggregate "owner reputation" exposed only on caregiver app screens.

### Stage P1-H — Background check (optional)

- **Task 146: Background-check provider integration** — predecessor Task 70; gated on legal review.

### Stage P1-I — Brand theming

- **Task 147: Loulou design tokens** — predecessor Task 93. Adopt full brand palette + typography.

### Stage P1-J — Multi-species pet model (if cat support requested)

- **Task 148: `pets` collection** — predecessor Task 97; migrate `users.dogs[]` to first-class pets with `species` field.

---

## 8. Story → Task coverage matrix (P0 + P1)

| Loulou story | Tier | Tasks |
|---|---|---|
| c1 register (subset) | P0 | predecessor 9, 10, 11 + P0-F 122, 123 |
| c1 register (full with consent) | P0 | + P0-K 89 |
| c2 location + service-type search | P0 | predecessor 53, 54 + P0-B 111 |
| c3 caregiver detail + trust badges | P0 | predecessor 17, 19, 54 + P0-B 111 + P0-E 119 |
| c4 booking + payment + escrow | P0 | predecessor 55, 58–62, 66, 76 |
| c4 booking on multiple services | P0 | predecessor 55, 56 |
| c5 status updates (push for high-emotion) | **P0 partial** | predecessor 73, 74 (partial), P0-J 126, 127 |
| c5 status updates (all triggers) | P1-A | 134–136 |
| c6 submit review (text) | P0 | predecessor 32, 33 |
| c6 submit review (photo) | P1-B | 137, 138 |
| c7 pet profile (basics) | P0 | predecessor 20 |
| c7 pet profile (full) | P1-C | 139 |
| c8 messaging (with anti-飞单) | P0 | predecessor 26–28 + P0-D 112–115 |
| c8 messaging (with image OCR) | post-P1 | revisit |
| c9 orders + payment records | P0 | predecessor 24, 25, 64 |
| c10 favourites | P1-E | 141, 142 |
| c11 cancel | P1-D | 140 |
| c11 modify-date | P2 | deferred |
| c12 owner CS | P0 | P0-I (67, 68, 69 + Lark) |
| c12+ first-order coupon | P0 | P0-F 121–124 |
| c12+ post-register redirect | P0 | P0-F 123 |
| c12+ 1h re-recommend | P0 | P0-E 116–120 |
| p1 caregiver certification | P0 | predecessor 38–42, 46 |
| p1 background check | P1-H | 146 |
| p2 service publishing | P0 | predecessor 43 |
| p3 calendar (toggle) | P0 | predecessor 44 (simplified) |
| p3 calendar (full) | P1-F | 143, 144 |
| p4 accept / decline + 24h auto-decline | P0 | predecessor 45 + P0-E 118 |
| p5 status post | P0 | predecessor 29, 30, 31 + P0-J wiring |
| p6 settle | P0 | predecessor 58–62 |
| p7 caregiver self-profile | P0 | predecessor 48 + intake editor |
| p8 messaging | P0 | predecessor 26–28 |
| p8 quick-reply | P0 | predecessor 79 (P0-H) |
| p9 earnings + withdrawal | P0 | predecessor 62, 63 |
| p10 view pet before accept | P0 | predecessor 45 |
| p11 caregiver→owner/pet review | P0 | predecessor 78 (P0-G) + 125 |
| p12 caregiver CS | P0 | P0-I |
| Insurance | post-P1 | deferred |
| Tiered commission | P2 | deferred (flat 15% at P0 in `config`) |
| Loyalty / repeat-discount | P2 | deferred |
| Live GPS | P2 / Phase 8 | deferred |
| 住家守护 | P2 / Phase 8 | deferred |
| i18n | P2 / Phase 8 | deferred |

---

## 9. Notes for the implementing engineers

- Stages can largely run in parallel after P0-A + P0-B foundation. Dispatch subagents per stage if running multi-agent.
- Every new cloud fn must follow existing `FnResult` contract from predecessor Task 5.
- Every config-driven value reads from `configService` (P0-L Task 128). No hardcoded thresholds.
- Anti-飞单 keyword regex must be tunable in `config` (Tasks 112, 129). Allow-list path is part of P0 scope, not a follow-on.
- Schedule fns (Tasks 117, 118, 119, 60) need CloudBase scheduled triggers configured in Stage P0-M Task 131 (cutover) — verify all triggers exist in prod env before final pre-launch sign-off.
- Index list (Task 94) must include new indexes for `bookings(caregiverId, status, acceptanceDeadline)` and `inquiries(caregiverId, expiresAt)` — missing these will silently break the SLA scheduled fns.
- Mock-mode removal (predecessor Task 110) is a **hard** prereq before P0-D Task 113 wiring — otherwise mock `sendMessage` masks the keyword filter behaviour.

---

## 10. Execution handoff

Once §3 prereqs are in motion and Phase 1 reaches Stage 1.M:

1. **Decision check** — re-verify all §9 spec decisions still hold (especially launch type if pilot scope shifted).
2. **Subagent dispatch** — use `superpowers:subagent-driven-development` per stage; review between stages.
3. **Inline execution alternative** — execute stages sequentially via `superpowers:executing-plans`, batch by predecessor task numbers.

P0-A and P0-B are the foundation stages — run first, sequentially. After that, dispatch the rest in parallel as bandwidth allows.

**P1 plan kicks off the day P0 launch goes live.** All P1 tasks reuse P0 infrastructure additively; none require refactor.
