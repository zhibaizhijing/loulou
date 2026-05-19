import { currentCaregiverId, getCurrentCaregiver, exitCaregiverMode } from '../../services/caregiverAuth'
import { listMyServices } from '../../services/serviceItemService'
import { getMonthAvailability } from '../../services/availabilityService'
import { showAppError } from '../../utils/errorHandler'
import { SERVICE_TYPE_LABEL } from '../../models/index'
import { __USE_MOCK__ } from '../../utils/env'
import { mockDb } from '../../mocks/db'
import type { Caregiver, ServiceType, Booking } from '../../models/index'

interface Data {
  loading: boolean
  noCaregiver: boolean
  caregiver: Caregiver | null
  pendingCount: number
  activeServicesCount: number
  blockedThisMonth: number
  labels: Record<ServiceType, string>
}

function pad(n: number): string { return n < 10 ? '0' + n : '' + n }
function nowYearMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    loading: true, noCaregiver: false,
    caregiver: null, pendingCount: 0, activeServicesCount: 0, blockedThisMonth: 0,
    labels: SERVICE_TYPE_LABEL
  },

  onShow() { this.load() },

  async load() {
    const cgId = currentCaregiverId()
    if (!cgId) {
      this.setData({ noCaregiver: true, loading: false })
      return
    }
    this.setData({ noCaregiver: false, loading: true })

    try {
      const caregiver = getCurrentCaregiver()
      if (!caregiver) {
        this.setData({ noCaregiver: true, loading: false })
        return
      }

      // Pending bookings: only mockable for now (live needs a listCaregiverBookings fn)
      let pendingCount = 0
      if (__USE_MOCK__) {
        pendingCount = (mockDb.bookings.list() as Booking[])
          .filter(b => b.walkerId === cgId && b.status === 'requested').length
      }

      const services = await listMyServices(cgId)
      const activeServicesCount = services.filter(s => s.active).length

      const slots = await getMonthAvailability(cgId, nowYearMonth())
      const blockedThisMonth = slots.filter(s => !s.available).length

      this.setData({
        caregiver: caregiver as any, pendingCount, activeServicesCount, blockedThisMonth, loading: false
      })
    } catch (e) {
      this.setData({ loading: false })
      showAppError(e)
    }
  },

  onOpenInbox() {
    wx.navigateTo({ url: '/pages/caregiver-inbox/index' })
  },
  onManageServices() {
    wx.navigateTo({ url: '/pages/caregiver-services/index' })
  },
  onOpenCalendar() {
    wx.navigateTo({ url: '/pages/caregiver-calendar/index' })
  },
  async onExitMode() {
    const m = await wx.showModal({ title: 'Exit caregiver mode?', content: 'You will return to the owner side of the app.' })
    if (!m.confirm) return
    exitCaregiverMode()
    wx.showToast({ title: 'Exited caregiver mode', icon: 'success' })
    setTimeout(() => wx.switchTab({ url: '/pages/home/index' }), 600)
  },
  onBackToMe() { wx.switchTab({ url: '/pages/me/index' }) }
})
