import { listMessages, sendMessage, watchNewMessages } from '../../services/chatService'
import { listMyBookings } from '../../services/bookingService'
import { getWalkerById } from '../../services/walkerService'
import { showAppError } from '../../utils/errorHandler'
import { isCaregiverMode } from '../../services/caregiverAuth'
import type { Message, MessageRole, Booking } from '../../models'

interface Thread {
  id: string
  bookingId: string
  name: string
  initial: string
  bg: 'butter' | 'lavender' | 'mint' | 'peach' | 'ink'
  photo?: string
  last: string
  time: string
  unread: number
  live: boolean
}

interface Data {
  bookingId: string
  threads: Thread[]
  messages: Message[]
  draft: string
  loading: boolean
  sending: boolean
  myRole: MessageRole
  lastScrollId: string
}

const PASTELS: Thread['bg'][] = ['butter', 'lavender', 'mint', 'peach']

function fmtTime(ts: number): string {
  if (!ts) return ''
  const diff = Date.now() - ts
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
  return `${Math.floor(diff / 86_400_000)} 天前`
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    bookingId: '',
    threads: [],
    messages: [], draft: '', loading: true, sending: false,
    myRole: 'owner', lastScrollId: ''
  },
  unwatch: null as null | (() => void),

  async onLoad(q: Record<string, string>) {
    this.setData({ bookingId: q.bookingId || '', myRole: isCaregiverMode() ? 'walker' : 'owner' })
    if (this.data.bookingId) {
      await this.loadChat()
    } else {
      await this.loadThreads()
    }
  },

  async onShow() {
    const tb = this.getTabBar?.() as WechatMiniprogram.Component.TrivialInstance | undefined
    if (tb && typeof tb.setData === 'function') {
      tb.setData({ activePath: '/pages/chat/index' })
    }
    if (!this.data.bookingId) await this.loadThreads()
  },

  onUnload() { if (this.unwatch) this.unwatch() },

  async loadThreads() {
    try {
      const bookings = await listMyBookings()
      const active = bookings.filter(b => b.status === 'accepted' || b.status === 'in_progress' || b.status === 'requested')
      const threads: Thread[] = []
      for (let i = 0; i < active.length; i++) {
        const b: Booking = active[i]
        const walker = await getWalkerById(b.walkerId).catch(() => null)
        const msgs = await listMessages(b._id, 5).catch(() => [] as Message[])
        const lastMsg = msgs[msgs.length - 1]
        const unread = msgs.filter(m => m.senderRole !== this.data.myRole).length
        threads.push({
          id: b._id, bookingId: b._id,
          name: walker ? `${walker.name}（守护者）` : '守护者',
          initial: walker?.name?.charAt(0) || '?',
          bg: PASTELS[i % PASTELS.length],
          photo: walker?.avatar,
          last: lastMsg?.text || '尚无消息',
          time: lastMsg ? fmtTime(lastMsg.createdAt) : fmtTime(b.createdAt),
          unread: Math.min(unread, 99),
          live: b.status === 'accepted' || b.status === 'in_progress'
        })
      }
      this.setData({ threads, loading: false })
    } catch (e) {
      this.setData({ loading: false })
      showAppError(e)
    }
  },

  async loadChat() {
    try {
      const initial = await listMessages(this.data.bookingId, 50)
      const lastId = initial.length ? initial[initial.length - 1]._id : ''
      this.setData({ messages: initial, loading: false, lastScrollId: lastId ? 'm-' + lastId : '' })
    } catch (e) {
      this.setData({ loading: false })
      showAppError(e)
    }
    this.unwatch = watchNewMessages(this.data.bookingId, (m) => {
      const exists = this.data.messages.some(x => x._id === m._id)
      if (exists) return
      const next = [...this.data.messages, m]
      this.setData({ messages: next, lastScrollId: 'm-' + m._id })
    })
  },

  onOpenThread(e: WechatMiniprogram.BaseEvent) {
    const bookingId = String(e.currentTarget.dataset.booking)
    wx.navigateTo({ url: `/pages/chat/index?bookingId=${bookingId}` })
  },

  async onSend() {
    const text = this.data.draft.trim()
    if (!text) return
    this.setData({ sending: true, draft: '' })
    try {
      await sendMessage(this.data.bookingId, text, this.data.myRole)
    } catch (e) {
      this.setData({ draft: text })
      showAppError(e)
    } finally {
      this.setData({ sending: false })
    }
  },

  onBack() { wx.navigateBack({}).catch?.(() => undefined) }
})
