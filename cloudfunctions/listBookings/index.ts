import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import type { Booking } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as any })

export default async function handler(_event: unknown, _ctx: unknown): Promise<FnResult<Booking[]>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')

    const db = cloud.database()
    const users = await (db.collection('users').where({ openid: wxCtx.OPENID }).get() as Promise<{ data: any[] }>)
    if (users.data.length === 0) return ok([])
    const ownerId = users.data[0]._id as string

    const r = await (db.collection('bookings').where({ ownerId }).orderBy('date', 'desc').limit(100).get() as Promise<{ data: any[] }>)
    return ok(r.data as Booking[])
  } catch (e: any) {
    console.error('[listBookings]', e)
    return err('INTERNAL', e?.message || 'Internal')
  }
}
