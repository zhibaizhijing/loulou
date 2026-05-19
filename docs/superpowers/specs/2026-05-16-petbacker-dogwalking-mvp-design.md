# Loulou — Pet Care Marketplace (WeChat Mini-Program)

**Date:** 2026-05-16 (initial), **revised 2026-05-18** to reflect refined product requirements (`docs/宠物寄养应用问题与范围定义0518.docx`) and user story map (`docs/Loulou_MVP用户故事地图_双端.html`).
**Status:** Design approved. Phase 1 (dog-walking owner-side slice) in implementation.
**Launch target:** 2026-09.

> **Reading order for engineers:** Sections 1–3 describe the Loulou product as a whole. Section 4 ("Phase 1 Scope") is the slice currently being built and matches the existing implementation plan (`docs/superpowers/plans/2026-05-16-petbacker-dogwalking-mvp.md`). Later phases are outlined in Section 9.

---

## 1. Product Overview

**Loulou** is a Chinese-market pet care marketplace connecting **pet owners** with vetted **caregivers** (照护者 / 守护者). Conceptually similar to Rover / PetBacker, localised for WeChat and Chinese payment, trust and review norms.

**Services offered (full product):**

| Service | Chinese | Description |
|---|---|---|
| Boarding | 寄养 | Overnight stay at caregiver's home |
| Daycare | 日托 | Daytime care at caregiver's home |
| Dog walking | 遛狗 | Time-boxed outdoor walk |
| House visit | 上门 | Caregiver visits owner's home |
| (Future) Live-in | 住家守护 | Caregiver stays at owner's home |

**Why this product exists (core problem):** Chinese pet owners — especially dog owners — cannot quickly find reliable, vetted, transparently-priced, well-reviewed caregivers. Existing alternatives (闲鱼, 小红书, 猫巷, 嘻猫, unipal, 布丁, pet shops, neighbours, 家政) are fragmented, unverified, or single-service. Caregivers lack a unified channel for service listing, scheduling, and payment collection.

**Cost of not solving:** owners overpay, vet by hand, or skip caregiving entirely (separation anxiety, missed travel).

---

## 2. Personas

### Owner (客户端 · 宠物主人)
City pet owners, 20–50, working professionals, treat pets as family.

- **Jobs to be done:** find trustworthy caregiver fast; verify past reviews; book + pay on platform; monitor pet status; communicate; resolve issues; review service.
- **Pain points:** comparing caregivers is slow; risk of last-minute cancellation; cannot judge caregiver character; opaque pricing; no service-quality guarantee; cannot follow service in real time; slow incident resolution; no accountability trail.

### Caregiver (服务端 · 照护者)
City residents, 20–50, time-flexible, animal-loving, want supplemental income.

- **Jobs to be done:** publish services + set prices + premium surcharges; receive orders; manage calendar; communicate with owners; basic safety guarantees; right to refuse unsafe / unreasonable jobs; earn income; review owner and pet.
- **Pain points:** hard to build long-term reputation; fear of aggressive pets; fear of emergencies; fear of empty calendar.

---

## 3. Full-product Functional Scope

Story IDs reference the user story map in `docs/Loulou_MVP用户故事地图_双端.html`. **Priority:** 必须 = MUST (M), 应有 = SHOULD (S), 可选 = COULD (C).

### Owner side
| ID | Story | Priority |
|---|---|---|
| c1 | Phone / WeChat one-tap registration | M |
| c2 | Location-based caregiver search; filter by service type | M |
| c3 | View caregiver detail page (rating, reviews, price, calendar) | M |
| c4 | Online booking + payment | M |
| c5 | Receive service status updates (photos + dynamics) | S |
| c6 | Submit review | M |
| c7 | Build pet profile (breed, vaccines, special needs, multi-pet) | M |
| c8 | In-app messaging | M |
| c9 | View orders + payment records | M |
| c10 | Favourite caregivers | S |
| c11 | Modify / cancel booking (policy-based refund) | S |
| c12 | Contact customer service (incidents) | M |

