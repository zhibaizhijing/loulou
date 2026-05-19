# Loulou — Risks & Open Problems

**Date:** 2026-05-18
**Source docs:** `docs/Loulou_MVP用户故事地图_双端.html`, `docs/宠物寄养应用问题与范围定义0518.docx`, current spec `docs/superpowers/specs/2026-05-16-petbacker-dogwalking-mvp-design.md`, current plan `docs/superpowers/plans/2026-05-16-petbacker-dogwalking-mvp.md`.
**Launch target:** 2026-09.

Risks are scored **Likelihood × Impact** (Low / Med / High). Phase tag = first phase where the risk meaningfully bites.

---

## 1. Product / Market Risks

### 1.1 Caregiver supply shortage at launch — **High × High** — Phase 1/2
Listed explicitly in the requirements doc. Two-sided marketplaces die when one side is empty; if owners open the app and see <10 caregivers in their district, no amount of UX polish saves the launch.
- **Mitigations:** kick off caregiver recruitment now, not after Phase 2 ships. Target 50 certified caregivers in pilot district before public launch. Seed the app with realistic demo profiles during private beta. Consider founder-led concierge sourcing (manually onboard friends-of-friends).
- **Open question:** which 1–2 cities for pilot? Affects recruitment geo and demo data.

### 1.2 Owner trust gap — **High × High** — Phase 1
Owners in China have low default trust for stranger-care; existing alternatives (小红书, 闲鱼) at least carry social-proof signals. Loulou launches with neither brand nor reviews. Without real reviews, the rating + review feature looks empty and reinforces distrust.
- **Mitigations:** real-name + ID + background check badges visible everywhere; environment photos mandatory for boarding; founder-shot promo content; partner with a vet/pet KOL for endorsement.
- **Phase-1 specific:** demo data must look plausible (real-sounding names, varied review text). The current `seedDemoData` fn is stubbed — invest in believable seed content before any user testing.

### 1.3 Commission rate vs. caregiver retention — **Med × High** — Phase 4
Doc identifies commission-too-high → caregiver churn. Once Phase 4 introduces real money, caregivers compare their net take vs. doing the same job off-platform (WeChat group, repeat customers paid directly).
- **Mitigations:** tiered commission (lower for high-volume); early-adopter rate locked for 12 months; surface "saved by platform" value (chat trail, dispute backup, insurance, payout). Watch off-platform leakage in chat logs.

### 1.4 Off-platform transaction leakage — **High × Med** — Phase 1+
Owner and caregiver have every incentive to "do the second booking on WeChat directly" after the first paid transaction. Platform sees one booking, never the next.
- **Mitigations:** prohibit phone-number exchange in chat (regex scrub) — but enforcement is hard. Stronger lever: make the platform stickier (insurance only if booked on platform; favourites + repeat-discount; loyalty rewards). Accept some leakage; defend ARPU via add-ons (insurance, premium listing).

### 1.5 Pet safety incidents — **Low × High** — Phase 1+
Doc flags this. A single news cycle about a pet harmed on Loulou can kill the brand.
- **Mitigations:** real-name + ID verification, indoor environment photos for boarders, vaccination upload, mandatory liability insurance (Phase 5), 24h CS hotline. Pre-write an incident-response playbook before launch (who responds, escalation, comms template).

### 1.6 Caregiver concentration & geographic gaps — **Med × Med** — Phase 3
Once multi-service ships, owners outside a few hot zones will see empty results. Empty-state can frame this ("成为首批照护者") but won't satisfy.
- **Mitigations:** geo-aware demand collection (waitlist by district); use waitlist data to drive recruitment.

---

## 2. Regulatory / Compliance Risks

### 2.1 WeChat Pay merchant onboarding (商户号) — **High × High** — Phase 4
Required for real payments. Issuance needs verified business entity, ICP, bank account. Lead time often 2–6 weeks. Blocking dependency for Phase 4.
- **Mitigations:** start the 商户号 application during Phase 2, not Phase 4. Confirm entity type (个体工商户 vs 有限公司) before applying — switching is painful.

### 2.2 Background check legality — **Med × High** — Phase 2
Real background checks on caregivers in China require either self-declaration + ID verification or a licensed third-party provider. Storing ID images is regulated under PIPL (个人信息保护法). Mishandling = fines + brand damage.
- **Mitigations:** use a licensed identity-verification API (e.g. Tencent Cloud Faceid) rather than storing raw IDs. Encryption at rest, minimum retention, explicit consent flow. Get legal review before Phase 2 spec lock.

### 2.3 Insurance product licensing — **Med × Med** — Phase 5
Selling insurance directly requires insurance-agency licensing. Acting as a sales channel for a licensed insurer needs a partnership + disclosure.
- **Mitigations:** start insurer outreach in Phase 2; do not promise insurance in marketing until Phase-5 partnership signed.

