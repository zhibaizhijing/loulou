import { showAppError } from '../../utils/errorHandler'

interface SvcItem { id: string; icon: string; bg: string; hint: string }
interface RecentItem { id: string; name: string; photo?: string; initial: string; served?: boolean }
interface BannerItem { tag: string; title: string; sub: string; bg: string; emoji: string; action?: 'guide' }

interface Data {
  city: string
  petType: string
  petOptions: string[]
  petPickerOpen: boolean
  addressPickerOpen: boolean
  addressOptions: string[]
  svcType: string
  services: SvcItem[]
  selectedSvc: SvcItem
  address: string
  dateLabel: string
  dateSummary: string
  startDate: string
  endDate: string
  recents: RecentItem[]
  banners: BannerItem[]
  bannerIdx: number
  currentBanner: BannerItem
  minStart: string
  minEnd: string
}

const SERVICES: SvcItem[] = [
  { id: '寄养',     icon: 'house',       hint: '24小时照护',               bg: 'butter' },
  { id: '日托',     icon: 'sun',         hint: '白天看护，当天接送',        bg: 'peach' },
  { id: '遛狗',     icon: 'sneaker',     hint: '至少30分钟',               bg: 'mint' },
  { id: '上门喂养', icon: 'hand-waving', hint: '查看、喂食、换水、铲屎等至少30分钟', bg: 'lavender' },
  { id: '伴宠留宿', icon: 'moon-stars',  hint: '守护者上门陪伴/过夜',       bg: 'sky' }
]

const BANNERS: BannerItem[] = [
  { tag: '新手必看',   title: 'Lou Lou 全流程指引', sub: '从注册到完成订单，一步看懂', bg: 'butter',   emoji: '🐾', action: 'guide' },
  { tag: '新人专享',   title: '首单立减 ¥20',       sub: '注册即得专属优惠券',         bg: 'peach',    emoji: '🎉' },
  { tag: '成为守护者', title: '陪伴萌宠 · 赚取收入', sub: '认证通过即可接单',           bg: 'lavender', emoji: '🐾' },
  { tag: '邀请有礼',   title: '邀好友得 ¥30 券',     sub: '双方均可领取',               bg: 'mint',     emoji: '🎁' }
]

const RECENTS: RecentItem[] = [
  { id: 'r1', name: '林若', initial: '林', photo: 'https://i.pravatar.cc/120?img=47', served: true },
  { id: 'r2', name: '陈逸', initial: '陈', photo: 'https://i.pravatar.cc/120?img=12', served: true },
  { id: 'r3', name: '桃子', initial: '桃', photo: 'https://i.pravatar.cc/120?img=32' }
]

const ADDRESSES = ['朝阳区·望京', '朝阳区·三里屯', '朝阳区·国贸', '海淀区·中关村', '东城区·东直门', '西城区·西单']

