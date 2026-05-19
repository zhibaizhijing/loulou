import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import { assertString, assertOneOf, FnError } from '../shared/assert'
import type { Message, MessageRole, Booking } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as any })

interface Payload { bookingId: string; text: string; role: MessageRole }

export default async function handler(event: Payload, _ctx: unknown): Promise<FnResult<{ messageId: string }>> {
  try {
    const wxCtx = cloud.getWXContext()
    if (!wxCtx.OPENID) return err('UNAUTH', 'Login required')

    const bookingId = assertString(event.bookingId, 'bookingId')
    const text = assertString(event.text, 'text')
    const role = assertOneOf(event.role, ['owner', 'walker'] as const, 'role')

    const db = cloud.database()
    const users = await (db.collection('users').where({ openid: wxCtx.OPENID }).get() as Promise<{ data: any[] }>)
    if (users.data.length === 0) return err('NOT_FOUND', 'User missing')
    const userId = users.data[0]._id as string

    let booking: Booking | null = null
    try {
      const b = await (db.collection('bookings').doc(bookingId).get() as Promise<{ data: any }>)
      booking = b.data as Booking
    } catch {
      return err('NOT_FOUND', 'Booking not found')
    }
    if (!booking) return err('NOT_FOUND', 'Booking not found')

    // Owner check: real. Walker check (demo): any logged-in user w/ role='walker' passes.
    if (role === 'owner' && booking.ownerId !== userId) {
      return err('FORBIDDEN', 'Not owner of booking')
    }

    const msg: Omit<Message, '_id'> = {
      bookingId, senderId: userId, senderRole: role, text, createdAt: Date.now()
    }
    const r = await (db.collection('messages').add({ data: msg }) as Promise<{ _id: string }>)
    return ok({ messageId: r._id })
  } catch (e: any) {
    if (e instanceof FnError) {
      const [code, msg] = e.message.split(': ')
      return err(code as any, msg || e.message)
    }
    console.error('[sendMessage]', e)
    return err('INTERNAL', e?.message || 'Internal')
  }
}
