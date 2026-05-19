import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import { FnError } from '../shared/assert'
import type { User } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as any })

interface LoginData { openid: string; isNewUser: boolean }

export default async function handler(_event: unknown, _context: unknown): Promise<FnResult<LoginData>> {
  try {
    const ctx = cloud.getWXContext()
    if (!ctx.OPENID) throw new FnError('UNAUTH', 'Login required')

    const db = cloud.database()
    const existing = await (db.collection('users').where({ openid: ctx.OPENID }).get() as Promise<{ data: any[] }>)
    if (existing.data.length > 0) {
      return ok({ openid: ctx.OPENID, isNewUser: false })
    }
    const newUser: User = {
      openid: ctx.OPENID,
      name: 'Pet Owner',
      dogs: [],
      createdAt: Date.now()
    }
    await db.collection('users').add({ data: newUser })
    return ok({ openid: ctx.OPENID, isNewUser: true })
  } catch (e: any) {
    if (e instanceof FnError) {
      const [code, msg] = e.message.split(': ')
      return err(code as any, msg || e.message)
    }
    console.error('[login] internal', e)
    return err('INTERNAL', e?.message || 'Internal')
  }
}
