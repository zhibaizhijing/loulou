import { listWalkers } from '../../services/walkerService'
import { showAppError } from '../../utils/errorHandler'

/** Design v3 Tag tone. Categories map: time→mint (credential), care→neutral (facility),
 *  skill→butter (service), relation→lavender. */
type TagTone = 'butter' | 'lavender' | 'mint' | 'peach' | 'neutral'
interface Feature { label: string; tone: TagTone }

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
  sortOpen: boolean
  sortOptions: string[]
  filterOpen: boolean
  fieldPicker: { open: boolean; field: string; title: string; options: string[]; value: string }
}

const SORT_OPTIONS = ['智能排序', '距离由近到远', '评分由高到低', '价格由低到高', '价格由高到低']
const PET_OPTIONS  = ['猫', '狗', '兔子', '鼠鼠', '鸟']
const SVC_OPTIONS  = ['寄养', '日托', '遛狗', '上门喂养', '伴宠留宿']
const ADDRESS_OPTIONS = ['朝阳区·望京', '朝阳区·三里屯', '朝阳区·国贸', '海淀区·中关村', '东城区·东直门']

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
    sort: '智能排序',
    sortOpen: false,
    sortOptions: SORT_OPTIONS,
    filterOpen: false,
    fieldPicker: { open: false, field: '', title: '', options: [], value: '' },
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
          { label: `认证${1 + (i % 6)}年`, tone: 'mint'    as TagTone },
          ...(w.canMedicate       ? [{ label: '清洁消毒', tone: 'neutral' as TagTone }] : []),
          ...(w.acceptsAggressive ? [{ label: '训练师',   tone: 'butter'  as TagTone }] : []),
          ...(w.acceptsPuppy      ? [{ label: '户外活动', tone: 'butter'  as TagTone }] : []),
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

  // v3 audit — summary chips re-open the same pickers used on home so users can
  // amend the query in place, matching design SearchResultsScreen `onPickField`.
  onPickPet() {
    this.setData({ fieldPicker: { open: true, field: 'petType', title: '选择宠物类型', options: PET_OPTIONS, value: this.data.q.petType } })
  },
  onPickSvc() {
    this.setData({ fieldPicker: { open: true, field: 'svcType', title: '选择服务类型', options: SVC_OPTIONS, value: this.data.q.svcType } })
  },
  onPickAddress() {
    this.setData({ fieldPicker: { open: true, field: 'address', title: '选择地址', options: ADDRESS_OPTIONS, value: this.data.q.address } })
  },
  onPickDate() {
    wx.showToast({ title: '日期编辑器即将上线', icon: 'none' })
  },
  onPickFieldValue(e: WechatMiniprogram.BaseEvent) {
    const value = String(e.currentTarget.dataset.value)
    const field = this.data.fieldPicker.field
    if (field && (field in this.data.q)) {
      (this.data.q as any)[field] = value
      this.setData({ q: this.data.q })
    }
    this.setData({ fieldPicker: { ...this.data.fieldPicker, open: false } })
  },
  onCloseFieldPicker() {
    this.setData({ fieldPicker: { ...this.data.fieldPicker, open: false } })
  },

  onOpenFilter() {
    this.setData({ filterOpen: true })
  },
  onCloseFilter() { this.setData({ filterOpen: false }) },
  onClearFilters() {
    this.setData({ filterOpen: false, filterCount: 0 })
    wx.showToast({ title: '已清空筛选', icon: 'none' })
  },
  onApplyFilters() {
    this.setData({ filterOpen: false })
  },

  onOpenSort() { this.setData({ sortOpen: !this.data.sortOpen }) },
  onPickSort(e: WechatMiniprogram.BaseEvent) {
    const sort = String(e.currentTarget.dataset.sort)
    const sorters: Record<string, (a: Card, b: Card) => number> = {
      '智能排序':     (a, b) => parseFloat(b.rating) - parseFloat(a.rating),
      '距离由近到远': (a, b) => parseFloat(a.dist) - parseFloat(b.dist),
      '评分由高到低': (a, b) => parseFloat(b.rating) - parseFloat(a.rating),
      '价格由低到高': (a, b) => a.price - b.price,
      '价格由高到低': (a, b) => b.price - a.price,
    }
    const sorter = sorters[sort] || sorters['智能排序']
    const guardians = [...this.data.guardians].sort(sorter)
    this.setData({ sort, sortOpen: false, guardians })
  },
  onCloseSort() { this.setData({ sortOpen: false }) },
  noop() { /* stopPropagation for sheet body taps */ },

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
