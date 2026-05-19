import { listMyServices, toggleServiceActive, unpublishService } from '../../services/serviceItemService'
import { currentCaregiverId } from '../../services/caregiverAuth'
import { showAppError } from '../../utils/errorHandler'
import { SERVICE_TYPE_LABEL, PRICING_UNIT_FOR } from '../../models/index'
import type { ServiceItem, ServiceType, PricingUnit } from '../../models/index'

const PRICING_UNIT_LABEL: Record<PricingUnit, string> = {
  per_walk:  '30 min',
  per_night: 'night',
  per_day:   'day',
  per_visit: 'visit',
  per_stay:  'stay'
}

interface Data {
  services: ServiceItem[]
  loading: boolean
  noCaregiver: boolean
  labels: Record<ServiceType, string>
  unitLabels: Record<ServiceType, string>
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    services: [], loading: true, noCaregiver: false,
    labels: SERVICE_TYPE_LABEL,
    unitLabels: Object.fromEntries(
      (Object.keys(PRICING_UNIT_FOR) as ServiceType[]).map(s => [s, PRICING_UNIT_LABEL[PRICING_UNIT_FOR[s]]])
    ) as Record<ServiceType, string>
  },

  onShow() { this.load() },

  async load() {
    const cgId = currentCaregiverId()
    if (!cgId) { this.setData({ noCaregiver: true, loading: false }); return }
    this.setData({ noCaregiver: false, loading: true })
    try {
      const services = await listMyServices(cgId)
      this.setData({ services, loading: false })
    } catch (e) { this.setData({ loading: false }); showAppError(e) }
  },

  async onToggle(e: WechatMiniprogram.CustomEvent<{ value: boolean }>) {
    const id = String(e.currentTarget.dataset.id)
    try {
      await toggleServiceActive(id, e.detail.value)
      this.load()
    } catch (err) { showAppError(err) }
  },

  onEdit(e: WechatMiniprogram.BaseEvent) {
    const id = String(e.currentTarget.dataset.id)
    wx.navigateTo({ url: `/pages/caregiver-service-edit/index?id=${id}` })
  },

  async onDelete(e: WechatMiniprogram.BaseEvent) {
    const m = await wx.showModal({ title: 'Delete service?', content: 'This unlists the service.' })
    if (!m.confirm) return
    const id = String(e.currentTarget.dataset.id)
    try {
      await unpublishService(id)
      this.load()
    } catch (err) { showAppError(err) }
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/caregiver-service-edit/index' })
  }
})
