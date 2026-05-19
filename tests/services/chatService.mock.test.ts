import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/env', () => ({ __USE_MOCK__: true }))

import { listMessages, sendMessage, watchNewMessages } from '@/services/chatService'
import { resetMockDb, mockDb } from '@/mocks/db'

beforeEach(() => {
  resetMockDb()
})

describe('chatService (mock path)', () => {
  it('listMessages returns ASC by createdAt for the bookingId', async () => {
    mockDb.messages.insert({ _id: 'm2', bookingId: 'b1', senderId: 's', senderRole: 'walker', text: 'B', createdAt: 200 } as any)
    mockDb.messages.insert({ _id: 'm1', bookingId: 'b1', senderId: 's', senderRole: 'owner',  text: 'A', createdAt: 100 } as any)
    mockDb.messages.insert({ _id: 'm3', bookingId: 'other', senderId: 's', senderRole: 'owner', text: 'X', createdAt: 150 } as any)
    const r = await listMessages('b1', 50)
    expect(r).toHaveLength(2)
    expect(r[0]._id).toBe('m1')
    expect(r[1]._id).toBe('m2')
  })

  it('sendMessage inserts into mockDb and assigns id', async () => {
    const r = await sendMessage('b1', 'hello', 'owner')
    expect(r.messageId).toBeTruthy()
    const list = mockDb.messages.list()
    expect(list).toHaveLength(1)
    expect(list[0].text).toBe('hello')
    expect(list[0].senderRole).toBe('owner')
    expect(list[0].bookingId).toBe('b1')
  })

  it('sendMessage VALIDATION on empty text', async () => {
    await expect(sendMessage('b1', '   ', 'owner')).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('watchNewMessages fires on insert that matches bookingId, not on other bookings', async () => {
    const seen: string[] = []
    const unsub = watchNewMessages('b1', m => seen.push(m._id))
    await sendMessage('b1', 'one', 'owner')
    await sendMessage('other', 'X', 'owner')
    await sendMessage('b1', 'two', 'walker')
    unsub()
    await sendMessage('b1', 'three', 'owner')
    expect(seen).toHaveLength(2)
  })
})
