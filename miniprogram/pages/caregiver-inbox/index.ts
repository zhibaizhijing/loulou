import { listCaregiverPendingBookings, acceptBooking, declineBooking } from '../../services/bookingService'
import { currentCaregiverId } from '../../services/caregiverAuth'
import { showAppError } from '../../utils/errorHandler'
import { formatDateTime } from '../../utils/date'
import { bus, BUS_EVENTS } from '../../utils/bus'
import type { Booking } from '../../models'

interface Row extends Booking { dateLabel: string }
interface Data {
  bookings: Row[]
  loading: boolean
  noCaregiver: boolean
  acting: string         // booking id currently being acted on (for loading state)
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: { bookings: [], loading: true, noCaregiver: false, acting: '' },

  onShow() { this.load() },

  async load() {
    const cgId = currentCaregiverId()
    if (!cgId) { this.setData({ noCaregiver: true, loading: false }); return }
    this.setData({ noCaregiver: false, loading: true })
    try {
      const list = await listCaregiverPendingBookings(cgId)
      const rows: Row[] = list.map(b => ({ ...b, dateLabel: formatDateTime(b.date) }))
      this.setData({ bookings: rows, loading: false })
    } catch (e) { this.setData({ loading: false }); showAppError(e) }
  },

  async onAccept(e: WechatMiniprogram.BaseEvent) {
    const id = String(e.currentTarget.dataset.id)
    this.setData({ acting: id })
    try {
      await acceptBooking(id)
      bus.emit(BUS_EVENTS.BOOKING_ACCEPTED, { bookingId: id })
      wx.showToast({ title: 'Accepted', icon: 'success' })
      this.load()
    } catch (e2) { showAppError(e2) }
    finally { this.setData({ acting: '' }) }
  },

  async onDecline(e: WechatMiniprogram.BaseEvent) {
    const id = String(e.currentTarget.dataset.id)
    const m = await wx.showModal({ title: 'Decline?', content: 'Owner will see the decline.' })
    if (!m.confirm) return
    this.setData({ acting: id })
    try {
      await declineBooking(id)
      bus.emit(BUS_EVENTS.BOOKING_DECLINED, { bookingId: id })
      wx.showToast({ title: 'Declined', icon: 'none' })
      this.load()
    } catch (e2) { showAppError(e2) }
    finally { this.setData({ acting: '' }) }
  },

  onChat(e: WechatMiniprogram.BaseEvent) {
    const id = String(e.currentTarget.dataset.id)
    wx.navigateTo({ url: `/pages/chat/index?bookingId=${id}` })
  }
})