### Caregiver side
| ID | Story | Priority |
|---|---|---|
| p1 | Register + complete certification (real-name, background, indoor photos) | M |
| p2 | Publish service items + set prices + surcharges | M |
| p3 | Manage availability calendar | M |
| p4 | Accept / fairly decline bookings (protected) | M |
| p5 | Send pet status photos + notes | S |
| p6 | Mark complete + receive auto-settlement | M |
| p7 | Edit profile / bio / showcase | S |
| p8 | In-app messaging (with quick replies) | M |
| p9 | View earnings + commission breakdown + withdraw | M |
| p10 | View pet profile before accepting | S |
| p11 | Review pet + owner | S |
| p12 | Emergency customer service | M |

### Cross-cutting (full product)
- Insurance purchase (C, deferred post-MVP).
- Tiered commission + early-adopter loyalty programme (business, not engineering surface).
- Admin moderation (incidents, fraud, review quality).
- Subscribe-message push (WeChat).

---

## 4. Phase 1 Scope — Dog-Walking Owner-Side Vertical Slice (**current implementation**)

This is the slice the existing plan implements. Constraints retained:

**In Phase 1:**
- Owner-side flow for dog-walking only (single service).
- Hidden walker-mode page for demo loop.
- Wx login + minimal owner profile (c1 subset — phone optional, WeChat openid only).
- Browse + filter walkers (c2 subset — area + max price + min rating).
- Walker profile + reviews (c3 subset — no live calendar; demo flat availability).
- Booking request + **mock** payment (c4 subset — UI only, no real 微信支付).
- 1:1 chat after booking confirmed (c8).
- Walk report (p5 analogue).
- Single-direction review owner→walker (c6).
- Empty/loading/error/offline UX baseline.

**Deferred to later phases (not in Phase 1):**
- c5 push notifications; c7 multi-pet profile (single inline dog form only); c9 detailed payment ledger; c10 favourites; c11 modify/cancel; c12 customer service entry; bi-directional review (p11); calendar (p3); p1 real certification (any logged-in user can flip walker mode); p2 self-service service publishing; p4 decline/accept flow (server auto-accepts); p6 settlement / p9 withdrawal; p7 walker self-edited profile; insurance; admin; subscribe push; boarding / daycare / house-visit services.

**Mapping table (Phase 1 ↔ Loulou stories):**

| Loulou story | Phase 1 coverage |
|---|---|
| c1 | Silent wx.login → openid; cloud fn `login`, `updateProfile` |
| c2 | `pages/home` + `walkerService.list` (location-by-area string, not GPS) |
| c3 | `pages/walker` + `reviewService.listForWalker` |
| c4 | `pages/booking-new` + `createBooking` cloud fn with `mockPayment: { paid: true }` |
| c6 | `pages/review` + `submitReview` cloud fn |
| c7 | Inline `dog-form` component; `users.dogs[]` array (no separate profile page) |
| c8 | `pages/chat` + `sendMessage` cloud fn + `db.watch()` realtime |
| p5 | Walker-mode `pages/_walker` + `submitWalkReport` cloud fn |

All other stories are **future work**, not held against Phase 1.

---

## 4.1. Mock Mode (development & demo, removed before pilot)

### Why

Phase 1 needs to be demoable and developable without depending on a live CloudBase environment. Reasons:
- Fresh appid (`wxab4f24c2c7243737`) has no CloudBase activated yet; activation needs admin action, deploys, function uploads, env config. Mock mode unblocks UI work during that gap.
- Demos to non-engineers (founders, recruited caregivers, design reviews) should not depend on cloud connectivity or seeded server data.
- Page-level + integration tests run faster against in-memory data than against the cloud SDK.
- A clear off-switch is required before pilot — mock data must not reach real users.

### Approach (Path A — service-layer toggle)

Single compile-time toggle: `__USE_MOCK__: boolean` in `miniprogram/utils/env.ts`. Every service file (`authService`, `walkerService`, `bookingService`, `chatService`, `reviewService`, `walkReportService`, `storageService`) branches on this flag:

```ts
// pattern repeated in each service
export async function list(filter: WalkerFilter): Promise<Walker[]> {
  if (__USE_MOCK__) return mockDb.walkers.list(filter)
  return db.collection('walkers').where(/*...*/).get().then(r => r.data)
}
```

App-boot path is also gated. When `__USE_MOCK__ === true`:
- `wx.cloud.init` is skipped (avoids `-601034` on un-activated appids).
- `silentLogin` returns a fake openid (`'mock-owner-1'`) immediately.
- A persistent banner "MOCK MODE — 模拟数据，未连接云端" appears at the top of every page (cannot be dismissed).

### Mock store

