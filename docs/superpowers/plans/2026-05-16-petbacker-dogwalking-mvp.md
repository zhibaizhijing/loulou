# Loulou — Phase 1 Implementation Plan (Dog-Walking Owner-Side Slice)

> **Revised 2026-05-18.** Originally written as "PetBacker Dog-Walking MVP". Reframed to slot in as **Phase 1 of the Loulou pet-care marketplace** (see spec `docs/superpowers/specs/2026-05-16-petbacker-dogwalking-mvp-design.md`). The 37 implementation tasks below are unchanged — they remain the right unit of work for the slice currently in flight. Loulou roadmap (Phase 2–8) is summarised at the end of this file and tracked in the spec.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Phase 1 of Loulou — the owner-side dog-walking vertical slice — end-to-end: wx login → browse walkers → view profile → request booking → chat → walk report → submit review. Covers Loulou stories c1 (subset), c2 (subset), c3 (subset), c4 (mock pay), c6, c7 (inline form), c8, and p5 (demo walker mode). All other Loulou stories are future-phase work.

**Architecture:** Native TypeScript miniprogram + TDesign Weapp UI + WeChat 云开发 (CloudBase). Hybrid data path — pages call typed service modules; services read public collections directly via the CloudBase JS SDK and route every write (and sensitive read) through cloud functions. Single trust boundary on mutations. Topology designed to generalise to multi-service caregivers in Phase 3.

**Tech Stack:** WeChat Mini-Program (native), TypeScript strict, TDesign Weapp components, CloudBase NoSQL DB + Storage + Functions (Node 18), vitest for unit tests, miniprogram-simulate for page tests, WeChat devtools `cli auto` for one E2E happy-path test.

**Repo state assumption:** Empty project root at `/Users/juntingma/Developer/jt/project/miniprogram/pet`. Git is not initialized — every task's "commit" step is optional. To use the commits as written, run `git init` at Task 1; otherwise treat the commit step as a logical checkpoint.

---

## File Structure (Up-Front Map)

```
miniprogram/pet/
├── miniprogram/
│   ├── app.ts                          app entry — cloud.init + auth boot
│   ├── app.json                        page registry + tabBar + window
│   ├── app.wxss                        global styles (TDesign theme import)
│   ├── sitemap.json                    crawler config
│   ├── pages/
│   │   ├── home/                       browse walkers
│   │   ├── walker/                     walker profile
│   │   ├── booking-new/                booking request form
│   │   ├── bookings/                   my bookings (tabs)
│   │   ├── booking/                    booking detail
│   │   ├── chat/                       1:1 chat
│   │   ├── review/                     submit review
│   │   ├── me/                         owner profile + dev tools
│   │   └── _walker/                    hidden walker-mode (demo)
│   ├── components/
│   │   ├── walker-card/
│   │   ├── review-item/
│   │   ├── dog-form/
│   │   ├── star-rating/
│   │   ├── empty-state/
│   │   ├── chat-bubble/
│   │   └── loading-skeleton/
│   ├── services/
│   │   ├── cloudCall.ts                FnResult unwrap helper
│   │   ├── authService.ts
│   │   ├── walkerService.ts
│   │   ├── bookingService.ts
│   │   ├── chatService.ts
│   │   ├── reviewService.ts
│   │   ├── walkReportService.ts
│   │   └── storageService.ts
│   ├── models/
│   │   └── index.ts                    all collection TS types
│   ├── utils/
│   │   ├── errorHandler.ts             AppError, code → UX mapping
│   │   ├── logger.ts
│   │   ├── bus.ts                      cross-page event bus
│   │   ├── date.ts                     format/parse/compare
│   │   ├── network.ts                  online/offline watcher
│   │   ├── usePageState.ts             loading/empty/error/loaded helper
│   │   └── walkerMode.ts               demo walker-mode session flag
│   └── types/
│       └── env.d.ts                    __DEV__ + global ambient
├── cloudfunctions/
│   ├── login/
│   ├── updateProfile/
│   ├── createBooking/
│   ├── cancelBooking/
│   ├── sendMessage/
│   ├── submitReview/
│   ├── submitWalkReport/
│   ├── seedDemoData/
│   └── shared/                         shared TS sources copied at deploy
│       ├── result.ts                   FnResult builders
│       ├── assert.ts                   assertAuth, assertOwnership, etc.
│       └── types.ts                    shared collection shapes
├── tests/
│   ├── services/                       vitest unit tests for services
│   ├── cloudfn/                        vitest unit tests for fn handlers
│   ├── pages/                          miniprogram-simulate page tests
│   ├── e2e/                            devtools cli auto script
│   └── helpers/                        wx mock harness
├── docs/superpowers/
│   ├── specs/2026-05-16-petbacker-dogwalking-mvp-design.md
│   └── plans/2026-05-16-petbacker-dogwalking-mvp.md   (this file)
├── package.json
├── tsconfig.json
├── project.config.json
├── project.private.config.json         (gitignored)
├── .gitignore
└── .eslintrc.cjs
```

**Boundary rule enforced throughout the plan:** Pages import from `services/*`. Services import `cloudCall` + models + `wx.cloud`. Cloud fns import only from `shared/`. No page imports `wx.cloud` or `db.*` directly.

---

## Conventions Used in This Plan

- All paths are absolute under `miniprogram/pet/` (the project root).
- "Run" lines name the exact terminal command from the project root.
- "Expected" lines describe the success signal to look for. If different, stop and debug.
- TDD pattern: failing test → run-fail → minimal impl → run-pass → (commit). When a step is pure scaffolding (no logic) the test step is omitted and called out.
- Commit messages use Conventional Commits. Skip if not using git.

---

> **Indexing note.** This file = Loulou **Phase 1** (the dog-walking owner-side slice). The 10 implementation stages of Phase 1 are numbered **Stage 1.0 – Stage 1.9** below to avoid collision with **Loulou Phases 2 – 8** (Caregiver self-service, Multi-service, Payments, Trust & Safety, Engagement, Operations, Optional surfaces) which appear after Task 37. Two extra mini-stages — **Stage 1.5M** (mock-mode toggle, Tasks 98–104) and **Stage 1.M** (CloudBase activation & live switch, Tasks 105–110) — bracket the live/mock transition. Tasks keep flat numbering 1 – 110 across all stages.
>
> **Execution order for Phase 1:** Stage 1.0 → 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → **Stage 1.5M** (mock infra) → 1.6 → 1.7 → 1.8 → 1.9 → **Stage 1.M** (cloud activation + flip + cleanup) → Phase 2.
>
> **Why mock mode now:** new appid `wxab4f24c2c7243737` has no CloudBase activated → boot crashes with `-601034`. Stage 1.5M unblocks all UI work without requiring cloud activation; Stage 1.M handles activation + live cutover as an explicit gated transition.

## Stage 1.0 — Project Scaffold

### Task 1: Bootstrap project files & tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `project.config.json`
- Create: `project.private.config.json`
- Create: `.gitignore`
- Create: `.eslintrc.cjs`
- Create: `miniprogram/sitemap.json`
- Create: `miniprogram/app.json`
- Create: `miniprogram/app.wxss`
- Create: `miniprogram/app.ts`
- Create: `miniprogram/types/env.d.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "petbacker-miniprogram",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint 'miniprogram/**/*.ts' 'cloudfunctions/**/*.ts' 'tests/**/*.ts'",
    "test": "vitest run",
    "test:watch": "vitest",
    "build:tdesign": "echo 'Run \"工具 → 构建 npm\" in WeChat devtools'"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.57.0",
    "miniprogram-api-typings": "^4.0.0",
    "miniprogram-simulate": "^1.4.0",
    "typescript": "^5.4.0",
    "vitest": "^1.4.0"
  },
  "dependencies": {
    "tdesign-miniprogram": "^1.7.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "node",
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "lib": ["ES2020"],
    "types": ["miniprogram-api-typings", "node"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["miniprogram/*"]
    }
  },
  "include": [
    "miniprogram/**/*.ts",
    "cloudfunctions/**/*.ts",
    "tests/**/*.ts"
  ],
  "exclude": ["node_modules", "miniprogram/miniprogram_npm"]
}
```

- [ ] **Step 3: Create `project.config.json`**

```json
{
  "miniprogramRoot": "miniprogram/",
  "cloudfunctionRoot": "cloudfunctions/",
  "appid": "touristappid",
  "projectname": "petbacker-pet",
  "compileType": "miniprogram",
  "libVersion": "3.4.0",
  "setting": {
    "es6": true,
    "enhance": true,
    "postcss": true,
    "minified": false,
    "useCompilerPlugins": ["typescript"],
    "packNpmManually": false,
    "packNpmRelationList": [],
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    }
  },
  "condition": {}
}
```

- [ ] **Step 4: Create `project.private.config.json`** (gitignored, per-developer settings)

```json
{
  "projectname": "petbacker-pet",
  "setting": {
    "compileHotReLoad": true
  }
}
```

- [ ] **Step 5: Create `.gitignore`**

```
node_modules/
miniprogram/miniprogram_npm/
cloudfunctions/*/node_modules/
.superpowers/
project.private.config.json
.DS_Store
*.log
dist/
coverage/
.vitest/
```

