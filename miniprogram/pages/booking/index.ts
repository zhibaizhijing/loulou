import { getBookingById, cancelBooking } from '../../services/bookingService'
import { getWalkerById } from '../../services/walkerService'
import { createPageState } from '../../utils/usePageState'
import { showAppError } from '../../utils/errorHandler'
import { formatDateTime } from '../../utils/date'
import { cloudCall } from '../../services/cloudCall'
import { bus, BUS_EVENTS } from '../../utils/bus'
import { SERVICE_TYPE_LABEL } from '../../models/index'
import type { Booking, Walker, WalkReport } from '../../models/index'

interface Data {
  booking: Booking | null
  walker: Walker | null
  report: WalkReport | null
  dateLabel: string
  statusLabel: string
  durationDetailLabel: string
  serviceLabel: string
  canReview: boolean
  canCancel: boolean
  pageStatus: string
  pageError: string
}

const LABELS: Record<Booking['status'], string> = {
  requested: 'Awaiting walker', accepted: 'Confirmed', declined: 'Declined',
  in_progress: 'In progress', completed: 'Completed', cancelled: 'Cancelled'
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    booking: null, walker: null, report: null,
    dateLabel: '', statusLabel: '', durationDetailLabel: '', serviceLabel: '',
    canReview: false, canCancel: false,
    pageStatus: 'loading', pageError: ''
  },
  bookingId: '',
  unsubs: [] as Array<() => void>,

  onLoad(q: Record<string, string>) {
    this.bookingId = q.id
    this.unsubs.push(bus.on(BUS_EVENTS.WALK_REPORT_SUBMITTED, () => this.load()))
    this.unsubs.push(bus.on(BUS_EVENTS.REVIEW_SUBMITTED, () => this.load()))
    this.unsubs.push(bus.on(BUS_EVENTS.BOOKING_ACCEPTED, () => this.load()))
    this.unsubs.push(bus.on(BUS_EVENTS.BOOKING_DECLINED, () => this.load()))
    this.load()
  },
  onShow() { if (this.data.booking) this.load() },
  onUnload() { this.unsubs.forEach((u: () => void) => u()) },

  async load() {
    const ps = createPageState(this.setData.bind(this))
    try {
      const booking = await ps.run(() => getBookingById(this.bookingId))
      const [walker, reportRes, existingReviews] = await Promise.all([
        getWalkerById(booking.walkerId).catch(() => null),
        cloudCall<{ report: WalkReport | null }>('getWalkReport', { bookingId: booking._id }).catch(() => ({ report: null })),
        cloudCall<{ reviews: unknown[] }>('listReviewsForBooking', { bookingId: booking._id }).catch(() => ({ reviews: [] }))
      ])
      const unit = booking.serviceType === 'walking' || booking.serviceType === 'house_visit' ? 'min'
                : booking.serviceType === 'daycare' ? (booking.durationMin > 1 ? 'days' : 'day')
                : (booking.durationMin > 1 ? 'nights' : 'night')
      const durationDetailLabel = `${booking.durationMin} ${unit}`
      const serviceLabel = SERVICE_TYPE_LABEL[booking.serviceType] || booking.serviceType
      this.setData({
        booking,
        walker,
        report: reportRes.report,
        dateLabel: formatDateTime(booking.date),
        statusLabel: LABELS[booking.status],
        durationDetailLabel,
        serviceLabel,
        canReview: booking.status === 'completed' && existingReviews.reviews.length === 0,
        canCancel: booking.status === 'requested' || booking.status === 'accepted'
      })
    } catch (e) { showAppError(e) }
  },

  onOpenChat() { wx.navigateTo({ url: `/pages/chat/index?bookingId=${this.bookingId}` }) },
  onLeaveReview() { wx.navigateTo({ url: `/pages/review/index?bookingId=${this.bookingId}` }) },
  onOpenWalker() {
    const w = this.data.walker
    if (w) wx.navigateTo({ url: `/pages/walker/index?id=${w._id}` })
  },
  async onCancel() {
    const m = await wx.showModal({ title: 'Cancel?', content: 'This cannot be undone.' })
    if (!m.confirm) return
    try {
      await cancelBooking(this.bookingId)
      bus.emit(BUS_EVENTS.BOOKING_UPDATED, { bookingId: this.bookingId })
      wx.showToast({ title: 'Cancelled', icon: 'success' })
      this.load()
    } catch (e) { showAppError(e) }
  },
  onBack() { wx.navigateBack() },
  onGoHome() { wx.switchTab({ url: '/pages/home/index', fail: () => wx.reLaunch({ url: '/pages/home/index' }) }) },
  onGoBookings() { wx.switchTab({ url: '/pages/bookings/index', fail: () => wx.reLaunch({ url: '/pages/bookings/index' }) }) }
})
