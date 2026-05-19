import { describe, it, expect, vi, beforeEach } from 'vitest'

const remove = vi.fn(async () => ({ stats: { removed: 0 } }))
const add = vi.fn(async ({ data }: any) => ({ _id: 'mock-' + data.name }))
const where = () => ({ remove })

vi.mock('wx-server-sdk', () => ({
  default: {
    init: () => undefined,
    getWXContext: () => ({ OPENID: 'tester' }),
    database: () => ({
      collection: () => ({ where, add }),
      command: { exists: () => true }
    })
  }
}))

import handler from '../../cloudfunctions/seedDemoData/index'

beforeEach(() => { remove.mockClear(); add.mockClear() })

describe('seedDemoData', () => {
  it('wipes 5 collections + inserts walkers + reviews', async () => {
    const r = await handler({}, {})
    expect(r.ok).toBe(true)
    expect(remove).toHaveBeenCalledTimes(5)
    expect(add.mock.calls.length).toBeGreaterThanOrEqual(8)
  })
})
