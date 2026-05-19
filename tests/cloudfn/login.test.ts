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
