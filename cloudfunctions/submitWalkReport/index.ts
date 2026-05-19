import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import { assertString, assertNumber, FnError } from '../shared/assert'
import type { WalkReport, Booking } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as any })

interface Payload { bookingId: string; photos: string[]; notes: string; durationMin: number; peeCount: number; poopCount: number }

export default async function handler(event: Payload, _ctx: unknown): Promise<FnResult<{ reportId: string }>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')

    const bookingId = assertString(event.bookingId, 'bookingId')
    assertString(event.notes, 'notes')
    assertNumber(event.durationMin, 'durationMin')
    assertNumber(event.peeCount, 'peeCount')
    assertNumber(event.poopCount, 'poopCount')

    const db = cloud.database()
    let booking: Booking | null = null
    try {
      const b = await (db.collection('bookings').doc(bookingId).get() as Promise<{ data: any }>)
      booking = b.data as Booking
    } catch {
      return err('NOT_FOUND', 'Booking not found')
    }
    if (!booking) return err('NOT_FOUND', 'Booking not found')
    if (booking.status === 'completed') return err('CONFLICT', 'Already completed')

    const report: Omit<WalkReport, '_id'> = {
      bookingId,
      walkerId: booking.walkerId,
      photos: event.photos ?? [],
      notes: event.notes,
      durationMin: event.durationMin,
      peeCount: event.peeCount,
      poopCount: event.poopCount,
      createdAt: Date.now()
    }
    const r = await (db.collection('walkReports').add({ data: report }) as Promise<{ _id: string }>)
    await (db.collection('bookings').doc(bookingId).update({ data: { status: 'completed', updatedAt: Date.now() } }) as Promise<any>)
    return ok({ reportId: r._id })
  } catch (e: any) {
    if (e instanceof FnError) {
      const [code, msg] = e.message.split(': ')
      return err(code as any, msg || e.message)
    }
    console.error('[submitWalkReport]', e)
    return err('INTERNAL', e?.message || 'Internal')
  }
}
