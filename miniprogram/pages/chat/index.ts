import { listMessages, sendMessage, watchNewMessages } from '../../services/chatService'
import { showAppError } from '../../utils/errorHandler'
import { isWalkerMode } from '../../utils/walkerMode'
import type { Message, MessageRole } from '../../models'

interface Data {
  messages: Message[]
  draft: string
  loading: boolean
  sending: boolean
  myRole: MessageRole
  lastScrollId: string
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: { messages: [], draft: '', loading: true, sending: false, myRole: 'owner', lastScrollId: '' },
  bookingId: '' as string,
  unwatch: null as null | (() => void),

  async onLoad(q: Record<string, string>) {
    this.bookingId = q.bookingId
    this.setData({ myRole: isWalkerMode() ? 'walker' : 'owner' })
    try {
      const initial = await listMessages(this.bookingId, 50)
      const lastId = initial.length ? initial[initial.length - 1]._id : ''
      this.setData({ messages: initial, loading: false, lastScrollId: lastId ? 'm-' + lastId : '' })
    } catch (e) {
      this.setData({ loading: false })
      showAppError(e)
    }
    this.unwatch = watchNewMessages(this.bookingId, (m) => {
      const exists = this.data.messages.some(x => x._id === m._id)
      if (exists) return
      const next = [...this.data.messages, m]
      this.setData({ messages: next, lastScrollId: 'm-' + m._id })
    })
  },

  onUnload() { if (this.unwatch) this.unwatch() },

  async onSend() {
    const text = this.data.draft.trim()
    if (!text) return
    this.setData({ sending: true, draft: '' })
    try {
      await sendMessage(this.bookingId, text, this.data.myRole)
      // realtime watcher will append; no manual setData needed
    } catch (e) {
      this.setData({ draft: text })
      showAppError(e)
    } finally {
      this.setData({ sending: false })
    }
  }
})
