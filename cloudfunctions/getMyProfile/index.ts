import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import type { User } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as any })

export default async function handler(_event: unknown, _ctx: unknown): Promise<FnResult<User>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')
    const db = cloud.database()
    const r = await (db.collection('users').where({ openid: wxCtx.OPENID }).limit(1).get() as Promise<{ data: any[] }>)
    if (r.data.length === 0) return err('NOT_FOUND', 'User missing')
    return ok(r.data[0] as User)
  } catch (e: any) {
    return err('INTERNAL', e?.message || 'Internal')
  }
}
