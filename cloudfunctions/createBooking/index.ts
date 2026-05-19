import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import { assertString, assertOneOf, assertNumber, assertFutureDate, FnError } from '../shared/assert'
import type { Booking } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as any })

interface Payload { walkerId: string; dogId: string; date: number; serviceType: 'walking'|'boarding'|'daycare'|'house_visit'|'live_in'; durationMin: number; notes?: string }

export default async function handler(event: Payload, _ctx: unknown): Promise<FnResult<{ bookingId: string }>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')

    const walkerId = assertString(event.walkerId, 'walkerId')
    const dogId = assertString(event.dogId, 'dogId')
    const date = assertFutureDate(event.date, 'date')
    const serviceType = assertOneOf(event.serviceType, ['walking', 'boarding', 'daycare', 'house_visit', 'live_in'] as const, 'serviceType')
    const durationMin = assertNumber(event.durationMin, 'durationMin')
    if (durationMin <= 0) return err('VALIDATION', 'durationMin must be positive')

    const db = cloud.database()
    const users = await (db.collection('users').where({ openid: wxCtx.OPENID }).get() as Promise<{ data: any[] }>)
    if (users.data.length === 0) return err('NOT_FOUND', 'User missing — call login first')
    const ownerId = users.data[0]._id as string

    let wRes: { data: any } | null = null
    try { wRes = await (db.collection('walkers').doc(walkerId).get() as Promise<{ data: any }>) } catch { /* not found */ }
    if (!wRes || !wRes.data) return err('NOT_FOUND', 'Walker not found')
    const pricePerWalk = wRes.data.pricePerWalk as number

    const amount =
      serviceType === 'walking' || serviceType === 'house_visit'
        ? pricePerWalk * (durationMin / 30)
        : pricePerWalk * durationMin
    const now = Date.now()
    const booking: Omit<Booking, '_id'> = {
      ownerId,
      walkerId,
      dogId,
      date,
      serviceType,
      durationMin,
      status: 'requested',
      notes: event.notes,
      mockPayment: { amount, paid: true },
      createdAt: now,
      updatedAt: now
    }
    const r = await (db.collection('bookings').add({ data: booking }) as Promise<{ _id: string }>)
    return ok({ bookingId: r._id })
  } catch (e: any) {
    if (e instanceof FnError) {
      const [code, msg] = e.message.split(': ')
      return err(code as any, msg || e.message)
    }
    console.error('[createBooking]', e)
    return err('INTERNAL', e?.message || 'Internal')
  }
}