### 2.4 In-app chat content compliance — **Low × High** — Phase 1+
Chinese regulation requires content moderation on user-to-user messaging at scale, plus retention for traceability. Phase 1 has chat but no moderation, no abuse reporting, no auto-flagging.
- **Mitigations:** before public launch (not before pilot), add: profanity/abuse filter, report-message CTA, server-side logging retention ≥ 6 months. Tencent CMS API covers this off-the-shelf.

### 2.5 Privacy — pet owner data + minors — **Med × Med** — Phase 1+
PIPL requires explicit consent for collecting personal data; the registration flow currently collects phone + name + address with no consent flow. Pet vaccination records arguably medical.
- **Mitigations:** add privacy policy + consent checkbox before public launch; data export + deletion endpoints (PIPL grants users these rights); 用户协议 reviewed by counsel.

### 2.6 ICP filing + content licensing — **Med × Med** — Phase 1
A WeChat mini-program with a business backend needs ICP filing for any custom domains and an entity certificate uploaded to mp.weixin.qq.com. Without this, public launch is blocked.
- **Mitigations:** confirm filing status of `wxab4f24c2c7243737` and CloudBase env before Phase 1 ships internally.

---

## 3. Technical Risks

### 3.1 CloudBase free-tier limits — **Med × High** — Phase 3+
50K cloud-fn calls/month, 2GB storage, 5GB egress, 50K DB reads/day on free tier. Phase 1 is fine. Multi-service + chat + real reads will exhaust free tier quickly; expect ¥几百–几千/month.
- **Mitigations:** add cost telemetry (server log `{ fn, ms, doc_reads }`). Before Phase 3, model traffic against quotas. Budget for paid tier.

### 3.2 Cloud function cold start — **Med × Med** — Phase 1
First-call cold start: 300–800ms on Node 18 CloudBase. Booking creation, login, message send all pay it. Affects perceived snappiness.
- **Mitigations:** keep functions warm via a 5-min ping (cron-trigger fn that calls nothing). Bundle small (no heavy deps). Pre-warm critical fns on app launch.

### 3.3 `db.watch()` realtime cost & flakiness — **Med × Med** — Phase 1
CloudBase realtime has historically been the buggiest API surface (reconnection issues, snapshot inconsistencies, charges per connection-minute). Chat is the canary.
- **Mitigations:** implement fall-back polling every 10s if watcher errors twice. Cap watcher lifetime to active page only (cancel on `onUnload`). Test on real device with backgrounding.

### 3.4 Image upload / storage cost — **Med × Med** — Phase 1+
Walk reports, environment photos, pet photos, chat images — adds up fast. No client-side compression today; phones upload 5–10MB JPEGs.
- **Mitigations:** add client-side resize (max 1600px, JPEG q=0.8) in `storageService.uploadImage`. Set storage lifecycle rules in CloudBase (purge after 12 months for chat images).

### 3.5 Walker-mode security shortcut — **High × Low** (now) → **High × High** (if shipped to real users) — Phase 1→2
Current demo treats *any* logged-in user with a session flag as a walker. If this code ships to a public preview without removal, anyone can post fake walk reports and complete bookings.
- **Mitigations:** gate the hidden `_walker` page behind `__DEV__`. Remove or hard-disable the walker-mode flag before any public link/QR code release. Phase 2 replaces it with real caregiver auth.

### 3.6 Booking idempotency — **Med × Med** — Phase 1
Double-tap on "submit booking" with slow network can create two bookings. Spec mentions idempotency key (hash of openid+walkerId+date) but plan does not enforce it.
- **Mitigations:** verify Task 22 actually implements idempotency on the cloud-fn side (not just client debounce). Add a vitest test that calls `createBooking` twice with identical payload and asserts one row.

### 3.7 Rating recompute race condition — **Med × Low** — Phase 1
`submitReview` reads `walker.rating` + count, computes new average, writes back. Two concurrent reviews → lost update.
- **Mitigations:** use CloudBase transaction API or atomic increment (`_.inc(stars)` on `ratingSum`, `_.inc(1)` on `reviewCount`, compute average on read). Cheap fix, easy to miss.

### 3.8 TypeScript / TDesign / miniprogram-simulate version drift — **Med × Low** — Phase 1
Native miniprogram + TS + TDesign + vitest is a niche stack with frequent compatibility regressions (TDesign minor releases occasionally break component APIs; miniprogram-simulate lags devtools).
- **Mitigations:** pin exact versions in `package.json` (no `^`). Update intentionally, not opportunistically. Track TDesign release notes when bumping.

