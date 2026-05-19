import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/env', () => ({ __USE_MOCK__: false }))

import { resetWxMock, setCallFnHandler, setDbHandler, mockCollection } from '../helpers'
import { listMessages, sendMessage } from '@/services/chatService'

beforeEach(() => {
  resetWxMock()
  setDbHandler({ collection: () => mockCollection([
    { _id: 'm1', bookingId: 'b1', senderId: 'o', senderRole: 'owner', text: 'hi', createdAt: 1 }
  ])})
})

describe('chatService (live path)', () => {
  it('listMessages returns reverse-chronological then reversed to ascending', async () => {
    const r = await listMessages('b1', 50)
    expect(r).toHaveLength(1)
    expect(r[0].text).toBe('hi')
  })

  it('sendMessage forwards to sendMessage fn', async () => {
    setCallFnHandler(async (n, d: any) => {
      expect(n).toBe('sendMessage')
      expect(d).toMatchObject({ bookingId: 'b1', text: 'hello' })
      return { ok: true, data: { messageId: 'm2' } }
    })
    const r = await sendMessage('b1', 'hello', 'owner')
    expect(r.messageId).toBe('m2')
  })
})
