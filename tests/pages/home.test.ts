import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/env', () => ({ __USE_MOCK__: false }))

import { resetWxMock, setDbHandler, mockCollection } from '../helpers'
import { listWalkers } from '@/services/walkerService'

beforeEach(() => {
  resetWxMock()
  setDbHandler({ collection: () => mockCollection([
    { _id: 'w1', name: 'A', areas: [], pricePerWalk: 30, rating: 4, reviewCount: 1, photos: [], bio: '', avatar: '', demo: true }
  ])})
})

describe('home page contract', () => {
  it('uses walkerService.list to fetch', async () => {
    const r = await listWalkers({})
    expect(r).toHaveLength(1)
  })
})
