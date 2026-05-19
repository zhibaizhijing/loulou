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

  it('FORBIDDEN when role=owner but openid is not booking owner', async () => {
    getWXContext.mockReturnValue({ OPENID: 'someone-else' })
    collection.mockImplementation((name: string) => {
      if (name === 'users')    return { where: () => ({ get: async () => ({ data: [{ _id: 'uX', openid: 'someone-else' }] }) }) }
      if (name === 'bookings') return { doc: () => ({ get: async () => ({ data: { _id: 'b1', ownerId: 'u1', walkerId: 'w1' } }) }) }
      throw new Error(name)
    })
    const r = await handler({ bookingId: 'b1', text: 'hi', role: 'owner' }, {})
    expect(r).toMatchObject({ ok: false, code: 'FORBIDDEN' })
  })

  it('walker role passes regardless of openid (demo)', async () => {
    getWXContext.mockReturnValue({ OPENID: 'anyone' })
    collection.mockImplementation((name: string) => {
      if (name === 'users')    return { where: () => ({ get: async () => ({ data: [{ _id: 'uX', openid: 'anyone' }] }) }) }
      if (name === 'bookings') return { doc: () => ({ get: async () => ({ data: { _id: 'b1', ownerId: 'u1', walkerId: 'w1' } }) }) }
      if (name === 'messages') return { add: async ({ data }: any) => ({ _id: 'mW', ...data }) }
      throw new Error(name)
    })
    const r = await handler({ bookingId: 'b1', text: 'hi', role: 'walker' }, {})
    expect(r).toMatchObject({ ok: true, data: { messageId: 'mW' } })
  })
})