`miniprogram/mocks/db.ts` exposes an in-memory store with the same surface area Phase 1 needs:
- Collections: `walkers`, `reviews`, `bookings`, `messages`, `walkReports`, `users`
- Query verbs: `list(filter)`, `get(id)`, `insert(doc)`, `update(id, patch)`, `delete(id)`
- Realtime substitute: `watch(collection, filter, onChange)` backed by a local event emitter (`utils/bus.ts`)
- Persistence: writes also serialised to `wx.setStorageSync` so reload preserves state during a demo session

`miniprogram/mocks/seed.ts` exports the same demo dataset that `cloudfunctions/seedDemoData` would seed server-side: 3 walkers, 5 reviews, 1 owner with 1 dog. Single source of truth — both the cloud fn and the mock module re-export from a shared `mocks/seedData.ts` constants file so mock and live demos look identical.

### Boundary rules

- `__USE_MOCK__` is a compile-time `const`, not a runtime feature flag — it must be statically resolvable so dead-code elimination can drop mock modules from prod bundles.
- `__USE_MOCK__` lives in `utils/env.ts` and is the **only** place toggled. No service decides on its own.
- Mock code lives under `miniprogram/mocks/` and is never imported by cloud functions.
- The banner is mandatory whenever the flag is true — there is no "silent mock" mode.

### Limits (acknowledged, not addressed in mock)

Mock mode does not exercise:
- Cloud function auth checks (`assertAuth`, `assertOwnerOfBooking`, etc.)
- `FnResult` / `AppError` server-side error paths (mock services throw `AppError` directly, but server-validation logic is bypassed)
- Idempotency keys at the money layer
- DB rules (server-side read/write restrictions)
- Realtime delivery semantics (mock emits synchronously on the same tick; real `db.watch` is debounced + async)
- Cold start, network failure, quota limits

These are tested only against live CloudBase (Stage 1.M).

### Path to live data

A dedicated mini-stage (**Stage 1.M — CloudBase Activation & Live Switch**) flips the toggle once the cloud env is provisioned and functions deployed. After Stage 1.M, the codebase keeps mock implementations in place but compiled-out via `__USE_MOCK__ = false`. Mock files survive in tree for local dev / E2E test rigs; they cannot be imported when the flag is false.

### When mock mode is removed

Mock module files (`miniprogram/mocks/**`) are **deleted entirely** before public pilot, alongside any dev-seed CTAs (`pages/me` dev button, hidden walker-mode). Removal is tracked under Phase 5 (Trust & Safety) launch checklist (see risks doc §5.6).

---

## 5. Stack & Tooling

| Concern | Choice |
|---|---|
| Platform | WeChat Mini-Program (native, not uni-app) |
| Language | TypeScript, strict mode |
| UI library | TDesign Weapp |
| Backend | WeChat 云开发 (CloudBase) — DB, storage, cloud functions, auth |
| AppID | `wxab4f24c2c7243737` (registered as 小程序; configured in `project.config.json`) |
| Build | Native miniprogram TS toolchain; `npm run build-npm` for TDesign |
| Tests | vitest, miniprogram-simulate, devtools `cli auto` for E2E |
| IDE | WeChat 开发者工具 (`/Applications/wechatwebdevtools.app/Contents/MacOS/cli`) |

---

## 6. Architecture

**Pattern:** Hybrid — client reads CloudBase DB directly via SDK; client writes & sensitive ops go through cloud functions.

```
┌──────────────────────────┐
│ Page (.ts)               │  pages never call wx.cloud or db directly
└──────────┬───────────────┘
           │
┌──────────▼───────────────┐
│ services/*.ts            │  reads → DB SDK direct
│                          │  writes → wx.cloud.callFunction
└────┬────────────┬────────┘
     │ (read)     │ (write/sensitive read)
┌────▼─────┐ ┌────▼─────────┐
│  DB      │ │ Cloud Fns    │
│ rules:   │ │ - createBkg  │
│ public   │ │ - sendMsg    │
│ collec   │ │ - submitRev  │
│ read-only│ │ - submitRpt  │
│          │ │ - updateProf │
└──────────┘ └──────┬───────┘
                    │
              ┌─────▼────┐
              │   DB     │
              └──────────┘
```

**Trust boundary:** all writes pass through cloud functions. DB write rules deny client writes entirely. DB read rules permit only public collections (`walkers`, `reviews`); private collections (`bookings`, `messages`, `walkReports`, `users`) require server access.

