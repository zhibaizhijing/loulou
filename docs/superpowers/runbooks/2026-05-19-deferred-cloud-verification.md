# Stage 1.M — Deferred Cloud Verification Runbook

**Date:** 2026-05-19
**Purpose:** This file lists every P0 task or task-step that was **coded in mock mode but cannot be fully verified until CloudBase is activated**. When Stage 1.M (predecessor Tasks 105–110) is opened, work through this checklist in order — each item is something that *only mock-mode operation* left unverified.

**Read first:**
- `/CLAUDE.md` — repo agent guide (especially "Progress tracking" + "Stage execution order")
- `docs/superpowers/plans/2026-05-19-loulou-p0-launch.md` §3 (prereqs) + Stage P0-M
- `docs/superpowers/plans/2026-05-16-petbacker-dogwalking-mvp.md` Stage 1.M (Tasks 105–110)
- `docs/superpowers/progress/2026-05-19-p0-progress.md` (live status)

**When to open this runbook:** roughly ~80% of P0 code is written, tested in mock, and ready. Working through this file *is* Stage 1.M expanded.

---

## 1. Required prereqs before opening this runbook

If any of these is incomplete the runbook will stall mid-execution. Tick before starting.

- [ ] **Prereq-1 — WeChat Pay 商户号** issued and bound to appid (lead 2–6 wks)
- [ ] **Prereq-2 — WeChat 服务号** registered + both P0 templates approved (`booking_accepted`, `pet_status_update`) (lead 1–7 days each)
- [ ] **Prereq-3 — Tencent Cloud Faceid** product enabled + API keys captured (lead ~1 day)
- [ ] **Prereq-4 — ICP filing** confirmed for `wxab4f24c2c7243737` (lead 7–20 days)
- [ ] **Prereq-5 — Lark `#cs-tickets`** workspace + incoming webhook URL captured
- [ ] **Prereq-7 — Legal review** complete — privacy policy text + 用户协议 + 服务协议 final
- [ ] All Stage P0-A through P0-L tasks marked `[x]` in progress file (Stage P0-M is interleaved with this runbook)

If any prereq is missing, **stop** and finish it before continuing. Opening Stage 1.M with prereqs incomplete generates more rework than it saves.

---

## 2. Order of execution

Items are grouped by external service. Within a group, do tasks in numbered order. Across groups, follow the top-level order below — each later group depends on earlier groups being live.

1. **A. CloudBase env + deploy** (no external dependency)
2. **B. Mock removal + flag flip**
3. **C. Scheduled-trigger registration** (depends on A)
4. **D. WeChat Pay live integration** (depends on A + Prereq-1)
5. **E. Tencent Faceid live integration** (depends on A + Prereq-3)
6. **F. 服务号 push live send** (depends on A + Prereq-2)
7. **G. Lark webhook live fire** (depends on A + Prereq-5)
8. **H. Storage + image lifecycle**
9. **I. DB indexes + rules in production**
10. **J. Final E2E + observability + sign-off**

Each group is mostly independent **once A is done**, so D / E / F / G can run in parallel by different agents if you're dispatching subagents.

---

## 3. Group A — CloudBase env + cloud fn deploy

Maps to predecessor **Task 105 + Task 106**.

- [ ] **A.1 — Create env `pet-dev`** in mp.weixin.qq.com → 云开发 → 开通. Record env ID + region.
- [ ] **A.2 — Create empty collections** matching `miniprogram/mocks/db.ts` shape: `users`, `caregivers`, `bookings`, `messages`, `reviews`, `serviceUpdates`, `caregiverApplications`, `services`, `availability`, `inquiries`, `coupons`, `violations`, `tickets`, `payouts`, `config`.
- [ ] **A.3 — Apply DB rules per spec §6.4.** World-read: `caregivers`, `services`, `reviews`. Server-only: everything else. Client write: none.
- [ ] **A.4 — Deploy every cloud fn** under `cloudfunctions/`. Verify status `部署成功` in CloudBase console for each:
  - login, updateProfile, getMyProfile
  - createBooking, getBooking, listBookings, listAllBookings, acceptBooking, declineBooking, cancelBooking
  - sendMessage, enforceViolation
  - submitReview, listReviewsForBooking
  - submitWalkReport, getWalkReport
  - createInquiry, recommendAlternates, autoDeclineBookings, recomputeResponsiveness
  - createPayment, releasePayment, refundPayment
  - applyCaregiver, submitCertification, verifyIdentity, approveApplication, rejectApplication
  - publishService, updateService, unpublishService
  - setAvailability, getAvailability
  - sendSubscribeMsg
  - createTicket, replyTicket, notifyLark, getBookingChatLog
  - exportMyData, deleteMyAccount
  - initConfig, updateConfig
  - seedDemoData