### 3.9 Data-model rename burden (`walkers` → `caregivers`) — **Med × Med** — Phase 3
Phase 1 hard-codes `walkers` collection name in services, cloud fns, indexes, and DB rules. Phase 3 rename touches all of them plus existing seed/production rows.
- **Mitigations:** budget one full day for Phase 3 rename. Alternatively: add a `serviceType` field in Phase 1 already (default `'walking'`) so Phase 3 just generalises queries instead of renaming. Decide now while it's cheap.

### 3.10 Indexing & query performance — **Low × Med** — Phase 2+
CloudBase requires explicit indexes for compound `where + orderBy` queries. Missing index = silent slow path or error at scale.
- **Mitigations:** document each query's index in the cloud-fn header comment. Create indexes during Task 36 (deploy) for: `walkers(areas, pricePerWalk, rating)`, `bookings(ownerId, date)`, `messages(bookingId, createdAt)`, `reviews(walkerId, createdAt)`.

---

## 4. UX / Product-Design Risks

### 4.1 Demo data masks empty-state UX — **Med × Med** — Phase 1
With seeded data the app feels populated. Real launch in a new district will look empty. Empty states must do real work: guidance, recruitment CTA, alternative actions.
- **Mitigations:** review every empty state with launch-day reality in mind (zero walkers, zero bookings, zero reviews). Add "推荐其他区域" / "成为照护者" CTAs.

### 4.2 Mock payment confusion in pilot — **Med × Low** — Phase 1
Internal testers may forget the booking flow uses mock pay. Risk of someone trying to share a booking screen as "proof" of real transaction.
- **Mitigations:** show clear "测试支付，未实际扣款" banner on the mock-pay screen. Add the disclaimer to any pilot-distribution comms.

### 4.3 Chat as a service-coordination tool vs. a casual messenger — **Med × Med** — Phase 1
Owners will use chat for everything (last-minute changes, photos, scolding). Without structured messages (booking-change request, status update template), important coordination drowns in casual chat.
- **Mitigations:** Phase 6 adds quick-reply templates (story p8 partial). Phase 1: at minimum, expose booking-change/cancel as a button in the chat header, not as a free-text negotiation.

### 4.4 Reviews are coarse (1–5 stars + text) — **Med × Low** — Phase 1
Single dimension loses signal. "Responsiveness", "cleanliness", "experience with breed" matter and are listed in p11 acceptance criteria — but Phase 1 review is flat.
- **Mitigations:** acceptable for Phase 1; structured review dimensions land in Phase 6. Keep `reviews` schema flexible (`tags?: string[]`) so adding dimensions doesn't require migration.

### 4.5 Accessibility — **Low × Med** — Phase 1
Not in scope per spec. Older owners (closer to age 50 in target persona) struggle with small targets, low contrast, gesture-heavy UI.
- **Mitigations:** ship at minimum: 16px+ body text, AA contrast on primary CTAs, no gesture-only navigation. Cheap to do during Phase 1, expensive to retrofit.

---

## 5. Operational / Go-to-Market Risks

### 5.1 No customer-service capacity — **High × High** — Phase 1+
Story c12/p12 says CS response time <2h. With zero CS staff and a founder/engineer also writing code, that SLA breaks on day one.
- **Mitigations:** before public launch: at least one human on a WeChat work account during business hours; out-of-hours auto-acknowledge with expected response time; route incidents to a single Lark/Feishu channel. Decide ownership before Phase 1 hands off.

### 5.2 Onboarding-funnel attrition — **Med × Med** — Phase 1
Spec sets registration goal at 60s. Caregiver onboarding (real-name + ID + photos + service forms) is realistically 15–30 min, with strong drop-off.
- **Mitigations:** allow caregiver to register first, certify later (gated by appearing in search until certified). Track funnel completion in analytics from day one.

### 5.3 Analytics / observability gap — **Med × Med** — Phase 1
Plan has no analytics task. Without funnel data, post-launch decisions are anecdote-driven.
- **Mitigations:** add minimal event logging in Phase 1 (login, view walker, start booking, complete booking, send message, submit review). WeChat 小程序 数据助手 covers basics; consider 神策/GrowingIO for richer funnels later.

### 5.4 No staging vs. production CloudBase separation — **Med × Med** — Phase 1
Spec mentions `pet-dev` env, but doesn't define how prod gets carved out. Risk of demo-seed code corrupting real users' data.
- **Mitigations:** Task 36 should explicitly create two envs (`pet-dev`, `pet-prod`). `seedDemoData` checks env ID and refuses on prod. Switch via `app.ts` constant, not a runtime flag.