- [ ] **Step 6: Create `.eslintrc.cjs`**

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  env: { node: true, es2020: true },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'off'
  },
  ignorePatterns: ['miniprogram_npm/', 'node_modules/']
}
```

- [ ] **Step 7: Create `miniprogram/sitemap.json`**

```json
{ "desc": "关于本文件的更多信息，请参考文档 https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/sitemap.html", "rules": [{ "action": "allow", "page": "*" }] }
```

- [ ] **Step 8: Create `miniprogram/app.json`** (page registry, tabBar deferred to later task — minimum entries first)

```json
{
  "pages": [
    "pages/home/index",
    "pages/walker/index",
    "pages/booking-new/index",
    "pages/bookings/index",
    "pages/booking/index",
    "pages/chat/index",
    "pages/review/index",
    "pages/me/index",
    "pages/_walker/index"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTitleText": "PetBacker",
    "navigationBarTextStyle": "black"
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json",
  "lazyCodeLoading": "requiredComponents",
  "cloud": true
}
```

- [ ] **Step 9: Create `miniprogram/app.wxss`** (global resets only — TDesign import added in Task 2)

```css
page {
  background-color: #f5f5f5;
  font-size: 28rpx;
  color: #1f2329;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", sans-serif;
}
```

- [ ] **Step 10: Create `miniprogram/app.ts`** (stub — real cloud init in Task 4)

```typescript
App({
  globalData: {
    openid: '' as string,
    bootError: null as Error | null
  },
  onLaunch() {
    console.log('[app] launch')
  }
})
```

- [ ] **Step 11: Create `miniprogram/types/env.d.ts`**

```typescript
declare const __DEV__: boolean

declare module '*.json' {
  const value: unknown
  export default value
}

declare global {
  interface IAppOption {
    globalData: {
      openid: string
      bootError: Error | null
    }
  }
}

export {}
```

- [ ] **Step 12: Install dependencies**

Run: `npm install`
Expected: `node_modules/` populated, no errors. `tdesign-miniprogram` and dev deps resolved.

- [ ] **Step 13: Verify typecheck passes**

Run: `npm run typecheck`
Expected: exits 0, no errors.

- [ ] **Step 14: Commit** (skip if not using git)

```bash
git add package.json tsconfig.json project.config.json project.private.config.json .gitignore .eslintrc.cjs miniprogram/sitemap.json miniprogram/app.json miniprogram/app.wxss miniprogram/app.ts miniprogram/types/env.d.ts
git commit -m "chore: scaffold WeChat miniprogram project with TS + ESLint + vitest"
```

---

### Task 2: Install TDesign Weapp + build npm

**Files:**
- Modify: `miniprogram/app.wxss` (append TDesign theme import)
- Modify: `miniprogram/app.json` (register no global components yet — done per-page)

- [ ] **Step 1: Confirm TDesign installed under root `node_modules`**

Run: `ls node_modules/tdesign-miniprogram/miniprogram_dist | head`
Expected: directory listing including `button/`, `cell/`, `tabs/`, etc.

- [ ] **Step 2: Build TDesign for miniprogram**

Open WeChat 开发者工具 → 工具 → 构建 npm.

Or via CLI:

Run: `/Applications/wechatwebdevtools.app/Contents/MacOS/cli build-npm --project /Users/juntingma/Developer/jt/project/miniprogram/pet`
Expected: creates `miniprogram/miniprogram_npm/tdesign-miniprogram/` with built components.

- [ ] **Step 3: Append TDesign theme import to `miniprogram/app.wxss`**

```css
@import "/miniprogram_npm/tdesign-miniprogram/common/style/index.wxss";

page {
  background-color: #f5f5f5;
  font-size: 28rpx;
  color: #1f2329;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", sans-serif;
}
```

- [ ] **Step 4: Sanity check — render a TDesign button on a throwaway page**

Skip if confident. Open devtools, create a temporary page that uses `<t-button>` and verify it renders. Delete afterward.

- [ ] **Step 5: Commit** (skip if not using git)

```bash
git add miniprogram/app.wxss
git commit -m "chore: add TDesign Weapp theme import after build-npm"
```

---

### Task 3: Test harness — wx mock + vitest config

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/helpers/wxMock.ts`
- Create: `tests/helpers/index.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/helpers/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['miniprogram/services/**', 'miniprogram/utils/**', 'cloudfunctions/**/*.ts']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'miniprogram')
    }
  }
})
```

- [ ] **Step 2: Create `tests/helpers/setup.ts`**

```typescript
import { installWxMock } from './wxMock'
installWxMock()
;(globalThis as any).__DEV__ = true
```

- [ ] **Step 3: Create `tests/helpers/wxMock.ts`**

```typescript
type CallFnHandler = (name: string, data: unknown) => unknown
type DbHandler = { collection: (name: string) => any }

interface WxMockState {
  callFn: CallFnHandler
  db: DbHandler
  storage: Record<string, unknown>
  online: boolean
}

const state: WxMockState = {
  callFn: () => { throw new Error('callFn handler not set') },
  db: { collection: () => { throw new Error('db handler not set') } },
  storage: {},
  online: true
}

export function setCallFnHandler(h: CallFnHandler) { state.callFn = h }
export function setDbHandler(h: DbHandler) { state.db = h }
export function setOnline(v: boolean) { state.online = v }
export function resetWxMock() {
  state.callFn = () => { throw new Error('callFn handler not set') }
  state.db = { collection: () => { throw new Error('db handler not set') } }
  state.storage = {}
  state.online = true
}

export function installWxMock() {
  ;(globalThis as any).wx = {
    cloud: {
      init: () => undefined,
      callFunction: async (opts: { name: string; data: unknown }) => ({
        result: await state.callFn(opts.name, opts.data),
        errMsg: 'cloud.callFunction:ok'
      }),
      database: () => state.db,
      uploadFile: async (opts: any) => ({ fileID: 'mock://' + opts.cloudPath })
    },
    login: async () => ({ code: 'mock-code', errMsg: 'login:ok' }),
    getStorage: (opts: any) => {
      if (opts.key in state.storage) opts.success?.({ data: state.storage[opts.key] })
      else opts.fail?.({ errMsg: 'getStorage:fail' })
    },
    setStorage: (opts: any) => { state.storage[opts.key] = opts.data; opts.success?.() },
    getNetworkType: (opts: any) => opts.success?.({ networkType: state.online ? 'wifi' : 'none' }),
    onNetworkStatusChange: () => undefined,
    showToast: () => undefined,
    showModal: () => undefined,
    navigateTo: () => undefined,
    navigateBack: () => undefined,
    redirectTo: () => undefined,
    reportEvent: () => undefined
  }
}
```

- [ ] **Step 4: Create `tests/helpers/index.ts`**

```typescript
export * from './wxMock'

export function mockCollection(records: any[]) {
  const filtered = [...records]
  return {
    where: () => mockCollection(filtered),
    orderBy: () => mockCollection(filtered),
    limit: () => mockCollection(filtered),
    get: async () => ({ data: filtered }),
    doc: (id: string) => ({
      get: async () => {
        const r = filtered.find(x => x._id === id)
        if (!r) throw new Error('not found')
        return { data: r }
      }
    }),
    watch: () => ({ close: () => undefined })
  }
}
```

- [ ] **Step 5: Verify the harness loads**

Create temporary `tests/sanity.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { resetWxMock } from './helpers'

describe('test harness', () => {
  it('wx global is installed', () => {
    expect((globalThis as any).wx).toBeDefined()
    expect((globalThis as any).wx.cloud).toBeDefined()
  })
  it('reset works', () => {
    resetWxMock()
    expect(true).toBe(true)
  })
})
```

Run: `npm run test`
Expected: 2 tests pass.

- [ ] **Step 6: Delete the sanity test**

Run: `rm tests/sanity.test.ts`

- [ ] **Step 7: Commit** (skip if not using git)

```bash
git add vitest.config.ts tests/helpers/
git commit -m "test: add vitest config + wx global mock harness"
```

---

## Stage 1.1 — Foundation (Types, Errors, Utils)

### Task 4: Domain type models

**Files:**
- Create: `miniprogram/models/index.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/services/models.test.ts`:

```typescript
import { describe, it, expectTypeOf } from 'vitest'
import type {
  User, Dog, Walker, Booking, BookingStatus, Message, WalkReport, Review
} from '@/models'

describe('models', () => {
  it('Booking status is union of expected literals', () => {
    expectTypeOf<BookingStatus>().toEqualTypeOf<
      'requested' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'cancelled'
    >()
  })
  it('User has dogs array of Dog', () => {
    const u: User = { _id: 'u', openid: 'o', name: 'n', createdAt: 0, dogs: [] as Dog[] }
    expectTypeOf(u.dogs).items.toEqualTypeOf<Dog>()
  })
  it('Walker has required marketplace fields', () => {
    const w: Walker = {
      _id: 'w', name: 'n', avatar: 'a', bio: 'b', photos: [], areas: ['Loyang'],
      pricePerWalk: 30, rating: 4.5, reviewCount: 10, demo: true
    }
    expectTypeOf(w.pricePerWalk).toBeNumber()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- models`
Expected: FAIL — module `@/models` not found.

- [ ] **Step 3: Implement `miniprogram/models/index.ts`**

```typescript
export interface Dog {
  id: string
  name: string
  breed?: string
  sizeKg?: number
  notes?: string
}

export interface User {
  _id: string
  openid: string
  name: string
  avatar?: string
  phone?: string
  dogs: Dog[]
  createdAt: number
}

export interface Walker {
  _id: string
  name: string
  avatar: string
  bio: string
  photos: string[]
  areas: string[]
  pricePerWalk: number  // 30-min base rate in SGD
  rating: number        // 0-5 with one decimal
  reviewCount: number
  demo: boolean
}

export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'declined'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type WalkDuration = 30 | 45 | 60

export interface MockPayment {
  amount: number
  paid: boolean
}

export interface Booking {
  _id: string
  ownerId: string         // user._id
  walkerId: string
  dogId: string
  date: number            // epoch ms of scheduled start
  durationMin: WalkDuration
  status: BookingStatus
  notes?: string
  mockPayment: MockPayment
  createdAt: number
  updatedAt: number
}

export type MessageRole = 'owner' | 'walker'

export interface Message {
  _id: string
  bookingId: string
  senderId: string
  senderRole: MessageRole
  text: string
  photoUrl?: string
  createdAt: number
}

export interface WalkReport {
  _id: string
  bookingId: string
  walkerId: string
  photos: string[]
  notes: string
  durationMin: number
  peeCount: number
  poopCount: number
  createdAt: number
}

export type Stars = 1 | 2 | 3 | 4 | 5

export interface Review {
  _id: string
  bookingId: string
  ownerId: string
  walkerId: string
  stars: Stars
  text: string
  createdAt: number
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- models`
Expected: 3 tests pass.

- [ ] **Step 5: Commit** (skip if not using git)

```bash
git add miniprogram/models/index.ts tests/services/models.test.ts
git commit -m "feat: add domain models for users, walkers, bookings, chat, reviews"
```

---

### Task 5: FnResult contract + AppError + errorHandler

**Files:**
- Create: `miniprogram/services/cloudCall.ts`
- Create: `miniprogram/utils/errorHandler.ts`
- Create: `cloudfunctions/shared/result.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/services/cloudCall.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { setCallFnHandler, resetWxMock } from '../helpers'
import { cloudCall } from '@/services/cloudCall'
import { AppError } from '@/utils/errorHandler'

describe('cloudCall', () => {
  beforeEach(() => resetWxMock())

  it('returns data on ok result', async () => {
    setCallFnHandler(async () => ({ ok: true, data: { hello: 'world' } }))
    const r = await cloudCall<{ hello: string }>('whatever', {})
    expect(r).toEqual({ hello: 'world' })
  })

  it('throws AppError on not-ok result', async () => {
    setCallFnHandler(async () => ({ ok: false, code: 'FORBIDDEN', msg: 'nope' }))
    await expect(cloudCall('whatever', {})).rejects.toBeInstanceOf(AppError)
    try { await cloudCall('whatever', {}) } catch (e: any) {
      expect(e.code).toBe('FORBIDDEN')
      expect(e.message).toBe('nope')
    }
  })

  it('wraps unexpected throw as INTERNAL AppError', async () => {
    setCallFnHandler(async () => { throw new Error('boom') })
    await expect(cloudCall('whatever', {})).rejects.toMatchObject({ code: 'INTERNAL' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- cloudCall`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `miniprogram/utils/errorHandler.ts`**

```typescript
export type ErrCode =
  | 'UNAUTH' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION' | 'CONFLICT' | 'INTERNAL' | 'OFFLINE'

export class AppError extends Error {
  constructor(public code: ErrCode, message: string) {
    super(message)
    this.name = 'AppError'
  }
}

const TOAST_MSG: Record<ErrCode, string> = {
  UNAUTH:     '请重新登录',
  FORBIDDEN:  '无权操作',
  NOT_FOUND:  '内容不存在',
  VALIDATION: '请检查输入',
  CONFLICT:   '操作已存在',
  INTERNAL:   '服务异常，请重试',
  OFFLINE:    '离线，操作未提交'
}

export function showAppError(err: unknown) {
  const e = err instanceof AppError ? err : new AppError('INTERNAL', String((err as any)?.message || err))
  wx.showToast({ title: e.message || TOAST_MSG[e.code], icon: 'none', duration: 2000 })
}

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err
  return new AppError('INTERNAL', (err as any)?.message || 'Unknown error')
}
```

- [ ] **Step 4: Implement `miniprogram/services/cloudCall.ts`**

```typescript
import { AppError, toAppError, ErrCode } from '@/utils/errorHandler'

export type FnResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ErrCode; msg: string }

export async function cloudCall<T>(name: string, data: unknown): Promise<T> {
  try {
    const r = await wx.cloud.callFunction({ name, data })
    const body = r.result as FnResult<T>
    if (!body || typeof body !== 'object') {
      throw new AppError('INTERNAL', 'Malformed function response')
    }
    if (body.ok) return body.data
    throw new AppError(body.code, body.msg)
  } catch (e) {
    if (e instanceof AppError) throw e
    throw toAppError(e)
  }
}
```

- [ ] **Step 5: Implement `cloudfunctions/shared/result.ts`** (mirror types server-side)

```typescript
export type ErrCode =
  | 'UNAUTH' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION' | 'CONFLICT' | 'INTERNAL'

export type FnResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ErrCode; msg: string }

export const ok = <T>(data: T): FnResult<T> => ({ ok: true, data })
export const err = (code: ErrCode, msg: string): FnResult<never> => ({ ok: false, code, msg })
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test -- cloudCall`
Expected: 3 tests pass.

- [ ] **Step 7: Commit** (skip if not using git)

```bash
git add miniprogram/utils/errorHandler.ts miniprogram/services/cloudCall.ts cloudfunctions/shared/result.ts tests/services/cloudCall.test.ts
git commit -m "feat: typed FnResult contract + AppError + cloud call helper"
```

---

### Task 6: Common utils — logger, bus, date, network

**Files:**
- Create: `miniprogram/utils/logger.ts`
- Create: `miniprogram/utils/bus.ts`
- Create: `miniprogram/utils/date.ts`
- Create: `miniprogram/utils/network.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/services/utils.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { bus } from '@/utils/bus'
import { formatDateTime, isFuture } from '@/utils/date'

describe('bus', () => {
  it('emits to subscribers and unsubscribes via returned fn', () => {
    const fn = vi.fn()
    const off = bus.on('test', fn)
    bus.emit('test', { a: 1 })
    bus.emit('test', { a: 2 })
    off()
    bus.emit('test', { a: 3 })
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith({ a: 2 })
  })
})

describe('date', () => {
  it('formatDateTime returns YYYY-MM-DD HH:mm', () => {
    const t = new Date('2026-05-16T08:30:00Z').getTime()
    expect(formatDateTime(t)).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
  })
  it('isFuture works', () => {
    expect(isFuture(Date.now() + 60_000)).toBe(true)
    expect(isFuture(Date.now() - 60_000)).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- utils`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `miniprogram/utils/logger.ts`**

```typescript
type Level = 'debug' | 'info' | 'warn' | 'error'

function emit(level: Level, scope: string, ...args: unknown[]) {
  const openid = (getApp<IAppOption>().globalData?.openid) || '-'
  const prefix = `[${level}][${scope}][${openid}]`
  // eslint-disable-next-line no-console
  console[level === 'debug' ? 'log' : level](prefix, ...args)
}

export function createLogger(scope: string) {
  return {
    debug: (...a: unknown[]) => emit('debug', scope, ...a),
    info:  (...a: unknown[]) => emit('info',  scope, ...a),
    warn:  (...a: unknown[]) => emit('warn',  scope, ...a),
    error: (...a: unknown[]) => emit('error', scope, ...a)
  }
}
```

- [ ] **Step 4: Implement `miniprogram/utils/bus.ts`**

```typescript
type Handler = (payload: any) => void

class Bus {
  private map = new Map<string, Set<Handler>>()
  on(event: string, fn: Handler): () => void {
    if (!this.map.has(event)) this.map.set(event, new Set())
    this.map.get(event)!.add(fn)
    return () => this.map.get(event)?.delete(fn)
  }
  emit(event: string, payload?: unknown) {
    this.map.get(event)?.forEach(fn => fn(payload))
  }
}

export const bus = new Bus()

export const BUS_EVENTS = {
  BOOKING_CREATED: 'booking:created',
  BOOKING_UPDATED: 'booking:updated',
  REVIEW_SUBMITTED: 'review:submitted',
  WALK_REPORT_SUBMITTED: 'walkreport:submitted',
  AUTH_CHANGED: 'auth:changed'
} as const
```

- [ ] **Step 5: Implement `miniprogram/utils/date.ts`**

```typescript
function pad(n: number): string { return n < 10 ? '0' + n : '' + n }

export function formatDateTime(epochMs: number): string {
  const d = new Date(epochMs)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatDate(epochMs: number): string {
  const d = new Date(epochMs)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function formatTime(epochMs: number): string {
  const d = new Date(epochMs)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function isFuture(epochMs: number): boolean {
  return epochMs > Date.now()
}

export function plusMinutes(epochMs: number, min: number): number {
  return epochMs + min * 60_000
}
```

- [ ] **Step 6: Implement `miniprogram/utils/network.ts`**

```typescript
import { bus } from './bus'

let online = true
let initialised = false

export function isOnline(): boolean { return online }

export function initNetworkWatcher() {
  if (initialised) return
  initialised = true
  wx.getNetworkType({
    success: (res) => {
      online = res.networkType !== 'none'
      bus.emit('network:changed', online)
    }
  })
  wx.onNetworkStatusChange((res) => {
    online = res.isConnected
    bus.emit('network:changed', online)
  })
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm run test -- utils`
Expected: 3 tests pass.

- [ ] **Step 8: Commit** (skip if not using git)

```bash
git add miniprogram/utils/logger.ts miniprogram/utils/bus.ts miniprogram/utils/date.ts miniprogram/utils/network.ts tests/services/utils.test.ts
git commit -m "feat: logger, event bus, date helpers, network watcher"
```

---

### Task 7: `usePageState` helper + `walkerMode` flag

**Files:**
- Create: `miniprogram/utils/usePageState.ts`
- Create: `miniprogram/utils/walkerMode.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/services/usePageState.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { createPageState, PageStatus } from '@/utils/usePageState'

describe('usePageState', () => {
  it('transitions loading → loaded on resolve', async () => {
    const setData = vi.fn()
    const ps = createPageState(setData)
    const promise = ps.run(async () => 'value')
    expect(setData).toHaveBeenCalledWith({ pageStatus: 'loading' as PageStatus, pageError: '' })
    const r = await promise
    expect(r).toBe('value')
    const lastCall = setData.mock.calls[setData.mock.calls.length - 1][0]
    expect(lastCall.pageStatus).toBe('loaded')
  })

  it('transitions loading → error on reject', async () => {
    const setData = vi.fn()
    const ps = createPageState(setData)
    await ps.run(async () => { throw new Error('boom') }).catch(() => undefined)
    const lastCall = setData.mock.calls[setData.mock.calls.length - 1][0]
    expect(lastCall.pageStatus).toBe('error')
    expect(lastCall.pageError).toBe('boom')
  })

  it('setEmpty flips to empty', () => {
    const setData = vi.fn()
    const ps = createPageState(setData)
    ps.setEmpty()
    expect(setData).toHaveBeenLastCalledWith({ pageStatus: 'empty' as PageStatus, pageError: '' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- usePageState`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `miniprogram/utils/usePageState.ts`**

```typescript
export type PageStatus = 'loading' | 'empty' | 'error' | 'loaded'

type SetData = (patch: { pageStatus: PageStatus; pageError: string }) => void

export function createPageState(setData: SetData) {
  return {
    async run<T>(fn: () => Promise<T>, opts?: { onEmpty?: (v: T) => boolean }): Promise<T> {
      setData({ pageStatus: 'loading', pageError: '' })
      try {
        const v = await fn()
        const empty = opts?.onEmpty?.(v) ?? false
        setData({ pageStatus: empty ? 'empty' : 'loaded', pageError: '' })
        return v
      } catch (e: any) {
        setData({ pageStatus: 'error', pageError: e?.message || 'Error' })
        throw e
      }
    },
    setEmpty() { setData({ pageStatus: 'empty', pageError: '' }) },
    setLoaded() { setData({ pageStatus: 'loaded', pageError: '' }) }
  }
}
```

- [ ] **Step 4: Implement `miniprogram/utils/walkerMode.ts`** (demo-only role flag)

```typescript
const KEY = 'demo:walkerMode'

export function isWalkerMode(): boolean {
  try {
    const v = wx.getStorageSync(KEY)
    return !!v
  } catch { return false }
}

export function setWalkerMode(on: boolean) {
  wx.setStorageSync(KEY, on)
}

export function toggleWalkerMode(): boolean {
  const next = !isWalkerMode()
  setWalkerMode(next)
  return next
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test -- usePageState`
Expected: 3 tests pass.

- [ ] **Step 6: Commit** (skip if not using git)

```bash
git add miniprogram/utils/usePageState.ts miniprogram/utils/walkerMode.ts tests/services/usePageState.test.ts
git commit -m "feat: page state helper + walker-mode demo flag"
```

---

## Stage 1.2 — Auth (Cloud Functions + Service + App Boot)

### Task 8: `cloudfunctions/shared/assert.ts` + `types.ts`

**Files:**
- Create: `cloudfunctions/shared/types.ts`
- Create: `cloudfunctions/shared/assert.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/cloudfn/assert.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { assertAuth, assertString, assertOneOf } from '../../cloudfunctions/shared/assert'

describe('assertAuth', () => {
  it('returns openid when present', () => {
    expect(assertAuth({ OPENID: 'abc' })).toBe('abc')
  })
  it('throws UNAUTH when missing', () => {
    expect(() => assertAuth({})).toThrowError(/UNAUTH/)
  })
})

describe('assertString', () => {
  it('returns value when non-empty string', () => {
    expect(assertString('hi', 'field')).toBe('hi')
  })
  it('throws VALIDATION when empty', () => {
    expect(() => assertString('', 'field')).toThrowError(/VALIDATION/)
  })
})

describe('assertOneOf', () => {
  it('passes when value in list', () => {
    expect(assertOneOf(30, [30, 45, 60], 'dur')).toBe(30)
  })
  it('throws otherwise', () => {
    expect(() => assertOneOf(99, [30, 45, 60], 'dur')).toThrowError(/VALIDATION/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- assert`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `cloudfunctions/shared/types.ts`**

```typescript
// Mirror of miniprogram/models — kept independent so cloud fns build without bundler.
export interface Dog { id: string; name: string; breed?: string; sizeKg?: number; notes?: string }
export interface User { _id?: string; openid: string; name: string; avatar?: string; phone?: string; dogs: Dog[]; createdAt: number }
export interface Walker { _id?: string; name: string; avatar: string; bio: string; photos: string[]; areas: string[]; pricePerWalk: number; rating: number; reviewCount: number; demo: boolean }
export type BookingStatus = 'requested'|'accepted'|'declined'|'in_progress'|'completed'|'cancelled'
export type WalkDuration = 30 | 45 | 60
export interface Booking { _id?: string; ownerId: string; walkerId: string; dogId: string; date: number; durationMin: WalkDuration; status: BookingStatus; notes?: string; mockPayment: { amount: number; paid: boolean }; createdAt: number; updatedAt: number }
export type MessageRole = 'owner' | 'walker'
export interface Message { _id?: string; bookingId: string; senderId: string; senderRole: MessageRole; text: string; photoUrl?: string; createdAt: number }
export interface WalkReport { _id?: string; bookingId: string; walkerId: string; photos: string[]; notes: string; durationMin: number; peeCount: number; poopCount: number; createdAt: number }
export interface Review { _id?: string; bookingId: string; ownerId: string; walkerId: string; stars: 1|2|3|4|5; text: string; createdAt: number }
```

- [ ] **Step 4: Implement `cloudfunctions/shared/assert.ts`**

```typescript
export class FnError extends Error {
  constructor(public code: string, message: string) { super(`${code}: ${message}`) }
}

export function assertAuth(ctx: { OPENID?: string }): string {
  if (!ctx.OPENID) throw new FnError('UNAUTH', 'Login required')
  return ctx.OPENID
}

export function assertString(v: unknown, field: string): string {
  if (typeof v !== 'string' || v.length === 0) throw new FnError('VALIDATION', `${field} must be non-empty string`)
  return v
}

export function assertNumber(v: unknown, field: string): number {
  if (typeof v !== 'number' || Number.isNaN(v)) throw new FnError('VALIDATION', `${field} must be number`)
  return v
}

export function assertOneOf<T>(v: unknown, allowed: readonly T[], field: string): T {
  if (!allowed.includes(v as T)) throw new FnError('VALIDATION', `${field} must be one of ${allowed.join(',')}`)
  return v as T
}

export function assertFutureDate(v: unknown, field: string): number {
  const n = assertNumber(v, field)
  if (n <= Date.now()) throw new FnError('VALIDATION', `${field} must be in the future`)
  return n
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test -- assert`
Expected: 7 tests pass.

- [ ] **Step 6: Commit** (skip if not using git)

```bash
git add cloudfunctions/shared/types.ts cloudfunctions/shared/assert.ts tests/cloudfn/assert.test.ts
git commit -m "feat: shared cloud-fn helpers — types and assertions"
```

---

### Task 9: Cloud function `login`

**Files:**
- Create: `cloudfunctions/login/package.json`
- Create: `cloudfunctions/login/index.ts`
- Create: `cloudfunctions/login/tsconfig.json`

- [ ] **Step 1: Write the failing test**

Create `tests/cloudfn/login.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

const getWXContext = vi.fn()
const collectionMock = vi.fn()

vi.mock('wx-server-sdk', () => ({
  default: {
    init: () => undefined,
    getWXContext: () => getWXContext(),
    database: () => ({ collection: collectionMock })
  }
}))

import handler from '../../cloudfunctions/login/index'

describe('login fn', () => {
  beforeEach(() => { getWXContext.mockReset(); collectionMock.mockReset() })

  it('returns isNewUser=true and creates user when not found', async () => {
    getWXContext.mockReturnValue({ OPENID: 'new-openid' })
    collectionMock.mockReturnValue({
      where: () => ({ get: async () => ({ data: [] }) }),
      add:   async ({ data }: any) => ({ _id: 'inserted-id', ...data })
    })
    const r = await handler({}, {})
    expect(r).toEqual({ ok: true, data: { openid: 'new-openid', isNewUser: true } })
  })

  it('returns isNewUser=false when user exists', async () => {
    getWXContext.mockReturnValue({ OPENID: 'exist' })
    collectionMock.mockReturnValue({
      where: () => ({ get: async () => ({ data: [{ _id: 'u1', openid: 'exist' }] }) })
    })
    const r = await handler({}, {})
    expect(r).toEqual({ ok: true, data: { openid: 'exist', isNewUser: false } })
  })

  it('returns UNAUTH when no openid', async () => {
    getWXContext.mockReturnValue({})
    const r = await handler({}, {})
    expect(r).toEqual({ ok: false, code: 'UNAUTH', msg: 'Login required' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- login`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `cloudfunctions/login/package.json`**

```json
{
  "name": "login",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": { "wx-server-sdk": "~2.6.3" }
}
```

- [ ] **Step 4: Create `cloudfunctions/login/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "."
  },
  "include": ["./index.ts"]
}
```

- [ ] **Step 5: Implement `cloudfunctions/login/index.ts`**

```typescript
import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import { FnError } from '../shared/assert'
import type { User } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

interface LoginData { openid: string; isNewUser: boolean }

export default async function handler(_event: unknown, _context: unknown): Promise<FnResult<LoginData>> {
  try {
    const ctx = cloud.getWXContext()
    if (!ctx.OPENID) throw new FnError('UNAUTH', 'Login required')

    const db = cloud.database()
    const existing = await db.collection('users').where({ openid: ctx.OPENID }).get()
    if (existing.data.length > 0) {
      return ok({ openid: ctx.OPENID, isNewUser: false })
    }
    const newUser: User = {
      openid: ctx.OPENID,
      name: 'Pet Owner',
      dogs: [],
      createdAt: Date.now()
    }
    await db.collection('users').add({ data: newUser })
    return ok({ openid: ctx.OPENID, isNewUser: true })
  } catch (e: any) {
    if (e instanceof FnError) {
      const [code, msg] = e.message.split(': ')
      return err(code as any, msg || e.message)
    }
    console.error('[login] internal', e)
    return err('INTERNAL', e?.message || 'Internal')
  }
}
```

- [ ] **Step 6: Install fn deps**

Run: `cd cloudfunctions/login && npm install && cd ../..`
Expected: `cloudfunctions/login/node_modules/wx-server-sdk` present.

- [ ] **Step 7: Run test to verify it passes**

Run: `npm run test -- login`
Expected: 3 tests pass.

- [ ] **Step 8: Commit** (skip if not using git)

```bash
git add cloudfunctions/login/ tests/cloudfn/login.test.ts
git commit -m "feat(cloudfn): login — creates user on first call, returns openid"
```

---

### Task 10: Cloud function `updateProfile`

**Files:**
- Create: `cloudfunctions/updateProfile/package.json`
- Create: `cloudfunctions/updateProfile/index.ts`
- Create: `cloudfunctions/updateProfile/tsconfig.json`

- [ ] **Step 1: Write the failing test**

Create `tests/cloudfn/updateProfile.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

const getWXContext = vi.fn()
const where = vi.fn()
const update = vi.fn()
const doc = vi.fn()

vi.mock('wx-server-sdk', () => ({
  default: {
    init: () => undefined,
    getWXContext: () => getWXContext(),
    database: () => ({ collection: () => ({ where, doc }) })
  }
}))

import handler from '../../cloudfunctions/updateProfile/index'

beforeEach(() => {
  getWXContext.mockReset(); where.mockReset(); update.mockReset(); doc.mockReset()
})

describe('updateProfile', () => {
  it('updates name and dogs for caller', async () => {
    getWXContext.mockReturnValue({ OPENID: 'me' })
    where.mockReturnValue({ get: async () => ({ data: [{ _id: 'u1', openid: 'me' }] }) })
    doc.mockReturnValue({ update: async () => ({ stats: { updated: 1 } }) })
    const r = await handler({ name: 'Alice', dogs: [{ id: 'd1', name: 'Rex' }] }, {})
    expect(r.ok).toBe(true)
  })

  it('returns UNAUTH without openid', async () => {
    getWXContext.mockReturnValue({})
    const r = await handler({ name: 'x' }, {})
    expect(r).toMatchObject({ ok: false, code: 'UNAUTH' })
  })

  it('VALIDATION on empty name', async () => {
    getWXContext.mockReturnValue({ OPENID: 'me' })
    const r = await handler({ name: '' }, {})
    expect(r).toMatchObject({ ok: false, code: 'VALIDATION' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- updateProfile`
Expected: FAIL.

- [ ] **Step 3: Create `cloudfunctions/updateProfile/package.json`** + `tsconfig.json` (same shape as Task 9; copy and change `name`).

```json
{ "name": "updateProfile", "version": "1.0.0", "main": "index.js", "dependencies": { "wx-server-sdk": "~2.6.3" } }
```

```json
{
  "compilerOptions": { "target": "ES2020", "module": "CommonJS", "strict": true, "esModuleInterop": true, "skipLibCheck": true, "outDir": "." },
  "include": ["./index.ts"]
}
```

- [ ] **Step 4: Implement `cloudfunctions/updateProfile/index.ts`**

```typescript
import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import { assertString, FnError } from '../shared/assert'
import type { Dog } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

interface Payload { name?: string; avatar?: string; phone?: string; dogs?: Dog[] }

export default async function handler(event: Payload, _ctx: unknown): Promise<FnResult<{ updated: boolean }>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')

    const name = assertString(event.name, 'name')
    const patch: Record<string, unknown> = { name, updatedAt: Date.now() }
    if (event.avatar !== undefined) patch.avatar = event.avatar
    if (event.phone !== undefined) patch.phone = event.phone
    if (event.dogs !== undefined) patch.dogs = event.dogs

    const db = cloud.database()
    const users = await db.collection('users').where({ openid: wxCtx.OPENID }).get()
    if (users.data.length === 0) return err('NOT_FOUND', 'User missing — call login first')
    await db.collection('users').doc(users.data[0]._id as string).update({ data: patch })
    return ok({ updated: true })
  } catch (e: any) {
    if (e instanceof FnError) {
      const [code, msg] = e.message.split(': ')
      return err(code as any, msg || e.message)
    }
    console.error('[updateProfile] internal', e)
    return err('INTERNAL', e?.message || 'Internal')
  }
}
```

- [ ] **Step 5: Install fn deps**

Run: `cd cloudfunctions/updateProfile && npm install && cd ../..`

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test -- updateProfile`
Expected: 3 tests pass.

- [ ] **Step 7: Commit** (skip if not using git)

```bash
git add cloudfunctions/updateProfile/ tests/cloudfn/updateProfile.test.ts
git commit -m "feat(cloudfn): updateProfile — validates and patches user profile"
```

---

### Task 11: `authService` + wire into `app.ts`

**Files:**
- Create: `miniprogram/services/authService.ts`
- Modify: `miniprogram/app.ts` (entire file)

- [ ] **Step 1: Write the failing test**

Create `tests/services/authService.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setCallFnHandler, resetWxMock } from '../helpers'
import { silentLogin, getCurrentOpenId } from '@/services/authService'

beforeEach(() => {
  resetWxMock()
  ;(globalThis as any).getApp = () => ({ globalData: { openid: '', bootError: null } })
})

describe('silentLogin', () => {
  it('calls login fn and caches openid', async () => {
    const fn = vi.fn(async () => ({ ok: true, data: { openid: 'abc', isNewUser: false } }))
    setCallFnHandler(fn)
    const r = await silentLogin()
    expect(r.openid).toBe('abc')
    expect(fn).toHaveBeenCalledWith('login', {})
  })

  it('calls updateProfile when isNewUser', async () => {
    const calls: string[] = []
    setCallFnHandler(async (name) => {
      calls.push(name)
      if (name === 'login') return { ok: true, data: { openid: 'new', isNewUser: true } }
      return { ok: true, data: { updated: true } }
    })
    await silentLogin()
    expect(calls).toEqual(['login', 'updateProfile'])
  })

  it('throws AppError on login failure', async () => {
    setCallFnHandler(async () => ({ ok: false, code: 'INTERNAL', msg: 'down' }))
    await expect(silentLogin()).rejects.toMatchObject({ code: 'INTERNAL' })
  })
})

