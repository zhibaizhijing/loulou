import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/env', () => ({ __USE_MOCK__: true }))

import { listWalkers, getWalkerById } from '@/services/walkerService'
import { resetMockDb, mockDb } from '@/mocks/db'

beforeEach(() => {
  resetMockDb()
  mockDb.walkers.insert({ _id: 'w1', name: 'Alex Tan', areas: ['Bukit Timah', 'Holland Village'], serviceTypes: ['walking', 'boarding'], pricePerWalk: 30, rating: 4.8, reviewCount: 10, photos: [], bio: '', avatar: '', demo: true } as any)
  mockDb.walkers.insert({ _id: 'w2', name: 'Mei Lin',  areas: ['Loyang', 'East Coast'],           serviceTypes: ['walking', 'daycare'], pricePerWalk: 25, rating: 4.9, reviewCount: 41, photos: [], bio: '', avatar: '', demo: true } as any)
  mockDb.walkers.insert({ _id: 'w3', name: 'Ravi Kumar', areas: ['Kembangan', 'Simei'],           serviceTypes: ['walking'],           pricePerWalk: 28, rating: 4.6, reviewCount: 12, photos: [], bio: '', avatar: '', demo: true } as any)
})

describe('walkerService (mock path)', () => {
  it('listWalkers returns all when no filter, sorted by rating desc', async () => {
    const r = await listWalkers({})
    expect(r).toHaveLength(3)
    expect(r[0]._id).toBe('w2')
    expect(r[1]._id).toBe('w1')
    expect(r[2]._id).toBe('w3')
  })

  it('listWalkers q matches exact area', async () => {
    const r = await listWalkers({ q: 'Loyang' })
    expect(r).toHaveLength(1)
    expect(r[0]._id).toBe('w2')
  })

  it('listWalkers q is case-insensitive', async () => {
    const r = await listWalkers({ q: 'loyang' })
    expect(r).toHaveLength(1)
    expect(r[0]._id).toBe('w2')
  })

  it('listWalkers q matches area substring (fuzzy)', async () => {
    const r = await listWalkers({ q: 'east' })
    expect(r).toHaveLength(1)
    expect(r[0]._id).toBe('w2')
  })

  it('listWalkers q matches walker name', async () => {
    const r = await listWalkers({ q: 'ravi' })
    expect(r).toHaveLength(1)
    expect(r[0]._id).toBe('w3')
  })

  it('listWalkers q matches name substring', async () => {
    const r = await listWalkers({ q: 'tan' })
    expect(r).toHaveLength(1)
    expect(r[0]._id).toBe('w1')
  })

  it('listWalkers q trims whitespace and ignores empty', async () => {
    const r = await listWalkers({ q: '   ' })
    expect(r).toHaveLength(3)
  })

  it('listWalkers no match → empty', async () => {
    const r = await listWalkers({ q: 'zzz' })
    expect(r).toHaveLength(0)
  })

  it('listWalkers combines q with maxPrice', async () => {
    const r = await listWalkers({ q: 'kumar', maxPrice: 30 })
    expect(r).toHaveLength(1)
    expect(r[0]._id).toBe('w3')
  })

  it('listWalkers filters by maxPrice', async () => {
    const r = await listWalkers({ maxPrice: 28 })
    expect(r.map(w => w._id).sort()).toEqual(['w2', 'w3'])
  })

  it('listWalkers filters by minRating', async () => {
    const r = await listWalkers({ minRating: 4.7 })
    expect(r.map(w => w._id).sort()).toEqual(['w1', 'w2'])
  })

  it('getWalkerById returns walker', async () => {
    const r = await getWalkerById('w1')
    expect(r.name).toBe('Alex Tan')
  })

  it('getWalkerById throws NOT_FOUND on missing', async () => {
    await expect(getWalkerById('nope')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('listWalkers filters by serviceType=boarding (only Alex offers boarding)', async () => {
    const r = await listWalkers({ serviceType: 'boarding' })
    expect(r).toHaveLength(1)
    expect(r[0]._id).toBe('w1')
  })

  it('listWalkers filters by serviceType=daycare (only Mei)', async () => {
    const r = await listWalkers({ serviceType: 'daycare' })
    expect(r).toHaveLength(1)
    expect(r[0]._id).toBe('w2')
  })

  it('listWalkers serviceType=walking returns all three', async () => {
    const r = await listWalkers({ serviceType: 'walking' })
    expect(r).toHaveLength(3)
  })

  it('listWalkers combines q + serviceType', async () => {
    const r = await listWalkers({ q: 'mei lin', serviceType: 'walking' })
    expect(r).toHaveLength(1)
    expect(r[0]._id).toBe('w2')
  })
})
