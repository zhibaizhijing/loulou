import { describe, it, expect, beforeEach } from 'vitest'
import { mockDb, initMockDb, resetMockDb } from '@/mocks/db'
import { watchMockCollection } from '@/mocks/realtime'

beforeEach(() => {
  resetMockDb()
})

describe('mockDb basics', () => {
  it('insert then list returns inserted row', () => {
    const r = mockDb.users.insert({ openid: 'x', name: 'X', dogs: [], createdAt: 0 } as any)
    expect(r._id).toBeTruthy()
    expect(mockDb.users.list()).toHaveLength(1)
  })

  it('update mutates row', () => {
    const r = mockDb.users.insert({ openid: 'x', name: 'X', dogs: [], createdAt: 0 } as any)
    const u = mockDb.users.update(r._id, { name: 'Y' } as any)
    expect(u?.name).toBe('Y')
    expect(mockDb.users.get(r._id)?.name).toBe('Y')
  })

  it('delete removes row', () => {
    const r = mockDb.users.insert({ openid: 'x', name: 'X', dogs: [], createdAt: 0 } as any)
    expect(mockDb.users.delete(r._id)).toBe(true)
    expect(mockDb.users.list()).toHaveLength(0)
  })

  it('watch fires on insert matching filter', () => {
    const seen: string[] = []
    const unsub = watchMockCollection<any>('users', () => true, (op, row) => {
      seen.push(`${op}:${row._id}`)
    })
    mockDb.users.insert({ openid: 'a', name: 'A', dogs: [], createdAt: 0 } as any)
    mockDb.users.insert({ openid: 'b', name: 'B', dogs: [], createdAt: 0 } as any)
    unsub()
    mockDb.users.insert({ openid: 'c', name: 'C', dogs: [], createdAt: 0 } as any)
    expect(seen).toHaveLength(2)
  })

  it('initMockDb seeds walkers + reviews + owner on cold start', () => {
    resetMockDb()
    initMockDb()
    expect(mockDb.walkers.list().length).toBe(4)
    expect(mockDb.reviews.list().length).toBe(8)
    expect(mockDb.users.list().length).toBe(1)
  })

  it('mockDb.walkers and mockDb.caregivers are the same collection reference', () => {
    expect(mockDb.walkers).toBe(mockDb.caregivers)
  })

  it('initMockDb seeds at least 7 service items (4 walking + Alex boarding + Mei daycare + Priya live_in)', () => {
    resetMockDb()
    initMockDb()
    expect(mockDb.services.list().length).toBeGreaterThanOrEqual(7)
  })
})
