import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/env', () => ({ __USE_MOCK__: true }))

import { silentLogin } from '@/services/authService'
import { resetMockDb, mockDb } from '@/mocks/db'

beforeEach(() => {
  resetMockDb()
  ;(globalThis as any).getApp = () => ({ globalData: { openid: '', bootError: null } })
})

describe('silentLogin (mock path)', () => {
  it('returns mock-owner-1 synchronously without cloud call', async () => {
    const r = await silentLogin()
    expect(r.openid).toBe('mock-owner-1')
    expect(r.isNewUser).toBe(false)
  })

  it('seeds mockDb on first call', async () => {
    await silentLogin()
    expect(mockDb.walkers.list().length).toBeGreaterThan(0)
    expect(mockDb.users.list().length).toBeGreaterThan(0)
  })

  it('subsequent call does not duplicate users', async () => {
    await silentLogin()
    const firstCount = mockDb.users.list().length
    await silentLogin()
    expect(mockDb.users.list().length).toBe(firstCount)
  })
})
