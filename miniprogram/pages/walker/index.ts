import { getWalkerById } from '../../services/walkerService'
import { listReviewsForWalker } from '../../services/reviewService'
import { listActiveServicesForCaregiver } from '../../services/serviceItemService'
import { SERVICE_TYPE_LABEL, PRICING_UNIT_FOR } from '../../models/index'
import { createPageState } from '../../utils/usePageState'
import { showAppError } from '../../utils/errorHandler'
import type { Walker, Review, ServiceType, PricingUnit } from '../../models/index'

interface ServicePrice { serviceType: ServiceType; price: number; unitLabel: string }
interface Data {
  walker: Walker | null
  reviews: Review[]
  servicePrices: ServicePrice[]
  labels: Record<ServiceType, string>
  pageStatus: string
  pageError: string
}

const PRICING_UNIT_LABEL: Record<PricingUnit, string> = {
  per_walk: '/ 30 min',
  per_night: '/ night',
  per_day: '/ day',
  per_visit: '/ visit',
  per_stay: '/ night'
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: { walker: null, reviews: [], servicePrices: [], labels: SERVICE_TYPE_LABEL, pageStatus: 'loading', pageError: '' },
  walkerId: '' as string,

  onLoad(query: Record<string, string>) {
    this.walkerId = query.id
    this.load()
  },

  async load() {
    const ps = createPageState(this.setData.bind(this))
    try {
      const [walker, reviews, services] = await ps.run(async () => Promise.all([
        getWalkerById(this.walkerId),
        listReviewsForWalker(this.walkerId, 20),
        listActiveServicesForCaregiver(this.walkerId).catch(() => [])
      ]))
      const servicePrices: ServicePrice[] = services.map(s => ({
        serviceType: s.serviceType,
        price: s.price,
        unitLabel: PRICING_UNIT_LABEL[PRICING_UNIT_FOR[s.serviceType]]
      }))
      this.setData({ walker, reviews, servicePrices })
    } catch (e) { showAppError(e) }
  },

  onBook() {
    wx.navigateTo({ url: `/pages/booking-new/index?walkerId=${this.walkerId}` })
  },

  onBack() { wx.navigateBack() }
})
