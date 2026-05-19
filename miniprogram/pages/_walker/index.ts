import { isWalkerMode, setWalkerMode } from '../../utils/walkerMode'
import { listMyBookings } from '../../services/bookingService'
import { submitWalkReport } from '../../services/walkReportService'
import { uploadImages } from '../../services/storageService'
import { showAppError } from '../../utils/errorHandler'
import { formatDateTime } from '../../utils/date'
import { bus, BUS_EVENTS } from '../../utils/bus'
import { cloudCall } from '../../services/cloudCall'
import type { Booking } from '../../models'

interface Row extends Booking { dateLabel: string; statusLabel: string }
interface Data {
  walkerOn: boolean; loading: boolean; bookings: Row[]
  showReport: boolean; activeBookingId: string
  notes: string; durationMin: number; peeCount: number; poopCount: number
  photos: string[]; submitting: boolean
}

const STATUS: Record<Booking['status'], string> = {
  requested: 'Requested', accepted: 'Confirmed', declined: 'Declined',
  in_progress: 'In progress', completed: 'Completed', cancelled: 'Cancelled'
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    walkerOn: false, loading: false, bookings: [],
    showReport: false, activeBookingId: '',
    notes: '', durationMin: 30, peeCount: 0, poopCount: 0,
    photos: [], submitting: false
  },

  onLoad() {
    this.setData({ walkerOn: isWalkerMode() })
    if (this.data.walkerOn) this.load()
  },
  onShow() { if (this.data.walkerOn) this.load() },

  onToggle() {
    const next = !this.data.walkerOn
    setWalkerMode(next)
    this.setData({ walkerOn: next, showReport: false })
    if (next) this.load()
  },

  async load() {
    this.setData({ loading: true })
    try {
      // Demo: walker sees all bookings. Mock mode falls back to listMyBookings
      // (single fake user, owner bookings == all bookings).
      const all = await cloudCall<Booking[]>('listAllBookings', {}).catch(() => listMyBookings())
      const rows: Row[] = all.map(b => ({ ...b, dateLabel: formatDateTime(b.date), statusLabel: STATUS[b.status] }))
      this.setData({ bookings: rows })
    } catch (e) { showAppError(e) }
    finally { this.setData({ loading: false }) }
  },

  onTapBk(e: WechatMiniprogram.BaseEvent) {
    this.setData({
      showReport: true,
      activeBookingId: String(e.currentTarget.dataset.id),
      notes: '', durationMin: 30, peeCount: 0, poopCount: 0, photos: []
    })
  },

  onDur(e: WechatMiniprogram.CustomEvent<{ value: number }>)  { this.setData({ durationMin: e.detail.value }) },
  onPee(e: WechatMiniprogram.CustomEvent<{ value: number }>)  { this.setData({ peeCount: e.detail.value }) },
  onPoop(e: WechatMiniprogram.CustomEvent<{ value: number }>) { this.setData({ poopCount: e.detail.value }) },

  async onPickPhotos() {
    const r = await wx.chooseMedia({ count: 3, mediaType: ['image'] })
    const ids = await uploadImages(r.tempFiles.map(f => f.tempFilePath), 'walkreport')
    this.setData({ photos: [...this.data.photos, ...ids] })
  },

  async onSubmitReport() {
    if (!this.data.notes.trim()) {
      wx.showToast({ title: 'Add notes', icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    try {
      await submitWalkReport({
        bookingId: this.data.activeBookingId,
        photos: this.data.photos,
        notes: this.data.notes,
        durationMin: this.data.durationMin,
        peeCount: this.data.peeCount,
        poopCount: this.data.poopCount
      })
      bus.emit(BUS_EVENTS.WALK_REPORT_SUBMITTED, { bookingId: this.data.activeBookingId })
      wx.showToast({ title: 'Report submitted', icon: 'success' })
      this.setData({ showReport: false })
      this.load()
    } catch (e) { showAppError(e) }
    finally { this.setData({ submitting: false }) }
  }
})
