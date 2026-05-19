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
  it('creates booking with computed amount and requested status', async () => {
    getWXContext.mockReturnValue({ OPENID: 'owner' })
    const futureDate = Date.now() + 86400000
    collection.mockImplementation((name: string) => {
      if (name === 'users')   return { where: () => ({ get: async () => ({ data: [{ _id: 'u1', openid: 'owner' }] }) }) }
      if (name === 'walkers') return { doc: () => ({ get: async () => ({ data: { _id: 'w1', pricePerWalk: 30 } }) }) }
      if (name === 'bookings') return { add: async ({ data }: any) => ({ _id: 'b1', ...data }) }
      throw new Error('unexpected col: ' + name)
    })
    const r = await handler({ walkerId: 'w1', dogId: 'd1', date: futureDate, serviceType: 'walking', durationMin: 60 }, {})
    expect(r).toMatchObject({ ok: true, data: { bookingId: 'b1' } })
  })

  it('UNAUTH if not logged in', async () => {
    getWXContext.mockReturnValue({})
    const r = await handler({ walkerId: 'w1', dogId: 'd1', date: Date.now() + 86400000, serviceType: 'walking', durationMin: 30 }, {})
    expect(r).toMatchObject({ ok: false, code: 'UNAUTH' })
  })

  it('VALIDATION on past date', async () => {
    getWXContext.mockReturnValue({ OPENID: 'owner' })
    const r = await handler({ walkerId: 'w1', dogId: 'd1', date: Date.now() - 1000, serviceType: 'walking', durationMin: 30 }, {})
    expect(r).toMatchObject({ ok: false, code: 'VALIDATION' })
  })

  it('VALIDATION on negative durationMin', async () => {
    getWXContext.mockReturnValue({ OPENID: 'owner' })
    const r = await handler({ walkerId: 'w1', dogId: 'd1', date: Date.now() + 86400000, serviceType: 'walking', durationMin: -1 }, {})
    expect(r).toMatchObject({ ok: false, code: 'VALIDATION' })
  })
})