- [ ] **A.5 — Manually invoke each fn** with a minimal payload from CloudBase console "测试" panel; confirm `FnResult` envelope returns (`{ ok: true | false, ... }`).
- [ ] **A.6 — Initial config seed** — run `initConfig` once with default `Config` doc per spec §9.1.
- [ ] **A.7 — Initial caregivers / reviews seed** — run `seedDemoData` once on the new env.

Cloud-fn list above is comprehensive of P0; if a fn does not exist, it means a P0 task wasn't coded — go finish that task before continuing this runbook.

---

## 4. Group B — Mock removal + flag flip

Maps to predecessor **Tasks 107, 109, 110**.

- [ ] **B.1 — Live smoke matrix** — leave `__USE_MOCK__ = true` locally; run app once against live env via temporary env override; confirm `wx.cloud.init({ env: 'pet-dev' })` no longer returns `-601034`.
- [ ] **B.2 — Toggle locally to test** — change `miniprogram/utils/env.ts` to `__USE_MOCK__ = false` **without committing**. Walk through every Phase-1 flow; record any path that throws on live but not on mock (likely cloud-fn validation edges).
- [ ] **B.3 — Fix surfaced bugs** — anything found in B.2 must be patched before committing the flag.
- [ ] **B.4 — Commit flag flip** — `__USE_MOCK__ = false` in env.ts. Run typecheck + lint + all tests; both `test:mock` and `test:live` suites green.
- [ ] **B.5 — Delete mock modules** — remove `miniprogram/mocks/`, `miniprogram/components/mock-banner/`, mock branches in services, `test:mock` script, `tests/helpers/withMockFlag.ts`, `*.mock.test.ts` files.
- [ ] **B.6 — Delete walker-mode artifacts** — `pages/_walker/`, `utils/walkerMode.ts`. Confirm via grep no remaining references.

**Hard gate:** Group B blocks Groups D–G verification (push, payment, Lark, Faceid all need real `wx.cloud.callFunction` reaching live env).

---

## 5. Group C — Scheduled-trigger registration

These cloud fns were coded but only manually invokable in mock. Now register their schedules.

- [ ] **C.1 — `releasePayment`** — every 30 min cron. Finds `bookings.payment.state='held' && reviewSettlementDue < now` and runs settle.
- [ ] **C.2 — `autoDeclineBookings`** — every 15 min cron. Finds `bookings.status='requested' && acceptanceDeadline < now`.
- [ ] **C.3 — `recommendAlternates`** — every 5 min cron. Finds `inquiries.status='open' && expiresAt < now`.
- [ ] **C.4 — `recomputeResponsiveness`** — hourly cron. Caregiver stat aggregation.
- [ ] **C.5 — Verify each schedule actually fires** — wait one cycle, check CloudBase fn logs for an invocation entry. Without log entry the schedule isn't really registered.
- [ ] **C.6 — Add Lark alert on schedule miss** — secondary cloud fn that monitors `last_run_at` per schedule and pings `#ops` if a cycle is skipped.

**Common pitfall:** registering a schedule in CloudBase console does not validate the cron string. First wait cycle is the real test.

---

## 6. Group D — WeChat Pay live integration

Maps to predecessor **Tasks 58, 60, 61, 66, 131**.

- [ ] **D.1 — Bind 商户号 to appid** in mp.weixin.qq.com. Capture API v3 key, merchant ID, notify URL.
- [ ] **D.2 — Store keys in CloudBase env config** — `WECHAT_PAY_MCH_ID`, `WECHAT_PAY_API_KEY`, `WECHAT_PAY_CERT`, `WECHAT_PAY_NOTIFY_URL`. Never in code.
- [ ] **D.3 — `createPayment` sandbox round-trip** — book a service from real device → app calls `createPayment` → server calls WeChat Pay unified order API → returns prepay params → `wx.requestPayment` prompts → success callback hits notify URL → `bookings.payment.state` flips `unpaid → held`.
- [ ] **D.4 — Refund round-trip per policy bucket** — test ≥3 cancellation paths: caregiver decline (full refund), owner cancel >24h before (per `config.cancellation.tiers`), owner cancel <12h (full caregiver retention).
- [ ] **D.5 — `releasePayment` end-to-end** — complete a booking → 48h schedule fires → caregiver `payouts` ledger credited (amount − commission).
- [ ] **D.6 — Money-layer idempotency** — replay any pay/refund/release with same `idempotencyKey`; assert single transaction recorded.
- [ ] **D.7 — Sandbox → prod cutover** — Task 131; replace sandbox merchant ID + keys with production values. Test one tiny real payment (~¥1) and refund.