**Why Hybrid:** browse + profile reads dominate traffic and must avoid 300–800ms cold-start lag — direct DB SDK delivers this. Mutations are rare and benefit from a single trust boundary — cloud functions deliver this. The service layer abstracts the split, so reads can later move behind cloud fns without changing pages. This pattern generalises to future services (boarding, daycare, etc.) by adding entity collections + fn handlers; the page → service → fn/db topology stays unchanged.

---

## 7. Phase 1 Components

### Pages (`miniprogram/pages/`)

| Page | Path | Purpose | Story |
|---|---|---|---|
| Home / Browse | `pages/home/index` | List walkers, filter bar, search | c2 |
| Walker profile | `pages/walker/index?id=` | Photos, bio, pricing, review list, "Book" CTA | c3 |
| Booking request | `pages/booking-new/index?walkerId=` | Date/time/duration/dog form, mock pay screen, submit | c4, c7(inline) |
| My bookings | `pages/bookings/index` | Tabs: upcoming / past | c9(subset) |
| Booking detail | `pages/booking/index?id=` | Status, walker info, chat entry, walk report, review CTA | c9 detail |
| Chat | `pages/chat/index?bookingId=` | Message list + composer (text only) | c8 |
| Review submit | `pages/review/index?bookingId=` | 5-star + text | c6 |
| Profile / Me | `pages/me/index` | Owner profile, dogs list, dev seed button, logout | c1, c7 |
| Walker mode (hidden) | `pages/_walker/index` | Demo-only walker view: bookings list, chat back, post walk report | p5 demo |

TabBar: Home · Bookings · Me

### Reusable components (`miniprogram/components/`)

`walker-card`, `review-item`, `dog-form`, `star-rating`, `empty-state`, `chat-bubble`, `loading-skeleton`

### Service layer (`miniprogram/services/`)

| Service | Responsibilities | Strategy |
|---|---|---|
| `authService` | wx login, getOwnerProfile, updateProfile | cloud fn |
| `walkerService` | list, getById, getReviews | direct DB read |
| `bookingService` | create, listMine, getById, cancel | cloud fn writes; listMine via fn (private data) |
| `chatService` | listMessages, send, watchNew | listMessages direct read; send via fn; watchNew via DB realtime |
| `reviewService` | submit, listForWalker | submit via fn; list direct |
| `walkReportService` | submit (walker-side), getForBooking | submit via fn; get direct |
| `storageService` | uploadImage | direct (CloudBase storage) |

**Rule:** pages NEVER call `wx.cloud.*` or `db.*` directly. Only services do.

### Cloud functions (`cloudfunctions/`)

`login`, `updateProfile`, `createBooking`, `cancelBooking`, `sendMessage`, `submitReview`, `submitWalkReport`, `seedDemoData` (dev only).

### Data model (CloudBase NoSQL collections)

```
users           { _id, openid, name, avatar, phone?, dogs: Dog[], createdAt }
walkers         { _id, name, avatar, bio, photos[], areas[], pricePerWalk,
                  rating, reviewCount, demo: true }
bookings        { _id, ownerId, walkerId, dogId, date, durationMin,
                  status: 'requested'|'accepted'|'declined'|'in_progress'|'completed'|'cancelled',
                  notes, mockPayment: { amount, paid }, createdAt, updatedAt }
messages        { _id, bookingId, senderId, senderRole: 'owner'|'walker',
                  text, photoUrl?, createdAt }
walkReports     { _id, bookingId, walkerId, photos[], notes,
                  durationMin, peeCount, poopCount, createdAt }
reviews         { _id, bookingId, ownerId, walkerId, stars: 1|2|3|4|5, text, createdAt }
```

`Dog` shape (embedded in `users.dogs`): `{ id, name, breed?, sizeKg?, notes? }`.

**DB rules:** `walkers` & `reviews` world-read. `users`/`bookings`/`messages`/`walkReports` deny client read (server-only via cloud fn). All collections deny client write.

**Future-proofing note:** the `walkers` collection will become `caregivers` (or be augmented with a `serviceType[]` field) when boarding / daycare / house-visit are added. Phase 1 deliberately names it `walkers` to keep the slice focused; the rename is a Phase 3 task (see Section 9).

### Project layout

