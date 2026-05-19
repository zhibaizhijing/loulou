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

  it('UNAUTH if not logged in', async () => {
    getWXContext.mockReturnValue({})
    const r = await handler({ bookingId: 'b1', photos: [], notes: 'x', durationMin: 30, peeCount: 0, poopCount: 0 }, {})
    expect(r).toMatchObject({ ok: false, code: 'UNAUTH' })
  })

  it('CONFLICT when booking already completed', async () => {
    getWXContext.mockReturnValue({ OPENID: 'walker-openid' })
    collection.mockImplementation((name: string) => {
      if (name === 'users') return { where: () => ({ get: async () => ({ data: [{ _id: 'u9', openid: 'walker-openid' }] }) }) }
      if (name === 'bookings') return {
        doc: () => ({
          get: async () => ({ data: { _id: 'b1', walkerId: 'w1', ownerId: 'u1', status: 'completed' } })
        })
      }
      throw new Error(name)
    })
    const r = await handler({ bookingId: 'b1', photos: [], notes: 'x', durationMin: 30, peeCount: 0, poopCount: 0 }, {})
    expect(r).toMatchObject({ ok: false, code: 'CONFLICT' })
  })

  it('VALIDATION on empty notes', async () => {
    getWXContext.mockReturnValue({ OPENID: 'w' })
    const r = await handler({ bookingId: 'b1', photos: [], notes: '', durationMin: 30, peeCount: 0, poopCount: 0 }, {})
    expect(r).toMatchObject({ ok: false, code: 'VALIDATION' })
  })
})
