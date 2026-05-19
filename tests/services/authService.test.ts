import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/env', () => ({ __USE_MOCK__: false }))

import { setCallFnHandler, resetWxMock } from '../helpers'
import { silentLogin, getCurrentOpenId } from '@/services/authService'

beforeEach(() => {
  resetWxMock()
  ;(globalThis as any).getApp = () => ({ globalData: { openid: '', bootError: null } })
})

describe('silentLogin (live path)', () => {
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
