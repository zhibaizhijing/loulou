import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/env', () => ({ __USE_MOCK__: true }))

import { listReviewsForWalker, submitReview } from '@/services/reviewService'
import { resetMockDb, mockDb } from '@/mocks/db'

beforeEach(() => {
  resetMockDb()
  mockDb.walkers.insert({ _id: 'w1', name: 'Alex', areas: [], serviceTypes: ['walking'], pricePerWalk: 30, rating: 4.0, reviewCount: 2, photos: [], bio: '', avatar: '', demo: true } as any)
})

describe('reviewService (mock path)', () => {
  it('listReviewsForWalker returns reviews sorted by createdAt desc', async () => {
    mockDb.reviews.insert({ _id: 'r1', walkerId: 'w1', stars: 5, text: 'a', ownerId: 'o', bookingId: 'b', createdAt: 1 } as any)
    mockDb.reviews.insert({ _id: 'r2', walkerId: 'w1', stars: 4, text: 'b', ownerId: 'o', bookingId: 'b', createdAt: 2 } as any)
    mockDb.reviews.insert({ _id: 'r3', walkerId: 'w2', stars: 5, text: 'c', ownerId: 'o', bookingId: 'b', createdAt: 3 } as any)
    const r = await listReviewsForWalker('w1')
    expect(r).toHaveLength(2)
    expect(r[0]._id).toBe('r2')
    expect(r[1]._id).toBe('r1')
  })

  it('submitReview inserts + recomputes walker rating', async () => {
    mockDb.bookings.insert({ _id: 'b1', ownerId: 'mock-owner-1', walkerId: 'w1', dogId: 'd1', date: 0, durationMin: 30, status: 'completed', mockPayment: { amount: 30, paid: true }, createdAt: 0, updatedAt: 0 } as any)
    const r = await submitReview({ bookingId: 'b1', stars: 5, text: 'great' })
    expect(r.reviewId).toBeTruthy()
    const w = mockDb.walkers.get('w1')!
    expect(w.reviewCount).toBe(3)
    // (4.0 × 2 + 5) / 3 = 4.333... → rounded to 1dp = 4.3
    expect(w.rating).toBeCloseTo(4.3, 1)
  })

  it('submitReview throws FORBIDDEN if booking belongs to someone else', async () => {
    mockDb.bookings.insert({ _id: 'b2', ownerId: 'other', walkerId: 'w1', dogId: 'd1', date: 0, durationMin: 30, status: 'completed', mockPayment: { amount: 30, paid: true }, createdAt: 0, updatedAt: 0 } as any)
    await expect(submitReview({ bookingId: 'b2', stars: 5, text: 'x' })).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('submitReview throws VALIDATION if booking not completed', async () => {
    mockDb.bookings.insert({ _id: 'b3', ownerId: 'mock-owner-1', walkerId: 'w1', dogId: 'd1', date: 0, durationMin: 30, status: 'accepted', mockPayment: { amount: 30, paid: true }, createdAt: 0, updatedAt: 0 } as any)
    await expect(submitReview({ bookingId: 'b3', stars: 5, text: 'x' })).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('submitReview throws CONFLICT on double-submit', async () => {
    mockDb.bookings.insert({ _id: 'b4', ownerId: 'mock-owner-1', walkerId: 'w1', dogId: 'd1', date: 0, durationMin: 30, status: 'completed', mockPayment: { amount: 30, paid: true }, createdAt: 0, updatedAt: 0 } as any)
    await submitReview({ bookingId: 'b4', stars: 5, text: 'a' })
    await expect(submitReview({ bookingId: 'b4', stars: 4, text: 'b' })).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('submitReview throws NOT_FOUND on missing booking', async () => {
    await expect(submitReview({ bookingId: 'nope', stars: 5, text: 'x' })).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})