### 5.5 Single-engineer key-person risk — **Med × High** — Phase 1+
If only one engineer holds the WeChat console, CloudBase root, ICP filing, 商户号 — and that person becomes unavailable — operations halt.
- **Mitigations:** document credentials in 1Password / vault accessible by ≥2 people; transfer 小程序管理员 to a stable corporate account before launch.

### 5.6 Demo timeline vs. real launch — **Med × Med** — Phase 1→Public
Spec target = 2026-09 launch. The current plan is Phase-1-only (one vertical slice with demo walker). Caregiver onboarding (Phase 2), multi-service (Phase 3), real payments (Phase 4) each take weeks. Working backwards from September with a single engineer, the timeline implies launch on Phase-1 scope plus minimal caregiver auth — multi-service and real payments probably slip to Q4 2026 or 2027.
- **Mitigations:** reconfirm what "launch" means in September — closed pilot in one district? Public app store listing? They imply very different scope. Get this written before Phase 2 spec starts.

---

## 6. Open Problems (decisions not yet made)

These are blockers or near-blockers that need a real human call, not engineering solutions.

1. **Pilot district + caregiver-recruitment owner.** Without this, supply-side risks (§1.1) compound.
2. **Business entity status.** Determines 商户号, ICP, PIPL approach (§2.1, §2.2, §2.5, §2.6).
3. **Commission rate model.** Tiered? Flat? Free in first 6 months? Affects unit economics and onboarding pitch (§1.3).
4. **What "launch" means in 2026-09.** Closed pilot vs. public; Phase 1-only vs. Phases 1–2 (§5.6).
5. **Real-name verification provider.** Tencent Faceid vs. Aliyun vs. partner. Drives Phase 2 spec.
6. **Insurance partner identity.** Conversations need to start in Phase 2 timeframe to be live for Phase 5.
7. **Brand identity (logo, primary colour, copy voice).** Deferred in spec; needed before any external preview. Loulou name is set; visual identity is not.
8. **Multi-pet model scope.** Phase 1 supports `users.dogs[]` (dog only). Cats? Other pets? Naming + data model touch this.
9. **Pricing model per service.** Walking is per-walk; boarding per-night; daycare per-day; house-visit per-visit. Each needs UX + DB modeling decisions in Phase 3 spec.
10. **`walkers` → `caregivers` naming decision (§3.9).** Costs more if deferred to Phase 3.

---

## 7. Risk Register Summary

| ID | Risk | L | I | Phase | Owner |
|---|---|---|---|---|---|
| 1.1 | Caregiver supply at launch | H | H | 1/2 | — |
| 1.2 | Owner trust gap | H | H | 1 | — |
| 1.3 | Commission vs. retention | M | H | 4 | — |
| 1.4 | Off-platform leakage | H | M | 1+ | — |
| 1.5 | Pet safety incident | L | H | 1+ | — |
| 1.6 | Geographic gaps | M | M | 3 | — |
| 2.1 | 商户号 lead time | H | H | 4 | — |
| 2.2 | Background-check legality | M | H | 2 | — |
| 2.3 | Insurance licensing | M | M | 5 | — |
| 2.4 | Chat content compliance | L | H | 1+ | — |
| 2.5 | PIPL / consent | M | M | 1+ | — |
| 2.6 | ICP filing | M | M | 1 | — |
| 3.1 | CloudBase free-tier | M | H | 3+ | — |
| 3.2 | Cold start | M | M | 1 | — |
| 3.3 | db.watch flakiness | M | M | 1 | — |
| 3.4 | Image upload cost | M | M | 1+ | — |
| 3.5 | Walker-mode shortcut | H | L→H | 1→2 | — |
| 3.6 | Booking idempotency | M | M | 1 | — |
| 3.7 | Rating race | M | L | 1 | — |
| 3.8 | Version drift | M | L | 1 | — |
| 3.9 | walkers→caregivers rename | M | M | 3 | — |
| 3.10 | Index gaps | L | M | 2+ | — |
| 4.1 | Empty-state UX | M | M | 1 | — |
| 4.2 | Mock-pay confusion | M | L | 1 | — |
| 4.3 | Chat coordination | M | M | 1 | — |
| 4.4 | Coarse reviews | M | L | 1 | — |
| 4.5 | Accessibility | L | M | 1 | — |
| 5.1 | CS capacity | H | H | 1+ | — |
| 5.2 | Onboarding attrition | M | M | 1 | — |
| 5.3 | Analytics gap | M | M | 1 | — |
| 5.4 | Env separation | M | M | 1 | — |
| 5.5 | Key-person | M | H | 1+ | — |
| 5.6 | Timeline ambiguity | M | M | 1→public | — |

**Top-3 to act on this week:** 1.1 (caregiver recruitment kickoff), 2.1 (商户号 application started), 5.1 (CS ownership decision before pilot).