**Money risk:** never test refunds against a prod merchant before sandbox is fully green. Currency math errors here cause real financial loss.

---

## 7. Group E — Tencent Faceid live integration

Maps to predecessor **Task 41**.

- [ ] **E.1 — Provision Faceid API keys** in `console.cloud.tencent.com → 实名认证 → Faceid`. Store in env config (`FACEID_SECRET_ID`, `FACEID_SECRET_KEY`).
- [ ] **E.2 — Replace mock stub in `verifyIdentity`** — remove always-return-true; call real `tencentcloud.faceid.GetRealNameAuthResult` (or chosen endpoint).
- [ ] **E.3 — Live verification round-trip** — submit a real caregiver application with a real ID + selfie; confirm provider response stored on application; PIPL retention rule (raw ID image purged after verification).
- [ ] **E.4 — Provider-failure path** — disable Faceid temporarily; confirm fn returns `code: 'INTERNAL'` and application is flagged for manual review (does not silently succeed).
- [ ] **E.5 — Cost accounting** — Faceid is per-call billing. Add to cost dashboard.

---

## 8. Group F — 服务号 push live send

Maps to predecessor **Task 73 (registration done as prereq) + Task 74 + new Tasks 126, 127**.

- [ ] **F.1 — 服务号 ↔ 小程序 binding** — both must be under the same 主体. Verify in mp.weixin.qq.com.
- [ ] **F.2 — Capture both template IDs** — `booking_accepted_template_id`, `pet_status_update_template_id`. Store in env config.
- [ ] **F.3 — `sendSubscribeMsg` first live send** — accept a booking from caregiver side → server fires `sendSubscribeMsg({ openid, templateId: booking_accepted_template_id, data })` → owner with active opt-in receives push.
- [ ] **F.4 — Pet-status update push** — caregiver posts a `serviceUpdates` row → push fires → owner receives.
- [ ] **F.5 — Opt-in flow on real device** — open booking-new in 体验版; submit booking; confirm `wx.requestSubscribeMessage` prompt appears; user must explicitly tap "允许"; failure path (user taps "拒绝") records denial and never re-prompts in the same session.
- [ ] **F.6 — Idempotency** — duplicate triggers (e.g., cloud-fn retried) → only one push delivered. Verified via `eventId` dedup.
- [ ] **F.7 — In-app timeline complement** — for a user who declined opt-in, confirm the same events appear in `pages/booking/` timeline + tab-badge unread count.

**Common pitfall:** WeChat 服务号 templates expire if not used within 30 days of approval. Use them at least once during this group, even with a test message, to keep them live.

---

## 9. Group G — Lark webhook live fire

Maps to predecessor **Task 69 + new acceptance work**.

- [ ] **G.1 — Store Lark webhook URL** in env config — `LARK_TICKETS_WEBHOOK_URL`.
- [ ] **G.2 — Replace mock stub in `notifyLark`** — remove `console.log`; call real Lark webhook (POST JSON).
- [ ] **G.3 — Live ticket fire** — open a CS ticket from owner side → Lark `#cs-tickets` receives card with `ticketId`, summary, severity, deep-link to CloudBase console for the ticket doc.
- [ ] **G.4 — Reply round-trip** — staff invokes `replyTicket` from CloudBase console "测试" panel → ticket `replies[]` updated → owner sees reply in support page.
- [ ] **G.5 — Chat-log retrieval** — staff invokes `getBookingChatLog({ bookingId })` → console returns ordered message list; verify messages flagged by anti-飞单 are visible.
- [ ] **G.6 — Webhook failure path** — temporarily break the URL; verify ticket is still created (Lark fire is fail-soft) and an error is logged to CloudBase fn log.

---

## 10. Group H — Storage + image lifecycle

Maps to predecessor **Task 91**.

- [ ] **H.1 — Verify client compression** — uploads from real device produce images ≤1600px @ q=0.8 JPEG (check size in CloudBase storage console).
- [ ] **H.2 — Storage lifecycle rules** — chat images purged after 12 months; walk-report photos kept 24 months. Configure in CloudBase storage → 生命周期.
- [ ] **H.3 — Storage access rules** — only signed reads via fileID; no public bucket.
- [ ] **H.4 — Image upload failure UX** — simulate offline → upload retry; rest of form survives.

---

## 11. Group I — DB indexes + production posture

Maps to predecessor **Task 94 + new acceptance**.

