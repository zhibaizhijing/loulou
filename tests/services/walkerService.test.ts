import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/env', () => ({ __USE_MOCK__: false }))

import { resetWxMock, setDbHandler, mockCollection } from '../helpers'
import { listWalkers, getWalkerById } from '@/services/walkerService'

const SEED = [
  { _id: 'w1', name: 'Alex Tan', areas: ['Bukit Timah'], pricePerWalk: 30, rating: 4.8, reviewCount: 10, photos: [], bio: '', avatar: '', demo: true },
  { _id: 'w2', name: 'Mei Lin',  areas: ['Loyang'],      pricePerWalk: 25, rating: 4.9, reviewCount: 41, photos: [], bio: '', avatar: '', demo: true }
]

beforeEach(() => {
  resetWxMock()
  setDbHandler({ collection: () => mockCollection(SEED) })
})

describe('walkerService (live path)', () => {
  it('listWalkers returns all when no filter', async () => {
    const r = await listWalkers({})
    expect(r).toHaveLength(2)
  })
  it('listWalkers applies q client-side after server fetch (case-insensitive substring)', async () => {
    const r = await listWalkers({ q: 'mei' })
    expect(r).toHaveLength(1)
    expect(r[0]._id).toBe('w2')
  })
  it('getWalkerById returns single record', async () => {
    const r = await getWalkerById('w1')
    expect(r._id).toBe('w1')
  })
  it('getWalkerById throws NOT_FOUND on missing', async () => {
    setDbHandler({ collection: () => mockCollection([]) })
    await expect(getWalkerById('nope')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('listWalkers serviceType filter applied client-side after server fetch', async () => {
    setDbHandler({
      collection: () => mockCollection([
        { _id: 'w1', name: 'A', areas: [], pricePerWalk: 30, rating: 4.8, reviewCount: 10, photos: [], bio: '', avatar: '', demo: true, serviceTypes: ['walking'] },
        { _id: 'w2', name: 'B', areas: [], pricePerWalk: 25, rating: 4.9, reviewCount: 41, photos: [], bio: '', avatar: '', demo: true, serviceTypes: ['walking', 'boarding'] }
      ])
    })
    const r = await listWalkers({ serviceType: 'boarding' })
    expect(r).toHaveLength(1)
    expect(r[0]._id).toBe('w2')
  })
})
