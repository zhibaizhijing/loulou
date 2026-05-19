import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import { assertString } from '../shared/assert'
import type { Booking } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as any })

export default async function handler(event: { bookingId: string }, _ctx: unknown): Promise<FnResult<{ cancelled: boolean }>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')
    const bookingId = assertString(event.bookingId, 'bookingId')

    const db = cloud.database()
    const users = await (db.collection('users').where({ openid: wxCtx.OPENID }).get() as Promise<{ data: any[] }>)
    if (users.data.length === 0) return err('NOT_FOUND', 'User not found')
    const ownerId = users.data[0]._id as string

    let b: { data: any } | null = null
    try { b = await (db.collection('bookings').doc(bookingId).get() as Promise<{ data: any }>) } catch { /* not found */ }
    if (!b || !b.data) return err('NOT_FOUND', 'Booking not found')
    const booking = b.data as Booking
    if (booking.ownerId !== ownerId) return err('FORBIDDEN', 'Not your booking')
    if (booking.status === 'completed') return err('CONFLICT', 'Cannot cancel completed booking')

    await (db.collection('bookings').doc(bookingId).update({ data: { status: 'cancelled', updatedAt: Date.now() } }) as Promise<any>)
    return ok({ cancelled: true })
  } catch (e: any) {
    console.error('[cancelBooking]', e)
    return err('INTERNAL', e?.message || 'Internal')
  }
}