```
miniprogram/pet/
├── miniprogram/
│   ├── app.ts  app.json  app.wxss  sitemap.json
│   ├── pages/
│   ├── components/
│   ├── services/
│   ├── models/         (TS types matching collections)
│   ├── utils/          (date, format, errorHandler, logger, bus)
│   └── types/          (global ambient types)
├── cloudfunctions/
│   ├── login/
│   ├── createBooking/
│   ├── ...
├── docs/superpowers/specs/
├── project.config.json
├── tsconfig.json
└── .gitignore
```

---

## 8. Phase 1 Data Flows

### Flow A — App start & auth

```
app.ts onLaunch
  → wx.cloud.init({ env: 'pet-xxx' })
  → authService.silentLogin()
       → wx.login() → code
       → cloud.callFunction('login', { code }) → { openid, isNewUser }
       → if new: cloud.callFunction('updateProfile', { name: 'Pet Owner' })
       → cache openid in app.globalData
  → router to last page or home
```

### Flow B — Browse walkers

```
home page onLoad / onPullDownRefresh
  → walkerService.list({ area, maxPrice, minRating })
       → db.collection('walkers')
            .where({ areas: _.in([area]), pricePerWalk: _.lte(maxPrice) })
            .orderBy('rating','desc').limit(20).get()
  → setData({ walkers })
tap card → wx.navigateTo('/pages/walker/index?id=' + id)
```

### Flow C — Walker profile

```
walker page onLoad(id)
  parallel:
    walkerService.getById(id)        → db direct
    reviewService.listForWalker(id)  → db direct
  → setData({ walker, reviews })
tap "Book" → wx.navigateTo('/pages/booking-new/index?walkerId=' + id)
```

### Flow D — Create booking

```
booking-new page submit
  → client form validation (date future, dog selected, duration ∈ {30,45,60})
  → bookingService.create({ walkerId, dogId, date, durationMin, notes })
       → cloud.callFunction('createBooking', payload)
            server:
              - assertAuth(event)
              - verify walker exists
              - amount = walker.pricePerWalk × (durationMin / 30)
                (pricePerWalk represents a 30-min base rate; durations are 30/45/60)
              - insert bookings doc { status: 'accepted', mockPayment: { amount, paid: true } }
              - return { bookingId }
  → wx.redirectTo('/pages/booking/index?id=' + bookingId)
  → toast "Booking confirmed"

DEMO: createBooking auto-accepts (no real walker to notify).
Phase 2+: status flow becomes requested → accepted/declined (caregiver action).
```

### Flow E — Chat

```
chat page onLoad(bookingId)
  → chatService.listMessages(bookingId)  (direct read of latest 50)
  → chatService.watchNew(bookingId, onSnapshot)
       → db.collection('messages').where({ bookingId }).watch({ onChange })

send composer:
  → optimistic append local (status: 'sending')
  → chatService.send(bookingId, text)
       → cloud.callFunction('sendMessage', { bookingId, text })
            server:
              - assertAuth(event)
              - assertBookingParticipant(openid, bookingId, role)
                  role determined by client header: 'owner' | 'walker'
                  owner check: openid === booking.ownerId
                  walker check (DEMO): any logged-in user with walker-mode flag in session
                  (real walker-side product will tie walker openid to walker doc)
              - insert messages doc
       → on resolve: mark 'sent'; on reject: mark 'failed' + retry CTA
```

### Flow F — Walker posts walk report (walker mode)

```
walker mode → bookings list → tap booking → "End walk + post report"
  → form: photos (1–3), notes, duration
  → upload photos via storageService.uploadImage → fileIDs[]
  → walkReportService.submit({ bookingId, photos, notes, durationMin })
       → cloud.callFunction('submitWalkReport', payload)
            server:
              - assertAuth(event)
              - assertWalkerOfBooking(openid, bookingId)  [demo: any logged-in walker-mode user OK]
              - insert walkReports doc
              - update bookings.status = 'completed'
  → owner side: booking detail page onShow re-fetch → renders report
  → unlocks "Leave review" CTA
```

### Flow G — Submit review

```
review page submit
  → reviewService.submit({ bookingId, stars, text })
       → cloud.callFunction('submitReview', payload)
            server:
              - assertAuth(event)
              - assertOwnerOfBooking(openid, bookingId)
              - assertBookingStatus(bookingId, 'completed')
              - assertNoExistingReview(bookingId)
              - insert reviews doc
              - update walkers: rating = (sum + stars) / (count + 1), reviewCount += 1
  → wx.navigateBack → toast "Thanks!"
```

