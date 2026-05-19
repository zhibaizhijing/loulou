import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import { assertString, assertOneOf, FnError } from '../shared/assert'
import type { Review, Booking } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as any })

interface Payload { bookingId: string; stars: 1|2|3|4|5; text: string }

export default async function handler(event: Payload, _ctx: unknown): Promise<FnResult<{ reviewId: string }>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')

    const bookingId = assertString(event.bookingId, 'bookingId')
    const stars = assertOneOf(event.stars, [1, 2, 3, 4, 5] as const, 'stars')
    const text = assertString(event.text, 'text')

    const db = cloud.database()
    const users = await (db.collection('users').where({ openid: wxCtx.OPENID }).get() as Promise<{ data: any[] }>)
    if (users.data.length === 0) return err('NOT_FOUND', 'User missing')
    const ownerUserId = users.data[0]._id as string

    let booking: Booking | null = null
    try {
      const b = await (db.collection('bookings').doc(bookingId).get() as Promise<{ data: any }>)
      booking = b.data as Booking
    } catch {
      return err('NOT_FOUND', 'Booking not found')
    }
    if (!booking) return err('NOT_FOUND', 'Booking not found')
    if (booking.ownerId !== ownerUserId) return err('FORBIDDEN', 'Not your booking')
    if (booking.status !== 'completed') return err('VALIDATION', 'Booking not completed')

    const existing = await (db.collection('reviews').where({ bookingId }).get() as Promise<{ data: any[] }>)
    if (existing.data.length > 0) return err('CONFLICT', 'Already reviewed')

    const review: Omit<Review, '_id'> = {
      bookingId, ownerId: ownerUserId, walkerId: booking.walkerId,
      stars, text, createdAt: Date.now()
    }
    const r = await (db.collection('reviews').add({ data: review }) as Promise<{ _id: string }>)

    // Update walker aggregate
    try {
      const wRes = await (db.collection('walkers').doc(booking.walkerId).get() as Promise<{ data: any }>)
      if (wRes && wRes.data) {
        const w = wRes.data as { rating: number; reviewCount: number }
        const nextCount = (w.reviewCount || 0) + 1
        const nextRating = +((((w.rating || 0) * (w.reviewCount || 0)) + stars) / nextCount).toFixed(1)
        await (db.collection('walkers').doc(booking.walkerId).update({ data: { rating: nextRating, reviewCount: nextCount } }) as Promise<any>)
      }
    } catch (e) {
      console.error('[submitReview] walker rating update failed', e)
      // non-fatal — review still inserted
    }

    return ok({ reviewId: r._id })
  } catch (e: any) {
    if (e instanceof FnError) {
      const [code, msg] = e.message.split(': ')
      return err(code as any, msg || e.message)
    }
    console.error('[submitReview]', e)
    return err('INTERNAL', e?.message || 'Internal')
  }
}
