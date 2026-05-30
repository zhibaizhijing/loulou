# CLAUDE.md — Loulou repository agent guide

This file is loaded by Claude Code into every conversation that opens this repo. Read it before doing anything else.

## What this project is

**Loulou** — WeChat Mini-Program pet-care marketplace (寄养 / 日托 / 遛狗 / 上门). Target: closed pilot in one city, 2026-09. Native TypeScript miniprogram + TDesign Weapp UI + WeChat CloudBase backend.

AppID: `wxab4f24c2c7243737` (小程序 type). CloudBase env (when activated): `pet-dev`.

## Authoritative documents (read these before coding)

1. **Spec — P0 scope (current):** `docs/superpowers/specs/2026-05-19-loulou-p0-mvp-scope.md`
2. **Spec — Phase 1 base architecture:** `docs/superpowers/specs/2026-05-16-petbacker-dogwalking-mvp-design.md`
3. **Plan — P0 + P1 (current):** `docs/superpowers/plans/2026-05-19-loulou-p0-launch.md`
4. **Plan — Phase 1 task bodies:** `docs/superpowers/plans/2026-05-16-petbacker-dogwalking-mvp.md`
5. **Risks:** `docs/superpowers/risks/2026-05-18-loulou-risks.md`
6. **Progress tracker:** `docs/superpowers/progress/2026-05-19-p0-progress.md`
7. **Cloud cutover runbook:** `docs/superpowers/runbooks/2026-05-19-deferred-cloud-verification.md` — open this only when ~80% of P0 code is shipped in mock and you're ready for Stage 1.M.

If spec and plan conflict, **spec wins** and the plan must be updated.

## Progress tracking — MANDATORY for every agent

**Whenever you complete a task, before ending your turn, you MUST update `docs/superpowers/progress/2026-05-19-p0-progress.md`:**

1. Tick the task's checkbox `- [ ]` → `- [x]`.
2. Update the stage-level count line (e.g., "Stage P0-A: 2/7 done").
3. Update the top "Snapshot" `Tasks complete` count.
4. Append one line at the **top** of §7 Changelog, format:
   `- YYYY-MM-DD — Task N (Stage X) — short note of what shipped + any caveats`
5. If the task uncovered a new risk, add it to `docs/superpowers/risks/2026-05-18-loulou-risks.md` and reference the risk ID in the changelog line.
6. If you only completed *part* of a task, do not tick the box; instead add a sub-bullet beneath it noting which sub-steps are done.

Skipping this step is **not optional** — the progress file is the only durable record across agent sessions. Without it, the next agent has no idea what's been done.

### When to update progress

- After committing code that implements a task
- After completing a non-code task (e.g., a prereq, doc edit, deploy)
- When discovering a task was *already* done (verify, then tick)
- When a task is split, re-scoped, or merged with another (note in changelog)

### When NOT to update progress

- Mid-task explorations or experiments
- Failed attempts that produced no shippable artifact
- Conversational answers to user questions

## Code conventions

- TypeScript strict mode everywhere.
- Pages NEVER call `wx.cloud.*` or `db.*` directly — only services do.
- All writes go through cloud functions; client reads only public collections (`caregivers`, `reviews`) directly.
- Cloud-fn error contract: `FnResult<T> = { ok: true, data: T } | { ok: false, code: ErrCode, msg: string }` — see `cloudfunctions/shared/result.ts` and `miniprogram/services/cloudCall.ts`.
- Every cloud fn begins with `assertAuth(event)` then resource-specific assertions before any DB op.
- Tunable thresholds (cancellation tiers, coupon values, strike limits, recommend counts, commission rate, quick-reply templates) read from the `config` singleton — never hardcode.
- Mock mode is gated by `__USE_MOCK__` in `miniprogram/utils/env.ts`. Every service branches on this flag at file scope; mock data lives in `miniprogram/mocks/`.

## Stage execution order (do not skip ahead)

1. Phase 1 Tasks 1–37 + Stage 1.5M (Tasks 98–104) — mock-mode complete (mostly done; see progress file).
2. Stage 1.M (Tasks 105–110) — CloudBase activation + cutover from mock to live.
3. P0 Stages A → M (Tasks 38–148 selectively) — see plan §4 for parallelism rules. P0-A + P0-B first, then the rest in parallel as bandwidth allows.
4. P1 stages — after pilot goes live.

## Critical-path non-engineering prereqs (start early; track in progress file §4)

商户号 / 服务号 / Tencent Faceid / ICP / Lark webhook / caregiver recruitment / legal review. These have lead times in weeks; they block specific P0 stages.

## When in doubt

- Read the spec section relevant to your stage before writing code.
- Reuse predecessor patterns from Phase 1 (FnResult unwrap, usePageState, error toast mapping). Don't invent new shapes.
- If a decision is needed that isn't already locked in the spec §9 decisions table, **ask the user first**. Don't guess.
- Never delete `miniprogram/mocks/` until Stage 1.M Task 110 — other agents depend on the mock path.
- Never flip `__USE_MOCK__` to `false` outside Stage 1.M Task 109 (must coordinate with cloud activation + deploy).

## Tests

- Vitest for unit + cloud fn handler tests.
- `miniprogram-simulate` for page tests.
- Two suites for services that branch on mock: `serviceX.test.ts` (live path with mocked SDK) + `serviceX.mock.test.ts` (mock-store path). Helper: `tests/helpers/withMockFlag.ts`.
- `npm run test` runs both suites; both must be green before claiming a task complete.

## What to do when you start a session

1. Read `docs/superpowers/progress/2026-05-19-p0-progress.md` §1 Snapshot + §7 Changelog tail.
2. Identify the highest-priority unchecked task in the lowest-numbered stage.
3. Read the relevant spec section and the predecessor task body (in `2026-05-16-petbacker-dogwalking-mvp.md`) for any task that absorbs predecessor work.
4. Implement the task with TDD where the predecessor task body specifies it.
5. Update the progress file (see above).
