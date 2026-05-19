import { listMyBookings } from '../../services/bookingService'
import { createPageState } from '../../utils/usePageState'
import { showAppError } from '../../utils/errorHandler'
import { formatDateTime } from '../../utils/date'
import { bus, BUS_EVENTS } from '../../utils/bus'
import type { Booking } from '../../models'

interface Row extends Booking { dateLabel: string; statusLabel: string; durationLabel: string; paymentLabel: string; paymentTone: string }
interface Data { tab: string; all: Row[]; filtered: Row[]; pageStatus: string; pageError: string }

const STATUS_LABEL: Record<Booking['status'], string> = {
  requested: 'Awaiting walker',
  accepted: 'Confirmed',
  declined: 'Declined',
  in_progress: 'Walk in progress',
  completed: 'Completed',
  cancelled: 'Cancelled'
}

const PAYMENT_LABEL: Record<string, { label: string; tone: string }> = {
  unpaid:   { label: 'Unpaid',   tone: 'warning' },
  held:     { label: 'Paid · escrow', tone: 'primary' },
  released: { label: 'Released', tone: 'success' },
  refunded: { label: 'Refunded', tone: 'danger' }
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: { tab: 'upcoming', all: [], filtered: [], pageStatus: 'loading', pageError: '' },
  unsub: null as null | (() => void),

  onLoad() {
    this.unsub = bus.on(BUS_EVENTS.BOOKING_CREATED, () => this.load())
    this.load()
  },
  onShow() { if (this.data.all.length) this.load() },
  onUnload() { this.unsub?.() },

  async load() {
    const ps = createPageState(this.setData.bind(this))
    try {
      const list = await ps.run(
        async () => (await listMyBookings()).map(b => {
          const unit = b.serviceType === 'walking' || b.serviceType === 'house_visit' ? 'min'
                    : b.serviceType === 'daycare' ? (b.durationMin > 1 ? 'days' : 'day')
                    : (b.durationMin > 1 ? 'nights' : 'night')
          const payState = b.payment?.state || 'unpaid'
          const pay = PAYMENT_LABEL[payState] || { label: payState, tone: 'default' }
          return {
            ...b,
            dateLabel: formatDateTime(b.date),
            statusLabel: STATUS_LABEL[b.status],
            durationLabel: `${b.durationMin} ${unit}`,
            paymentLabel: pay.label,
            paymentTone: pay.tone
          }
        }),
        { onEmpty: v => v.length === 0 }
      )
      this.setData({ all: list })
      this.applyTab()
    } catch (e) { showAppError(e) }
  },

  applyTab() {
    const now = Date.now()
    const isUpcoming = (b: Row) => (b.status === 'requested' || b.status === 'accepted' || b.status === 'in_progress') && b.date >= now
    const filtered = this.data.all.filter(this.data.tab === 'upcoming' ? isUpcoming : (b) => !isUpcoming(b))
    this.setData({ filtered, pageStatus: filtered.length === 0 ? 'empty' : 'loaded' })
  },

  onTabChange(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ tab: e.detail.value })
    this.applyTab()
  },

  onTap(e: WechatMiniprogram.BaseEvent) {
    wx.navigateTo({ url: `/pages/booking/index?id=${e.currentTarget.dataset.id}` })
  },

  onPullDownRefresh() { this.load().finally(() => wx.stopPullDownRefresh()) },
  onRetry() { this.load() }
})
