import { listCaregiverBookings, acceptBooking, declineBooking } from '../../services/bookingService'
import { currentCaregiverId } from '../../services/caregiverAuth'
import { showAppError } from '../../utils/errorHandler'
import { formatDateTime } from '../../utils/date'
import { bus, BUS_EVENTS } from '../../utils/bus'
import { SERVICE_TYPE_LABEL } from '../../models/index'
import type { Booking } from '../../models'

interface Row extends Booking { dateLabel: string; statusLabel: string; durationLabel: string; serviceLabel: string }
interface Data {
  tab: string
  all: Row[]
  filtered: Row[]
  loading: boolean
  noCaregiver: boolean
  acting: string
}

const STATUS_LABEL: Record<Booking['status'], string> = {
  requested: 'Awaiting your response',
  accepted: 'Confirmed',
  declined: 'Declined',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled'
}

function durationUnit(b: Booking): string {
  if (b.serviceType === 'walking' || b.serviceType === 'house_visit') return 'min'
  if (b.serviceType === 'daycare') return b.durationMin > 1 ? 'days' : 'day'
  return b.durationMin > 1 ? 'nights' : 'night'
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: { tab: 'pending', all: [], filtered: [], loading: true, noCaregiver: false, acting: '' },
  unsubs: [] as Array<() => void>,

  onLoad() {
    this.unsubs.push(bus.on(BUS_EVENTS.BOOKING_ACCEPTED, () => this.load()))
    this.unsubs.push(bus.on(BUS_EVENTS.BOOKING_DECLINED, () => this.load()))
    this.unsubs.push(bus.on(BUS_EVENTS.BOOKING_CREATED, () => this.load()))
    this.unsubs.push(bus.on(BUS_EVENTS.BOOKING_UPDATED, () => this.load()))
  },
  onShow() { this.load() },
  onUnload() { this.unsubs.forEach((u: () => void) => u()) },

  async load() {
    const cgId = currentCaregiverId()
    if (!cgId) { this.setData({ noCaregiver: true, loading: false }); return }
    this.setData({ noCaregiver: false, loading: true })
    try {
      const list = await listCaregiverBookings(cgId)
      const rows: Row[] = list.map(b => ({
        ...b,
        dateLabel: formatDateTime(b.date),
        statusLabel: STATUS_LABEL[b.status],
        durationLabel: `${b.durationMin} ${durationUnit(b)}`,
        serviceLabel: SERVICE_TYPE_LABEL[b.serviceType] || b.serviceType
      }))
      this.setData({ all: rows, loading: false })
      this.applyTab()
    } catch (e) { this.setData({ loading: false }); showAppError(e) }
  },

  applyTab() {
    const now = Date.now()
    const isPending = (b: Row) => b.status === 'requested'
    const isUpcoming = (b: Row) => (b.status === 'accepted' || b.status === 'in_progress') && b.date >= now
    const isPast = (b: Row) => !isPending(b) && !isUpcoming(b)
    const tab = this.data.tab
    const fn = tab === 'pending' ? isPending : tab === 'upcoming' ? isUpcoming : isPast
    this.setData({ filtered: this.data.all.filter(fn) })
  },

  onTabChange(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ tab: String(e.detail.value) })
    this.applyTab()
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
  },

  onOpen(e: WechatMiniprogram.BaseEvent) {
    const id = String(e.currentTarget.dataset.id)
    wx.navigateTo({ url: `/pages/booking/index?id=${id}` })
  }
})
