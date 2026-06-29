// v2 — Messages tab + ChatView. Spec §2.9 + §2.10.
//   - No bookingId  → threads list (MessagesScreen)
//   - With bookingId → ChatView (top nav + app card + shortcuts + bubbles + quick-reply + input + sheets)
import { listMessages, sendMessage, watchNewMessages } from '../../services/chatService'
import { listMyBookings, getBookingById } from '../../services/bookingService'
import { getWalkerById } from '../../services/walkerService'
import { showAppError } from '../../utils/errorHandler'
import { isCaregiverMode } from '../../services/caregiverAuth'
import { SERVICE_TYPE_LABEL } from '../../models/index'
import { toV2Status, type V2Status } from '../../utils/orderStatus'
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

interface AppCard {
  service: string
  dateLabel: string
  pet: string
  area: string
  status: V2Status
}

interface MsgVm {
  _id: string
  from: 'system' | 'user' | 'guardian'
  text: string
  time: string
  action: '' | 'summary'
}

interface Data {
  bookingId: string
  threads: Thread[]
  messages: MsgVm[]
  draft: string
  loading: boolean
  sending: boolean
  myRole: MessageRole
  lastScrollId: string
  // v2 ChatView
  guardianName: string
  guardianPhoto: string
  guardianInitial: string
  appCard: AppCard | null
  isCompleted: boolean
  plusOpen: boolean
  tipOpen: boolean
  reviewOpen: boolean
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

function fmtClock(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

function fmtDate(ts: number): string {
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function toVm(m: Message, myRole: MessageRole): MsgVm {
  const from: MsgVm['from'] =
    m.senderRole === 'system' || (m as any).senderRole === 'system' ? 'system'
    : m.senderRole === myRole ? 'user'
    : 'guardian'
  return {
    _id: m._id,
    from,
    text: m.text,
    time: fmtClock(m.createdAt),
    action: (m.action === 'summary' ? 'summary' : '') as ('' | 'summary'),
  }
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    bookingId: '',
    threads: [],
    messages: [], draft: '', loading: true, sending: false,
    myRole: 'owner', lastScrollId: '',
    guardianName: '', guardianPhoto: '', guardianInitial: '',
    appCard: null,
    isCompleted: false,
    plusOpen: false, tipOpen: false, reviewOpen: false,
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
    try { wx.removeStorageSync('loulou:badge:chat') } catch { /* noop */ }
  },

  onUnload() { if (this.unwatch) this.unwatch() },

  async loadThreads() {
    try {
      const bookings = await listMyBookings()
      const active = bookings.filter(b =>
        b.status === 'accepted' || b.status === 'in_progress' || b.status === 'requested'
      )
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
      const [booking, initial] = await Promise.all([
        getBookingById(this.data.bookingId).catch(() => null),
        listMessages(this.data.bookingId, 50).catch(() => [] as Message[]),
      ])
      const walker = booking ? await getWalkerById(booking.walkerId).catch(() => null) : null
      const status: V2Status = booking ? toV2Status(booking.status) : 'pending'
      const appCard: AppCard | null = booking ? {
        service: SERVICE_TYPE_LABEL[booking.serviceType],
        dateLabel: fmtDate(booking.date),
        pet: '我的宠物',
        area: '朝阳区·望京',
        status,
      } : null
      const vms = initial.map(m => toVm(m, this.data.myRole))
      const lastId = vms.length ? vms[vms.length - 1]._id : ''
      this.setData({
        messages: vms,
        appCard,
        isCompleted: status === 'completed',
        guardianName: walker?.name || '守护者',
        guardianPhoto: walker?.avatar || '',
        guardianInitial: walker?.name?.charAt(0) || '?',
        loading: false,
        lastScrollId: lastId ? 'm-' + lastId : '',
      })
    } catch (e) {
      this.setData({ loading: false })
      showAppError(e)
    }
    this.unwatch = watchNewMessages(this.data.bookingId, (m) => {
      const exists = this.data.messages.some(x => x._id === m._id)
      if (exists) return
      const next = [...this.data.messages, toVm(m, this.data.myRole)]
      this.setData({ messages: next, lastScrollId: 'm-' + m._id })
    })
  },

  onOpenThread(e: WechatMiniprogram.BaseEvent) {
    const bookingId = String(e.currentTarget.dataset.booking)
    wx.navigateTo({ url: `/pages/chat/index?bookingId=${bookingId}` })
  },

  // ── Shortcut row ──────────────────────────────────────────
  onModify()    { wx.navigateTo({ url: `/pages/booking/index?id=${this.data.bookingId}&action=modify` }) },
  onDetails()   { wx.navigateTo({ url: `/pages/booking/index?id=${this.data.bookingId}` }) },
  onPay()       { wx.navigateTo({ url: `/pages/booking/index?id=${this.data.bookingId}&action=pay` }) },
  onReviewBtn() { this.setData({ reviewOpen: true }) },

  // ── Quick-reply ───────────────────────────────────────────
  onMeet() { this.setData({ draft: '您好，我们能提前见面熟悉一下吗' }) },
  onTip()  { this.setData({ tipOpen: true }) },

  // ── Tip / Review sheets ───────────────────────────────────
  onTipPick(e: WechatMiniprogram.CustomEvent<{ amount: number }>) {
    const amt = e.detail.amount
    this.setData({ tipOpen: false })
    this.sendBubble(`🧧 我给你发了一个 ¥${amt} 的打赏，谢谢你的照顾！`)
  },
  onTipClose() { this.setData({ tipOpen: false }) },

  onReviewSubmit(e: WechatMiniprogram.CustomEvent<{ stars: number }>) {
    const stars = e.detail.stars
    this.setData({ reviewOpen: false })
    this.sendBubble(`⭐ 我给本次服务打了 ${stars} 星好评，谢谢你！`)
  },
  onReviewClose() { this.setData({ reviewOpen: false }) },

  // ── Input bar ─────────────────────────────────────────────
  onDraftInput(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ draft: e.detail.value })
  },
  onSend()      { this.sendBubble(this.data.draft) },
  onTogglePlus(){ this.setData({ plusOpen: !this.data.plusOpen }) },
  onClosePlus() { this.setData({ plusOpen: false }) },

  async sendBubble(text: string) {
    const t = (text || '').trim()
    if (!t) return
    this.setData({ sending: true, draft: '' })
    try {
      await sendMessage(this.data.bookingId, t, this.data.myRole)
    } catch (e) {
      this.setData({ draft: t })
      showAppError(e)
    } finally {
      this.setData({ sending: false })
    }
  },

  // ── System message action ─────────────────────────────────
  onOpenSummary() {
    wx.navigateTo({ url: `/pages/booking/index?id=${this.data.bookingId}` })
  },

  onBack() { wx.navigateBack({}).catch?.(() => undefined) }
})
