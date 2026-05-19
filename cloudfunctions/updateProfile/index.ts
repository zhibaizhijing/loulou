import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import { assertString, FnError } from '../shared/assert'
import type { Dog } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as any })

interface Payload { name?: string; avatar?: string; phone?: string; dogs?: Dog[] }

export default async function handler(event: Payload, _ctx: unknown): Promise<FnResult<{ updated: boolean }>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')

    const name = assertString(event.name, 'name')
    const patch: Record<string, unknown> = { name, updatedAt: Date.now() }
    if (event.avatar !== undefined) patch.avatar = event.avatar
    if (event.phone !== undefined) patch.phone = event.phone
    if (event.dogs !== undefined) patch.dogs = event.dogs

    const db = cloud.database()
    const users = await (db.collection('users').where({ openid: wxCtx.OPENID }).get() as Promise<{ data: any[] }>)
    if (users.data.length === 0) return err('NOT_FOUND', 'User missing — call login first')
    await db.collection('users').doc(users.data[0]._id as string).update({ data: patch })
    return ok({ updated: true })
  } catch (e: any) {
    if (e instanceof FnError) {
      const [code, msg] = e.message.split(': ')
      return err(code as any, msg || e.message)
    }
    console.error('[updateProfile] internal', e)
    return err('INTERNAL', e?.message || 'Internal')
  }
}
