import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/env', () => ({ __USE_MOCK__: false }))

import { resetWxMock, setDbHandler, mockCollection } from '../helpers'
import { listReviewsForWalker } from '@/services/reviewService'

beforeEach(() => {
  resetWxMock()
  setDbHandler({
    collection: () => mockCollection([
      { _id: 'r1', walkerId: 'w1', stars: 5, text: 'great', ownerId: 'o', bookingId: 'b', createdAt: 1 },
      { _id: 'r2', walkerId: 'w1', stars: 4, text: 'good',  ownerId: 'o', bookingId: 'b', createdAt: 2 }
    ])
  })
})

describe('reviewService.listForWalker (live path)', () => {
  it('returns reviews for walker', async () => {
    const r = await listReviewsForWalker('w1', 10)
    expect(r).toHaveLength(2)
  })
})
