import { listWalkers } from '../../services/walkerService'
import { showAppError } from '../../utils/errorHandler'

interface Feature { label: string; cat: 'relation' | 'time' | 'skill' | 'care' | 'other' }

interface Card {
  id: string
  name: string
  photo?: string
  initial: string
  initialBg: string
  badge?: string
  rating: string
  reviews: number
  dist: string
  city: string
  bio: string
  reused: boolean
  features: Feature[]
  price: number
  unit: string
  orders: number
  cert: boolean
  favorited: boolean
}

interface Query {
  petType: string
  svcType: string
  address: string
  startDate: string
  endDate: string
  nights: number
  unit: string
}

interface Data {
  q: Query
  guardians: Card[]
  loading: boolean
  filterCount: number
  sort: string
}

const PASTELS = ['butter', 'lavender', 'mint', 'peach', 'lavender-soft'] as const


Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    q: {
      petType: '狗', svcType: '寄养', address: '朝阳·三里屯',
      startDate: '5月22日 周三', endDate: '5月24日 周五',
      nights: 2, unit: '晚'
    },
    guardians: [],
    loading: true,
    filterCount: 0,
    sort: '智能排序'
  },

  onLoad(query: Record<string, string>) {
    if (query.q) {
      try {
        const decoded = JSON.parse(decodeURIComponent(query.q)) as Partial<Query>
        this.setData({ q: { ...this.data.q, ...decoded } })
      } catch { /* ignore parse failure */ }
    }
    this.loadGuardians()
  },

  async loadGuardians() {
    try {
      const walkers = await listWalkers({})
      const cards: Card[] = walkers.map((w, i) => ({
        id: w._id,
        name: w.name,
        photo: w.avatar || undefined,
        initial: (w.name || '?').charAt(0),
        initialBg: PASTELS[i % PASTELS.length],
        badge: w.rating >= 4.85 ? '金牌' : undefined,
        rating: w.rating.toFixed(2),
        reviews: w.reviewCount,
        dist: ((i + 1) * 0.7).toFixed(1),
        city: w.areas?.[0] || '朝阳',
        bio: w.bio || '专业守护者，提供贴心照护',
        reused: i % 3 === 0,
        features: [
          { label: `认证${1 + (i % 6)}年`, cat: 'time' as const },
          ...(w.canMedicate    ? [{ label: '清洁消毒',  cat: 'care'  as const }] : []),
          ...(w.acceptsAggressive ? [{ label: '训练师', cat: 'skill' as const }] : []),
          ...(w.acceptsPuppy   ? [{ label: '户外活动',  cat: 'skill' as const }] : [])
        ].slice(0, 4),
        price: w.pricePerWalk,
        unit: '晚',
        orders: 100 + (i * 47) % 400,
        cert: w.rating >= 4.7,
        favorited: false
      }))
      this.setData({ guardians: cards, loading: false })
    } catch (e) {
      showAppError(e)
      this.setData({ loading: false })
    }
  },

  onBack() { wx.navigateBack({}).catch?.(() => undefined) },

  onPickPet()     { wx.showToast({ title: '修改宠物类型', icon: 'none' }) },
  onPickSvc()     { wx.showToast({ title: '修改服务类型', icon: 'none' }) },
  onPickAddress() { wx.showToast({ title: '修改地址', icon: 'none' }) },
  onPickDate()    { wx.showToast({ title: '修改日期', icon: 'none' }) },
  onOpenFilter()  { wx.showToast({ title: '筛选即将上线', icon: 'none' }) },
  onOpenSort()    { wx.showToast({ title: '排序即将上线', icon: 'none' }) },

  onToggleFav(e: WechatMiniprogram.BaseEvent) {
    const id = String(e.currentTarget.dataset.id)
    const guardians = this.data.guardians.map(g =>
      g.id === id ? { ...g, favorited: !g.favorited } : g
    )
    this.setData({ guardians })
  },

  onOpenGuardian(e: WechatMiniprogram.BaseEvent) {
    const id = String(e.currentTarget.dataset.id)
    wx.navigateTo({ url: `/pages/walker/index?id=${id}` })
  }
})