### State management

No global store library. Per-page state via `setData`. Cross-page state (auth, current dogs) via `app.globalData` plus an event bus (`utils/bus.ts`) for cache invalidation (e.g., new booking → bookings list refresh on next focus).

### Realtime / freshness

- Chat: `db.watch()` (CloudBase realtime listener)
- Booking status: page `onShow` re-fetches
- Walker rating: eventual consistency, walker page re-fetches on each open

---

## 9. Future Phases (Roadmap to Full Loulou)

Each phase becomes its own brainstorm → spec → plan cycle. Order is suggested; reorder based on caregiver-supply and pilot feedback.

### Phase 2 — Caregiver self-service (story IDs p1, p2, p3, p4, p7)
Real caregiver onboarding: real-name + ID upload (`p1`), service publishing UI with prices and surcharges (`p2`), availability calendar (`p3`), accept/decline order flow (`p4`), self-edited profile (`p7`).
**New collections:** `caregivers` (replaces/augments `walkers`), `services` (one row per published service per caregiver), `availability` (calendar slots), `applications` (pending certification).
**New cloud fns:** `applyCaregiver`, `submitCertification`, `publishService`, `setAvailability`, `acceptBooking`, `declineBooking`.
**Booking status flow** moves from auto-accept to `requested → accepted | declined`.

### Phase 3 — Multi-service support (寄养 / 日托 / 上门)
Generalise `walkers` collection → `caregivers` with `serviceType[]`. Search filter c2 fully realised. Per-service pricing and duration units (per-night for boarding, per-day for daycare, per-visit for house visits). UI: service-type tabs on home page; service-specific booking form fields (e.g., overnight count, pickup/dropoff window).

### Phase 4 — Payments + settlement (stories c4 full, c9 full, p6, p9)
Replace mock payment with real **WeChat Pay** merchant integration. Escrow until service complete + 48h. Caregiver earnings ledger (`p9`), commission line, withdrawal flow (T+1). Owner payment record + invoice export (`c9`).
**Compliance:** requires 商户号 (merchant ID) — separate registration with WeChat Pay; KYC for caregiver payouts.

### Phase 5 — Trust & safety (c12, p12, insurance)
Customer service entry point (in-app), incident escalation with evidence upload, response SLA. Optional insurance purchase at checkout. Caregiver background check service (Phase 2 lays the data, Phase 5 wires the provider).

### Phase 6 — Engagement (c5 push, c10 favourites, c11 modify/cancel, bi-directional review p11)
WeChat subscribe-message templates for booking status, walk-report posted, review reminder. Favourites collection. Cancellation policy + refund engine. Caregiver review of owner/pet (`p11`).

### Phase 7 — Operations
Admin moderation portal (web), fraud detection, review-quality moderation, manual incident workflow. Tiered commission engine + loyalty programme for early caregivers.

### Phase 8 — Optional surfaces
Live GPS walk tracking + map view. Live-in service (住家守护). i18n if expanding beyond mainland Chinese.

---

## 10. Error Handling

### Categories & UX

| Category | Source | Response |
|---|---|---|
| Network | Cloud fn reject, DB get reject | Toast "网络异常，重试" + retry. One auto-retry on transient. |
| Auth | openid missing, session expired | Silent re-login. If still fails: modal → kick to home. |
| Validation (client) | Form bad input | Inline field error. Submit disabled until valid. |
| Validation (server) | Cloud fn rejects payload/business rule | Toast w/ server message. Form stays filled. |
| Authz | Cloud fn returns 403 | Toast "无权操作". Navigate back. Log to telemetry. |
| Conflict | Double-submit | Cloud fn idempotency key (e.g., booking: hash(openid + walkerId + date)). Returns existing record; UI proceeds as success. |
| Not found | Walker deleted, booking missing | Empty-state w/ "返回" CTA. |
| Quota | CloudBase free tier hit | Modal "服务暂不可用". Log loudly. |
| Upload | Photo upload fail | Per-image retry; rest of form survives. |

### Cloud function error contract

```ts
type FnResult<T> = { ok: true; data: T } | { ok: false; code: ErrCode; msg: string }
type ErrCode = 'UNAUTH' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION' | 'CONFLICT' | 'INTERNAL'
```

