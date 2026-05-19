import { cloudCall } from './cloudCall'
import { __USE_MOCK__ } from '../utils/env'
import { mockDb } from '../mocks/db'
import { watchMockCollection } from '../mocks/realtime'
import { AppError } from '../utils/errorHandler'
import type { Message, MessageRole } from '../models'

const MOCK_OWNER_ID = 'mock-owner-1'

export async function listMessages(bookingId: string, limit = 50): Promise<Message[]> {
  if (__USE_MOCK__) {
    return mockDb.messages
      .list()
      .filter(m => m.bookingId === bookingId)
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(-limit)
  }
  const db = wx.cloud.database()
  const r = await db.collection('messages')
    .where({ bookingId })
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get()
  return ((r as any).data as Message[]).slice().reverse()
}

export async function sendMessage(bookingId: string, text: string, role: MessageRole): Promise<{ messageId: string }> {
  const trimmed = text.trim()
  if (!trimmed) throw new AppError('VALIDATION', 'Message cannot be empty')
  if (__USE_MOCK__) {
    const inserted = mockDb.messages.insert({
      bookingId,
      senderId: MOCK_OWNER_ID,
      senderRole: role,
      text: trimmed,
      createdAt: Date.now()
    } as Omit<Message, '_id'>)
    return { messageId: inserted._id }
  }
  return cloudCall<{ messageId: string }>('sendMessage', { bookingId, text: trimmed, role })
}

export function watchNewMessages(bookingId: string, onNew: (m: Message) => void): () => void {
  if (__USE_MOCK__) {
    return watchMockCollection<Message>(
      'messages',
      m => m.bookingId === bookingId,
      (op, m) => { if (op === 'insert') onNew(m) }
    )
  }
  const db = wx.cloud.database()
  const watcher = db.collection('messages')
    .where({ bookingId })
    .orderBy('createdAt', 'asc')
    .watch({
      onChange: (snap: any) => {
        for (const c of snap.docChanges || []) {
          if (c.dataType === 'add' || c.dataType === 'init') {
            onNew(c.doc as Message)
          }
        }
      },
      onError: (err: unknown) => console.error('[chat] watch error', err)
    })
  return () => { try { (watcher as any).close() } catch { /* ignore */ } }
}
