import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import type { Booking } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as any })

export default async function handler(_event: unknown, _ctx: unknown): Promise<FnResult<Booking[]>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')
    const db = cloud.database()
    const r = await (db.collection('bookings').orderBy('date', 'desc').limit(100).get() as Promise<{ data: any[] }>)
    return ok(r.data as Booking[])
  } catch (e: any) {
    return err('INTERNAL', e?.message || 'Internal')
  }
}