- [ ] **I.1 — Create indexes:**
  - `caregivers(serviceTypes, areas, rating)` — compound for browse query
  - `caregivers(serviceTypes, acceptedSizeBands)` — intake filter
  - `bookings(ownerId, createdAt desc)` — listBookings
  - `bookings(caregiverId, status, acceptanceDeadline)` — caregiver inbox + auto-decline scheduler
  - `messages(bookingId, createdAt)` — chat list + log retrieval
  - `inquiries(caregiverId, expiresAt)` — recommendAlternates scheduler
  - `inquiries(ownerId, status)` — owner re-recommend UX
  - `reviews(subjectId, createdAt desc)` — profile review list
  - `violations(userId, occurredAt)` — strike count
  - `payouts(caregiverId, createdAt desc)` — earnings page
  - `tickets(status, slaDueAt)` — ops queue
- [ ] **I.2 — Verify** — for each compound query in cloud fns, confirm CloudBase console shows index hit (not full collection scan).
- [ ] **I.3 — DB rules sanity** — run the unauthenticated-client read tests; private collections must reject.
- [ ] **I.4 — Staging vs prod separation** — if only `pet-dev` exists, create `pet-prod`. Re-deploy fns to prod. `seedDemoData` must refuse on prod (env check by ID).

---

## 12. Group J — Final E2E, observability, sign-off

Maps to predecessor **Tasks 87, 92, 95, 96, 132, 133** + acceptance gates.

- [ ] **J.1 — Analytics event taxonomy live** — every event from spec §11 firing into CloudBase analytics (or WeChat 数据助手). Verify in dashboard.
- [ ] **J.2 — Cost monitoring + Lark alert** — Task 92; daily aggregate fn calls / DB reads / storage / egress; threshold alert to `#ops`.
- [ ] **J.3 — Funnel analytics** — Task 95; pilot caregiver-apply step completion + owner first-booking funnel visible.
- [ ] **J.4 — Mock module sweep** — Task 133; grep entire repo for `__USE_MOCK__`, `mocks/`, `withMockFlag` — all must be absent. CI check enforced.
- [ ] **J.5 — Final happy-path E2E live** — Task 132; ten-step flow from spec §7 acceptance criteria, against live `pet-prod`, on a real iPhone + real Android via 体验版.
- [ ] **J.6 — Pre-launch checklist sign-off** — every item in `docs/superpowers/plans/2026-05-19-loulou-p0-launch.md` §6 ticked; founder + engineer sign-off recorded.

---

## 13. Rollback plan

If Stage 1.M surfaces critical issues (data corruption, payment failure, push spam):

1. **Immediate** — flip `__USE_MOCK__` back to `true` and re-deploy via predecessor Stage 1.5M restore (git revert Task 110 commit). Confirms app keeps working in mock while you debug.
2. **Money** — pause `releasePayment` schedule by disabling the cron in CloudBase console. Don't delete; just pause. Investigate ledger first.
3. **Push** — disable `sendSubscribeMsg` by replacing trigger calls with a feature flag in `config.featureFlags.pushEnabled = false`. Re-enable when fixed.
4. **Schedule failure** — manually trigger affected fns from console while fixing the cron.
5. **Catastrophic data corruption** — `pet-prod` is one env among several; restore from CloudBase backup (snapshot frequency = daily; verify backup is enabled in I.4).

Document any rollback in `docs/superpowers/progress/2026-05-19-p0-progress.md` §7 changelog with a one-liner.

---

## 14. Effort estimate

| Group | Engineer-days |
|---|---|
| A — env + deploy | 0.5–1 |
| B — mock removal + flag | 1–2 |
| C — schedules | 1 |
| D — WeChat Pay | 3–5 |
| E — Faceid | 1–2 |
| F — 服务号 push | 1–2 |
| G — Lark | 0.5 |
| H — storage | 0.5 |
| I — indexes + prod env | 1 |
| J — final E2E + sign-off | 2–3 |
| **Total Stage 1.M** | **~11–18 days** |

Run Groups D / E / F / G / H in parallel where bandwidth allows (each independent after Group A).

---

## 15. Update protocol

After completing each numbered item in this runbook:
- Tick the checkbox above
- Update `docs/superpowers/progress/2026-05-19-p0-progress.md` §3 Stage 1.M + relevant P0 stage tasks (§4)
- Add one line to progress file §7 Changelog

If something in mock didn't match live behavior, log the surprise — `docs/superpowers/risks/2026-05-18-loulou-risks.md` gets a new entry, and any code patches go via normal task flow (do not bypass tests).