const SVC_FORM: Record<string, 'A' | 'B'> = {
  '寄养': 'A', '日托': 'A', '伴宠留宿': 'A',
  '遛狗': 'B', '上门喂养': 'B'
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function tomorrowStr(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fmtDateCN(s: string): string {
  if (!s) return ''
  const [, m, d] = s.split('-').map(Number)
  return `${m}月${d}日`
}

function daysBetween(a: string, b: string): number {
  if (!a || !b) return 0
  return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000))
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    city: '北京',
    petType: '狗',
    petOptions: ['猫', '狗', '兔子', '鼠鼠', '鸟'],
    petPickerOpen: false,
    addressPickerOpen: false,
    addressOptions: ADDRESSES,
    svcType: '上门喂养',
    services: SERVICES,
    selectedSvc: SERVICES[3],
    address: '朝阳区·望京',
    dateLabel: '日期与时段',
    dateSummary: '',
    startDate: '',
    endDate: '',
    recents: RECENTS,
    banners: BANNERS,
    bannerIdx: 0,
    currentBanner: BANNERS[0],
    minStart: todayStr(),
    minEnd: tomorrowStr()
  },

  onLoad() {
    this.updateDateLabel(this.data.svcType)
  },

  onShow() {
    const tb = this.getTabBar?.() as WechatMiniprogram.Component.TrivialInstance | undefined
    if (tb && typeof tb.setData === 'function') {
      tb.setData({ activePath: '/pages/home/index' })
    }
  },

  onPullDownRefresh() { wx.stopPullDownRefresh() },

  updateDateLabel(svc: string) {
    const form = SVC_FORM[svc] || 'A'
    this.setData({ dateLabel: form === 'B' ? '日期与时段' : '日期' })
  },

  refreshDateSummary() {
    const { svcType, startDate, endDate } = this.data
    const form = SVC_FORM[svcType] || 'A'
    if (!startDate) {
      this.setData({ dateSummary: '' })
      return
    }
    if (form === 'A') {
      if (!endDate) {
        this.setData({ dateSummary: `${fmtDateCN(startDate)} 起` })
        return
      }
      const nights = daysBetween(startDate, endDate)
      const unit = svcType === '日托' ? '天' : '晚'
      this.setData({ dateSummary: `${fmtDateCN(startDate)} – ${fmtDateCN(endDate)} · ${nights} ${unit}` })
    } else {
      this.setData({ dateSummary: fmtDateCN(startDate) })
    }
  },

  onPickSvc(e: WechatMiniprogram.BaseEvent) {
    const id = String(e.currentTarget.dataset.id)
    const sel = this.data.services.find(s => s.id === id) || this.data.services[0]
    this.setData({ svcType: id, selectedSvc: sel })
    this.updateDateLabel(id)
    this.refreshDateSummary()
  },

  onPickPetType()    { this.setData({ petPickerOpen: true }) },
  onClosePetPicker() { this.setData({ petPickerOpen: false }) },
  onSelectPet(e: WechatMiniprogram.BaseEvent) {
    const v = String(e.currentTarget.dataset.value)
    this.setData({ petType: v, petPickerOpen: false })
  },

  onPickAddress()        { this.setData({ addressPickerOpen: true }) },
  onCloseAddressPicker() { this.setData({ addressPickerOpen: false }) },
  onSelectAddress(e: WechatMiniprogram.BaseEvent) {
    const v = String(e.currentTarget.dataset.value)
    this.setData({ address: v, addressPickerOpen: false })
  },

  onStartDate(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    const v = e.detail.value
    let endDate = this.data.endDate
    const nextMin = new Date(v); nextMin.setDate(nextMin.getDate() + 1)
    const minEnd = `${nextMin.getFullYear()}-${String(nextMin.getMonth() + 1).padStart(2, '0')}-${String(nextMin.getDate()).padStart(2, '0')}`
    if (endDate && endDate < minEnd) endDate = ''
    this.setData({ startDate: v, endDate, minEnd })
    this.refreshDateSummary()
  },

  onEndDate(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ endDate: e.detail.value })
    this.refreshDateSummary()
  },

  onSearch() {
    try {
      const q = JSON.stringify({
        petType: this.data.petType,
        svcType: this.data.svcType,
        address: this.data.address,
        startDate: this.data.startDate,
        endDate: this.data.endDate
      })
      wx.navigateTo({ url: `/pages/search-results/index?q=${encodeURIComponent(q)}` })
    } catch (e) { showAppError(e) }
  },

  onPickRecent(e: WechatMiniprogram.BaseEvent) {
    const id = String(e.currentTarget.dataset.id)
    wx.navigateTo({ url: `/pages/walker/index?id=${id}` })
  },

  onBanner() {
    if (this.data.currentBanner?.action === 'guide') {
      wx.navigateTo({ url: '/pages/process-guide/index' })
    }
  },
  onOpenGuide() { wx.navigateTo({ url: '/pages/process-guide/index' }) },
  onBannerDot(e: WechatMiniprogram.BaseEvent) {
    const i = Number(e.currentTarget.dataset.i)
    this.setData({ bannerIdx: i, currentBanner: this.data.banners[i] })
  }
})
