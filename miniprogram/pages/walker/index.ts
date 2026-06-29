import { getWalkerById } from '../../services/walkerService'
import { listReviewsForWalker } from '../../services/reviewService'
import { listActiveServicesForCaregiver } from '../../services/serviceItemService'
import { SERVICE_TYPE_LABEL, PRICING_UNIT_FOR, PET_TYPE_LABEL, SIZE_BAND_LABEL } from '../../models/index'
import { createPageState } from '../../utils/usePageState'
import { showAppError } from '../../utils/errorHandler'
import type { Walker, Review, ServiceType, PricingUnit, PetType, SizeBand } from '../../models/index'

interface Tier  { size: string; range: string; price: number }
interface Extra { label: string; price: string }
interface ServicePrice {
  serviceType: ServiceType
  price: number
  unitShort: string
  locLabel: string
  tiers: Tier[]
  extras: Extra[]
}

interface BarSvc { id: string; price: number; unit: string; serviceType: ServiceType }

interface Data {
  walker: Walker | null
  reviews: Review[]
  servicePrices: ServicePrice[]
  tagline: string
  areaLabel: string
  heroPhoto: string
  photos: string[]
  photoIdx: number
  liked: boolean
  tab: 'info' | 'reviews' | 'services'
  labels: Record<ServiceType, string>
  petTypeLabels: Record<PetType, string>
  sizeBandLabels: Record<SizeBand, string>
  pageStatus: string
  pageError: string
  // v2 sticky booking bar
  barServices: BarSvc[]
  initialServiceId: string
  petReminderOpen: boolean
  policyOpen: boolean
}

const UNIT_SHORT: Record<PricingUnit, string> = {
  per_walk: '次',
  per_night: '晚',
  per_day: '天',
  per_visit: '次',
  per_stay: '晚'
}

const LOC_LABEL: Record<ServiceType, string> = {
  boarding:    '在守护者家',
  daycare:     '在守护者家',
  walking:     '在你的小区周边',
  house_visit: '在宠物主家',
  live_in:     '在宠物主家'
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    walker: null, reviews: [], servicePrices: [],
    tagline: '', areaLabel: '',
    heroPhoto: '', photos: [], photoIdx: 0, liked: false,
    tab: 'info',
    labels: SERVICE_TYPE_LABEL,
    petTypeLabels: PET_TYPE_LABEL,
    sizeBandLabels: SIZE_BAND_LABEL,
    pageStatus: 'loading', pageError: '',
    barServices: [], initialServiceId: '',
    petReminderOpen: false, policyOpen: false,
  },
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
      const servicePrices: ServicePrice[] = services.map(s => {
        const base = s.price
        const tiers: Tier[] = s.serviceType === 'walking' || s.serviceType === 'house_visit'
          ? [
              { size: '小型',   range: '0–7 公斤',   price: base },
              { size: '中型',   range: '7–18 公斤',  price: Math.round(base * 1.15) },
              { size: '大型',   range: '18–45 公斤', price: Math.round(base * 1.3) }
            ]
          : [
              { size: '小型',   range: '0–7 公斤',   price: base },
              { size: '中型',   range: '7–18 公斤',  price: Math.round(base * 1.13) },
              { size: '大型',   range: '18–45 公斤', price: Math.round(base * 1.25) }
            ]
        const extras: Extra[] = s.serviceType === 'boarding' || s.serviceType === 'live_in'
          ? [
              { label: '节假日加价',         price: '+¥17' },
              { label: '每增加 1 只',         price: '+¥48' },
              { label: '幼宠',               price: '+¥11' },
              { label: '紧急预约',           price: '+¥15' },
              { label: '长期订单（7 晚+）',   price: '-10%' }
            ]
          : [
              { label: '节假日加价',         price: '+¥10' },
              { label: '每增加 1 只',         price: '+¥20' },
              { label: '紧急预约',           price: '+¥8' }
            ]
        return {
          serviceType: s.serviceType,
          price: base,
          unitShort: UNIT_SHORT[PRICING_UNIT_FOR[s.serviceType]],
          locLabel: LOC_LABEL[s.serviceType],
          tiers,
          extras
        }
      })
      const heroPhoto = walker.avatar || (walker.photos && walker.photos[0]) || ''
      const photos = (walker.photos && walker.photos.length) ? walker.photos : (heroPhoto ? [heroPhoto] : [])
      const tagline = walker.bio ? walker.bio.split('\n')[0].slice(0, 28) : '专业守护者，提供贴心照护'
      const areaLabel = walker.areas && walker.areas.length ? `${walker.areas.join('、')}` : ''
      const barServices: BarSvc[] = servicePrices.map(sp => ({
        id: SERVICE_TYPE_LABEL[sp.serviceType],
        price: sp.price,
        unit: sp.unitShort,
        serviceType: sp.serviceType,
      }))
      const initialServiceId = barServices[0]?.id || ''
      this.setData({ walker, reviews, servicePrices, heroPhoto, photos, tagline, areaLabel, barServices, initialServiceId })
    } catch (e) { showAppError(e) }
  },

  onTab(e: WechatMiniprogram.BaseEvent) {
    this.setData({ tab: e.currentTarget.dataset.tab as 'info' | 'reviews' | 'services' })
  },

  onLike()  { this.setData({ liked: !this.data.liked }) },
  onShare() { wx.showToast({ title: '分享即将上线', icon: 'none' }) },
  onBook()  { this.navigateToBooking() },

  navigateToBooking(svcType?: ServiceType) {
    const qs = svcType ? `&service=${svcType}` : ''
    wx.navigateTo({ url: `/pages/booking-new/index?walkerId=${this.walkerId}${qs}` })
  },

  onBookViaBar(e: WechatMiniprogram.CustomEvent<{ id: string; svc: BarSvc }>) {
    const svc = e.detail.svc
    // v2 spec §2.15 — block booking for new users with no pet on file.
    let hasPet = true
    try {
      const dogs = wx.getStorageSync('loulou:my-dogs')
      hasPet = Array.isArray(dogs) && dogs.length > 0
    } catch { /* test env */ }
    if (!hasPet) {
      this.pendingService = svc?.serviceType
      this.setData({ petReminderOpen: true })
      return
    }
    this.navigateToBooking(svc?.serviceType)
  },

  pendingService: undefined as ServiceType | undefined,

  onPetReminderGo() {
    this.setData({ petReminderOpen: false })
    const ret = `/pages/walker/index?id=${this.walkerId}`
    wx.navigateTo({ url: `/pages/pets/index?mode=add&returnTo=${encodeURIComponent(ret)}` })
  },
  onPetReminderSkip() {
    this.setData({ petReminderOpen: false })
    this.navigateToBooking(this.pendingService)
    this.pendingService = undefined
  },
  onPetReminderDismiss() { this.setData({ petReminderOpen: false }) },
  onShowPolicy()  { this.setData({ policyOpen: true })  },
  onClosePolicy() { this.setData({ policyOpen: false }) },

  onBack() { wx.navigateBack({}).catch?.(() => undefined) }
})
