import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import { assertString } from '../shared/assert'
import type { Review } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as any })

export default async function handler(event: { bookingId: string }, _ctx: unknown): Promise<FnResult<{ reviews: Review[] }>> {
  try {
    const bookingId = assertString(event.bookingId, 'bookingId')
    const db = cloud.database()
    const r = await (db.collection('reviews').where({ bookingId }).get() as Promise<{ data: any[] }>)
    return ok({ reviews: r.data as Review[] })
  } catch (e: any) {
    return err('INTERNAL', e?.message || 'Internal')
  }
}
