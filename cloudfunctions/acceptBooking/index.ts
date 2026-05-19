import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import { assertString } from '../shared/assert'
import type { Booking } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as any })

export default async function handler(event: { bookingId: string }, _ctx: unknown): Promise<FnResult<{ accepted: boolean }>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')
    const bookingId = assertString(event.bookingId, 'bookingId')
    const db = cloud.database()
    let booking: Booking | null = null
    try {
      const b = await (db.collection('bookings').doc(bookingId).get() as Promise<{ data: any }>)
      booking = b.data as Booking
    } catch { return err('NOT_FOUND', 'Booking not found') }
    if (!booking) return err('NOT_FOUND', 'Booking not found')
    if (booking.status !== 'requested') return err('CONFLICT', 'Booking is not pending')
    await (db.collection('bookings').doc(bookingId).update({ data: { status: 'accepted', updatedAt: Date.now() } }) as Promise<any>)
    return ok({ accepted: true })
  } catch (e: any) {
    return err('INTERNAL', e?.message || 'Internal')
  }
}