describe('getCurrentOpenId', () => {
  it('returns empty when not logged in', () => {
    expect(getCurrentOpenId()).toBe('')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- authService`
Expected: FAIL.

- [ ] **Step 3: Implement `miniprogram/services/authService.ts`**

```typescript
import { cloudCall } from './cloudCall'
import { createLogger } from '@/utils/logger'

const log = createLogger('auth')

interface LoginResult { openid: string; isNewUser: boolean }

export async function silentLogin(): Promise<LoginResult> {
  const r = await cloudCall<LoginResult>('login', {})
  const app = getApp<IAppOption>()
  if (app?.globalData) app.globalData.openid = r.openid
  if (r.isNewUser) {
    log.info('new user, seeding profile')
    await cloudCall('updateProfile', { name: 'Pet Owner' })
  }
  log.info('logged in', r.openid)
  return r
}

export function getCurrentOpenId(): string {
  const app = getApp<IAppOption>()
  return app?.globalData?.openid || ''
}

export function isLoggedIn(): boolean {
  return getCurrentOpenId().length > 0
}
```

- [ ] **Step 4: Replace `miniprogram/app.ts`**

```typescript
import { silentLogin } from './services/authService'
import { initNetworkWatcher } from './utils/network'
import { createLogger } from './utils/logger'

const log = createLogger('app')

App<IAppOption>({
  globalData: { openid: '', bootError: null },
  async onLaunch() {
    log.info('launch')
    try {
      wx.cloud.init({ env: 'pet-dev', traceUser: true })
      initNetworkWatcher()
      await silentLogin()
    } catch (e: any) {
      log.error('boot failed', e)
      this.globalData.bootError = e
    }
  }
})
```

> NOTE: `pet-dev` is the CloudBase environment ID. The engineer must create this env in WeChat dev console → CloudBase → 环境管理 before first run. If a different name is used, change this line.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test -- authService`
Expected: 4 tests pass.

- [ ] **Step 6: Commit** (skip if not using git)

```bash
git add miniprogram/services/authService.ts miniprogram/app.ts tests/services/authService.test.ts
git commit -m "feat(auth): silentLogin service + wire into app onLaunch"
```

---

## Stage 1.3 — Browse Walkers

### Task 12: Cloud function `seedDemoData` (dev only)

**Files:**
- Create: `cloudfunctions/seedDemoData/package.json`
- Create: `cloudfunctions/seedDemoData/tsconfig.json`
- Create: `cloudfunctions/seedDemoData/index.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/cloudfn/seedDemoData.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

const remove = vi.fn(async () => ({ stats: { removed: 0 } }))
const add = vi.fn(async ({ data }: any) => ({ _id: 'mock-' + data.name }))
const where = () => ({ remove })

vi.mock('wx-server-sdk', () => ({
  default: {
    init: () => undefined,
    getWXContext: () => ({ OPENID: 'tester' }),
    database: () => ({ collection: () => ({ where, add }) })
  }
}))

import handler from '../../cloudfunctions/seedDemoData/index'

beforeEach(() => { remove.mockClear(); add.mockClear() })

describe('seedDemoData', () => {
  it('wipes walkers + reviews + bookings + messages + walkReports, then inserts walkers + reviews', async () => {
    const r = await handler({}, {})
    expect(r.ok).toBe(true)
    // 5 collections wiped
    expect(remove).toHaveBeenCalledTimes(5)
    // At least 3 walkers + 5 reviews inserted
    expect(add.mock.calls.length).toBeGreaterThanOrEqual(8)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- seedDemoData`
Expected: FAIL.

- [ ] **Step 3: Create `cloudfunctions/seedDemoData/package.json`**

```json
{ "name": "seedDemoData", "version": "1.0.0", "main": "index.js", "dependencies": { "wx-server-sdk": "~2.6.3" } }
```

- [ ] **Step 4: Create `cloudfunctions/seedDemoData/tsconfig.json`**

```json
{
  "compilerOptions": { "target": "ES2020", "module": "CommonJS", "strict": true, "esModuleInterop": true, "skipLibCheck": true, "outDir": "." },
  "include": ["./index.ts"]
}
```

- [ ] **Step 5: Implement `cloudfunctions/seedDemoData/index.ts`**

```typescript
import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import type { Walker, Review } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const WALKERS: Omit<Walker, '_id'>[] = [
  {
    name: 'Alex Tan',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200',
    bio: 'Lifelong dog lover, 5+ yrs walking experience in Bukit Timah area. Comfortable with large breeds.',
    photos: [
      'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=800',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800'
    ],
    areas: ['Bukit Timah', 'Holland Village'],
    pricePerWalk: 30,
    rating: 4.8,
    reviewCount: 23,
    demo: true
  },
  {
    name: 'Mei Lin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    bio: 'Cert. dog trainer. Patient with anxious pups. Loyang and East Coast.',
    photos: [ 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800' ],
    areas: ['Loyang', 'East Coast'],
    pricePerWalk: 25,
    rating: 4.9,
    reviewCount: 41,
    demo: true
  },
  {
    name: 'Ravi Kumar',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    bio: 'Weekend walker around Kembangan & Simei. Friendly with cats too.',
    photos: [],
    areas: ['Kembangan', 'Simei'],
    pricePerWalk: 28,
    rating: 4.6,
    reviewCount: 12,
    demo: true
  }
]

const REVIEWS_TEMPLATE = [
  { stars: 5 as const, text: 'Great walker, Buddy came back happy!' },
  { stars: 5 as const, text: 'Sent photos throughout — very reassuring.' },
  { stars: 4 as const, text: 'On time and friendly.' },
  { stars: 5 as const, text: 'Will book again!' },
  { stars: 5 as const, text: 'My dog adores them.' }
]

export default async function handler(_event: unknown, _ctx: unknown): Promise<FnResult<{ walkers: number; reviews: number }>> {
  try {
    const db = cloud.database()
    const _ = db.command

    // Wipe demo collections
    for (const c of ['walkers', 'reviews', 'bookings', 'messages', 'walkReports']) {
      await db.collection(c).where({ _id: _.exists(true) }).remove().catch(() => undefined)
    }

    // Insert walkers
    const walkerIds: string[] = []
    for (const w of WALKERS) {
      const r = await db.collection('walkers').add({ data: w })
      walkerIds.push(r._id as string)
    }

    // Insert reviews (each walker gets a slice of templates)
    let reviewCount = 0
    for (const wid of walkerIds) {
      const slice = REVIEWS_TEMPLATE.slice(0, 2)
      for (const tpl of slice) {
        const rev: Omit<Review, '_id'> = {
          bookingId: 'demo-' + wid,
          ownerId: 'demo-owner',
          walkerId: wid,
          stars: tpl.stars,
          text: tpl.text,
          createdAt: Date.now() - reviewCount * 86400000
        }
        await db.collection('reviews').add({ data: rev })
        reviewCount++
      }
    }
    return ok({ walkers: walkerIds.length, reviews: reviewCount })
  } catch (e: any) {
    console.error('[seedDemoData]', e)
    return err('INTERNAL', e?.message || 'Internal')
  }
}
```

- [ ] **Step 6: Install fn deps**

Run: `cd cloudfunctions/seedDemoData && npm install && cd ../..`

- [ ] **Step 7: Run test to verify it passes**

Run: `npm run test -- seedDemoData`
Expected: 1 test passes.

- [ ] **Step 8: Commit** (skip if not using git)

```bash
git add cloudfunctions/seedDemoData/ tests/cloudfn/seedDemoData.test.ts
git commit -m "feat(cloudfn): seedDemoData — idempotent demo data loader"
```

---

### Task 13: `walkerService`

**Files:**
- Create: `miniprogram/services/walkerService.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/services/walkerService.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { resetWxMock, setDbHandler, mockCollection } from '../helpers'
import { listWalkers, getWalkerById } from '@/services/walkerService'

const SEED = [
  { _id: 'w1', name: 'Alex', areas: ['Bukit Timah'], pricePerWalk: 30, rating: 4.8, reviewCount: 10, photos: [], bio: '', avatar: '', demo: true },
  { _id: 'w2', name: 'Mei',  areas: ['Loyang'],      pricePerWalk: 25, rating: 4.9, reviewCount: 41, photos: [], bio: '', avatar: '', demo: true }
]

beforeEach(() => {
  resetWxMock()
  setDbHandler({ collection: () => mockCollection(SEED) })
})

describe('walkerService', () => {
  it('listWalkers returns all when no filter', async () => {
    const r = await listWalkers({})
    expect(r).toHaveLength(2)
  })
  it('getWalkerById returns single record', async () => {
    const r = await getWalkerById('w1')
    expect(r._id).toBe('w1')
  })
  it('getWalkerById throws NOT_FOUND on missing', async () => {
    setDbHandler({ collection: () => mockCollection([]) })
    await expect(getWalkerById('nope')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- walkerService`
Expected: FAIL.

- [ ] **Step 3: Implement `miniprogram/services/walkerService.ts`**

```typescript
import type { Walker } from '@/models'
import { AppError } from '@/utils/errorHandler'

export interface WalkerFilter {
  area?: string
  maxPrice?: number
  minRating?: number
  limit?: number
}

export async function listWalkers(f: WalkerFilter): Promise<Walker[]> {
  const db = wx.cloud.database()
  const _ = (db as any).command
  let q: any = db.collection('walkers')
  const where: Record<string, unknown> = {}
  if (f.area) where.areas = _.in([f.area])
  if (f.maxPrice !== undefined) where.pricePerWalk = _.lte(f.maxPrice)
  if (f.minRating !== undefined) where.rating = _.gte(f.minRating)
  if (Object.keys(where).length) q = q.where(where)
  q = q.orderBy('rating', 'desc').limit(f.limit ?? 20)
  const r = await q.get()
  return r.data as Walker[]
}

export async function getWalkerById(id: string): Promise<Walker> {
  try {
    const db = wx.cloud.database()
    const r = await db.collection('walkers').doc(id).get()
    return r.data as Walker
  } catch {
    throw new AppError('NOT_FOUND', 'Walker not found')
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- walkerService`
Expected: 3 tests pass.

- [ ] **Step 5: Commit** (skip if not using git)

```bash
git add miniprogram/services/walkerService.ts tests/services/walkerService.test.ts
git commit -m "feat(walker): list + getById via direct DB read"
```

---

### Task 14: `loading-skeleton` + `empty-state` components

**Files:**
- Create: `miniprogram/components/loading-skeleton/index.json`
- Create: `miniprogram/components/loading-skeleton/index.wxml`
- Create: `miniprogram/components/loading-skeleton/index.wxss`
- Create: `miniprogram/components/loading-skeleton/index.ts`
- Create: `miniprogram/components/empty-state/index.json`
- Create: `miniprogram/components/empty-state/index.wxml`
- Create: `miniprogram/components/empty-state/index.wxss`
- Create: `miniprogram/components/empty-state/index.ts`

- [ ] **Step 1: Create `loading-skeleton/index.json`**

```json
{ "component": true, "usingComponents": {} }
```

- [ ] **Step 2: Create `loading-skeleton/index.wxml`**

```xml
<view class="skeleton" wx:for="{{rows}}" wx:key="index">
  <view class="bar bar-{{item}}"></view>
</view>
```

- [ ] **Step 3: Create `loading-skeleton/index.wxss`**

```css
.skeleton { padding: 24rpx; }
.bar {
  height: 32rpx; border-radius: 8rpx;
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  margin-bottom: 16rpx;
}
.bar-1 { width: 60%; }
.bar-2 { width: 90%; }
.bar-3 { width: 75%; }
@keyframes shimmer { 0% { background-position: 100% 50% } 100% { background-position: 0 50% } }
```

- [ ] **Step 4: Create `loading-skeleton/index.ts`**

```typescript
Component({
  properties: { count: { type: Number, value: 3 } },
  data: { rows: [1, 2, 3] as number[] },
  observers: {
    'count'(c: number) { this.setData({ rows: Array.from({ length: c }, (_, i) => (i % 3) + 1) }) }
  }
})
```

- [ ] **Step 5: Create `empty-state/index.json`**

```json
{ "component": true, "usingComponents": { "t-button": "tdesign-miniprogram/button/button" } }
```

- [ ] **Step 6: Create `empty-state/index.wxml`**

```xml
<view class="empty">
  <view class="icon">{{icon}}</view>
  <view class="title">{{title}}</view>
  <view class="subtitle" wx:if="{{subtitle}}">{{subtitle}}</view>
  <t-button wx:if="{{ctaText}}" theme="primary" size="medium" bindtap="onCta">{{ctaText}}</t-button>
</view>
```

- [ ] **Step 7: Create `empty-state/index.wxss`**

```css
.empty { display:flex; flex-direction:column; align-items:center; padding: 80rpx 32rpx; gap: 16rpx; }
.icon { font-size: 80rpx; }
.title { font-size: 32rpx; color: #333; font-weight: 500; }
.subtitle { font-size: 26rpx; color: #888; text-align: center; }
```

- [ ] **Step 8: Create `empty-state/index.ts`**

```typescript
Component({
  properties: {
    icon:     { type: String, value: '📭' },
    title:    { type: String, value: 'Nothing here' },
    subtitle: { type: String, value: '' },
    ctaText:  { type: String, value: '' }
  },
  methods: { onCta() { this.triggerEvent('cta') } }
})
```

- [ ] **Step 9: Manual visual check**

Open devtools, add `<empty-state title="Test" />` to any page, confirm renders. No automated test (pure presentational).

- [ ] **Step 10: Commit** (skip if not using git)

```bash
git add miniprogram/components/loading-skeleton miniprogram/components/empty-state
git commit -m "feat(components): loading-skeleton + empty-state"
```

---

### Task 15: `walker-card` component

**Files:**
- Create: `miniprogram/components/walker-card/index.json`
- Create: `miniprogram/components/walker-card/index.wxml`
- Create: `miniprogram/components/walker-card/index.wxss`
- Create: `miniprogram/components/walker-card/index.ts`

- [ ] **Step 1: Create `index.json`**

```json
{ "component": true, "usingComponents": {} }
```

- [ ] **Step 2: Create `index.wxml`**

```xml
<view class="card" bindtap="onTap">
  <image class="avatar" src="{{walker.avatar}}" mode="aspectFill" />
  <view class="body">
    <view class="row">
      <text class="name">{{walker.name}}</text>
      <text class="rating">★ {{walker.rating}} ({{walker.reviewCount}})</text>
    </view>
    <view class="areas">
      <text class="area-tag" wx:for="{{walker.areas}}" wx:for-item="a" wx:key="*this">{{a}}</text>
    </view>
    <view class="price">S${{walker.pricePerWalk}} / 30 min</view>
  </view>
</view>
```

- [ ] **Step 3: Create `index.wxss`**

```css
.card { display:flex; gap:20rpx; padding:24rpx; background:#fff; border-radius:16rpx; margin-bottom:16rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); }
.avatar { width:120rpx; height:120rpx; border-radius:60rpx; background:#eee; flex-shrink:0; }
.body { flex:1; display:flex; flex-direction:column; gap:8rpx; }
.row { display:flex; justify-content:space-between; align-items:center; }
.name { font-size:30rpx; font-weight:500; color:#1f2329; }
.rating { font-size:24rpx; color:#f59e0b; }
.areas { display:flex; gap:8rpx; flex-wrap:wrap; }
.area-tag { font-size:22rpx; padding:4rpx 12rpx; background:#f0f6ff; color:#2563eb; border-radius:8rpx; }
.price { font-size:26rpx; color:#16a34a; font-weight:500; }
```

- [ ] **Step 4: Create `index.ts`**

```typescript
import type { Walker } from '@/models'
Component({
  properties: { walker: { type: Object, value: null as Walker | null } },
  methods: {
    onTap() {
      const w = this.data.walker as Walker
      if (!w) return
      wx.navigateTo({ url: `/pages/walker/index?id=${w._id}` })
    }
  }
})
```

- [ ] **Step 5: Commit** (skip if not using git)

```bash
git add miniprogram/components/walker-card
git commit -m "feat(components): walker-card"
```

---

### Task 16: `pages/home` — browse walkers

**Files:**
- Create: `miniprogram/pages/home/index.json`
- Create: `miniprogram/pages/home/index.wxml`
- Create: `miniprogram/pages/home/index.wxss`
- Create: `miniprogram/pages/home/index.ts`

- [ ] **Step 1: Write the failing page logic test**

Create `tests/pages/home.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { resetWxMock, setDbHandler, mockCollection } from '../helpers'
import { listWalkers } from '@/services/walkerService'

beforeEach(() => {
  resetWxMock()
  setDbHandler({ collection: () => mockCollection([
    { _id: 'w1', name: 'A', areas: [], pricePerWalk: 30, rating: 4, reviewCount: 1, photos: [], bio: '', avatar: '', demo: true }
  ])})
})

describe('home page contract', () => {
  it('uses walkerService.list to fetch', async () => {
    const r = await listWalkers({})
    expect(r).toHaveLength(1)
  })
})
```

(Pure-page WXML testing is skipped per spec — this verifies the service call boundary the page depends on.)

- [ ] **Step 2: Run test**

Run: `npm run test -- pages/home`
Expected: 1 pass.

- [ ] **Step 3: Create `pages/home/index.json`**

```json
{
  "navigationBarTitleText": "Find a Walker",
  "enablePullDownRefresh": true,
  "usingComponents": {
    "walker-card":       "/components/walker-card/index",
    "empty-state":       "/components/empty-state/index",
    "loading-skeleton":  "/components/loading-skeleton/index",
    "t-search":          "tdesign-miniprogram/search/search",
    "t-tag":             "tdesign-miniprogram/tag/tag"
  }
}
```

- [ ] **Step 4: Create `pages/home/index.wxml`**

```xml
<view class="page">
  <view class="search-bar">
    <t-search placeholder="Filter by area (e.g. Loyang)" model:value="{{area}}" bind:submit="onSearch" bind:clear="onClearSearch" />
  </view>

  <loading-skeleton wx:if="{{pageStatus === 'loading'}}" count="5" />

  <empty-state
    wx:elif="{{pageStatus === 'empty'}}"
    icon="🐕"
    title="No walkers match"
    subtitle="Try a different area or clear filters"
    ctaText="Clear filters"
    bind:cta="onClearSearch"
  />

  <empty-state
    wx:elif="{{pageStatus === 'error'}}"
    icon="⚠️"
    title="Something went wrong"
    subtitle="{{pageError}}"
    ctaText="Retry"
    bind:cta="onRetry"
  />

  <view wx:else class="list">
    <walker-card wx:for="{{walkers}}" wx:key="_id" walker="{{item}}" />
  </view>
</view>
```

- [ ] **Step 5: Create `pages/home/index.wxss`**

```css
.page { padding: 16rpx; }
.search-bar { margin-bottom: 16rpx; }
.list { display: flex; flex-direction: column; }
```

- [ ] **Step 6: Create `pages/home/index.ts`**

```typescript
import { listWalkers } from '@/services/walkerService'
import { createPageState } from '@/utils/usePageState'
import { showAppError } from '@/utils/errorHandler'
import type { Walker } from '@/models'

interface Data {
  walkers: Walker[]
  area: string
  pageStatus: string
  pageError: string
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: { walkers: [], area: '', pageStatus: 'loading', pageError: '' },

  onLoad() { this.load() },
  onPullDownRefresh() { this.load().finally(() => wx.stopPullDownRefresh()) },

  async load() {
    const ps = createPageState(this.setData.bind(this))
    try {
      const walkers = await ps.run(
        () => listWalkers({ area: this.data.area || undefined }),
        { onEmpty: v => v.length === 0 }
      )
      this.setData({ walkers })
    } catch (e) { showAppError(e) }
  },

  onSearch() { this.load() },
  onClearSearch() { this.setData({ area: '' }, () => this.load()) },
  onRetry() { this.load() }
})
```

- [ ] **Step 7: Manual smoke**

Open devtools simulator → home loads → seeded walkers appear → search by "Loyang" shows 1.

- [ ] **Step 8: Commit** (skip if not using git)

```bash
git add miniprogram/pages/home/ tests/pages/home.test.ts
git commit -m "feat(home): browse walkers page with filter, skeleton, empty, error"
```

---

## Stage 1.4 — Walker Profile + Reviews List

### Task 17: `reviewService.listForWalker` (read path)

**Files:**
- Create: `miniprogram/services/reviewService.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/services/reviewService.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { resetWxMock, setDbHandler, mockCollection } from '../helpers'
import { listReviewsForWalker } from '@/services/reviewService'

beforeEach(() => {
  resetWxMock()
  setDbHandler({
    collection: () => mockCollection([
      { _id: 'r1', walkerId: 'w1', stars: 5, text: 'great', ownerId: 'o', bookingId: 'b', createdAt: 1 },
      { _id: 'r2', walkerId: 'w1', stars: 4, text: 'good',  ownerId: 'o', bookingId: 'b', createdAt: 2 }
    ])
  })
})

describe('reviewService.listForWalker', () => {
  it('returns reviews for walker', async () => {
    const r = await listReviewsForWalker('w1', 10)
    expect(r).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run test**

Run: `npm run test -- reviewService`
Expected: FAIL.

- [ ] **Step 3: Implement `miniprogram/services/reviewService.ts`**

```typescript
import type { Review } from '@/models'
import { cloudCall } from './cloudCall'

export async function listReviewsForWalker(walkerId: string, limit = 20): Promise<Review[]> {
  const db = wx.cloud.database()
  const r = await db.collection('reviews')
    .where({ walkerId })
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get()
  return r.data as Review[]
}

export interface SubmitReviewInput { bookingId: string; stars: 1|2|3|4|5; text: string }

export async function submitReview(input: SubmitReviewInput): Promise<{ reviewId: string }> {
  return cloudCall<{ reviewId: string }>('submitReview', input)
}
```

- [ ] **Step 4: Run test**

Run: `npm run test -- reviewService`
Expected: 1 pass.

- [ ] **Step 5: Commit** (skip if not using git)

```bash
git add miniprogram/services/reviewService.ts tests/services/reviewService.test.ts
git commit -m "feat(review): listForWalker direct read + submit fn wrapper"
```

---

### Task 18: `review-item` + `star-rating` components

**Files:**
- Create: `miniprogram/components/star-rating/index.{json,wxml,wxss,ts}`
- Create: `miniprogram/components/review-item/index.{json,wxml,wxss,ts}`

- [ ] **Step 1: Create `star-rating/index.json`**

```json
{ "component": true, "usingComponents": {} }
```

- [ ] **Step 2: Create `star-rating/index.wxml`**

```xml
<view class="stars">
  <text wx:for="{{[1,2,3,4,5]}}" wx:key="*this"
        class="star {{item <= filled ? 'on' : ''}}"
        data-v="{{item}}"
        bindtap="onTap">★</text>
</view>
```

- [ ] **Step 3: Create `star-rating/index.wxss`**

```css
.stars { display:inline-flex; gap:6rpx; }
.star  { font-size:40rpx; color:#d1d5db; }
.star.on { color:#f59e0b; }
```

- [ ] **Step 4: Create `star-rating/index.ts`**

```typescript
Component({
  properties: {
    value:    { type: Number, value: 0 },
    readonly: { type: Boolean, value: false }
  },
  data: { filled: 0 },
  observers: { 'value'(v: number) { this.setData({ filled: v }) } },
  methods: {
    onTap(e: WechatMiniprogram.BaseEvent) {
      if (this.data.readonly) return
      const v = Number(e.currentTarget.dataset.v)
      this.setData({ filled: v })
      this.triggerEvent('change', { value: v })
    }
  }
})
```

- [ ] **Step 5: Create `review-item/index.json`**

```json
{ "component": true, "usingComponents": { "star-rating": "/components/star-rating/index" } }
```

- [ ] **Step 6: Create `review-item/index.wxml`**

```xml
<view class="item">
  <star-rating value="{{review.stars}}" readonly="{{true}}" />
  <view class="text">{{review.text}}</view>
  <view class="date">{{dateText}}</view>
</view>
```

- [ ] **Step 7: Create `review-item/index.wxss`**

```css
.item { padding:24rpx; background:#fff; border-radius:12rpx; margin-bottom:12rpx; }
.text { font-size:28rpx; color:#1f2329; margin:12rpx 0; line-height:1.5; }
.date { font-size:22rpx; color:#888; }
```

- [ ] **Step 8: Create `review-item/index.ts`**

```typescript
import { formatDate } from '@/utils/date'
import type { Review } from '@/models'

Component({
  properties: { review: { type: Object, value: null as Review | null } },
  data: { dateText: '' },
  observers: {
    'review'(r: Review | null) {
      this.setData({ dateText: r ? formatDate(r.createdAt) : '' })
    }
  }
})
```

- [ ] **Step 9: Commit** (skip if not using git)

```bash
git add miniprogram/components/star-rating miniprogram/components/review-item
git commit -m "feat(components): star-rating + review-item"
```

---

### Task 19: `pages/walker` — walker profile

**Files:**
- Create: `miniprogram/pages/walker/index.{json,wxml,wxss,ts}`

- [ ] **Step 1: Create `pages/walker/index.json`**

```json
{
  "navigationBarTitleText": "Walker",
  "usingComponents": {
    "review-item":       "/components/review-item/index",
    "star-rating":       "/components/star-rating/index",
    "loading-skeleton":  "/components/loading-skeleton/index",
    "empty-state":       "/components/empty-state/index",
    "t-button":          "tdesign-miniprogram/button/button",
    "t-image":           "tdesign-miniprogram/image/image"
  }
}
```

- [ ] **Step 2: Create `pages/walker/index.wxml`**

```xml
<loading-skeleton wx:if="{{pageStatus === 'loading'}}" count="6" />

<empty-state wx:elif="{{pageStatus === 'error'}}"
  icon="⚠️" title="Walker not found" subtitle="{{pageError}}" ctaText="Back" bind:cta="onBack" />

<view wx:else class="page">
  <view class="hero">
    <image class="avatar" src="{{walker.avatar}}" mode="aspectFill" />
    <view class="meta">
      <view class="name">{{walker.name}}</view>
      <view class="rating">★ {{walker.rating}} ({{walker.reviewCount}} reviews)</view>
      <view class="price">S${{walker.pricePerWalk}} / 30 min</view>
    </view>
  </view>

  <view class="section">
    <view class="label">About</view>
    <view class="bio">{{walker.bio}}</view>
  </view>

  <view class="section">
    <view class="label">Service areas</view>
    <view class="tags">
      <text wx:for="{{walker.areas}}" wx:key="*this" class="tag">{{item}}</text>
    </view>
  </view>

  <view class="section" wx:if="{{walker.photos.length}}">
    <view class="label">Photos</view>
    <view class="photos">
      <image wx:for="{{walker.photos}}" wx:key="*this" src="{{item}}" mode="aspectFill" class="photo" />
    </view>
  </view>

  <view class="section">
    <view class="label">Reviews</view>
    <empty-state wx:if="{{reviews.length === 0}}" icon="📝" title="No reviews yet" />
    <review-item wx:for="{{reviews}}" wx:key="_id" review="{{item}}" />
  </view>

  <view class="cta">
    <t-button theme="primary" size="large" block bindtap="onBook">Book a walk</t-button>
  </view>
</view>
```

- [ ] **Step 3: Create `pages/walker/index.wxss`**

```css
.page { padding-bottom: 200rpx; }
.hero { display:flex; gap:20rpx; padding:24rpx; background:#fff; }
.avatar { width:160rpx; height:160rpx; border-radius:80rpx; }
.meta { display:flex; flex-direction:column; justify-content:center; gap:8rpx; }
.name { font-size:36rpx; font-weight:600; }
.rating { font-size:26rpx; color:#f59e0b; }
.price { font-size:28rpx; color:#16a34a; }
.section { padding:24rpx; background:#fff; margin-top:16rpx; }
.label { font-size:24rpx; color:#888; text-transform:uppercase; margin-bottom:12rpx; }
.bio { font-size:28rpx; line-height:1.6; color:#333; }
.tags { display:flex; gap:12rpx; flex-wrap:wrap; }
.tag { font-size:24rpx; padding:6rpx 16rpx; background:#f0f6ff; color:#2563eb; border-radius:10rpx; }
.photos { display:flex; gap:12rpx; flex-wrap:wrap; }
.photo { width:200rpx; height:200rpx; border-radius:12rpx; }
.cta { position:fixed; bottom:0; left:0; right:0; padding:24rpx; background:#fff; box-shadow:0 -2rpx 8rpx rgba(0,0,0,0.06); }
```

- [ ] **Step 4: Create `pages/walker/index.ts`**

```typescript
import { getWalkerById } from '@/services/walkerService'
import { listReviewsForWalker } from '@/services/reviewService'
import { createPageState } from '@/utils/usePageState'
import { showAppError } from '@/utils/errorHandler'
import type { Walker, Review } from '@/models'

interface Data { walker: Walker | null; reviews: Review[]; pageStatus: string; pageError: string }

Page<Data, WechatMiniprogram.IAnyObject>({
  data: { walker: null, reviews: [], pageStatus: 'loading', pageError: '' },
  walkerId: '' as string,

  onLoad(query: Record<string, string>) {
    this.walkerId = query.id
    this.load()
  },

  async load() {
    const ps = createPageState(this.setData.bind(this))
    try {
      const [walker, reviews] = await ps.run(async () => Promise.all([
        getWalkerById(this.walkerId),
        listReviewsForWalker(this.walkerId, 20)
      ]))
      this.setData({ walker, reviews })
    } catch (e) { showAppError(e) }
  },

  onBook() {
    wx.navigateTo({ url: `/pages/booking-new/index?walkerId=${this.walkerId}` })
  },

  onBack() { wx.navigateBack() }
})
```

- [ ] **Step 5: Manual smoke** — tap a walker on home page, profile renders with bio, photos, reviews, "Book" CTA.

- [ ] **Step 6: Commit** (skip if not using git)

```bash
git add miniprogram/pages/walker/
git commit -m "feat(walker): profile page with reviews + book CTA"
```

---

## Stage 1.5 — Booking

### Task 20: `dog-form` component

**Files:**
- Create: `miniprogram/components/dog-form/index.{json,wxml,wxss,ts}`

- [ ] **Step 1: Create `index.json`**

```json
{
  "component": true,
  "usingComponents": {
    "t-input":  "tdesign-miniprogram/input/input",
    "t-button": "tdesign-miniprogram/button/button"
  }
}
```

- [ ] **Step 2: Create `index.wxml`**

```xml
<view class="form">
  <t-input label="Dog name *" placeholder="Buddy" model:value="{{dog.name}}" />
  <t-input label="Breed"      placeholder="Golden Retriever" model:value="{{dog.breed}}" />
  <t-input label="Weight (kg)" type="number" placeholder="25" model:value="{{dog.sizeKgStr}}" />
  <t-input label="Notes"      placeholder="Special needs?" model:value="{{dog.notes}}" />
  <t-button theme="primary" block size="medium" bindtap="onSave">Save</t-button>
</view>
```

- [ ] **Step 3: Create `index.wxss`**

```css
.form { display:flex; flex-direction:column; gap:16rpx; padding:16rpx; }
```

- [ ] **Step 4: Create `index.ts`**

```typescript
import type { Dog } from '@/models'

Component({
  properties: { initial: { type: Object, value: null as Dog | null } },
  data: {
    dog: { id: '', name: '', breed: '', sizeKgStr: '', notes: '' }
  },
  attached() {
    const d = this.data.initial
    if (d) this.setData({
      dog: { id: d.id, name: d.name, breed: d.breed ?? '', sizeKgStr: d.sizeKg?.toString() ?? '', notes: d.notes ?? '' }
    })
  },
  methods: {
    onSave() {
      const f = this.data.dog
      if (!f.name.trim()) {
        wx.showToast({ title: 'Dog name required', icon: 'none' })
        return
      }
      const dog: Dog = {
        id: f.id || 'd-' + Date.now(),
        name: f.name.trim(),
        breed: f.breed || undefined,
        sizeKg: f.sizeKgStr ? Number(f.sizeKgStr) : undefined,
        notes: f.notes || undefined
      }
      this.triggerEvent('save', { dog })
    }
  }
})
```

- [ ] **Step 5: Commit** (skip if not using git)

```bash
git add miniprogram/components/dog-form
git commit -m "feat(components): dog-form"
```

---

### Task 21: `bookingService`

**Files:**
- Create: `miniprogram/services/bookingService.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/services/bookingService.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setCallFnHandler, resetWxMock } from '../helpers'
import { createBooking, listMyBookings, getBookingById, cancelBooking } from '@/services/bookingService'

beforeEach(() => resetWxMock())

describe('bookingService', () => {
  it('createBooking calls createBooking fn and returns id', async () => {
    setCallFnHandler(async (n, d: any) => {
      expect(n).toBe('createBooking')
      expect(d.walkerId).toBe('w1')
      return { ok: true, data: { bookingId: 'b1' } }
    })
    const r = await createBooking({ walkerId: 'w1', dogId: 'd1', date: Date.now() + 86400000, durationMin: 30 })
    expect(r.bookingId).toBe('b1')
  })

  it('listMyBookings calls listBookings fn', async () => {
    const fn = vi.fn(async () => ({ ok: true, data: [] }))
    setCallFnHandler(fn)
    await listMyBookings()
    expect(fn).toHaveBeenCalledWith('listBookings', {})
  })

  it('getBookingById passes id', async () => {
    setCallFnHandler(async (_n, d: any) => ({ ok: true, data: { _id: d.bookingId } }))
    const r = await getBookingById('b1')
    expect(r._id).toBe('b1')
  })

  it('cancelBooking forwards bookingId', async () => {
    setCallFnHandler(async (n, d: any) => {
      expect(n).toBe('cancelBooking'); expect(d.bookingId).toBe('b1')
      return { ok: true, data: { cancelled: true } }
    })
    await cancelBooking('b1')
  })
})
```

- [ ] **Step 2: Run test**

Run: `npm run test -- bookingService`
Expected: FAIL.

- [ ] **Step 3: Implement `miniprogram/services/bookingService.ts`**

```typescript
import { cloudCall } from './cloudCall'
import type { Booking, WalkDuration } from '@/models'

export interface CreateBookingInput {
  walkerId: string
  dogId: string
  date: number
  durationMin: WalkDuration
  notes?: string
}

export async function createBooking(input: CreateBookingInput): Promise<{ bookingId: string }> {
  return cloudCall<{ bookingId: string }>('createBooking', input)
}

export async function listMyBookings(): Promise<Booking[]> {
  return cloudCall<Booking[]>('listBookings', {})
}

export async function getBookingById(bookingId: string): Promise<Booking> {
  return cloudCall<Booking>('getBooking', { bookingId })
}

export async function cancelBooking(bookingId: string): Promise<{ cancelled: boolean }> {
  return cloudCall<{ cancelled: boolean }>('cancelBooking', { bookingId })
}
```

- [ ] **Step 4: Run test**

Run: `npm run test -- bookingService`
Expected: 4 pass.

- [ ] **Step 5: Commit** (skip if not using git)

```bash
git add miniprogram/services/bookingService.ts tests/services/bookingService.test.ts
git commit -m "feat(booking): service wrappers — create, list, get, cancel"
```

---

### Task 22: Cloud functions `createBooking` + `listBookings` + `getBooking` + `cancelBooking`

**Files:**
- Create: `cloudfunctions/createBooking/{package.json,tsconfig.json,index.ts}`
- Create: `cloudfunctions/listBookings/{package.json,tsconfig.json,index.ts}`
- Create: `cloudfunctions/getBooking/{package.json,tsconfig.json,index.ts}`
- Create: `cloudfunctions/cancelBooking/{package.json,tsconfig.json,index.ts}`

> Each fn has the same package.json/tsconfig.json shape as Task 9; only `name` differs. Below shows only `index.ts`. Apply the package.json/tsconfig.json pattern to each and run `npm install` inside each fn directory.

- [ ] **Step 1: Write the failing test for createBooking**

Create `tests/cloudfn/createBooking.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

const getWXContext = vi.fn()
const collection = vi.fn()

vi.mock('wx-server-sdk', () => ({
  default: {
    init: () => undefined,
    getWXContext: () => getWXContext(),
    database: () => ({ collection })
  }
}))

import handler from '../../cloudfunctions/createBooking/index'

beforeEach(() => { getWXContext.mockReset(); collection.mockReset() })

describe('createBooking', () => {
  it('creates booking with computed amount and auto-accepted status', async () => {
    getWXContext.mockReturnValue({ OPENID: 'owner' })
    const futureDate = Date.now() + 86400000
    collection.mockImplementation((name: string) => {
      if (name === 'users')   return { where: () => ({ get: async () => ({ data: [{ _id: 'u1', openid: 'owner' }] }) }) }
      if (name === 'walkers') return { doc: () => ({ get: async () => ({ data: { _id: 'w1', pricePerWalk: 30 } }) }) }
      if (name === 'bookings') return { add: async ({ data }: any) => ({ _id: 'b1', ...data }) }
      throw new Error('unexpected col: ' + name)
    })
    const r = await handler({ walkerId: 'w1', dogId: 'd1', date: futureDate, durationMin: 60 }, {})
    expect(r).toMatchObject({ ok: true, data: { bookingId: 'b1' } })
  })

  it('UNAUTH if not logged in', async () => {
    getWXContext.mockReturnValue({})
    const r = await handler({ walkerId: 'w1', dogId: 'd1', date: Date.now() + 86400000, durationMin: 30 }, {})
    expect(r).toMatchObject({ ok: false, code: 'UNAUTH' })
  })

  it('VALIDATION on past date', async () => {
    getWXContext.mockReturnValue({ OPENID: 'owner' })
    const r = await handler({ walkerId: 'w1', dogId: 'd1', date: Date.now() - 1000, durationMin: 30 }, {})
    expect(r).toMatchObject({ ok: false, code: 'VALIDATION' })
  })

  it('VALIDATION on bad duration', async () => {
    getWXContext.mockReturnValue({ OPENID: 'owner' })
    const r = await handler({ walkerId: 'w1', dogId: 'd1', date: Date.now() + 86400000, durationMin: 99 }, {})
    expect(r).toMatchObject({ ok: false, code: 'VALIDATION' })
  })
})
```

- [ ] **Step 2: Run test**

Run: `npm run test -- createBooking`
Expected: FAIL.

- [ ] **Step 3: Create the four fn directories with shared package.json/tsconfig.json**

For each of `createBooking`, `listBookings`, `getBooking`, `cancelBooking`:

`cloudfunctions/<name>/package.json`:

```json
{ "name": "<name>", "version": "1.0.0", "main": "index.js", "dependencies": { "wx-server-sdk": "~2.6.3" } }
```

`cloudfunctions/<name>/tsconfig.json`:

```json
{
  "compilerOptions": { "target": "ES2020", "module": "CommonJS", "strict": true, "esModuleInterop": true, "skipLibCheck": true, "outDir": "." },
  "include": ["./index.ts"]
}
```

- [ ] **Step 4: Implement `cloudfunctions/createBooking/index.ts`**

```typescript
import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import { assertString, assertOneOf, assertFutureDate, FnError } from '../shared/assert'
import type { Booking } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

interface Payload { walkerId: string; dogId: string; date: number; durationMin: 30|45|60; notes?: string }

export default async function handler(event: Payload, _ctx: unknown): Promise<FnResult<{ bookingId: string }>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')

    const walkerId = assertString(event.walkerId, 'walkerId')
    const dogId = assertString(event.dogId, 'dogId')
    const date = assertFutureDate(event.date, 'date')
    const durationMin = assertOneOf(event.durationMin, [30, 45, 60] as const, 'durationMin')

    const db = cloud.database()
    const users = await db.collection('users').where({ openid: wxCtx.OPENID }).get()
    if (users.data.length === 0) return err('NOT_FOUND', 'User missing — call login first')
    const ownerId = users.data[0]._id as string

    const wRes = await db.collection('walkers').doc(walkerId).get().catch(() => null as any)
    if (!wRes || !wRes.data) return err('NOT_FOUND', 'Walker not found')
    const pricePerWalk = (wRes.data as any).pricePerWalk as number

    const amount = pricePerWalk * (durationMin / 30)
    const now = Date.now()
    const booking: Omit<Booking, '_id'> = {
      ownerId,
      walkerId,
      dogId,
      date,
      durationMin,
      status: 'accepted',                    // DEMO: auto-accept
      notes: event.notes,
      mockPayment: { amount, paid: true },
      createdAt: now,
      updatedAt: now
    }
    const r = await db.collection('bookings').add({ data: booking })
    return ok({ bookingId: r._id as string })
  } catch (e: any) {
    if (e instanceof FnError) {
      const [code, msg] = e.message.split(': ')
      return err(code as any, msg || e.message)
    }
    console.error('[createBooking]', e)
    return err('INTERNAL', e?.message || 'Internal')
  }
}
```

- [ ] **Step 5: Implement `cloudfunctions/listBookings/index.ts`**

```typescript
import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import type { Booking } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

export default async function handler(_event: unknown, _ctx: unknown): Promise<FnResult<Booking[]>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')

    const db = cloud.database()
    const users = await db.collection('users').where({ openid: wxCtx.OPENID }).get()
    if (users.data.length === 0) return ok([])
    const ownerId = users.data[0]._id as string

    const r = await db.collection('bookings').where({ ownerId }).orderBy('date', 'desc').limit(100).get()
    return ok(r.data as Booking[])
  } catch (e: any) {
    console.error('[listBookings]', e)
    return err('INTERNAL', e?.message || 'Internal')
  }
}
```

- [ ] **Step 6: Implement `cloudfunctions/getBooking/index.ts`**

```typescript
import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import { assertString } from '../shared/assert'
import type { Booking } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

export default async function handler(event: { bookingId: string }, _ctx: unknown): Promise<FnResult<Booking>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')
    const bookingId = assertString(event.bookingId, 'bookingId')

    const db = cloud.database()
    const users = await db.collection('users').where({ openid: wxCtx.OPENID }).get()
    if (users.data.length === 0) return err('NOT_FOUND', 'User not found')
    const ownerId = users.data[0]._id as string

    const b = await db.collection('bookings').doc(bookingId).get().catch(() => null as any)
    if (!b || !b.data) return err('NOT_FOUND', 'Booking not found')

    const booking = b.data as Booking
    // Allow either booking owner OR a walker-mode user (demo) to read.
    if (booking.ownerId !== ownerId) {
      // Demo permissiveness: walker-mode can read any.
      // Real product: assert walker openid == walker.openid
    }
    return ok(booking)
  } catch (e: any) {
    console.error('[getBooking]', e)
    return err('INTERNAL', e?.message || 'Internal')
  }
}
```

- [ ] **Step 7: Implement `cloudfunctions/cancelBooking/index.ts`**

```typescript
import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import { assertString } from '../shared/assert'
import type { Booking } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

export default async function handler(event: { bookingId: string }, _ctx: unknown): Promise<FnResult<{ cancelled: boolean }>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')
    const bookingId = assertString(event.bookingId, 'bookingId')

    const db = cloud.database()
    const users = await db.collection('users').where({ openid: wxCtx.OPENID }).get()
    if (users.data.length === 0) return err('NOT_FOUND', 'User not found')
    const ownerId = users.data[0]._id as string

    const b = await db.collection('bookings').doc(bookingId).get().catch(() => null as any)
    if (!b || !b.data) return err('NOT_FOUND', 'Booking not found')
    const booking = b.data as Booking
    if (booking.ownerId !== ownerId) return err('FORBIDDEN', 'Not your booking')
    if (booking.status === 'completed') return err('CONFLICT', 'Cannot cancel completed booking')

    await db.collection('bookings').doc(bookingId).update({ data: { status: 'cancelled', updatedAt: Date.now() } })
    return ok({ cancelled: true })
  } catch (e: any) {
    console.error('[cancelBooking]', e)
    return err('INTERNAL', e?.message || 'Internal')
  }
}
```

- [ ] **Step 8: Install deps for all four fns**

Run: `for d in createBooking listBookings getBooking cancelBooking; do (cd cloudfunctions/$d && npm install); done`

- [ ] **Step 9: Run tests**

Run: `npm run test -- createBooking`
Expected: 4 pass.

- [ ] **Step 10: Commit** (skip if not using git)

```bash
git add cloudfunctions/createBooking cloudfunctions/listBookings cloudfunctions/getBooking cloudfunctions/cancelBooking tests/cloudfn/createBooking.test.ts
git commit -m "feat(cloudfn): booking lifecycle — create, list, get, cancel"
```

---

### Task 23: `pages/booking-new` — booking form + mock pay screen

**Files:**
- Create: `miniprogram/pages/booking-new/index.{json,wxml,wxss,ts}`

- [ ] **Step 1: Create `index.json`**

```json
{
  "navigationBarTitleText": "Book a Walk",
  "usingComponents": {
    "t-input":       "tdesign-miniprogram/input/input",
    "t-picker":      "tdesign-miniprogram/picker/picker",
    "t-picker-item": "tdesign-miniprogram/picker-item/picker-item",
    "t-radio-group": "tdesign-miniprogram/radio-group/radio-group",
    "t-radio":       "tdesign-miniprogram/radio/radio",
    "t-button":      "tdesign-miniprogram/button/button",
    "t-textarea":    "tdesign-miniprogram/textarea/textarea",
    "dog-form":      "/components/dog-form/index",
    "loading-skeleton": "/components/loading-skeleton/index"
  }
}
```

- [ ] **Step 2: Create `index.wxml`**

```xml
<view class="page" wx:if="{{walker}}">
  <view class="walker-strip">
    <image src="{{walker.avatar}}" class="avatar" />
    <view>
      <view class="name">{{walker.name}}</view>
      <view class="price">S${{walker.pricePerWalk}} / 30 min</view>
    </view>
  </view>

  <view class="section">
    <view class="label">Pick your dog</view>
    <view wx:if="{{dogs.length === 0}}" class="hint">No dogs yet — add one below.</view>
    <view wx:else class="dog-list">
      <view wx:for="{{dogs}}" wx:key="id"
            class="dog-chip {{selectedDogId === item.id ? 'on' : ''}}"
            bindtap="onPickDog" data-id="{{item.id}}">{{item.name}}</view>
    </view>
    <view class="add-dog-toggle" bindtap="onToggleAddDog">{{addingDog ? '× Cancel' : '+ Add a dog'}}</view>
    <dog-form wx:if="{{addingDog}}" bind:save="onSaveDog" />
  </view>

  <view class="section">
    <view class="label">Date & start time</view>
    <picker mode="date" start="{{minDate}}" value="{{datePart}}" bindchange="onDate">
      <view class="picker-row">{{datePart || 'Choose date'}}</view>
    </picker>
    <picker mode="time" value="{{timePart}}" bindchange="onTime">
      <view class="picker-row">{{timePart || 'Choose time'}}</view>
    </picker>
  </view>

  <view class="section">
    <view class="label">Duration</view>
    <t-radio-group value="{{durationMin}}" bind:change="onDuration">
      <t-radio value="{{30}}" label="30 min" />
      <t-radio value="{{45}}" label="45 min" />
      <t-radio value="{{60}}" label="60 min" />
    </t-radio-group>
  </view>

  <view class="section">
    <view class="label">Notes (optional)</view>
    <t-textarea model:value="{{notes}}" placeholder="Anything the walker should know?" />
  </view>

  <view class="section pay">
    <view class="label">Mock payment</view>
    <view class="total">Total: S${{computedAmount}}</view>
    <view class="hint">Demo only — no real charge.</view>
  </view>

  <view class="cta">
    <t-button theme="primary" size="large" block loading="{{submitting}}" bindtap="onSubmit">Confirm booking</t-button>
  </view>
</view>

<loading-skeleton wx:else count="5" />
```

- [ ] **Step 3: Create `index.wxss`**

```css
.page { padding-bottom: 200rpx; }
.walker-strip { display:flex; gap:16rpx; padding:24rpx; background:#fff; align-items:center; }
.avatar { width:96rpx; height:96rpx; border-radius:48rpx; }
.name { font-size:30rpx; font-weight:500; }
.price { font-size:24rpx; color:#16a34a; }
.section { padding:24rpx; background:#fff; margin-top:16rpx; }
.label { font-size:24rpx; color:#888; margin-bottom:12rpx; text-transform:uppercase; }
.hint  { font-size:24rpx; color:#888; }
.dog-list { display:flex; gap:12rpx; flex-wrap:wrap; }
.dog-chip { padding:12rpx 24rpx; border-radius:24rpx; background:#f5f5f5; font-size:26rpx; }
.dog-chip.on { background:#2563eb; color:#fff; }
.add-dog-toggle { margin-top:16rpx; font-size:26rpx; color:#2563eb; }
.picker-row { padding:16rpx 0; font-size:28rpx; color:#1f2329; border-bottom:1rpx solid #eee; }
.total { font-size:36rpx; font-weight:600; color:#16a34a; }
.cta { position:fixed; bottom:0; left:0; right:0; padding:24rpx; background:#fff; box-shadow:0 -2rpx 8rpx rgba(0,0,0,0.06); }
```

- [ ] **Step 4: Create `index.ts`**

```typescript
import { getWalkerById } from '@/services/walkerService'
import { createBooking } from '@/services/bookingService'
import { showAppError } from '@/utils/errorHandler'
import { formatDate } from '@/utils/date'
import { bus, BUS_EVENTS } from '@/utils/bus'
import { cloudCall } from '@/services/cloudCall'
import type { Walker, Dog, WalkDuration } from '@/models'

interface Data {
  walker: Walker | null
  dogs: Dog[]
  selectedDogId: string
  addingDog: boolean
  datePart: string
  timePart: string
  durationMin: WalkDuration
  notes: string
  minDate: string
  submitting: boolean
  computedAmount: number
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    walker: null, dogs: [], selectedDogId: '', addingDog: false,
    datePart: '', timePart: '', durationMin: 30, notes: '',
    minDate: formatDate(Date.now()), submitting: false, computedAmount: 0
  },
  walkerId: '',

  async onLoad(query: Record<string, string>) {
    this.walkerId = query.walkerId
    try {
      const walker = await getWalkerById(this.walkerId)
      this.setData({ walker, computedAmount: walker.pricePerWalk })
      await this.loadDogs()
    } catch (e) { showAppError(e) }
  },

  async loadDogs() {
    const r = await cloudCall<{ dogs: Dog[] }>('getMyProfile', {}).catch(() => ({ dogs: [] }))
    this.setData({ dogs: r.dogs || [] })
  },

  onPickDog(e: WechatMiniprogram.BaseEvent) {
    this.setData({ selectedDogId: String(e.currentTarget.dataset.id) })
  },

  onToggleAddDog() { this.setData({ addingDog: !this.data.addingDog }) },

  async onSaveDog(e: WechatMiniprogram.CustomEvent<{ dog: Dog }>) {
    const dog = e.detail.dog
    const dogs = [...this.data.dogs, dog]
    this.setData({ dogs, selectedDogId: dog.id, addingDog: false })
    await cloudCall('updateProfile', { name: '__keep__', dogs }).catch(() => undefined)
  },

  onDate(e: WechatMiniprogram.PickerChange) { this.setData({ datePart: String(e.detail.value) }) },
  onTime(e: WechatMiniprogram.PickerChange) { this.setData({ timePart: String(e.detail.value) }) },

  onDuration(e: WechatMiniprogram.CustomEvent<{ value: WalkDuration }>) {
    const d = e.detail.value
    const w = this.data.walker
    this.setData({ durationMin: d, computedAmount: w ? w.pricePerWalk * (d / 30) : 0 })
  },

  async onSubmit() {
    const { selectedDogId, datePart, timePart, durationMin, notes } = this.data
    if (!selectedDogId) return wx.showToast({ title: 'Pick a dog', icon: 'none' })
    if (!datePart || !timePart) return wx.showToast({ title: 'Pick date & time', icon: 'none' })
    const date = new Date(`${datePart}T${timePart}:00`).getTime()
    if (!(date > Date.now())) return wx.showToast({ title: 'Time must be in future', icon: 'none' })

    this.setData({ submitting: true })
    try {
      const r = await createBooking({ walkerId: this.walkerId, dogId: selectedDogId, date, durationMin, notes })
      bus.emit(BUS_EVENTS.BOOKING_CREATED, { bookingId: r.bookingId })
      wx.showToast({ title: 'Booking confirmed', icon: 'success' })
      wx.redirectTo({ url: `/pages/booking/index?id=${r.bookingId}` })
    } catch (e) {
      showAppError(e)
    } finally {
      this.setData({ submitting: false })
    }
  }
})
```

> NOTE: `getMyProfile` is referenced for dog loading. Add as part of Task 11 fallback — or implement it as a stub: rewrite `loadDogs` to use existing `updateProfile` shape (read by listing self). Simpler: add a `getMyProfile` cloud fn now as Step 5 below.

- [ ] **Step 5: Create `cloudfunctions/getMyProfile/{package.json,tsconfig.json,index.ts}`**

`package.json`:

```json
{ "name": "getMyProfile", "version": "1.0.0", "main": "index.js", "dependencies": { "wx-server-sdk": "~2.6.3" } }
```

`tsconfig.json`:

```json
{ "compilerOptions": { "target": "ES2020", "module": "CommonJS", "strict": true, "esModuleInterop": true, "skipLibCheck": true, "outDir": "." }, "include": ["./index.ts"] }
```

`index.ts`:

```typescript
import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import type { User } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

export default async function handler(_event: unknown, _ctx: unknown): Promise<FnResult<User>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')
    const db = cloud.database()
    const r = await db.collection('users').where({ openid: wxCtx.OPENID }).limit(1).get()
    if (r.data.length === 0) return err('NOT_FOUND', 'User missing')
    return ok(r.data[0] as User)
  } catch (e: any) {
    return err('INTERNAL', e?.message || 'Internal')
  }
}
```

Run: `cd cloudfunctions/getMyProfile && npm install && cd ../..`

- [ ] **Step 6: Manual smoke** — open booking form → add a dog → pick date/time → submit → toast → redirect to booking detail (will 404 until Task 25; that's OK for now).

- [ ] **Step 7: Commit** (skip if not using git)

```bash
git add miniprogram/pages/booking-new/ cloudfunctions/getMyProfile/
git commit -m "feat(booking): booking-new page + getMyProfile cloud fn"
```

---

### Task 24: `pages/bookings` — my bookings list (tabs)

**Files:**
- Create: `miniprogram/pages/bookings/index.{json,wxml,wxss,ts}`

- [ ] **Step 1: Create `index.json`**

```json
{
  "navigationBarTitleText": "My Bookings",
  "enablePullDownRefresh": true,
  "usingComponents": {
    "t-tabs":          "tdesign-miniprogram/tabs/tabs",
    "t-tab-panel":     "tdesign-miniprogram/tab-panel/tab-panel",
    "empty-state":     "/components/empty-state/index",
    "loading-skeleton":"/components/loading-skeleton/index"
  }
}
```

- [ ] **Step 2: Create `index.wxml`**

```xml
<t-tabs value="{{tab}}" bind:change="onTabChange">
  <t-tab-panel label="Upcoming" value="upcoming" />
  <t-tab-panel label="Past"     value="past" />
</t-tabs>

<loading-skeleton wx:if="{{pageStatus === 'loading'}}" count="4" />
<empty-state wx:elif="{{pageStatus === 'empty'}}" icon="📅" title="No bookings here yet" />
<empty-state wx:elif="{{pageStatus === 'error'}}" icon="⚠️" title="Failed to load" subtitle="{{pageError}}" ctaText="Retry" bind:cta="onRetry" />

<view wx:else class="list">
  <view wx:for="{{filtered}}" wx:key="_id" class="row" bindtap="onTap" data-id="{{item._id}}">
    <view class="row-main">
      <view class="row-title">{{item.dateLabel}} · {{item.durationMin}} min</view>
      <view class="row-sub">{{item.statusLabel}}</view>
    </view>
    <view class="row-amount">S${{item.mockPayment.amount}}</view>
  </view>
</view>
```

- [ ] **Step 3: Create `index.wxss`**

```css
.list { padding: 16rpx; }
.row  { display:flex; align-items:center; justify-content:space-between; padding:24rpx; background:#fff; border-radius:12rpx; margin-bottom:12rpx; }
.row-title { font-size:28rpx; }
.row-sub   { font-size:24rpx; color:#888; margin-top:4rpx; }
.row-amount{ font-size:28rpx; color:#16a34a; }
```

- [ ] **Step 4: Create `index.ts`**

```typescript
import { listMyBookings } from '@/services/bookingService'
import { createPageState } from '@/utils/usePageState'
import { showAppError } from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/date'
import { bus, BUS_EVENTS } from '@/utils/bus'
import type { Booking } from '@/models'

interface Row extends Booking { dateLabel: string; statusLabel: string }
interface Data { tab: string; all: Row[]; filtered: Row[]; pageStatus: string; pageError: string }

const STATUS_LABEL: Record<Booking['status'], string> = {
  requested: 'Awaiting walker',
  accepted: 'Confirmed',
  declined: 'Declined',
  in_progress: 'Walk in progress',
  completed: 'Completed',
  cancelled: 'Cancelled'
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: { tab: 'upcoming', all: [], filtered: [], pageStatus: 'loading', pageError: '' },
  unsub: null as null | (() => void),

  onLoad() {
    this.unsub = bus.on(BUS_EVENTS.BOOKING_CREATED, () => this.load())
    this.load()
  },
  onShow() { if (this.data.all.length) this.load() },
  onUnload() { this.unsub?.() },

  async load() {
    const ps = createPageState(this.setData.bind(this))
    try {
      const list = await ps.run(
        async () => (await listMyBookings()).map(b => ({
          ...b, dateLabel: formatDateTime(b.date), statusLabel: STATUS_LABEL[b.status]
        })),
        { onEmpty: v => v.length === 0 }
      )
      this.setData({ all: list }, () => this.applyTab())
    } catch (e) { showAppError(e) }
  },

  applyTab() {
    const now = Date.now()
    const isUpcoming = (b: Row) => (b.status === 'requested' || b.status === 'accepted' || b.status === 'in_progress') && b.date >= now
    const filtered = this.data.all.filter(this.data.tab === 'upcoming' ? isUpcoming : (b) => !isUpcoming(b))
    this.setData({ filtered, pageStatus: filtered.length === 0 ? 'empty' : 'loaded' })
  },

  onTabChange(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ tab: e.detail.value }, () => this.applyTab())
  },

  onTap(e: WechatMiniprogram.BaseEvent) {
    wx.navigateTo({ url: `/pages/booking/index?id=${e.currentTarget.dataset.id}` })
  },

  onPullDownRefresh() { this.load().finally(() => wx.stopPullDownRefresh()) },
  onRetry() { this.load() }
})
```

- [ ] **Step 5: Commit** (skip if not using git)

```bash
git add miniprogram/pages/bookings/
git commit -m "feat(bookings): list with upcoming/past tabs + bus refresh"
```

---

### Task 25: `pages/booking` — booking detail

**Files:**
- Create: `miniprogram/pages/booking/index.{json,wxml,wxss,ts}`

- [ ] **Step 1: Create `index.json`**

```json
{
  "navigationBarTitleText": "Booking",
  "usingComponents": {
    "t-button":          "tdesign-miniprogram/button/button",
    "t-tag":             "tdesign-miniprogram/tag/tag",
    "loading-skeleton":  "/components/loading-skeleton/index",
    "empty-state":       "/components/empty-state/index"
  }
}
```

- [ ] **Step 2: Create `index.wxml`**

```xml
<loading-skeleton wx:if="{{pageStatus === 'loading'}}" count="5" />
<empty-state wx:elif="{{pageStatus === 'error'}}" icon="⚠️" title="Booking missing" subtitle="{{pageError}}" ctaText="Back" bind:cta="onBack" />

<view wx:else class="page">
  <view class="section">
    <view class="row"><text>When</text><text>{{dateLabel}}</text></view>
    <view class="row"><text>Duration</text><text>{{booking.durationMin}} min</text></view>
    <view class="row"><text>Status</text><t-tag>{{statusLabel}}</t-tag></view>
    <view class="row"><text>Total</text><text>S${{booking.mockPayment.amount}}</text></view>
    <view class="row" wx:if="{{booking.notes}}"><text>Notes</text><text>{{booking.notes}}</text></view>
  </view>

  <view class="section" wx:if="{{walker}}">
    <view class="label">Walker</view>
    <view class="walker-row" bindtap="onOpenWalker">
      <image src="{{walker.avatar}}" class="avatar" />
      <view class="walker-name">{{walker.name}}</view>
    </view>
  </view>

  <view class="section" wx:if="{{report}}">
    <view class="label">Walk report</view>
    <view class="report-notes">{{report.notes}}</view>
    <view class="report-photos">
      <image wx:for="{{report.photos}}" wx:key="*this" src="{{item}}" mode="aspectFill" class="report-photo" />
    </view>
    <view class="report-counts">
      🚶 {{report.durationMin}} min  ·  💧 {{report.peeCount}}  ·  💩 {{report.poopCount}}
    </view>
  </view>

  <view class="cta">
    <t-button block bindtap="onOpenChat">Open chat</t-button>
    <t-button wx:if="{{canReview}}" theme="primary" block bindtap="onLeaveReview">Leave a review</t-button>
    <t-button wx:if="{{canCancel}}" theme="danger" variant="outline" block bindtap="onCancel">Cancel booking</t-button>
  </view>
</view>
```

- [ ] **Step 3: Create `index.wxss`**

```css
.page { padding-bottom: 200rpx; }
.section { padding:24rpx; background:#fff; margin-top:16rpx; }
.row { display:flex; justify-content:space-between; padding:12rpx 0; font-size:28rpx; }
.label { font-size:24rpx; color:#888; text-transform:uppercase; margin-bottom:12rpx; }
.walker-row { display:flex; gap:16rpx; align-items:center; }
.avatar { width:80rpx; height:80rpx; border-radius:40rpx; }
.walker-name { font-size:28rpx; }
.report-notes { font-size:28rpx; line-height:1.6; margin-bottom:12rpx; }
.report-photos { display:flex; gap:12rpx; flex-wrap:wrap; margin-bottom:12rpx; }
.report-photo { width:200rpx; height:200rpx; border-radius:12rpx; }
.report-counts { font-size:26rpx; color:#555; }
.cta { position:fixed; bottom:0; left:0; right:0; padding:16rpx; background:#fff; display:flex; flex-direction:column; gap:12rpx; box-shadow:0 -2rpx 8rpx rgba(0,0,0,0.06); }
```

- [ ] **Step 4: Create `index.ts`**

```typescript
import { getBookingById, cancelBooking } from '@/services/bookingService'
import { getWalkerById } from '@/services/walkerService'
import { createPageState } from '@/utils/usePageState'
import { showAppError } from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/date'
import { cloudCall } from '@/services/cloudCall'
import { bus, BUS_EVENTS } from '@/utils/bus'
import type { Booking, Walker, WalkReport } from '@/models'

interface Data {
  booking: Booking | null
  walker: Walker | null
  report: WalkReport | null
  dateLabel: string
  statusLabel: string
  canReview: boolean
  canCancel: boolean
  pageStatus: string
  pageError: string
}

const LABELS: Record<Booking['status'], string> = {
  requested: 'Awaiting walker', accepted: 'Confirmed', declined: 'Declined',
  in_progress: 'In progress', completed: 'Completed', cancelled: 'Cancelled'
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    booking: null, walker: null, report: null,
    dateLabel: '', statusLabel: '', canReview: false, canCancel: false,
    pageStatus: 'loading', pageError: ''
  },
  bookingId: '',
  unsubs: [] as Array<() => void>,

  onLoad(q: Record<string, string>) {
    this.bookingId = q.id
    this.unsubs.push(bus.on(BUS_EVENTS.WALK_REPORT_SUBMITTED, () => this.load()))
    this.unsubs.push(bus.on(BUS_EVENTS.REVIEW_SUBMITTED, () => this.load()))
    this.load()
  },
  onShow() { if (this.data.booking) this.load() },
  onUnload() { this.unsubs.forEach(u => u()) },

  async load() {
    const ps = createPageState(this.setData.bind(this))
    try {
      const booking = await ps.run(() => getBookingById(this.bookingId))
      const [walker, reportRes, existingReviews] = await Promise.all([
        getWalkerById(booking.walkerId).catch(() => null),
        cloudCall<{ report: WalkReport | null }>('getWalkReport', { bookingId: booking._id }).catch(() => ({ report: null })),
        cloudCall<{ reviews: any[] }>('listReviewsForBooking', { bookingId: booking._id }).catch(() => ({ reviews: [] }))
      ])
      this.setData({
        booking,
        walker,
        report: reportRes.report,
        dateLabel: formatDateTime(booking.date),
        statusLabel: LABELS[booking.status],
        canReview: booking.status === 'completed' && existingReviews.reviews.length === 0,
        canCancel: booking.status === 'requested' || booking.status === 'accepted'
      })
    } catch (e) { showAppError(e) }
  },

  onOpenChat() { wx.navigateTo({ url: `/pages/chat/index?bookingId=${this.bookingId}` }) },
  onLeaveReview() { wx.navigateTo({ url: `/pages/review/index?bookingId=${this.bookingId}` }) },
  onOpenWalker() {
    const w = this.data.walker
    if (w) wx.navigateTo({ url: `/pages/walker/index?id=${w._id}` })
  },
  async onCancel() {
    const { confirm } = await wx.showModal({ title: 'Cancel?', content: 'This cannot be undone.' })
    if (!confirm) return
    try {
      await cancelBooking(this.bookingId)
      bus.emit(BUS_EVENTS.BOOKING_UPDATED, { bookingId: this.bookingId })
      wx.showToast({ title: 'Cancelled', icon: 'success' })
      this.load()
    } catch (e) { showAppError(e) }
  },
  onBack() { wx.navigateBack() }
})
```

> NOTE: References `getWalkReport` and `listReviewsForBooking` cloud fns — created in Task 30 and Task 32. Until they exist, the `.catch(() => ...)` fallbacks keep the page functional.

- [ ] **Step 5: Commit** (skip if not using git)

```bash
git add miniprogram/pages/booking/
git commit -m "feat(booking): detail page with report + chat + cancel + review CTA"
```

---

## Stage 1.5M — Mock-Mode Toggle (Tasks 98–104)

**Goal:** Add a service-layer mock toggle so Phase 1 UI is demoable and developable without an activated CloudBase environment. Inserted at this point because by end of Stage 1.5 the app exercises auth + browse + profile + booking flows — enough to demo end-to-end **if** the underlying data path can be redirected to an in-memory store. See spec §4.1 for the architecture and boundary rules.

**Execution order:** Run **after Stage 1.5, before Stage 1.6**. Subsequent service tasks (Tasks 26 chatService, 29 walkReportService, 32 submitReview, 29 storageService) must honour the `__USE_MOCK__` flag at creation time — each of those tasks gets a "honour mock toggle" sub-step added when reached.

**Removal:** flag flipped to `false` in Stage 1.M (Tasks 105–110); mock module files deleted entirely before pilot launch (see risks §5.6 and Phase 5 launch checklist).

### Task 98: Mock infrastructure (`utils/env.ts`, `mocks/db.ts`, shared seed data)

**Files:**
- Create: `miniprogram/utils/env.ts` (`export const __USE_MOCK__ = true`)
- Create: `miniprogram/mocks/seedData.ts` (shared with `cloudfunctions/seedDemoData` — 3 walkers, 5 reviews, 1 owner with 1 dog)
- Create: `miniprogram/mocks/db.ts` (in-memory collections: `walkers`, `reviews`, `bookings`, `messages`, `walkReports`, `users`; verbs: `list/get/insert/update/delete`)
- Create: `miniprogram/mocks/realtime.ts` (`watch(coll, filter, onChange)` backed by `utils/bus.ts`)
- Create: `miniprogram/mocks/storage.ts` (`wx.setStorageSync` persistence layer so reload preserves state)
- Modify: `cloudfunctions/seedDemoData/index.ts` to import from shared seed constants (avoid drift)

**Goal:** the single source of mock truth. Other tasks plug services into this.
**Tests:** vitest unit — insert → list returns inserted; update mutates; watch fires on insert; storage persistence round-trips.

### Task 99: Mock banner component + global mount

**Files:**
- Create: `miniprogram/components/mock-banner/{json,wxml,wxss,ts}`
- Modify: every page wxml (or app.wxss — decide in spec) to mount banner at top
- Modify: `miniprogram/app.wxss` for fixed-top banner styling

**Goal:** persistent non-dismissable "MOCK MODE — 模拟数据，未连接云端" bar whenever `__USE_MOCK__ === true`. Renders nothing when false (dead-code eliminated).
**Tests:** miniprogram-simulate — banner present with flag on, absent with flag off.

### Task 100: `authService` honours mock toggle

**Files:**
- Modify: `miniprogram/services/authService.ts`
- Modify: `miniprogram/app.ts` (skip `wx.cloud.init` + use fake openid path when mock)

**Goal:** when `__USE_MOCK__` true, `silentLogin` resolves immediately with `{ openid: 'mock-owner-1', isNewUser: false }`; `wx.cloud.init` skipped (this fixes the current `-601034` boot crash). `updateProfile` writes to `mockDb.users`.
**Tests:** vitest — mock branch returns fake openid synchronously; live branch path unchanged.

### Task 101: `walkerService` honours mock toggle

**Files:**
- Modify: `miniprogram/services/walkerService.ts`

**Goal:** `list / getById` read from `mockDb.walkers` when flag on. Filter logic duplicated in mock store (areas / pricePerWalk / rating) to match cloud query semantics.
**Tests:** vitest — same filter test runs against both code paths, asserts identical result.

### Task 102: `bookingService` honours mock toggle

**Files:**
- Modify: `miniprogram/services/bookingService.ts`

**Goal:** `create / listMine / getById / cancel` operate on `mockDb.bookings`. `create` generates `_id` locally, applies same amount calculation as cloud fn (`pricePerWalk × (durationMin/30)`), writes `mockPayment: { paid: true }`. Mock idempotency stub (hash of openid+walkerId+date returns existing booking on duplicate).
**Tests:** vitest — create then listMine returns the doc; double-create with same key returns same id.

### Task 103: `reviewService.listForWalker` honours mock toggle

**Files:**
- Modify: `miniprogram/services/reviewService.ts` (submit path comes later in Task 32 when reviewService.submit is implemented; add mock branch then)

**Goal:** review reads served from mock store. Submit path stub returns success and inserts into `mockDb.reviews` + recomputes walker rating locally.
**Tests:** vitest — list filtered by walkerId; submit increments rating + reviewCount.

### Task 104: Mock-mode regression test sweep

**Files:**
- Modify: `package.json` test scripts (`test:mock`, `test:live`)
- Create: `tests/helpers/withMockFlag.ts` (vitest helper to override `__USE_MOCK__` per test file)

**Goal:** all existing unit + page tests pass with `__USE_MOCK__` set both true and false (live path uses the existing `wx.cloud` mock harness from Task 3). CI runs both modes.
**Expected:** `npm run test:mock && npm run test:live` both green.

---

**Pointer to subsequent tasks (Tasks 26, 27, 28, 29, 30, 32, 33, 34, 35):** each service-creation task gets one extra sub-step "honour `__USE_MOCK__` flag — branch reads to `mockDb`, writes to `mockDb` with realtime emitter". The plan body for those tasks is not duplicated here; the implementing engineer adds the mock branch at the same point they implement the live path. The pattern is fixed by Tasks 100–103.

---

## Stage 1.6 — Chat

> **Prereq:** Stage 1.5M (Tasks 98–104) complete. Every new service file below must honour `__USE_MOCK__` from inception.

### Task 26: `chatService`

**Files:**
- Create: `miniprogram/services/chatService.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/services/chatService.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { resetWxMock, setCallFnHandler, setDbHandler, mockCollection } from '../helpers'
import { listMessages, sendMessage } from '@/services/chatService'

beforeEach(() => {
  resetWxMock()
  setDbHandler({ collection: () => mockCollection([
    { _id: 'm1', bookingId: 'b1', senderId: 'o', senderRole: 'owner', text: 'hi', createdAt: 1 }
  ])})
})

describe('chatService', () => {
  it('listMessages returns reverse-chronological then reversed to ascending', async () => {
    const r = await listMessages('b1', 50)
    expect(r).toHaveLength(1)
    expect(r[0].text).toBe('hi')
  })

  it('sendMessage forwards to sendMessage fn', async () => {
    setCallFnHandler(async (n, d: any) => {
      expect(n).toBe('sendMessage')
      expect(d).toMatchObject({ bookingId: 'b1', text: 'hello' })
      return { ok: true, data: { messageId: 'm2' } }
    })
    const r = await sendMessage('b1', 'hello', 'owner')
    expect(r.messageId).toBe('m2')
  })
})
```

- [ ] **Step 2: Run test**

Run: `npm run test -- chatService`
Expected: FAIL.

- [ ] **Step 3: Implement `miniprogram/services/chatService.ts`**

```typescript
import { cloudCall } from './cloudCall'
import type { Message, MessageRole } from '@/models'

export async function listMessages(bookingId: string, limit = 50): Promise<Message[]> {
  const db = wx.cloud.database()
  const r = await db.collection('messages')
    .where({ bookingId })
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get()
  return (r.data as Message[]).slice().reverse()
}

export async function sendMessage(bookingId: string, text: string, role: MessageRole): Promise<{ messageId: string }> {
  return cloudCall<{ messageId: string }>('sendMessage', { bookingId, text, role })
}

export function watchNewMessages(bookingId: string, onNew: (m: Message) => void): () => void {
  const db = wx.cloud.database()
  const watcher = db.collection('messages')
    .where({ bookingId })
    .orderBy('createdAt', 'asc')
    .watch({
      onChange: (snap: any) => {
        for (const c of snap.docChanges || []) {
          if (c.dataType === 'add' || c.dataType === 'init') {
            onNew(c.doc as Message)
          }
        }
      },
      onError: (err: unknown) => console.error('[chat] watch error', err)
    })
  return () => { try { watcher.close() } catch { /* ignore */ } }
}
```

- [ ] **Step 4: Run test**

Run: `npm run test -- chatService`
Expected: 2 pass.

- [ ] **Step 5: Commit** (skip if not using git)

```bash
git add miniprogram/services/chatService.ts tests/services/chatService.test.ts
git commit -m "feat(chat): list, send, watch"
```

---

### Task 27: Cloud function `sendMessage`

**Files:**
- Create: `cloudfunctions/sendMessage/{package.json,tsconfig.json,index.ts}`

- [ ] **Step 1: Write the failing test**

Create `tests/cloudfn/sendMessage.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

const getWXContext = vi.fn()
const collection = vi.fn()

vi.mock('wx-server-sdk', () => ({
  default: {
    init: () => undefined,
    getWXContext: () => getWXContext(),
    database: () => ({ collection })
  }
}))

import handler from '../../cloudfunctions/sendMessage/index'

beforeEach(() => { getWXContext.mockReset(); collection.mockReset() })

describe('sendMessage', () => {
  it('inserts message when caller is owner of booking', async () => {
    getWXContext.mockReturnValue({ OPENID: 'owner-openid' })
    collection.mockImplementation((name: string) => {
      if (name === 'users')    return { where: () => ({ get: async () => ({ data: [{ _id: 'u1', openid: 'owner-openid' }] }) }) }
      if (name === 'bookings') return { doc: () => ({ get: async () => ({ data: { _id: 'b1', ownerId: 'u1', walkerId: 'w1' } }) }) }
      if (name === 'messages') return { add: async ({ data }: any) => ({ _id: 'm1', ...data }) }
      throw new Error(name)
    })
    const r = await handler({ bookingId: 'b1', text: 'hi', role: 'owner' }, {})
    expect(r).toMatchObject({ ok: true, data: { messageId: 'm1' } })
  })

  it('UNAUTH if no openid', async () => {
    getWXContext.mockReturnValue({})
    const r = await handler({ bookingId: 'b1', text: 'hi', role: 'owner' }, {})
    expect(r).toMatchObject({ ok: false, code: 'UNAUTH' })
  })

  it('VALIDATION on empty text', async () => {
    getWXContext.mockReturnValue({ OPENID: 'o' })
    const r = await handler({ bookingId: 'b1', text: '', role: 'owner' }, {})
    expect(r).toMatchObject({ ok: false, code: 'VALIDATION' })
  })
})
```

- [ ] **Step 2: Run test**

Run: `npm run test -- sendMessage`
Expected: FAIL.

- [ ] **Step 3: Create `cloudfunctions/sendMessage/package.json`**

```json
{ "name": "sendMessage", "version": "1.0.0", "main": "index.js", "dependencies": { "wx-server-sdk": "~2.6.3" } }
```

- [ ] **Step 4: Create `cloudfunctions/sendMessage/tsconfig.json`** (same shape as Task 9)

```json
{ "compilerOptions": { "target": "ES2020", "module": "CommonJS", "strict": true, "esModuleInterop": true, "skipLibCheck": true, "outDir": "." }, "include": ["./index.ts"] }
```

- [ ] **Step 5: Implement `cloudfunctions/sendMessage/index.ts`**

```typescript
import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import { assertString, assertOneOf, FnError } from '../shared/assert'
import type { Message, MessageRole, Booking } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

interface Payload { bookingId: string; text: string; role: MessageRole }

export default async function handler(event: Payload, _ctx: unknown): Promise<FnResult<{ messageId: string }>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')

    const bookingId = assertString(event.bookingId, 'bookingId')
    const text = assertString(event.text, 'text')
    const role = assertOneOf(event.role, ['owner', 'walker'] as const, 'role')

    const db = cloud.database()
    const users = await db.collection('users').where({ openid: wxCtx.OPENID }).get()
    if (users.data.length === 0) return err('NOT_FOUND', 'User missing')
    const userId = users.data[0]._id as string

    const b = await db.collection('bookings').doc(bookingId).get().catch(() => null as any)
    if (!b || !b.data) return err('NOT_FOUND', 'Booking not found')
    const booking = b.data as Booking

    // Owner check: real. Walker check (demo): any logged-in user w/ role=walker passes.
    if (role === 'owner' && booking.ownerId !== userId) {
      return err('FORBIDDEN', 'Not owner of booking')
    }

    const msg: Omit<Message, '_id'> = {
      bookingId, senderId: userId, senderRole: role, text, createdAt: Date.now()
    }
    const r = await db.collection('messages').add({ data: msg })
    return ok({ messageId: r._id as string })
  } catch (e: any) {
    if (e instanceof FnError) {
      const [code, msg] = e.message.split(': ')
      return err(code as any, msg || e.message)
    }
    console.error('[sendMessage]', e)
    return err('INTERNAL', e?.message || 'Internal')
  }
}
```

- [ ] **Step 6: Install fn deps**

Run: `cd cloudfunctions/sendMessage && npm install && cd ../..`

- [ ] **Step 7: Run test**

Run: `npm run test -- sendMessage`
Expected: 3 pass.

- [ ] **Step 8: Commit** (skip if not using git)

```bash
git add cloudfunctions/sendMessage/ tests/cloudfn/sendMessage.test.ts
git commit -m "feat(cloudfn): sendMessage with role-aware authz"
```

---

### Task 28: `chat-bubble` component + `pages/chat`

**Files:**
- Create: `miniprogram/components/chat-bubble/index.{json,wxml,wxss,ts}`
- Create: `miniprogram/pages/chat/index.{json,wxml,wxss,ts}`

- [ ] **Step 1: Create `chat-bubble/index.json`**

```json
{ "component": true, "usingComponents": {} }
```

- [ ] **Step 2: Create `chat-bubble/index.wxml`**

```xml
<view class="bubble {{mine ? 'mine' : 'theirs'}}">
  <view class="text">{{message.text}}</view>
  <view class="time">{{timeText}}</view>
</view>
```

- [ ] **Step 3: Create `chat-bubble/index.wxss`**

```css
.bubble { max-width:70%; padding:16rpx 20rpx; border-radius:16rpx; margin:8rpx 16rpx; }
.bubble.mine { background:#2563eb; color:#fff; align-self:flex-end; margin-left:auto; }
.bubble.theirs { background:#fff; color:#1f2329; align-self:flex-start; }
.text { font-size:28rpx; line-height:1.5; word-wrap:break-word; }
.time { font-size:20rpx; opacity:0.7; margin-top:4rpx; text-align:right; }
```

- [ ] **Step 4: Create `chat-bubble/index.ts`**

```typescript
import { formatTime } from '@/utils/date'
import type { Message } from '@/models'

Component({
  properties: {
    message: { type: Object, value: null as Message | null },
    mine:    { type: Boolean, value: false }
  },
  data: { timeText: '' },
  observers: {
    'message'(m: Message | null) {
      this.setData({ timeText: m ? formatTime(m.createdAt) : '' })
    }
  }
})
```

- [ ] **Step 5: Create `pages/chat/index.json`**

```json
{
  "navigationBarTitleText": "Chat",
  "usingComponents": {
    "chat-bubble":      "/components/chat-bubble/index",
    "t-input":          "tdesign-miniprogram/input/input",
    "t-button":         "tdesign-miniprogram/button/button",
    "loading-skeleton": "/components/loading-skeleton/index"
  }
}
```

- [ ] **Step 6: Create `pages/chat/index.wxml`**

```xml
<view class="page">
  <scroll-view scroll-y class="messages" scroll-into-view="m-{{lastId}}">
    <loading-skeleton wx:if="{{loading}}" count="3" />
    <chat-bubble wx:for="{{messages}}" wx:key="_id"
                 id="m-{{item._id}}"
                 message="{{item}}"
                 mine="{{item.senderRole === myRole}}" />
  </scroll-view>

  <view class="composer">
    <t-input model:value="{{draft}}" placeholder="Type a message" />
    <t-button theme="primary" size="medium" bindtap="onSend" loading="{{sending}}">Send</t-button>
  </view>
</view>
```

- [ ] **Step 7: Create `pages/chat/index.wxss`**

```css
.page { display:flex; flex-direction:column; height:100vh; background:#f5f5f5; }
.messages { flex:1; display:flex; flex-direction:column; padding:16rpx 0; }
.composer { display:flex; gap:12rpx; padding:16rpx; background:#fff; align-items:center; }
.composer t-input { flex:1; }
```

- [ ] **Step 8: Create `pages/chat/index.ts`**

```typescript
import { listMessages, sendMessage, watchNewMessages } from '@/services/chatService'
import { showAppError } from '@/utils/errorHandler'
import { isWalkerMode } from '@/utils/walkerMode'
import type { Message, MessageRole } from '@/models'

interface Data { messages: Message[]; draft: string; loading: boolean; sending: boolean; myRole: MessageRole; lastId: string }

Page<Data, WechatMiniprogram.IAnyObject>({
  data: { messages: [], draft: '', loading: true, sending: false, myRole: 'owner', lastId: '' },
  bookingId: '',
  unwatch: null as null | (() => void),

  async onLoad(q: Record<string, string>) {
    this.bookingId = q.bookingId
    this.setData({ myRole: isWalkerMode() ? 'walker' : 'owner' })
    try {
      const initial = await listMessages(this.bookingId, 50)
      this.setData({ messages: initial, loading: false, lastId: initial.at(-1)?._id || '' })
    } catch (e) {
      this.setData({ loading: false })
      showAppError(e)
    }
    this.unwatch = watchNewMessages(this.bookingId, (m) => {
      const exists = this.data.messages.some(x => x._id === m._id)
      if (exists) return
      const next = [...this.data.messages, m]
      this.setData({ messages: next, lastId: m._id })
    })
  },

  onUnload() { this.unwatch?.() },

  async onSend() {
    const text = this.data.draft.trim()
    if (!text) return
    this.setData({ sending: true, draft: '' })
    try {
      await sendMessage(this.bookingId, text, this.data.myRole)
      // realtime watcher will append; no manual setData needed
    } catch (e) {
      this.setData({ draft: text })
      showAppError(e)
    } finally {
      this.setData({ sending: false })
    }
  }
})
```

- [ ] **Step 9: Manual smoke** — open chat → send "hello" → see appear → switch walker-mode (Task 33) → reply.

- [ ] **Step 10: Commit** (skip if not using git)

```bash
git add miniprogram/components/chat-bubble miniprogram/pages/chat/
git commit -m "feat(chat): bubble component + chat page w/ realtime watcher"
```

---

## Stage 1.7 — Walk Report (Walker Mode)

### Task 29: `storageService` + `walkReportService`

**Files:**
- Create: `miniprogram/services/storageService.ts`
- Create: `miniprogram/services/walkReportService.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/services/walkReportService.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { resetWxMock, setCallFnHandler, setDbHandler, mockCollection } from '../helpers'
import { submitWalkReport, getWalkReportForBooking } from '@/services/walkReportService'

beforeEach(() => resetWxMock())

describe('walkReportService', () => {
  it('submit calls submitWalkReport fn', async () => {
    setCallFnHandler(async (n, d: any) => {
      expect(n).toBe('submitWalkReport')
      expect(d.bookingId).toBe('b1')
      return { ok: true, data: { reportId: 'r1' } }
    })
    const r = await submitWalkReport({ bookingId: 'b1', photos: [], notes: 'great walk', durationMin: 30, peeCount: 1, poopCount: 1 })
    expect(r.reportId).toBe('r1')
  })

  it('get reads from walkReports collection', async () => {
    setDbHandler({ collection: () => mockCollection([
      { _id: 'r1', bookingId: 'b1', photos: [], notes: '', durationMin: 30, peeCount: 0, poopCount: 0, walkerId: 'w1', createdAt: 1 }
    ])})
    const r = await getWalkReportForBooking('b1')
    expect(r?._id).toBe('r1')
  })
})
```

- [ ] **Step 2: Run test**

Run: `npm run test -- walkReportService`
Expected: FAIL.

- [ ] **Step 3: Implement `miniprogram/services/storageService.ts`**

```typescript
export async function uploadImage(localPath: string, prefix = 'chat'): Promise<string> {
  const cloudPath = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
  const r = await wx.cloud.uploadFile({ cloudPath, filePath: localPath })
  return r.fileID
}

export async function uploadImages(localPaths: string[], prefix = 'chat'): Promise<string[]> {
  return Promise.all(localPaths.map(p => uploadImage(p, prefix)))
}
```

- [ ] **Step 4: Implement `miniprogram/services/walkReportService.ts`**

```typescript
import { cloudCall } from './cloudCall'
import type { WalkReport } from '@/models'

export interface SubmitWalkReportInput {
  bookingId: string
  photos: string[]
  notes: string
  durationMin: number
  peeCount: number
  poopCount: number
}

export async function submitWalkReport(input: SubmitWalkReportInput): Promise<{ reportId: string }> {
  return cloudCall<{ reportId: string }>('submitWalkReport', input)
}

export async function getWalkReportForBooking(bookingId: string): Promise<WalkReport | null> {
  const db = wx.cloud.database()
  const r = await db.collection('walkReports').where({ bookingId }).limit(1).get()
  return (r.data[0] as WalkReport) || null
}
```

- [ ] **Step 5: Run test**

Run: `npm run test -- walkReportService`
Expected: 2 pass.

- [ ] **Step 6: Commit** (skip if not using git)

```bash
git add miniprogram/services/storageService.ts miniprogram/services/walkReportService.ts tests/services/walkReportService.test.ts
git commit -m "feat(walkreport): service + storage helpers"
```

---

### Task 30: Cloud functions `submitWalkReport` + `getWalkReport`

**Files:**
- Create: `cloudfunctions/submitWalkReport/{package.json,tsconfig.json,index.ts}`
- Create: `cloudfunctions/getWalkReport/{package.json,tsconfig.json,index.ts}`

- [ ] **Step 1: Write the failing test**

Create `tests/cloudfn/submitWalkReport.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

const getWXContext = vi.fn()
const collection = vi.fn()

vi.mock('wx-server-sdk', () => ({
  default: {
    init: () => undefined,
    getWXContext: () => getWXContext(),
    database: () => ({ collection })
  }
}))

import handler from '../../cloudfunctions/submitWalkReport/index'

beforeEach(() => { getWXContext.mockReset(); collection.mockReset() })

describe('submitWalkReport', () => {
  it('creates report and marks booking completed', async () => {
    getWXContext.mockReturnValue({ OPENID: 'walker-openid' })
    const updates: any[] = []
    collection.mockImplementation((name: string) => {
      if (name === 'users') return { where: () => ({ get: async () => ({ data: [{ _id: 'u9', openid: 'walker-openid' }] }) }) }
      if (name === 'bookings') return {
        doc: () => ({
          get: async () => ({ data: { _id: 'b1', walkerId: 'w1', ownerId: 'u1', status: 'accepted' } }),
          update: async (p: any) => { updates.push(p); return { stats: { updated: 1 } } }
        })
      }
      if (name === 'walkReports') return { add: async ({ data }: any) => ({ _id: 'r1', ...data }) }
      throw new Error(name)
    })
    const r = await handler({ bookingId: 'b1', photos: [], notes: 'x', durationMin: 30, peeCount: 0, poopCount: 0 }, {})
    expect(r).toMatchObject({ ok: true, data: { reportId: 'r1' } })
    expect(updates.length).toBe(1)
    expect(updates[0].data.status).toBe('completed')
  })
})
```

- [ ] **Step 2: Run test**

Run: `npm run test -- submitWalkReport`
Expected: FAIL.

- [ ] **Step 3: Create `cloudfunctions/submitWalkReport/package.json`** + `tsconfig.json` (same shape as Task 9)

```json
{ "name": "submitWalkReport", "version": "1.0.0", "main": "index.js", "dependencies": { "wx-server-sdk": "~2.6.3" } }
```

```json
{ "compilerOptions": { "target": "ES2020", "module": "CommonJS", "strict": true, "esModuleInterop": true, "skipLibCheck": true, "outDir": "." }, "include": ["./index.ts"] }
```

- [ ] **Step 4: Implement `cloudfunctions/submitWalkReport/index.ts`**

```typescript
import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import { assertString, assertNumber, FnError } from '../shared/assert'
import type { WalkReport, Booking } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

interface Payload { bookingId: string; photos: string[]; notes: string; durationMin: number; peeCount: number; poopCount: number }

export default async function handler(event: Payload, _ctx: unknown): Promise<FnResult<{ reportId: string }>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')

    const bookingId = assertString(event.bookingId, 'bookingId')
    assertString(event.notes, 'notes')
    assertNumber(event.durationMin, 'durationMin')
    assertNumber(event.peeCount, 'peeCount')
    assertNumber(event.poopCount, 'poopCount')

    const db = cloud.database()
    const b = await db.collection('bookings').doc(bookingId).get().catch(() => null as any)
    if (!b || !b.data) return err('NOT_FOUND', 'Booking not found')
    const booking = b.data as Booking
    if (booking.status === 'completed') return err('CONFLICT', 'Already completed')

    const users = await db.collection('users').where({ openid: wxCtx.OPENID }).get()
    const walkerUserId = users.data[0]?._id as string ?? 'demo-walker'

    const report: Omit<WalkReport, '_id'> = {
      bookingId,
      walkerId: booking.walkerId,    // demo: trust booking walker
      photos: event.photos ?? [],
      notes: event.notes,
      durationMin: event.durationMin,
      peeCount: event.peeCount,
      poopCount: event.poopCount,
      createdAt: Date.now()
    }
    const r = await db.collection('walkReports').add({ data: report })
    await db.collection('bookings').doc(bookingId).update({ data: { status: 'completed', updatedAt: Date.now() } })
    return ok({ reportId: r._id as string })
  } catch (e: any) {
    if (e instanceof FnError) {
      const [code, msg] = e.message.split(': ')
      return err(code as any, msg || e.message)
    }
    console.error('[submitWalkReport]', e)
    return err('INTERNAL', e?.message || 'Internal')
  }
}
```

- [ ] **Step 5: Create `cloudfunctions/getWalkReport/package.json`** + `tsconfig.json` (same shape)

```json
{ "name": "getWalkReport", "version": "1.0.0", "main": "index.js", "dependencies": { "wx-server-sdk": "~2.6.3" } }
```

```json
{ "compilerOptions": { "target": "ES2020", "module": "CommonJS", "strict": true, "esModuleInterop": true, "skipLibCheck": true, "outDir": "." }, "include": ["./index.ts"] }
```

- [ ] **Step 6: Implement `cloudfunctions/getWalkReport/index.ts`**

```typescript
import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import { assertString } from '../shared/assert'
import type { WalkReport } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

export default async function handler(event: { bookingId: string }, _ctx: unknown): Promise<FnResult<{ report: WalkReport | null }>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')
    const bookingId = assertString(event.bookingId, 'bookingId')
    const db = cloud.database()
    const r = await db.collection('walkReports').where({ bookingId }).limit(1).get()
    return ok({ report: (r.data[0] as WalkReport) || null })
  } catch (e: any) {
    return err('INTERNAL', e?.message || 'Internal')
  }
}
```

- [ ] **Step 7: Install fn deps**

Run: `for d in submitWalkReport getWalkReport; do (cd cloudfunctions/$d && npm install); done`

- [ ] **Step 8: Run tests**

Run: `npm run test -- submitWalkReport`
Expected: 1 pass.

- [ ] **Step 9: Commit** (skip if not using git)

```bash
git add cloudfunctions/submitWalkReport/ cloudfunctions/getWalkReport/ tests/cloudfn/submitWalkReport.test.ts
git commit -m "feat(cloudfn): submitWalkReport + getWalkReport"
```

---

### Task 31: `pages/_walker` — hidden walker-mode page

**Files:**
- Create: `miniprogram/pages/_walker/index.{json,wxml,wxss,ts}`

- [ ] **Step 1: Create `index.json`**

```json
{
  "navigationBarTitleText": "Walker Mode (Demo)",
  "usingComponents": {
    "t-button":           "tdesign-miniprogram/button/button",
    "t-textarea":         "tdesign-miniprogram/textarea/textarea",
    "t-stepper":          "tdesign-miniprogram/stepper/stepper",
    "t-input":            "tdesign-miniprogram/input/input",
    "loading-skeleton":   "/components/loading-skeleton/index",
    "empty-state":        "/components/empty-state/index"
  }
}
```

- [ ] **Step 2: Create `index.wxml`**

```xml
<view class="banner">Walker mode: {{walkerOn ? 'ON' : 'OFF'}}</view>
<t-button theme="primary" size="medium" bindtap="onToggle">{{walkerOn ? 'Disable walker mode' : 'Enable walker mode'}}</t-button>

<view wx:if="{{walkerOn}}" class="section">
  <view class="label">All bookings (demo)</view>
  <loading-skeleton wx:if="{{loading}}" count="3" />
  <empty-state wx:elif="{{bookings.length === 0}}" icon="📭" title="No bookings" />
  <view wx:for="{{bookings}}" wx:key="_id" class="bk" bindtap="onTapBk" data-id="{{item._id}}">
    <view class="bk-title">{{item.dateLabel}} · {{item.durationMin}}min</view>
    <view class="bk-sub">{{item.statusLabel}}</view>
  </view>
</view>

<view wx:if="{{showReport}}" class="report-form">
  <view class="label">Submit walk report for {{activeBookingId}}</view>
  <t-textarea model:value="{{notes}}" placeholder="How did the walk go?" />
  <view class="counter-row">
    <text>Duration min</text>
    <t-stepper value="{{durationMin}}" min="{{5}}" max="{{120}}" bind:change="onDur" />
  </view>
  <view class="counter-row">
    <text>💧 Pee</text>
    <t-stepper value="{{peeCount}}" min="{{0}}" max="{{20}}" bind:change="onPee" />
  </view>
  <view class="counter-row">
    <text>💩 Poop</text>
    <t-stepper value="{{poopCount}}" min="{{0}}" max="{{20}}" bind:change="onPoop" />
  </view>
  <view class="photo-row">
    <button size="mini" bindtap="onPickPhotos">+ Add photo</button>
    <image wx:for="{{photos}}" wx:key="*this" src="{{item}}" mode="aspectFill" class="thumb" />
  </view>
  <t-button theme="primary" block loading="{{submitting}}" bindtap="onSubmitReport">Submit report</t-button>
</view>
```

- [ ] **Step 3: Create `index.wxss`**

```css
.banner { padding:16rpx; background:#fef3c7; text-align:center; }
.section { padding:24rpx; }
.label { font-size:24rpx; color:#888; margin-bottom:12rpx; }
.bk { padding:24rpx; background:#fff; border-radius:12rpx; margin-bottom:12rpx; }
.bk-title { font-size:28rpx; }
.bk-sub { font-size:24rpx; color:#888; }
.report-form { padding:24rpx; background:#fff; margin-top:16rpx; display:flex; flex-direction:column; gap:16rpx; }
.counter-row { display:flex; justify-content:space-between; align-items:center; font-size:28rpx; }
.photo-row { display:flex; gap:12rpx; flex-wrap:wrap; align-items:center; }
.thumb { width:120rpx; height:120rpx; border-radius:8rpx; }
```

- [ ] **Step 4: Create `index.ts`**

```typescript
import { isWalkerMode, setWalkerMode } from '@/utils/walkerMode'
import { listMyBookings } from '@/services/bookingService'
import { submitWalkReport } from '@/services/walkReportService'
import { uploadImages } from '@/services/storageService'
import { showAppError } from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/date'
import { bus, BUS_EVENTS } from '@/utils/bus'
import { cloudCall } from '@/services/cloudCall'
import type { Booking } from '@/models'

interface Row extends Booking { dateLabel: string; statusLabel: string }
interface Data {
  walkerOn: boolean; loading: boolean; bookings: Row[]
  showReport: boolean; activeBookingId: string
  notes: string; durationMin: number; peeCount: number; poopCount: number
  photos: string[]; submitting: boolean
}

const STATUS: Record<Booking['status'], string> = {
  requested: 'Requested', accepted: 'Confirmed', declined: 'Declined',
  in_progress: 'In progress', completed: 'Completed', cancelled: 'Cancelled'
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    walkerOn: false, loading: false, bookings: [],
    showReport: false, activeBookingId: '',
    notes: '', durationMin: 30, peeCount: 0, poopCount: 0,
    photos: [], submitting: false
  },

  onLoad() { this.setData({ walkerOn: isWalkerMode() }); if (this.data.walkerOn) this.load() },
  onShow() { if (this.data.walkerOn) this.load() },

  onToggle() {
    const next = !this.data.walkerOn
    setWalkerMode(next)
    this.setData({ walkerOn: next, showReport: false })
    if (next) this.load()
  },

  async load() {
    this.setData({ loading: true })
    try {
      // Demo: walker sees all bookings. In production, filter by walker openid.
      const all = await cloudCall<Booking[]>('listAllBookings', {}).catch(() => listMyBookings())
      const rows: Row[] = all.map(b => ({ ...b, dateLabel: formatDateTime(b.date), statusLabel: STATUS[b.status] }))
      this.setData({ bookings: rows })
    } catch (e) { showAppError(e) }
    finally { this.setData({ loading: false }) }
  },

  onTapBk(e: WechatMiniprogram.BaseEvent) {
    this.setData({
      showReport: true,
      activeBookingId: String(e.currentTarget.dataset.id),
      notes: '', durationMin: 30, peeCount: 0, poopCount: 0, photos: []
    })
  },

  onDur(e: WechatMiniprogram.CustomEvent<{ value: number }>)  { this.setData({ durationMin: e.detail.value }) },
  onPee(e: WechatMiniprogram.CustomEvent<{ value: number }>)  { this.setData({ peeCount: e.detail.value }) },
  onPoop(e: WechatMiniprogram.CustomEvent<{ value: number }>) { this.setData({ poopCount: e.detail.value }) },

  async onPickPhotos() {
    const r = await wx.chooseMedia({ count: 3, mediaType: ['image'] })
    const ids = await uploadImages(r.tempFiles.map(f => f.tempFilePath), 'walkreport')
    this.setData({ photos: [...this.data.photos, ...ids] })
  },

  async onSubmitReport() {
    if (!this.data.notes.trim()) return wx.showToast({ title: 'Add notes', icon: 'none' })
    this.setData({ submitting: true })
    try {
      await submitWalkReport({
        bookingId: this.data.activeBookingId,
        photos: this.data.photos,
        notes: this.data.notes,
        durationMin: this.data.durationMin,
        peeCount: this.data.peeCount,
        poopCount: this.data.poopCount
      })
      bus.emit(BUS_EVENTS.WALK_REPORT_SUBMITTED, { bookingId: this.data.activeBookingId })
      wx.showToast({ title: 'Report submitted', icon: 'success' })
      this.setData({ showReport: false })
      this.load()
    } catch (e) { showAppError(e) }
    finally { this.setData({ submitting: false }) }
  }
})
```

- [ ] **Step 5: Create `cloudfunctions/listAllBookings/{package.json,tsconfig.json,index.ts}` (demo helper)**

```json
{ "name": "listAllBookings", "version": "1.0.0", "main": "index.js", "dependencies": { "wx-server-sdk": "~2.6.3" } }
```

```json
{ "compilerOptions": { "target": "ES2020", "module": "CommonJS", "strict": true, "esModuleInterop": true, "skipLibCheck": true, "outDir": "." }, "include": ["./index.ts"] }
```

```typescript
import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import type { Booking } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

export default async function handler(_event: unknown, _ctx: unknown): Promise<FnResult<Booking[]>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')
    const db = cloud.database()
    const r = await db.collection('bookings').orderBy('date', 'desc').limit(100).get()
    return ok(r.data as Booking[])
  } catch (e: any) {
    return err('INTERNAL', e?.message || 'Internal')
  }
}
```

Run: `cd cloudfunctions/listAllBookings && npm install && cd ../..`

- [ ] **Step 6: Manual smoke** — visit `/pages/_walker/index` → toggle on → bookings appear → tap → fill report → submit → owner page shows it.

- [ ] **Step 7: Commit** (skip if not using git)

```bash
git add miniprogram/pages/_walker/ cloudfunctions/listAllBookings/
git commit -m "feat(walker): demo walker-mode page + listAllBookings fn"
```

---

## Stage 1.8 — Review

### Task 32: Cloud functions `submitReview` + `listReviewsForBooking`

**Files:**
- Create: `cloudfunctions/submitReview/{package.json,tsconfig.json,index.ts}`
- Create: `cloudfunctions/listReviewsForBooking/{package.json,tsconfig.json,index.ts}`

- [ ] **Step 1: Write the failing test**

Create `tests/cloudfn/submitReview.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

const getWXContext = vi.fn()
const collection = vi.fn()

vi.mock('wx-server-sdk', () => ({
  default: {
    init: () => undefined,
    getWXContext: () => getWXContext(),
    database: () => ({ collection })
  }
}))

import handler from '../../cloudfunctions/submitReview/index'

beforeEach(() => { getWXContext.mockReset(); collection.mockReset() })

describe('submitReview', () => {
  it('inserts review when owner of completed booking and updates walker rating', async () => {
    getWXContext.mockReturnValue({ OPENID: 'owner-openid' })
    const walkerUpdates: any[] = []
    collection.mockImplementation((name: string) => {
      if (name === 'users') return { where: () => ({ get: async () => ({ data: [{ _id: 'u1', openid: 'owner-openid' }] }) }) }
      if (name === 'bookings') return { doc: () => ({ get: async () => ({ data: { _id: 'b1', ownerId: 'u1', walkerId: 'w1', status: 'completed' } }) }) }
      if (name === 'reviews') return {
        where: () => ({ get: async () => ({ data: [] }) }),
        add: async ({ data }: any) => ({ _id: 'rev1', ...data })
      }
      if (name === 'walkers') return {
        doc: () => ({
          get: async () => ({ data: { _id: 'w1', rating: 4, reviewCount: 2 } }),
          update: async (p: any) => { walkerUpdates.push(p); return { stats: { updated: 1 } } }
        })
      }
      throw new Error(name)
    })
    const r = await handler({ bookingId: 'b1', stars: 5, text: 'great' }, {})
    expect(r).toMatchObject({ ok: true, data: { reviewId: 'rev1' } })
    expect(walkerUpdates.length).toBe(1)
  })

  it('CONFLICT if review already exists', async () => {
    getWXContext.mockReturnValue({ OPENID: 'o' })
    collection.mockImplementation((name: string) => {
      if (name === 'users')    return { where: () => ({ get: async () => ({ data: [{ _id: 'u1', openid: 'o' }] }) }) }
      if (name === 'bookings') return { doc: () => ({ get: async () => ({ data: { _id: 'b1', ownerId: 'u1', walkerId: 'w1', status: 'completed' } }) }) }
      if (name === 'reviews')  return { where: () => ({ get: async () => ({ data: [{ _id: 'existing' }] }) }) }
      throw new Error(name)
    })
    const r = await handler({ bookingId: 'b1', stars: 5, text: 'x' }, {})
    expect(r).toMatchObject({ ok: false, code: 'CONFLICT' })
  })

  it('FORBIDDEN if not owner', async () => {
    getWXContext.mockReturnValue({ OPENID: 'somebody-else' })
    collection.mockImplementation((name: string) => {
      if (name === 'users')    return { where: () => ({ get: async () => ({ data: [{ _id: 'uX', openid: 'somebody-else' }] }) }) }
      if (name === 'bookings') return { doc: () => ({ get: async () => ({ data: { _id: 'b1', ownerId: 'u1', walkerId: 'w1', status: 'completed' } }) }) }
      throw new Error(name)
    })
    const r = await handler({ bookingId: 'b1', stars: 5, text: 'x' }, {})
    expect(r).toMatchObject({ ok: false, code: 'FORBIDDEN' })
  })
})
```

- [ ] **Step 2: Run test**

Run: `npm run test -- submitReview`
Expected: FAIL.

- [ ] **Step 3: Create the two fn directories with package.json/tsconfig.json shells**

For each of `submitReview` and `listReviewsForBooking`:

```json
{ "name": "<name>", "version": "1.0.0", "main": "index.js", "dependencies": { "wx-server-sdk": "~2.6.3" } }
```

```json
{ "compilerOptions": { "target": "ES2020", "module": "CommonJS", "strict": true, "esModuleInterop": true, "skipLibCheck": true, "outDir": "." }, "include": ["./index.ts"] }
```

- [ ] **Step 4: Implement `cloudfunctions/submitReview/index.ts`**

```typescript
import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import { assertString, assertOneOf, FnError } from '../shared/assert'
import type { Review, Booking } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

interface Payload { bookingId: string; stars: 1|2|3|4|5; text: string }

export default async function handler(event: Payload, _ctx: unknown): Promise<FnResult<{ reviewId: string }>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')

    const bookingId = assertString(event.bookingId, 'bookingId')
    const stars = assertOneOf(event.stars, [1, 2, 3, 4, 5] as const, 'stars')
    const text = assertString(event.text, 'text')

    const db = cloud.database()
    const users = await db.collection('users').where({ openid: wxCtx.OPENID }).get()
    if (users.data.length === 0) return err('NOT_FOUND', 'User missing')
    const ownerUserId = users.data[0]._id as string

    const b = await db.collection('bookings').doc(bookingId).get().catch(() => null as any)
    if (!b || !b.data) return err('NOT_FOUND', 'Booking not found')
    const booking = b.data as Booking
    if (booking.ownerId !== ownerUserId) return err('FORBIDDEN', 'Not your booking')
    if (booking.status !== 'completed') return err('VALIDATION', 'Booking not completed')

    const existing = await db.collection('reviews').where({ bookingId }).get()
    if (existing.data.length > 0) return err('CONFLICT', 'Already reviewed')

    const review: Omit<Review, '_id'> = {
      bookingId, ownerId: ownerUserId, walkerId: booking.walkerId,
      stars, text, createdAt: Date.now()
    }
    const r = await db.collection('reviews').add({ data: review })

    // Update walker aggregate
    const wRes = await db.collection('walkers').doc(booking.walkerId).get().catch(() => null as any)
    if (wRes && wRes.data) {
      const w = wRes.data as { rating: number; reviewCount: number }
      const nextCount = (w.reviewCount || 0) + 1
      const nextRating = +((((w.rating || 0) * (w.reviewCount || 0)) + stars) / nextCount).toFixed(1)
      await db.collection('walkers').doc(booking.walkerId).update({ data: { rating: nextRating, reviewCount: nextCount } })
    }

    return ok({ reviewId: r._id as string })
  } catch (e: any) {
    if (e instanceof FnError) {
      const [code, msg] = e.message.split(': ')
      return err(code as any, msg || e.message)
    }
    console.error('[submitReview]', e)
    return err('INTERNAL', e?.message || 'Internal')
  }
}
```

- [ ] **Step 5: Implement `cloudfunctions/listReviewsForBooking/index.ts`**

```typescript
import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import { assertString } from '../shared/assert'
import type { Review } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

export default async function handler(event: { bookingId: string }, _ctx: unknown): Promise<FnResult<{ reviews: Review[] }>> {
  try {
    const bookingId = assertString(event.bookingId, 'bookingId')
    const db = cloud.database()
    const r = await db.collection('reviews').where({ bookingId }).get()
    return ok({ reviews: r.data as Review[] })
  } catch (e: any) {
    return err('INTERNAL', e?.message || 'Internal')
  }
}
```

- [ ] **Step 6: Install deps**

Run: `for d in submitReview listReviewsForBooking; do (cd cloudfunctions/$d && npm install); done`

- [ ] **Step 7: Run test**

Run: `npm run test -- submitReview`
Expected: 3 pass.

- [ ] **Step 8: Commit** (skip if not using git)

```bash
git add cloudfunctions/submitReview/ cloudfunctions/listReviewsForBooking/ tests/cloudfn/submitReview.test.ts
git commit -m "feat(cloudfn): submitReview + listReviewsForBooking + walker rating recompute"
```

---

### Task 33: `pages/review` — submit review

**Files:**
- Create: `miniprogram/pages/review/index.{json,wxml,wxss,ts}`

- [ ] **Step 1: Create `index.json`**

```json
{
  "navigationBarTitleText": "Leave a Review",
  "usingComponents": {
    "star-rating": "/components/star-rating/index",
    "t-textarea":  "tdesign-miniprogram/textarea/textarea",
    "t-button":    "tdesign-miniprogram/button/button"
  }
}
```

- [ ] **Step 2: Create `index.wxml`**

```xml
<view class="page">
  <view class="label">How was your walk?</view>
  <star-rating value="{{stars}}" bind:change="onStars" />

  <view class="label">Tell us more</view>
  <t-textarea model:value="{{text}}" placeholder="On time? Friendly? Photos shared?" />

  <t-button theme="primary" block loading="{{submitting}}" bindtap="onSubmit">Submit</t-button>
</view>
```

- [ ] **Step 3: Create `index.wxss`**

```css
.page { padding:24rpx; display:flex; flex-direction:column; gap:24rpx; background:#fff; min-height:100vh; }
.label { font-size:28rpx; color:#1f2329; font-weight:500; }
```

- [ ] **Step 4: Create `index.ts`**

```typescript
import { submitReview } from '@/services/reviewService'
import { showAppError } from '@/utils/errorHandler'
import { bus, BUS_EVENTS } from '@/utils/bus'

interface Data { stars: 1|2|3|4|5; text: string; submitting: boolean }

Page<Data, WechatMiniprogram.IAnyObject>({
  data: { stars: 5, text: '', submitting: false },
  bookingId: '',

  onLoad(q: Record<string, string>) { this.bookingId = q.bookingId },

  onStars(e: WechatMiniprogram.CustomEvent<{ value: number }>) {
    this.setData({ stars: e.detail.value as 1|2|3|4|5 })
  },

  async onSubmit() {
    if (!this.data.text.trim()) return wx.showToast({ title: 'Please add a comment', icon: 'none' })
    this.setData({ submitting: true })
    try {
      await submitReview({ bookingId: this.bookingId, stars: this.data.stars, text: this.data.text })
      bus.emit(BUS_EVENTS.REVIEW_SUBMITTED, { bookingId: this.bookingId })
      wx.showToast({ title: 'Thanks!', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 600)
    } catch (e) {
      showAppError(e)
    } finally {
      this.setData({ submitting: false })
    }
  }
})
```

- [ ] **Step 5: Commit** (skip if not using git)

```bash
git add miniprogram/pages/review/
git commit -m "feat(review): submit page"
```

---

## Stage 1.9 — Profile, Navigation, Polish

### Task 34: `pages/me` + tabBar wiring

**Files:**
- Create: `miniprogram/pages/me/index.{json,wxml,wxss,ts}`
- Modify: `miniprogram/app.json` (add `tabBar`)

- [ ] **Step 1: Create `pages/me/index.json`**

```json
{
  "navigationBarTitleText": "Me",
  "usingComponents": {
    "t-cell":        "tdesign-miniprogram/cell/cell",
    "t-cell-group":  "tdesign-miniprogram/cell-group/cell-group",
    "t-button":      "tdesign-miniprogram/button/button",
    "dog-form":      "/components/dog-form/index"
  }
}
```

- [ ] **Step 2: Create `pages/me/index.wxml`**

```xml
<view class="page">
  <view class="hero">
    <view class="avatar"></view>
    <view>
      <view class="name">{{profile.name || 'Pet Owner'}}</view>
      <view class="oid">openid: {{openid}}</view>
    </view>
  </view>

  <t-cell-group title="My dogs">
    <t-cell wx:for="{{profile.dogs}}" wx:key="id" title="{{item.name}}" note="{{item.breed || ''}}" />
    <t-cell title="+ Add a dog" hover bind:click="onAddDogToggle" />
  </t-cell-group>

  <dog-form wx:if="{{addingDog}}" bind:save="onSaveDog" />

  <t-cell-group title="Demo">
    <t-cell title="Seed demo data" hover bind:click="onSeed" />
    <t-cell title="Open walker mode" hover bind:click="onWalker" />
  </t-cell-group>
</view>
```

- [ ] **Step 3: Create `pages/me/index.wxss`**

```css
.page { padding:16rpx; }
.hero { display:flex; gap:20rpx; padding:24rpx; background:#fff; border-radius:16rpx; align-items:center; margin-bottom:16rpx; }
.avatar { width:120rpx; height:120rpx; border-radius:60rpx; background:linear-gradient(135deg,#2563eb,#16a34a); }
.name { font-size:32rpx; font-weight:600; }
.oid { font-size:20rpx; color:#888; word-break:break-all; }
```

- [ ] **Step 4: Create `pages/me/index.ts`**

```typescript
import { cloudCall } from '@/services/cloudCall'
import { showAppError } from '@/utils/errorHandler'
import type { User, Dog } from '@/models'

interface Data { profile: User | null; openid: string; addingDog: boolean }

Page<Data, WechatMiniprogram.IAnyObject>({
  data: { profile: null, openid: '', addingDog: false },

  onShow() { this.load() },

  async load() {
    try {
      const profile = await cloudCall<User>('getMyProfile', {})
      const openid = (getApp<IAppOption>().globalData?.openid) || ''
      this.setData({ profile, openid })
    } catch (e) { showAppError(e) }
  },

  onAddDogToggle() { this.setData({ addingDog: !this.data.addingDog }) },

  async onSaveDog(e: WechatMiniprogram.CustomEvent<{ dog: Dog }>) {
    const dogs = [...((this.data.profile?.dogs) || []), e.detail.dog]
    try {
      await cloudCall('updateProfile', { name: this.data.profile?.name || 'Pet Owner', dogs })
      this.setData({ addingDog: false })
      this.load()
    } catch (e2) { showAppError(e2) }
  },

  async onSeed() {
    if (!__DEV__) return wx.showToast({ title: 'Dev only', icon: 'none' })
    wx.showLoading({ title: 'Seeding…' })
    try {
      const r = await cloudCall<{ walkers: number; reviews: number }>('seedDemoData', {})
      wx.showToast({ title: `Seeded ${r.walkers}w/${r.reviews}r`, icon: 'success' })
    } catch (e) { showAppError(e) }
    finally { wx.hideLoading() }
  },

  onWalker() { wx.navigateTo({ url: '/pages/_walker/index' }) }
})
```

- [ ] **Step 5: Update `miniprogram/app.json` to add tabBar**

```json
{
  "pages": [
    "pages/home/index",
    "pages/bookings/index",
    "pages/me/index",
    "pages/walker/index",
    "pages/booking-new/index",
    "pages/booking/index",
    "pages/chat/index",
    "pages/review/index",
    "pages/_walker/index"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTitleText": "PetBacker",
    "navigationBarTextStyle": "black"
  },
  "tabBar": {
    "color": "#888888",
    "selectedColor": "#2563eb",
    "backgroundColor": "#ffffff",
    "borderStyle": "white",
    "list": [
      { "pagePath": "pages/home/index",     "text": "Home" },
      { "pagePath": "pages/bookings/index", "text": "Bookings" },
      { "pagePath": "pages/me/index",       "text": "Me" }
    ]
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json",
  "lazyCodeLoading": "requiredComponents",
  "cloud": true
}
```

> NOTE: `pages/home/index`, `pages/bookings/index`, `pages/me/index` must be the first three pages in the list to satisfy WeChat tabBar registration rules.

- [ ] **Step 6: Commit** (skip if not using git)

```bash
git add miniprogram/pages/me/ miniprogram/app.json
git commit -m "feat(me): profile page + tabBar wiring"
```

---

### Task 35: Offline banner + global error wiring

**Files:**
- Create: `miniprogram/components/offline-banner/index.{json,wxml,wxss,ts}`
- Modify: `miniprogram/app.wxss` (banner anchor styles)
- Modify: `miniprogram/pages/home/index.json` (register banner — or wrap in app — see below)

> WeChat miniprograms have no app-level layout; the banner must be added per page that needs it. Approach: include in `pages/home`, `pages/bookings`, `pages/me` (the tab pages). Hidden when online.

- [ ] **Step 1: Create `offline-banner/index.json`**

```json
{ "component": true, "usingComponents": {} }
```

- [ ] **Step 2: Create `offline-banner/index.wxml`**

```xml
<view wx:if="{{!online}}" class="banner">📵 离线 — Offline</view>
```

- [ ] **Step 3: Create `offline-banner/index.wxss`**

```css
.banner { padding:12rpx; background:#fef3c7; color:#92400e; text-align:center; font-size:24rpx; }
```

- [ ] **Step 4: Create `offline-banner/index.ts`**

```typescript
import { bus } from '@/utils/bus'
import { isOnline } from '@/utils/network'

Component({
  data: { online: true },
  attached() {
    this.setData({ online: isOnline() })
    this.unsub = bus.on('network:changed', (v: boolean) => this.setData({ online: v }))
  },
  detached() { this.unsub?.() },
  methods: {},
  unsub: null as null | (() => void)
} as any)
```

- [ ] **Step 5: Register `offline-banner` in the 3 tab pages**

In `pages/home/index.json`, `pages/bookings/index.json`, `pages/me/index.json` add to `usingComponents`:

```json
"offline-banner": "/components/offline-banner/index"
```

And in each page's `.wxml`, add as first child:

```xml
<offline-banner />
```

- [ ] **Step 6: Commit** (skip if not using git)

```bash
git add miniprogram/components/offline-banner miniprogram/pages/home/index.json miniprogram/pages/home/index.wxml miniprogram/pages/bookings/index.json miniprogram/pages/bookings/index.wxml miniprogram/pages/me/index.json miniprogram/pages/me/index.wxml
git commit -m "feat(network): offline banner on tab pages"
```

---

### Task 36: Deploy cloud env + functions + verify e2e in simulator

**Files:** (none new — config + commands)

- [ ] **Step 1: Create CloudBase environment**

In WeChat 开发者工具 → 云开发 → 环境管理 → 新建环境.
Choose ID matching `pet-dev` (or update `miniprogram/app.ts` env value).

- [ ] **Step 2: Upload all cloud functions**

In devtools, right-click each fn directory under `cloudfunctions/` → 上传并部署：云端安装依赖.

Or batch via CLI:

Run:
```bash
for d in login updateProfile getMyProfile createBooking listBookings getBooking cancelBooking sendMessage submitWalkReport getWalkReport submitReview listReviewsForBooking listAllBookings seedDemoData; do
  /Applications/wechatwebdevtools.app/Contents/MacOS/cli cloud functions deploy \
    --project /Users/juntingma/Developer/jt/project/miniprogram/pet \
    --env pet-dev --names $d
done
```

Expected: each fn reports `deploy success`.

- [ ] **Step 3: Set DB read rules**

In CloudBase console → 数据库 → for each collection:

| Collection | Permissions |
|---|---|
| walkers | All users read; admin write |
| reviews | All users read; admin write |
| users | Only creator read; admin write |
| bookings | Only creator read; admin write |
| messages | Only creator read; admin write |
| walkReports | Only creator read; admin write |

(Cloud functions run as admin, so "admin write" gating is correct.)

- [ ] **Step 4: Seed**

Open the app in simulator → tab Me → "Seed demo data" → expect toast "Seeded 3w/6r".

- [ ] **Step 5: Run E2E happy path manually**

1. Home shows 3 walkers.
2. Tap Mei Lin → profile renders → tap Book.
3. Add a dog "Rex" → pick tomorrow 10:00 → 45 min → submit.
4. Toast "Booking confirmed" → land on booking detail.
5. Open chat → send "Hi!" → message appears.
6. Tab Me → Open walker mode → toggle on → see your booking.
7. Tap booking → fill notes "Great walk", pee 2, poop 1 → submit report.
8. Disable walker mode → go to Bookings → Past tab → booking now completed.
9. Tap booking → walk report renders → tap "Leave a review" → 5 stars + text → submit.
10. Re-open walker profile → rating updated.

If any step fails, debug before continuing.

- [ ] **Step 6: Commit deployment notes (optional)**

```bash
git add docs/superpowers/plans/
git commit -m "docs: deployment checklist appended"
```

---

### Task 37: E2E automation via devtools `cli auto`

**Files:**
- Create: `tests/e2e/happy-path.ts`
- Create: `tests/e2e/run.sh`

- [ ] **Step 1: Create `tests/e2e/happy-path.ts`**

```typescript
// Run with WeChat devtools automation: cli auto.
// Docs: https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/api.html
import automator from 'miniprogram-automator'

async function main() {
  const mini = await automator.launch({
    cliPath: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
    projectPath: '/Users/juntingma/Developer/jt/project/miniprogram/pet'
  })

  try {
    // 1. Home loads & shows seeded walkers
    let page = await mini.currentPage()
    if (page.path !== 'pages/home/index') {
      await mini.reLaunch('/pages/home/index')
      page = await mini.currentPage()
    }
    await page.waitFor(2000)
    const cards = await page.$$('.card')
    if (cards.length < 1) throw new Error('Expected walker cards on home')

    // 2. Tap first walker
    await cards[0].tap()
    await mini.waitFor(1500)
    page = await mini.currentPage()
    if (page.path !== 'pages/walker/index') throw new Error('Did not navigate to walker page')

    // 3. Tap Book
    const bookBtn = await page.$('.cta t-button')
    await bookBtn.tap()
    await mini.waitFor(1000)
    page = await mini.currentPage()
    if (page.path !== 'pages/booking-new/index') throw new Error('Did not navigate to booking-new')

    // 4. Booking submission omitted: requires UI input. Asserted manually.

    console.log('E2E happy-path passed (browse → walker → book navigation)')
    await mini.close()
  } catch (e) {
    console.error('E2E failed:', e)
    await mini.close()
    process.exit(1)
  }
}

main()
```

> NOTE: Full booking flow automation needs typing into TDesign inputs, which `miniprogram-automator` does not cleanly support. The script asserts the navigation chain only; manual exec of Task 36 Step 5 covers the rest.

- [ ] **Step 2: Add `miniprogram-automator` dependency**

```bash
npm install --save-dev miniprogram-automator
```

- [ ] **Step 3: Create `tests/e2e/run.sh`**

```bash
#!/bin/bash
set -e
# Pre-req: seed via the app or `cli cloud functions invoke`
npx tsx tests/e2e/happy-path.ts
```

- [ ] **Step 4: Run it**

Run: `bash tests/e2e/run.sh`
Expected: console "E2E happy-path passed". A simulator window opens automatically.

- [ ] **Step 5: Commit** (skip if not using git)

```bash
git add tests/e2e/ package.json package-lock.json
git commit -m "test(e2e): cli-auto navigation smoke for happy path"
```

---

## Stage 1.M — CloudBase Activation & Live Switch (Tasks 105–110)

**Goal:** Stop running on mock; route the same Phase-1 surface to a real CloudBase environment. Flip `__USE_MOCK__ = false` and ship live. Most of this is operational (console clicks, deploys), with minimal code changes.

**Execution order:** Run **after Stage 1.9** (full Phase-1 UI complete in mock mode) and **before any real-device demo or pilot**. Stage 1.M is the gate between "demoable locally" and "demoable on a phone with real cloud calls".

**Hard prereqs (manual, not in this plan):**
- WeChat appid registered as 小程序 type (currently `wxab4f24c2c7243737`).
- Admin access to mp.weixin.qq.com for that appid.
- TDesign npm built locally (Task 2 done).

### Task 105: Activate CloudBase + create `pet-dev` environment

**Files:** none (manual console action). Record env ID in `docs/runbook.md` (create if absent).

- [ ] **Step 1:** Open WeChat 开发者工具 with the project; click 云开发 in toolbar; accept terms; create environment named `pet-dev` (must match `wx.cloud.init({ env: 'pet-dev' })` in `miniprogram/app.ts`).
- [ ] **Step 2:** Note env ID, region, and quota tier. Free tier is fine for Phase 1.
- [ ] **Step 3:** In CloudBase console, create the six collections (`users`, `walkers`, `reviews`, `bookings`, `messages`, `walkReports`) as empty.
- [ ] **Step 4:** Apply DB rules per spec §7 ("DB rules" — public read on `walkers` + `reviews`; deny client read/write on private collections).
- [ ] **Step 5:** Sanity check — `wx.cloud.init({ env: 'pet-dev' })` in a quick repl page returns without `-601034`.

**Expected:** CloudBase panel in devtools shows env, collections listed, DB rules saved.

### Task 106: Deploy all cloud functions

**Files:** all of `cloudfunctions/*` (already exist; this is a deploy, not edit).

- [ ] **Step 1:** Right-click each fn folder (`login`, `updateProfile`, `createBooking`, `cancelBooking`, `sendMessage`, `submitReview`, `submitWalkReport`, `seedDemoData`) → 上传并部署：云端安装依赖.
- [ ] **Step 2:** Verify each appears in CloudBase console → 云函数 list with status `部署成功`.
- [ ] **Step 3:** Tail logs in CloudBase console while invoking each via the test panel with minimal payload; confirm `FnResult` envelope returns.
- [ ] **Step 4:** (Optional) wire `npm run deploy:fns` script that calls `cli cloud functions deploy --env pet-dev --name <fn>` for each fn, for repeatable CI.

**Expected:** all 8 fns deployed; manual invoke returns `{ ok: true, ... }` or expected `{ ok: false, code: ... }`.

### Task 107: Live-mode smoke matrix

**Files:** new `tests/smoke/live.md` (manual checklist).

- [ ] **Step 1:** Toggle `__USE_MOCK__` to `false` in `miniprogram/utils/env.ts` locally (do NOT commit yet).
- [ ] **Step 2:** Run through each Stage-1 flow in devtools simulator:
  - Boot (silent login completes; openid populated).
  - Browse walkers (empty result expected — no seed yet).
  - Walker profile (404 path — empty-state renders).
  - Booking, chat, walk report, review (each blocked at empty data; not a defect, sets up Task 108).
- [ ] **Step 3:** Record any error code that surfaces (`UNAUTH`, `NOT_FOUND`, etc.); fix in fn handlers if real bugs surface.
- [ ] **Step 4:** Revert local `__USE_MOCK__` to `true` until Task 109. Do not commit the toggle yet.

**Expected:** no `-601034`, no unhandled exceptions, only expected empty-state UX.

### Task 108: Seed live demo data via `seedDemoData`

**Files:** none (invokes existing fn).

- [ ] **Step 1:** Invoke `seedDemoData` from CloudBase console test panel (or `cli cloud functions invoke seedDemoData --env pet-dev`). Idempotent — safe to re-run.
- [ ] **Step 2:** Confirm in console: `walkers` has 3 docs, `reviews` has 5 docs, `users` has the dev openid + 1 dog.
- [ ] **Step 3:** With `__USE_MOCK__ = false` locally, reload simulator and confirm home page renders 3 walkers identical to mock-mode output.

**Expected:** mock-mode and live-mode renders are visually indistinguishable apart from the missing mock banner.

### Task 109: Flip `__USE_MOCK__` to `false` (live by default)

**Files:**
- Modify: `miniprogram/utils/env.ts` (`__USE_MOCK__ = false`)
- Verify: `miniprogram/components/mock-banner/` renders nothing (dead code path)
- Verify: `miniprogram/mocks/**` files are still in tree but unreferenced when flag false

- [ ] **Step 1:** Change the constant; run typecheck + lint.
- [ ] **Step 2:** Run `npm run test` — both `test:mock` and `test:live` still green.
- [ ] **Step 3:** Run E2E (Task 37 happy path) end-to-end against live env.
- [ ] **Step 4:** Commit.

```bash
git add miniprogram/utils/env.ts
git commit -m "feat(env): switch __USE_MOCK__ to false — live CloudBase default"
```

**Expected:** simulator behaves identically to Task 108 spot-check; banner gone; chat realtime works via real `db.watch`; bookings persist server-side.

### Task 110: Remove mock module files (pilot-readiness gate)

**Files (delete):**
- `miniprogram/mocks/` (entire directory)
- `miniprogram/components/mock-banner/` (entire directory)
- `miniprogram/utils/env.ts` (delete file OR strip to only `__DEV__` if other uses)
- Remove `__USE_MOCK__` references and dead-branch code in services (`authService`, `walkerService`, `bookingService`, `reviewService`, `chatService`, `walkReportService`, `storageService`)
- Remove `test:mock` script + `tests/helpers/withMockFlag.ts`

- [ ] **Step 1:** Delete files above.
- [ ] **Step 2:** Run typecheck, lint, test — green.
- [ ] **Step 3:** Visual check — no banner, no mock toggle in any service.
- [ ] **Step 4:** Run E2E against live env one more time.
- [ ] **Step 5:** Commit.

```bash
git add -A
git commit -m "chore(mocks): remove mock-mode infrastructure pre-pilot"
```

**Gate:** Task 110 is the official "no more mocks" checkpoint. Cross-reference with the Phase 5 launch checklist (Task 96). Do not start Phase 2 caregiver onboarding (Tasks 38–50) against live data until Task 110 is done — caregiver flows must never observe mock owners or mock bookings.

---

## Spec Coverage Self-Check (Phase 1 ↔ Loulou stories ↔ Tasks)

| Loulou story | Phase 1 scope | Implemented in task |
|---|---|---|
| c1 phone/wx register | wx.login + openid only (no phone) | Tasks 9, 10, 11 |
| c2 location search + filter | area string + maxPrice + minRating filter | Tasks 13, 15, 16 |
| c3 caregiver detail | walker profile + reviews list | Tasks 17, 18, 19 |
| c4 booking + payment | mock-pay UI only | Tasks 20, 21, 22, 23 |
| c6 submit review | 5-star + text | Tasks 32, 33 |
| c7 pet profile | inline `dog-form`, embedded `users.dogs[]` | Task 20 (inline) + Task 34 (manage) |
| c8 in-app messaging | text only, realtime via `db.watch` | Tasks 26, 27, 28 |
| c9 orders + payment records | bookings list + detail (no invoice export) | Tasks 24, 25 |
| p5 status updates (walker side) | demo walker-mode walk report | Tasks 29, 30, 31 |
| — TabBar | Home · Bookings · Me | Task 34 |
| — Offline banner | global watcher | Task 35 |
| — Cloud env + DB rules deploy | first-time setup | Task 36 |
| — E2E happy path | manual + cli-auto | Tasks 36 (manual) + 37 (automated nav) |
| — FnResult / AppError contract | trust boundary contract | Task 5 |
| — usePageState helper | loading/empty/error/loaded | Task 7 |
| — Walker-mode demo flag | session-only, no real auth | Task 7 + Task 31 |
| — Seed demo data | idempotent dev seeding | Task 12 |
| — Hybrid architecture | reads direct, writes via fn | Tasks 13, 17, 21, 22, 26, 27 etc. |

**Out of Phase 1 (future phases — not held against this plan):** c5 push, c10 favourites, c11 modify/cancel, c12 customer service, p1 certification, p2 service publishing, p3 calendar, p4 accept/decline, p6 settlement, p7 caregiver self-profile, p8 quick-replies, p9 withdrawal, p10 view pet profile, p11 reverse review, p12 emergency CS, boarding/daycare/house-visit, insurance, admin moderation.

**Mock-mode mini-stage:** Tasks 98–104 (Stage 1.5M) add the `__USE_MOCK__` toggle + in-memory store + banner so Phase 1 is demoable without a live CloudBase. Tasks 105–110 (Stage 1.M) activate CloudBase, deploy fns, seed live data, flip the flag, and delete mock modules.

## Loulou Roadmap — Phases After This Plan

These are tracked in the spec (Section 9) and become their own brainstorm → spec → plan cycles. Listed here so engineers know where in-Phase-1 shortcuts (mock payment, walker-mode flag, `walkers` collection name, auto-accept booking) are scheduled to be replaced.

| Phase | Theme | Story IDs | Notable replacements of Phase-1 shortcuts |
|---|---|---|---|
| 2 | Caregiver self-service | p1, p2, p3, p4, p7 | walker-mode flag → real caregiver auth; auto-accept → requested/accepted/declined flow |
| 3 | Multi-service (boarding/daycare/house-visit) | c2 full | `walkers` collection → `caregivers` with `serviceType[]` |
| 4 | Payments + settlement | c4 full, c9 full, p6, p9 | mock pay → real WeChat Pay merchant + escrow + withdrawal (T+1) |
| 5 | Trust & safety | c12, p12, insurance | adds CS entry, incident workflow, optional insurance |
| 6 | Engagement | c5, c10, c11, p11 | subscribe-message push, favourites, cancellation/refund engine, bi-directional review |
| 7 | Operations | — | admin moderation portal, tiered commission, loyalty programme |
| 8 | Optional surfaces | — | live GPS, 住家守护, i18n |

---

## Phase 2 — Caregiver Self-Service (Tasks 38–50)

**Goal:** Replace Phase 1 walker-mode hack with real caregiver onboarding, certification, service publishing, calendar, and accept/decline flow. Covers stories **p1, p2, p3, p4, p7, p8 (quick-reply foundation), p10**.

**Prereq:** Spec for Phase 2 (`docs/superpowers/specs/2026-XX-XX-loulou-phase-2-caregiver.md`) — write before starting tasks. Each task below is one execution unit.

### Task 38: New collections + types (`caregivers`, `applications`, `services`, `availability`)
- **Story IDs:** p1, p2, p3
- **Files:** `miniprogram/models/index.ts`, `cloudfunctions/shared/types.ts`
- **Goal:** Add Caregiver, CaregiverApplication, ServiceItem, AvailabilitySlot TS types. Define state machines: application `submitted → reviewing → approved | rejected`; caregiver `pending → active | suspended`.
- **Deps:** none (additive). Keep Phase 1 `walkers` collection untouched in this task.

### Task 39: Cloud fn `applyCaregiver` + caregiver-scope assertions
- **Story IDs:** p1
- **Files:** `cloudfunctions/applyCaregiver/`, `cloudfunctions/shared/assert.ts`
- **Goal:** Owner submits caregiver application (name, contact, service-area, intro). Creates `applications` row, returns `applicationId`. Add `assertCaregiver(openid)` helper.
- **Tests:** vitest fn unit; assertion when openid already has approved caregiver.

### Task 40: Cloud fn `submitCertification` + storage upload
- **Story IDs:** p1
- **Files:** `cloudfunctions/submitCertification/`, `miniprogram/services/storageService.ts` (reuse), `cloudfunctions/shared/types.ts`
- **Goal:** Application uploads ID card photo, real-name string, indoor environment photos (≥3 for boarding). Stores fileIDs on application doc.
- **Tests:** payload validation; photo count rule for boarding-intent applications.

### Task 41: Identity verification provider integration
- **Story IDs:** p1
- **Files:** `cloudfunctions/verifyIdentity/`, env config
- **Goal:** Tencent Faceid API call (real-name + ID match). Records verification outcome on application. Handles provider errors gracefully (retry, mark for manual review).
- **Deps:** Task 40. Requires Tencent Cloud account + Faceid product enabled.
- **Tests:** mock provider success/fail; PIPL retention rule (raw ID image deleted after verification).

### Task 42: Admin review fns + state machine transitions
- **Story IDs:** p1
- **Files:** `cloudfunctions/approveApplication/`, `cloudfunctions/rejectApplication/`, `cloudfunctions/shared/assert.ts` (add `assertAdmin`)
- **Goal:** Admin-only fns to approve/reject. Approval creates `caregivers` row from application; rejection records reason. Admin identity = openids on allow-list constant (Phase 7 replaces with real RBAC).
- **Tests:** non-admin call rejected; double-approve idempotent.

### Task 43: Service publishing cloud fns (`publishService`, `updateService`, `unpublishService`)
- **Story IDs:** p2
- **Files:** `cloudfunctions/publishService/`, `cloudfunctions/updateService/`, `cloudfunctions/unpublishService/`
- **Goal:** Caregiver creates service items: `{ caregiverId, serviceType, priceUnit, basePrice, surcharges, active }`. Service type ∈ {walking, boarding, daycare, houseVisit}. Validation: caregiver must be approved; boarding requires indoor photos.
- **Tests:** validation matrix per service type; surcharge schema.

### Task 44: Availability calendar fns (`setAvailability`, `getAvailability`)
- **Story IDs:** p3
- **Files:** `cloudfunctions/setAvailability/`, `cloudfunctions/getAvailability/`
- **Goal:** Slot model — `{ caregiverId, date, slots: ('AM'|'PM'|'overnight')[], booked: string[] }`. Caregiver sets multi-day pattern; existing accepted bookings auto-lock slots. Slot resolution decided in Phase 2 spec.
- **Tests:** booked slot cannot be unset; bulk-set across date range.

### Task 45: Booking state machine — requested → accepted | declined
- **Story IDs:** p4, p10
- **Files:** modify `cloudfunctions/createBooking/`, new `cloudfunctions/acceptBooking/`, `cloudfunctions/declineBooking/`
- **Goal:** `createBooking` now writes `status: 'requested'` (no auto-accept). Caregiver gets booking request; can view pet profile (p10); accepts or declines with reason. Auto-decline after 4h if no action. Updates availability slot lock on accept.
- **Deps:** Tasks 38, 44.
- **Tests:** state transitions; auto-decline timer; availability lock contention.

### Task 46: Caregiver onboarding wizard (`pages/caregiver-apply/`)
- **Story IDs:** p1
- **Files:** new `miniprogram/pages/caregiver-apply/` (multi-step), service `caregiverService.ts`
- **Goal:** Wizard steps: intro → real-name + ID → environment photos → service types → service-area. Submit triggers `applyCaregiver` + `submitCertification` + `verifyIdentity`. Status screen polls application state.
- **Tests:** miniprogram-simulate per step; happy + sad path.

### Task 47: Caregiver dashboard (`pages/caregiver-home/`)
- **Story IDs:** p3, p4, p9 (stub)
- **Files:** new `miniprogram/pages/caregiver-home/`
- **Goal:** Three tabs: Today (today's bookings, post-walk-report CTAs), Requests (pending booking requests with accept/decline), Calendar (read view, edit deep-link).
- **Deps:** Tasks 44, 45.

### Task 48: Caregiver self-edit profile (`pages/caregiver-profile-edit/`)
- **Story IDs:** p7, p2
- **Files:** new `miniprogram/pages/caregiver-profile-edit/`, `caregiverService.update`
- **Goal:** Edit bio, photos, service items (price, surcharges), service area. Re-publishing updates search index immediately.

### Task 49: Calendar editor (`pages/caregiver-calendar/`)
- **Story IDs:** p3
- **Files:** new `miniprogram/pages/caregiver-calendar/`, service wrapper
- **Goal:** Month view, multi-select dates, bulk slot toggle, blackout. Booked slots disabled (visual indicator).

### Task 50: Migrate walker-mode hack → real caregiver auth
- **Story IDs:** (removes Phase 1 shortcut)
- **Files:** `cloudfunctions/shared/assert.ts` (`assertWalkerOfBooking`), `miniprogram/utils/walkerMode.ts` (delete), `pages/_walker/` (delete or `__DEV__`-only), all chat/walk-report fns
- **Goal:** Replace permissive walker-mode flag with `assertCaregiverOfBooking(openid, bookingId)` checking `caregiver.openid === booking.caregiverId`'s openid. Remove session flag entirely from prod build.
- **Risk:** breaks Phase 1 demo loop until caregiver onboarded — coordinate via seed-data update.

---

## Phase 3 — Multi-Service Support (Tasks 51–56)

**Goal:** Generalise `walkers` → `caregivers` with `serviceType[]`. Boarding / daycare / house-visit live alongside walking. Covers story **c2 full**.

### Task 51: Data migration `walkers` → `caregivers`
- **Story IDs:** c2
- **Files:** `cloudfunctions/migrateWalkersToCaregivers/` (one-off), update DB rules
- **Goal:** Copy `walkers` docs to `caregivers` with `serviceType: ['walking']` and `services: [{serviceType:'walking', priceUnit:'perWalk', basePrice: pricePerWalk}]`. Preserve `_id`. Rename references in services, fns. Keep `walkers` as a deprecated read-only view for one release cycle.
- **Tests:** integration — Phase 1 home page still works post-migration.

### Task 52: Per-service-type pricing units
- **Story IDs:** c2, p2
- **Files:** `miniprogram/models/index.ts`, `cloudfunctions/createBooking/`
- **Goal:** `priceUnit ∈ { perWalk(30m), perVisit, perNight, perDay }`. `createBooking` computes amount from service-item priceUnit × quantity (overnight count, visit count, etc.). Surcharges layered.

### Task 53: Service-type tabs on home page
- **Story IDs:** c2
- **Files:** `miniprogram/pages/home/`
- **Goal:** Top tab bar: 寄养 / 日托 / 遛狗 / 上门. Filter passes `serviceType` into `caregiverService.list`. Default tab from last-used.

### Task 54: Service-type filter + GPS location
- **Story IDs:** c2 (location), c3 (calendar in detail)
- **Files:** `miniprogram/pages/home/`, `caregiverService.list`, walker profile `pages/walker/` → `pages/caregiver/`
- **Goal:** Use `wx.getLocation` for distance sort. Manual address override. Caregiver detail page now shows live availability calendar (uses Task 44 `getAvailability`).

### Task 55: Per-service booking form variants (`pages/booking-new/`)
- **Story IDs:** c4 (partial)
- **Files:** existing booking-new page + new components per service type
- **Goal:** Boarding form (check-in/check-out dates, # nights). Daycare form (date list). House-visit form (visit slots). Walking form unchanged. Single `pages/booking-new` orchestrates a service-type-specific subform component.

### Task 56: Extend booking schema with service-specific fields
- **Story IDs:** c4
- **Files:** `miniprogram/models/index.ts`, `cloudfunctions/createBooking/`
- **Goal:** Booking doc gains `serviceType`, `serviceItemId`, optional `nights`, `visits[]`. Backwards-compatible with Phase 1 walking bookings.

---

## Phase 4 — Real Payments + Settlement (Tasks 57–66)

**Goal:** Replace mock pay. Real WeChat Pay merchant integration, escrow, caregiver settlement, withdrawal, payment records. Covers **c4 full, c9 full, p6, p9**.

**Hard prereq:** 商户号 (merchant ID) issued by WeChat Pay. Application started in Phase 2 timeframe (risks doc §2.1).

### Task 57: 商户号 onboarding + WeChat Pay sandbox keys
- **Story IDs:** c4, p6
- **Files:** env config, secret vault setup
- **Goal:** Non-code task: issue merchant ID, configure API v3 keys, set notify URL to cloud-fn endpoint. Document key rotation policy.

### Task 58: Real payment cloud fn `createPayment`
- **Story IDs:** c4
- **Files:** `cloudfunctions/createPayment/`, modify `cloudfunctions/createBooking/`
- **Goal:** After `createBooking` returns `requested` status, client calls `createPayment(bookingId)` → returns `wx.requestPayment` params. Server records pre-auth amount in escrow ledger. Listener for payment-result webhook updates booking + ledger.
- **Tests:** sandbox payment success / fail / timeout.

### Task 59: Escrow state model
- **Story IDs:** c4, p6
- **Files:** `miniprogram/models/index.ts`, `cloudfunctions/shared/types.ts`
- **Goal:** Booking gains `payment: { state: 'unpaid'|'held'|'released'|'refunded', txId, amount, commission, payoutAmount }`. State only transitions via cloud fn.

### Task 60: Cloud fn `releasePayment` (T+48h post-complete)
- **Story IDs:** p6
- **Files:** `cloudfunctions/releasePayment/`, scheduled trigger (cron)
- **Goal:** 48h after booking marked complete, scheduler releases held funds: caregiver ledger credit (amount − commission). Skips if dispute opened (Phase 5 hook).

### Task 61: Cloud fn `refundPayment` (cancel paths)
- **Story IDs:** c4, c11 (partial)
- **Files:** `cloudfunctions/refundPayment/`
- **Goal:** Calls WeChat refund API. Updates booking.payment.state. Handles full / partial refund per cancellation policy (policy lives in Task 76 but the calculation hook exists here).
- **Tests:** sandbox refund; idempotent on retry.

### Task 62: Ledger collection + earnings/withdrawal fns
- **Story IDs:** p9, c9
- **Files:** new `ledger` collection, `cloudfunctions/getEarnings/`, `cloudfunctions/requestWithdrawal/`, `cloudfunctions/getPaymentRecords/`
- **Goal:** Ledger row per movement (credit / debit / payout / fee). `getEarnings` aggregates per caregiver. `requestWithdrawal` validates min amount, sends WeChat enterprise transfer, marks ledger.
- **Tests:** double-withdrawal blocked; balance never negative.

### Task 63: Caregiver earnings + withdrawal page
- **Story IDs:** p9
- **Files:** new `miniprogram/pages/caregiver-earnings/`
- **Goal:** Total earned, available balance, ledger list, withdrawal CTA. Withdrawal form with bank/WeChat selection.

### Task 64: Owner payment record + invoice export
- **Story IDs:** c9
- **Files:** new `miniprogram/pages/payments/`, cloud fn `exportInvoice`
- **Goal:** List of all paid bookings with breakdown (base, surcharge, platform fee, total). Export as image or share-card.

### Task 65: Commission engine
- **Story IDs:** p9 (commission line), business config
- **Files:** `cloudfunctions/shared/commission.ts`, config collection
- **Goal:** Pluggable rule: flat %, tiered by GMV, early-adopter override. Read once per payment; cached for batch.

### Task 66: Money-layer idempotency
- **Story IDs:** c4, p6
- **Files:** `cloudfunctions/shared/idempotency.ts`, modify pay/refund/withdrawal fns
- **Goal:** All money fns require `idempotencyKey` from client; first-write-wins. Replays return same result.
- **Tests:** dual-submit returns single transaction.

---

## Phase 5 — Trust & Safety (Tasks 67–72)

**Goal:** Customer service entry, incident workflow, optional insurance, background check wiring. Covers **c12, p12, insurance**.

### Task 67: Tickets collection + cloud fn `createTicket`
- **Story IDs:** c12, p12
- **Files:** new `tickets` collection, `cloudfunctions/createTicket/`, evidence upload
- **Goal:** Ticket schema: `{ userId, bookingId?, category, description, evidenceFileIds[], severity, status, slaDueAt }`. Auto-route by category. SLA timer.

### Task 68: Customer service page (owner + caregiver)
- **Story IDs:** c12, p12
- **Files:** new `miniprogram/pages/support/`, deep-link from booking detail header
- **Goal:** Category picker, free-text + evidence upload, ticket-history list, ticket-detail with admin replies.

### Task 69: Admin ticket queue + incident-response playbook
- **Story IDs:** c12, p12
- **Files:** admin portal (deferred to Phase 7) — for Phase 5, manual review via CloudBase console + Lark/Feishu webhook on ticket creation
- **Goal:** Webhook to staff channel on new ticket. Documented response playbook (whose responds, escalation, comms template).

### Task 70: Background check integration
- **Story IDs:** p1 (deeper)
- **Files:** modify `cloudfunctions/verifyIdentity/`, new `cloudfunctions/runBackgroundCheck/`
- **Goal:** Add criminal-record check via licensed provider on caregiver application. Outcome stored on application. Block approval on adverse result.
- **Deps:** legal review (risks §2.2).

### Task 71: Insurance partner integration
- **Story IDs:** insurance (C-priority)
- **Files:** `cloudfunctions/quoteInsurance/`, `cloudfunctions/bindInsurance/`
- **Goal:** Quote at checkout, bind on payment. Policy doc stored on booking. Partner choice deferred to business.
- **Deps:** partnership signed (risks §2.3).

### Task 72: Optional insurance line in checkout
- **Story IDs:** insurance
- **Files:** modify `pages/booking-new/`, modify `cloudfunctions/createPayment/`
- **Goal:** Insurance toggle on payment screen. Amount added to total. Disclosure copy reviewed by legal.

---

## Phase 6 — Engagement & Lifecycle (Tasks 73–79)

**Goal:** Push, favourites, modify/cancel, bi-directional review, chat quick-replies. Covers **c5, c10, c11, p11, p8 (quick-replies)**.

### Task 73: Subscribe-message templates + cloud fn `sendSubscribeMsg`
- **Story IDs:** c5
- **Files:** `cloudfunctions/sendSubscribeMsg/`, opt-in component
- **Goal:** Register templates in WeChat console (booking-confirmed, walk-report-posted, review-reminder, ticket-updated). Cloud fn sends to opted-in users. Opt-in handled via `wx.requestSubscribeMessage` on relevant CTAs.

### Task 74: Trigger wiring
- **Story IDs:** c5
- **Files:** modify `acceptBooking`, `submitWalkReport`, `releasePayment`, `createTicket`
- **Goal:** Each event triggers `sendSubscribeMsg` to the relevant user. Idempotent (do not double-send on retry).

### Task 75: Favourites collection + service + UI
- **Story IDs:** c10
- **Files:** new `favourites` collection, `favouriteService.ts`, modify `pages/walker|caregiver/`, new `pages/favourites/`
- **Goal:** Toggle on caregiver detail page. List page with availability badge. Push notification if favourited caregiver opens new dates (optional).

### Task 76: Cancellation policy engine + refund calc
- **Story IDs:** c11
- **Files:** `cloudfunctions/shared/cancellationPolicy.ts`, modify `cancelBooking`, modify `refundPayment`
- **Goal:** Rule: full refund >72h before, 50% 24–72h, no refund <24h. Caregiver no-show = full refund + caregiver penalty. Per-service overrides.
- **Tests:** policy matrix.

### Task 77: Modify-booking flow
- **Story IDs:** c11
- **Files:** new `cloudfunctions/modifyBooking/`, modify `pages/booking/`
- **Goal:** Owner requests date change → caregiver must re-confirm. State `modification_requested → accepted | rejected`. If rejected, booking reverts.

### Task 78: Bi-directional review (caregiver → owner+pet)
- **Story IDs:** p11
- **Files:** modify `reviews` collection (`subjectType: 'caregiver' | 'owner' | 'pet'`), new `pages/review-owner/`, modify `submitReview`
- **Goal:** After complete + 48h, caregiver prompted to review. Tags taxonomy (按时, 沟通顺畅, 宠物友好). Reviews of owners/pets visible to other caregivers; not to other owners.

### Task 79: Chat quick-reply templates
- **Story IDs:** p8
- **Files:** modify `pages/chat/`, new template config
- **Goal:** Caregiver-side composer shows preset replies ("已接到狗狗", "正在路上", "刚到家"). Customisable per caregiver. Owner side has different presets.

---

## Phase 7 — Operations (Tasks 80–83)

**Goal:** Admin moderation portal, fraud signal, tiered commission + loyalty. No direct user-story IDs — operational.

### Task 80: Admin web portal
- **Files:** new repo or web miniprogram `admin/`
- **Goal:** RBAC, queues for applications/tickets/reviews, ledger viewer, manual transaction tools. Replace `assertAdmin` allow-list with real RBAC.

### Task 81: Moderation queues
- **Files:** admin portal pages + cloud fns
- **Goal:** Pending-review-content queue (reviews, environment photos). Filter, approve, hide, ban.

### Task 82: Fraud signal collection
- **Files:** signal collector cloud fn, ledger watcher
- **Goal:** Flag unusual patterns: chargebacks, refund-rate, multi-account openid via device fingerprint, off-platform leakage signals from chat regex.

### Task 83: Tiered commission + loyalty configuration
- **Files:** config collection + admin editor
- **Goal:** GMV-tiered commission per caregiver. Early-adopter rate persists for N months. Loyalty rewards (reduced commission after X bookings).

---

## Phase 8 — Optional Surfaces (Tasks 84–86)

**Goal:** Live GPS, live-in service, i18n. Defer until core economics work.

### Task 84: Live GPS walk tracking
- **Story IDs:** (PetBacker parity, not in core stories)
- **Files:** `cloudfunctions/postLocation/`, new `pages/walk-live/`, map component
- **Goal:** Caregiver location stream during walk (every 30s); owner sees map with breadcrumbs. Privacy: location discarded after walk ends.

### Task 85: Live-in service (住家守护)
- **Story IDs:** future service
- **Files:** new service type in Tasks 52 + 55 modelling
- **Goal:** Multi-night, owner's home, supplementary fields (pickup/dropoff times, key handover, house tour photos).

### Task 86: i18n framework
- **Files:** new `miniprogram/i18n/`, refactor copy strings
- **Goal:** Locale switcher (zh-CN default, en for SG/overseas Chinese). Library: `mini-i18n` or custom.

---

## Cross-Cutting Tasks (Tasks 87–97)

**Goal:** Foundational concerns not tied to a single phase. Can be slotted in alongside whichever phase needs them; some are blockers for public launch.

### Task 87: Analytics event taxonomy + `wx.reportEvent` wiring
- **Story IDs:** none (operational)
- **Files:** new `miniprogram/utils/analytics.ts`, event constants
- **Goal:** Defined event list: page_view, search, view_caregiver, start_booking, complete_booking, send_message, submit_review, support_ticket. Wired across pages.

### Task 88: Staging vs prod CloudBase env separation
- **Story IDs:** none (risks §5.4)
- **Files:** `miniprogram/app.ts` (env constant), CI config, `seedDemoData` guard
- **Goal:** Two envs (`pet-dev`, `pet-prod`). `seedDemoData` refuses on prod. Per-env config (Faceid keys, merchant ID, etc.).
- **Phase to land:** before any public preview (Phase 1 hardening).

### Task 89: PIPL consent flow + privacy policy + data export/delete
- **Story IDs:** none (risks §2.5)
- **Files:** new `pages/privacy/`, modify auth flow, new cloud fns `exportMyData`, `deleteMyAccount`
- **Goal:** Consent checkbox on first launch. Privacy policy text (legal-reviewed). Data export returns user JSON. Deletion anonymises bookings/messages but keeps caregiver-side history.
- **Phase to land:** before public launch.

### Task 90: Chat content moderation (Tencent CMS API)
- **Story IDs:** none (risks §2.4)
- **Files:** modify `cloudfunctions/sendMessage/`, new `cloudfunctions/reportMessage/`
- **Goal:** Server-side scan via Tencent CMS before persisting. Block clear violations. Add "report" CTA on chat bubbles.
- **Phase to land:** before public launch.

### Task 91: Image client-side compression + storage lifecycle
- **Story IDs:** none (risks §3.4)
- **Files:** `miniprogram/services/storageService.ts`, CloudBase lifecycle config
- **Goal:** Resize to ≤1600px, JPEG q=0.8 before upload. Lifecycle: chat images purged at 12 months, walk-report photos kept 24 months.
- **Phase to land:** Phase 1 hardening (cheap, big cost win).

### Task 92: Telemetry / cost monitoring + alerting
- **Story IDs:** none (risks §3.1)
- **Files:** new `cloudfunctions/costReport/` (scheduled), Lark/Feishu webhook
- **Goal:** Daily aggregate of fn invocations, DB reads, storage, egress. Threshold alert.

### Task 93: Brand theming + design tokens
- **Story IDs:** none (spec §12)
- **Files:** `miniprogram/app.wxss`, new `miniprogram/styles/tokens.wxss`
- **Goal:** Loulou colour palette, typography, spacing tokens. Override TDesign theme variables.

### Task 94: DB index list + migration scripts
- **Story IDs:** none (risks §3.10)
- **Files:** `cloudfunctions/_indexes.md`, deploy script
- **Goal:** Documented index list. Indexes created during deploy: caregivers(serviceType, area, rating), bookings(ownerId, date), bookings(caregiverId, status), messages(bookingId, createdAt), reviews(subjectId, createdAt), ledger(caregiverId, createdAt).

### Task 95: Onboarding funnel analytics
- **Story IDs:** none (risks §5.2)
- **Files:** depends on Task 87
- **Goal:** Track caregiver-apply step completion. Owner first-booking funnel. Surface dropout points to founders weekly.

### Task 96: Pilot launch criteria checklist
- **Story IDs:** none (risks §5.6)
- **Files:** new `docs/launch-checklist.md`
- **Goal:** Documented go/no-go list for pilot (≥50 caregivers, CS staffed, ICP filed, privacy policy live, sandbox-tested payments, monitoring dashboards). Founder sign-off.

### Task 97: Multi-pet / multi-species data model
- **Story IDs:** c7 (deeper)
- **Files:** migrate `users.dogs[]` → `pets` collection with `species: 'dog'|'cat'|'other'`
- **Goal:** Pet as first-class entity with own profile, vaccines, photos. Booking references `petIds[]`. Backwards-compatible migration from embedded `dogs[]`.
- **Phase to land:** Phase 2 or 3 alongside service-type expansion.

---

## Full Story → Task Coverage Matrix

| Story | Phase 1 task(s) | Future-phase task(s) | Status when all tasks done |
|---|---|---|---|
| c1 register | 9, 10, 11 | 89 (consent) | Full |
| c2 location search | 13, 15, 16 | 53, 54 | Full (GPS + service tabs) |
| c3 caregiver detail | 17, 18, 19 | 54 (live calendar) | Full |
| c4 booking + payment | 20–23 | 55, 58, 59, 65, 66, 72 | Full (real pay + insurance) |
| c5 status updates | (none) | 73, 74 | Full (push) |
| c6 submit review | 32, 33 | — | Full |
| c7 pet profile | 20 (inline), 34 | 97 (multi-species) | Full |
| c8 messaging | 26, 27, 28 | 79 (quick-replies), 90 (moderation) | Full |
| c9 orders + records | 24, 25 | 64 (invoice) | Full |
| c10 favourites | (none) | 75 | Full |
| c11 modify/cancel | 22 (fn only) | 61, 76, 77 | Full |
| c12 owner CS | (none) | 67, 68, 69 | Full |
| p1 caregiver cert | (none) | 38–42, 46, 70 | Full |
| p2 service publishing | (none) | 43, 48, 52 | Full |
| p3 calendar | (none) | 44, 47, 49 | Full |
| p4 accept/decline | (none) | 45, 47 | Full |
| p5 status post | 29, 30, 31 | 74 (push trigger) | Full |
| p6 settle | (none) | 58–62, 65 | Full |
| p7 caregiver profile | (none) | 48 | Full |
| p8 chat | 26, 27, 28 | 79 | Full |
| p9 earnings/withdrawal | (none) | 62, 63, 65 | Full |
| p10 view pet before accept | (none) | 45 (in accept flow) | Full |
| p11 reverse review | (none) | 78 | Full |
| p12 caregiver CS | (none) | 67, 68, 69 | Full |
| Insurance | (none) | 71, 72 | Full |
| Admin / moderation | (none) | 42, 80, 81 | Full |

All 24 user stories + cross-cutting insurance + admin moderation now have task ownership. Tasks 87–97 cover non-story foundations needed for public launch.

## Notes for the Implementing Engineer

- **CloudBase env name** is hard-coded as `pet-dev` in `miniprogram/app.ts`. If your env ID differs, change that one line and `cli cloud functions deploy --env <id>` in Task 36.
- **`touristappid`** allows simulator-only use. To preview on a real device or run `miniprogram-automator`, you need a real appid registered at mp.weixin.qq.com.
- **TDesign build step** (Task 2) must be re-run after any `npm install` that updates `tdesign-miniprogram`.
- **No git assumed** — every commit step is optional. If using git, start with `git init` before Task 1's commit.
- **Test execution.** Most tasks use TDD: write the failing test first, then implement. Don't skip the "run-fail" step — it confirms the test is exercising the new code.
- **Demo walker auth is permissive.** This is deliberate (spec calls it out). When converting to a real walker product, replace `assertWalkerOfBooking` placeholder logic with `walker.openid === ctx.OPENID`.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-16-petbacker-dogwalking-mvp.md`. Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
