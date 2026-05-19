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
