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
    expect(walkerUpdates[0].data.reviewCount).toBe(3)
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

  it('VALIDATION if booking not completed', async () => {
    getWXContext.mockReturnValue({ OPENID: 'o' })
    collection.mockImplementation((name: string) => {
      if (name === 'users')    return { where: () => ({ get: async () => ({ data: [{ _id: 'u1', openid: 'o' }] }) }) }
      if (name === 'bookings') return { doc: () => ({ get: async () => ({ data: { _id: 'b1', ownerId: 'u1', walkerId: 'w1', status: 'accepted' } }) }) }
      throw new Error(name)
    })
    const r = await handler({ bookingId: 'b1', stars: 5, text: 'x' }, {})
    expect(r).toMatchObject({ ok: false, code: 'VALIDATION' })
  })
})
