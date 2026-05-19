import { publishService, getServiceById, updateServicePrice } from '../../services/serviceItemService'
import { currentCaregiverId } from '../../services/caregiverAuth'
import { showAppError } from '../../utils/errorHandler'
import { SERVICE_TYPE_LABEL, PRICING_UNIT_FOR } from '../../models/index'
import type { ServiceType, PricingUnit } from '../../models/index'

const PRICING_UNIT_LABEL: Record<PricingUnit, string> = {
  per_walk: '30 min', per_night: 'night', per_day: 'day', per_visit: 'visit', per_stay: 'stay'
}

const ALL_SERVICES: ServiceType[] = ['walking', 'boarding', 'daycare', 'house_visit', 'live_in']

interface Data {
  editingExisting: boolean
  serviceId: string
  serviceType: ServiceType
  priceStr: string
  surchargeRules: string
  submitting: boolean
  labels: Record<ServiceType, string>
  unitLabel: string
  serviceOptions: { value: ServiceType; label: string }[]
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    editingExisting: false,
    serviceId: '',
    serviceType: 'walking',
    priceStr: '',
    surchargeRules: '',
    submitting: false,
    labels: SERVICE_TYPE_LABEL,
    unitLabel: PRICING_UNIT_LABEL[PRICING_UNIT_FOR.walking],
    serviceOptions: ALL_SERVICES.map(s => ({ value: s, label: SERVICE_TYPE_LABEL[s] }))
  },

  async onLoad(q: Record<string, string>) {
    if (q.id) {
      try {
        const s = await getServiceById(q.id)
        this.setData({
          editingExisting: true,
          serviceId: s._id,
          serviceType: s.serviceType,
          priceStr: String(s.price),
          surchargeRules: s.surchargeRules ?? '',
          unitLabel: PRICING_UNIT_LABEL[PRICING_UNIT_FOR[s.serviceType]]
        })
      } catch (e) { showAppError(e) }
    }
  },

  onTypeChange(e: WechatMiniprogram.CustomEvent<{ value: ServiceType }>) {
    const t = e.detail.value
    this.setData({ serviceType: t, unitLabel: PRICING_UNIT_LABEL[PRICING_UNIT_FOR[t]] })
  },

  async onSubmit() {
    const cgId = currentCaregiverId()
    if (!cgId) {
      wx.showToast({ title: 'Not in caregiver mode', icon: 'none' })
      return
    }
    const price = Number(this.data.priceStr)
    if (!price || price <= 0) {
      wx.showToast({ title: 'Price required', icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    try {
      if (this.data.editingExisting) {
        await updateServicePrice(this.data.serviceId, price)
      } else {
        await publishService({
          caregiverId: cgId,
          serviceType: this.data.serviceType,
          price,
          surchargeRules: this.data.surchargeRules || undefined
        })
      }
      wx.showToast({ title: 'Saved', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 600)
    } catch (e) { showAppError(e) }
    finally { this.setData({ submitting: false }) }
  }
})
