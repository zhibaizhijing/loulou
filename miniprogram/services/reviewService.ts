import type { Review } from '../models'
import { cloudCall } from './cloudCall'
import { __USE_MOCK__ } from '../utils/env'
import { mockDb } from '../mocks/db'
import { AppError } from '../utils/errorHandler'

const MOCK_OWNER_ID = 'mock-owner-1'

export async function listReviewsForWalker(walkerId: string, limit = 20): Promise<Review[]> {
  if (__USE_MOCK__) {
    return mockDb.reviews
      .list()
      .filter(r => r.walkerId === walkerId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit)
  }
  const db = wx.cloud.database()
  const r = await db.collection('reviews')
    .where({ walkerId })
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get()
  return (r as any).data as Review[]
}

export interface SubmitReviewInput { bookingId: string; stars: 1|2|3|4|5; text: string }

export async function submitReview(input: SubmitReviewInput): Promise<{ reviewId: string }> {
  if (__USE_MOCK__) return submitMock(input)
  return cloudCall<{ reviewId: string }>('submitReview', input)
}

function submitMock(input: SubmitReviewInput): { reviewId: string } {
  const booking = mockDb.bookings.get(input.bookingId)
  if (!booking) throw new AppError('NOT_FOUND', 'Booking not found')
  if (booking.ownerId !== MOCK_OWNER_ID) throw new AppError('FORBIDDEN', 'Not your booking')
  if (booking.status !== 'completed') throw new AppError('VALIDATION', 'Booking not completed')

  const existing = mockDb.reviews.list().find(r => r.bookingId === input.bookingId)
  if (existing) throw new AppError('CONFLICT', 'Already reviewed')

  const inserted = mockDb.reviews.insert({
    bookingId: input.bookingId,
    ownerId: MOCK_OWNER_ID,
    walkerId: booking.walkerId,
    stars: input.stars,
    text: input.text,
    createdAt: Date.now()
  } as Omit<Review, '_id'>)

  // Recompute walker rating aggregate
  const walker = mockDb.walkers.get(booking.walkerId)
  if (walker) {
    const nextCount = walker.reviewCount + 1
    const nextRating = +(((walker.rating * walker.reviewCount) + input.stars) / nextCount).toFixed(1)
    mockDb.walkers.update(walker._id, { rating: nextRating, reviewCount: nextCount })
  }

  return { reviewId: inserted._id }
}
