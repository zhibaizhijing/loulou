import { getBookingById, cancelBooking } from '../../services/bookingService'
import { previewCancelRefund, refundPayment } from '../../services/paymentService'
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
  walkerInitial: string
  report: WalkReport | null
  dateLabel: string
  statusLabel: string
  durationDetailLabel: string
  serviceLabel: string
  svcIcon: string
  petLabel: string
  serviceFee: number
  paymentStatusLabel: string
  canReview: boolean
  canCancel: boolean
  canModify: boolean
  canRebook: boolean
  cancelModalOpen: boolean
  cancelDateStr: string
  pageStatus: string
  pageError: string
}

const PAY_STATUS_LABEL: Record<string, string> = {
  unpaid:   '待支付',
  held:     '已托管',
  released: '已结算',
  refunded: '已退款'
}

const LABELS: Record<Booking['status'], string> = {
  requested: '等待守护者', accepted: '已确认', declined: '已拒绝',
  in_progress: '进行中', completed: '已完成', cancelled: '已取消'
}

const SVC_ICON: Record<string, string> = {
  boarding:    'house',
  daycare:     'sun',
  walking:     'sneaker',
  house_visit: 'hand-waving',
  live_in:     'moon-stars'
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    booking: null, walker: null, walkerInitial: '?', report: null,
    dateLabel: '', statusLabel: '', durationDetailLabel: '', serviceLabel: '',
    svcIcon: 'paw-print', petLabel: '宠物', serviceFee: 0,
    paymentStatusLabel: '',
    canReview: false, canCancel: false,
    canModify: false, canRebook: false,
    cancelModalOpen: false, cancelDateStr: '',
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
      const unit = booking.serviceType === 'walking' || booking.serviceType === 'house_visit' ? '分钟'
                : booking.serviceType === 'daycare' ? '天'
                : '晚'
      const durationDetailLabel = `${booking.durationMin} ${unit}`
      const serviceLabel = SERVICE_TYPE_LABEL[booking.serviceType] || booking.serviceType
      const payState = booking.payment?.state || 'unpaid'
      const walkerInitial = (walker?.name || '?').charAt(0)
      this.setData({
        booking,
        walker,
        walkerInitial,
        report: reportRes.report,
        dateLabel: formatDateTime(booking.date),
        statusLabel: LABELS[booking.status],
        durationDetailLabel,
        serviceLabel,
        svcIcon: SVC_ICON[booking.serviceType] || 'paw-print',
        petLabel: '宠物',
        serviceFee: booking.mockPayment.amount,
        paymentStatusLabel: PAY_STATUS_LABEL[payState] || payState,
        canReview: booking.status === 'completed' && existingReviews.reviews.length === 0,
        canCancel: booking.status === 'requested' || booking.status === 'accepted',
        canModify: booking.status === 'requested' || booking.status === 'accepted',
        canRebook: booking.status === 'completed' || booking.status === 'cancelled' || booking.status === 'declined'
      })
    } catch (e) { showAppError(e) }
  },

  onOpenChat() { wx.navigateTo({ url: `/pages/chat/index?bookingId=${this.bookingId}` }) },
  onLeaveReview() { wx.navigateTo({ url: `/pages/review/index?bookingId=${this.bookingId}` }) },
  onModify() { wx.navigateTo({ url: `/pages/order-modify/index?id=${this.bookingId}` }) },
  onRebook() {
    const w = this.data.walker
    if (w) wx.navigateTo({ url: `/pages/booking-new/index?walkerId=${w._id}` })
  },
  onOpenWalker() {
    const w = this.data.walker
    if (w) wx.navigateTo({ url: `/pages/walker/index?id=${w._id}` })
  },
  onCancel() {
    // v3 — open the design's 3-tier bottom-anchored cancel-order modal.
    const cancelDateStr = this.computeCancelDateStr()
    this.setData({ cancelModalOpen: true, cancelDateStr })
  },
  onCloseCancelModal() { this.setData({ cancelModalOpen: false }) },
  async onConfirmCancel() {
    this.setData({ cancelModalOpen: false })
    let refundAmount = 0
    let shouldRefund = false
    try {
      const preview = previewCancelRefund(this.bookingId)
      refundAmount = preview.refundAmount
      shouldRefund = refundAmount > 0 && this.data.booking?.payment?.state === 'held'
    } catch { /* preview failure shouldn't block cancel */ }
    try {
      if (shouldRefund) {
        await refundPayment({
          bookingId: this.bookingId,
          refundAmount,
          idempotencyKey: `refund-${this.bookingId}-${Date.now()}`,
          reason: 'Owner cancelled'
        })
      }
      await cancelBooking(this.bookingId)
      bus.emit(BUS_EVENTS.BOOKING_UPDATED, { bookingId: this.bookingId })
      wx.showToast({ title: shouldRefund ? `已退款 ¥${refundAmount}` : '订单已取消', icon: 'success' })
      this.load()
    } catch (e) { showAppError(e) }
  },
  computeCancelDateStr(): string {
    const b = this.data.booking
    if (!b?.date) return '服务前一天'
    const d = new Date(b.date)
    d.setDate(d.getDate() - 1)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  },
  onBack() { wx.navigateBack() },
  onGoHome() { wx.switchTab({ url: '/pages/home/index', fail: () => wx.reLaunch({ url: '/pages/home/index' }) }) },
  onGoBookings() { wx.switchTab({ url: '/pages/bookings/index', fail: () => wx.reLaunch({ url: '/pages/bookings/index' }) }) }
})
