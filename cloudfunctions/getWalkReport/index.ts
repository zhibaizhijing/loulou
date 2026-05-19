import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import { assertString } from '../shared/assert'
import type { WalkReport } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as any })

export default async function handler(event: { bookingId: string }, _ctx: unknown): Promise<FnResult<{ report: WalkReport | null }>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')
    const bookingId = assertString(event.bookingId, 'bookingId')
    const db = cloud.database()
    const r = await (db.collection('walkReports').where({ bookingId }).limit(1).get() as Promise<{ data: any[] }>)
    return ok({ report: (r.data[0] as WalkReport) || null })
  } catch (e: any) {
    return err('INTERNAL', e?.message || 'Internal')
  }
}