Service layer unwraps:

```ts
async function call<T>(name: string, payload: unknown): Promise<T> {
  const r = await wx.cloud.callFunction({ name, data: payload })
  const body = r.result as FnResult<T>
  if (!body.ok) throw new AppError(body.code, body.msg)
  return body.data
}
```

Pages catch `AppError` → map code to UX (toast / modal / redirect) via `utils/errorHandler.ts`.

### Logging

- Client: `utils/logger.ts` wraps `console.*`, adds page + openid context. Errors surface to local file in dev; `wx.reportEvent` once real appid is in place.
- Server: structured JSON per call: `{ fn, openid, ms, code, payload-redacted }`. Visible in CloudBase console.
- No PII in logs (redact phone, message text).

### Empty / loading / error states

Every list page handles 4 states via shared `usePageState` helper:
1. Loading → `loading-skeleton`
2. Empty → `empty-state`
3. Error → `empty-state` variant w/ retry
4. Loaded → render

### Offline

- `wx.getNetworkType()` watcher → global banner "离线"
- Writes blocked w/ toast "离线，操作未提交"
- Reads serve from `wx.getStorage` cache where stale-OK (walker list TTL 5 min)

### Defensive boundaries

- Client validation = UX only.
- Every cloud fn first calls `assertAuth(event)` then resource-specific assertions before any DB op.
- DB rules deny anything not explicitly public; no client write rules at all.

---

## 11. Testing

### Layers

| Layer | Tool | Scope |
|---|---|---|
| Unit (TS pure) | vitest | Utils, formatters, validation, error mapping, services with mocked `wx.cloud`/`db` |
| Cloud fn unit | vitest | Each fn handler, mock `cloud.database()` + `cloud.getWXContext()` |
| Integration (cloud fn ↔ DB) | vitest + CloudBase test env | Real fn deployed to dev env; reset between tests via `seedDemoData` |
| Page logic | vitest + miniprogram-simulate | Render page TS w/ stub data, assert setData and event handlers |
| E2E | WeChat devtools `cli auto` | Scripted user flow (one happy-path test, see below) |
| Manual smoke | Devtools simulator + 真机预览 | Pre-release checklist |

### Coverage targets

- Cloud fns: 90%+
- Services: 80%+
- Validators: 100%
- Pages: smoke render only

### E2E happy path

```
1. silentLogin → owner created
2. seedDemoData → 3 walkers, 1 dog for owner
3. browse home → assert 3 cards
4. tap walker → assert profile renders
5. tap book → fill form → submit → booking created
6. open chat → send "hello" → assert appears
7. switch to walker mode → see booking → post walk report
8. owner returns → assert report visible → submit review
9. assert walker rating updated
```

### Test data

- `cloudfunctions/seedDemoData/`: idempotent. Wipes test-env collections, seeds 3 walkers + 5 reviews + sample dogs. Called from CI pre-E2E.
- Dev seed button on `pages/me/` (visible only when `__DEV__`) for manual seeding.

### CI

GitHub Actions (set up only after first push to remote):
- `npm run typecheck`
- `npm run lint` (eslint + wxml-lint)
- `npm run test` (vitest unit + cloud fn unit)
- Integration & E2E: gated on label, runs against dev cloud env.

### Out of scope (defer)

Performance/load tests, visual regression, accessibility audit, multi-locale snapshot tests.

---

## 12. Open Questions / Phase-1 Risks

(Full product, operational, and regulatory risks live in `docs/superpowers/risks/2026-05-18-loulou-risks.md`.)

- **CloudBase env name.** Must be created in WeChat dev console before first run; spec assumes `pet-<random>`. Plan should include this setup step.
- **TDesign customisation.** Brand-distinct theming (Loulou logo, primary colour) deferred — MVP uses TDesign defaults. Visual identity is its own future task.
- **Walker-mode access control.** Hidden page reachable only via direct path. Walker identity in demo = "any logged-in user who flipped a walker-mode flag in their session"; this satisfies the demo loop but is not real auth. Real caregiver side replaces this in Phase 2.
- **Cloud function quota.** All writes pay one fn invocation. Free tier = 50K calls/month; ample for demo, but background batches (e.g., rating recompute) should stay light.
- **Collection naming.** `walkers` (Phase 1) → `caregivers` (Phase 3) rename. Phase 1 code should not lean on the name semantically; treat the entity as "service provider".
