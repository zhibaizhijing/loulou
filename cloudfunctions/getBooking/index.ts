import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import { assertString } from '../shared/assert'
import type { Booking } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as any })

export default async function handler(event: { bookingId: string }, _ctx: unknown): Promise<FnResult<Booking>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')
    const bookingId = assertString(event.bookingId, 'bookingId')

    const db = cloud.database()
    const users = await (db.collection('users').where({ openid: wxCtx.OPENID }).get() as Promise<{ data: any[] }>)
    if (users.data.length === 0) return err('NOT_FOUND', 'User not found')

    let b: { data: any } | null = null
    try { b = await (db.collection('bookings').doc(bookingId).get() as Promise<{ data: any }>) } catch { /* not found */ }
    if (!b || !b.data) return err('NOT_FOUND', 'Booking not found')

    return ok(b.data as Booking)
  } catch (e: any) {
    console.error('[getBooking]', e)
    return err('INTERNAL', e?.message || 'Internal')
  }
}
