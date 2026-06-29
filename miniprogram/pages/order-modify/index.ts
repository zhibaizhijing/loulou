// v2 — OrderModifyScreen. Spec §2.12.
//
// Lets the owner adjust service / dateStart / dateEnd / message on a pending or
// accepted booking. Confirm:
//   - replaces the booking in the mock store
//   - appends a system 'summary' action message in chat (rendered as tappable card)
//   - bumps badges
//   - shows toast and pops back to chat (or booking summary).
import { getBookingById } from '../../services/bookingService'
import { sendMessage } from '../../services/chatService'
import { mockDb } from '../../mocks/db'
import { showAppError } from '../../utils/errorHandler'
import { SERVICE_TYPE_LABEL, type ServiceType } from '../../models'

interface Data {
  bookingId: string
  serviceOptions: { id: ServiceType; label: string }[]
  service: ServiceType
  dateStart: string
  dateEnd: string
  note: string
  loading: boolean
  pageStatus: string
}

const SERVICE_OPTIONS: { id: ServiceType; label: string }[] = [
  { id: 'boarding',    label: '寄养' },
  { id: 'daycare',     label: '日托' },
  { id: 'walking',     label: '遛狗' },
  { id: 'house_visit', label: '上门喂养' },
  { id: 'live_in',     label: '伴宠留宿' },
]

function fmtDate(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function toTs(s: string): number {
  if (!s) return 0
  const d = new Date(s)
  return d.getTime()
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    bookingId: '',
    serviceOptions: SERVICE_OPTIONS,
    service: 'boarding',
    dateStart: '',
    dateEnd: '',
    note: '',
    loading: true,
    pageStatus: 'loading',
  },

  async onLoad(q: Record<string, string>) {
    const id = q.id || ''
    this.setData({ bookingId: id, loading: false, pageStatus: 'loaded' })
    if (!id) return
    try {
      const b = await getBookingById(id)
      this.setData({
        service: b.serviceType,
        dateStart: fmtDate(b.date),
        dateEnd: fmtDate((b as any).dropoffEnd || b.date),
      })
    } catch { /* booking may not exist on fresh launch — keep defaults */ }
  },

  onPickSvc(e: WechatMiniprogram.BaseEvent) {
    this.setData({ service: String(e.currentTarget.dataset.id) as ServiceType })
  },
  onStartDate(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ dateStart: e.detail.value })
  },
  onEndDate(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ dateEnd: e.detail.value })
  },
  onNote(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ note: e.detail.value })
  },

  async onConfirm() {
    const id = this.data.bookingId
    const { service, dateStart, dateEnd, note } = this.data
    try {
      const b = mockDb.bookings.get(id)
      if (!b) throw new Error('Booking not found')
      const ts = toTs(dateStart)
      mockDb.bookings.update(id, {
        serviceType: service,
        date: ts || b.date,
        dropoffEnd: toTs(dateEnd) || undefined,
        updatedAt: Date.now(),
      })

      const shortId = String(id).replace(/^app-/, '').slice(0, 8) || '000000'
      const dl = dateEnd && dateEnd !== dateStart ? `${dateStart} → ${dateEnd}` : dateStart
      const summaryText = `您修改了订单（编号 ${shortId}）：${SERVICE_TYPE_LABEL[service]} · ${dl}，等待守护者重新确认`

      // Append summary card + optional user note via chatService
      await sendMessage(id, summaryText, 'owner')
        .then(() => {
          // Tag the just-sent message with action='summary' (mock direct)
          const msgs = mockDb.messages.list().filter(m => m.bookingId === id)
          const last = msgs[msgs.length - 1]
          if (last) {
            mockDb.messages.update(last._id, {
              senderRole: 'system' as any,
              action: 'summary',
            } as any)
          }
        })
      if (note.trim()) await sendMessage(id, note.trim(), 'owner')

      try { wx.setStorageSync('loulou:badge:chat', true) } catch { /* test env */ }
      try { wx.setStorageSync('loulou:badge:orders', true) } catch { /* test env */ }

      wx.showToast({ title: '修改已提交', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 600)
    } catch (e) { showAppError(e) }
  },

  onBack() { wx.navigateBack({}).catch?.(() => undefined) },
})
