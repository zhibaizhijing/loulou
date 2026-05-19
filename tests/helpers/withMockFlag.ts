// withMockFlag.ts
//
// Vitest's `vi.mock` is hoisted at parse time, so you cannot wrap it in a helper.
// To force a test file onto the LIVE path, paste this at the top of the file
// BEFORE any other imports:
//
//   import { vi } from 'vitest'
//   vi.mock('@/utils/env', () => ({ __USE_MOCK__: false }))
//
// To force a test file onto the MOCK path:
//
//   import { vi } from 'vitest'
//   vi.mock('@/utils/env', () => ({ __USE_MOCK__: true }))
//
// File naming convention:
//   - foo.test.ts       → live path (vi.mock with false)
//   - foo.mock.test.ts  → mock path (vi.mock with true)
//
// The npm scripts pick the right subset:
//   - `npm run test:live`  exclude **/*.mock.test.ts
//   - `npm run test:mock`  run **/*.mock.test.ts only
//   - `npm run test`        run everything
//
// This file exists only as a discoverable convention reference. It exports
// nothing functional. Vitest cannot wrap vi.mock at runtime.

export const MOCK_FLAG_CONVENTION_DOC = 'see tests/helpers/withMockFlag.ts header'
