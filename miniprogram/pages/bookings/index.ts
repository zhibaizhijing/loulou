import { listMyBookings } from '../../services/bookingService'
import { getWalkerById } from '../../services/walkerService'
import { createPageState } from '../../utils/usePageState'
import { showAppError } from '../../utils/errorHandler'
import { formatDateTime } from '../../utils/date'
import { bus, BUS_EVENTS } from '../../utils/bus'
import { SERVICE_TYPE_LABEL } from '../../models/index'
import type { Booking } from '../../models'

interface Row extends Booking {
  walkerName: string
  walkerAvatar?: string
  walkerInitial: string
  bg: 'butter' | 'lavender' | 'mint' | 'peach'
  serviceLabel: string
  dateLabel: string
  petLabel: string
  statusLabel: string
  statusBg: string
  statusFg: string
  statusDesc: string
  descColor: string
  tabKey: '待确认' | '待付款' | '待完成' | '已完成' | '已失效'
  canAct: boolean
}

type TabKey = '全部' | '待确认' | '待付款' | '待完成' | '已完成' | '已失效'

interface Data {
  tab: TabKey
  tabs: TabKey[]
  all: Row[]
  filtered: Row[]
  pageStatus: string
  pageError: string
}

const PASTELS: Row['bg'][] = ['butter', 'lavender', 'mint', 'peach']

interface StatusMeta {
  label: string
  bg: string
  fg: string
  desc: string
  tabKey: Row['tabKey']
}

const STATUS_META: Record<Booking['status'], StatusMeta> = {
  requested:   { label: '待确认', bg: '#FEF3C7', fg: '#B45309', desc: '申请已发出，等待守护者接受', tabKey: '待确认' },
  accepted:    { label: '待付款', bg: '#E6F1EC', fg: '#2C7A4B', desc: '守护者已确认接单，请尽快付款', tabKey: '待付款' },
  in_progress: { label: '待完成', bg: '#E3EEF7', fg: '#2F5F87', desc: '服务进行中',                tabKey: '待完成' },
  completed:   { label: '已完成', bg: '#F0F0F5', fg: '#6B6B7A', desc: '服务已完成，感谢信任',    tabKey: '已完成' },
  declined:    { label: '已拒绝', bg: '#FFF0F0', fg: '#CC2200', desc: '守护者暂时无法接受此申请', tabKey: '已失效' },
  cancelled:   { label: '已取消', bg: '#F0F0F5', fg: '#6B6B7A', desc: '订单已取消',              tabKey: '已失效' }
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    tab: '全部',
    tabs: ['全部', '待确认', '待付款', '待完成', '已完成', '已失效'],
    all: [], filtered: [],
    pageStatus: 'loading', pageError: ''
  },
  unsub: null as null | (() => void),

  onLoad() {
    this.unsub = bus.on(BUS_EVENTS.BOOKING_CREATED, () => this.load())
    this.load()
  },
  onShow() {
    if (this.data.all.length) this.load()
    const tb = this.getTabBar?.() as WechatMiniprogram.Component.TrivialInstance | undefined
    if (tb && typeof tb.setData === 'function') {
      tb.setData({ activePath: '/pages/bookings/index' })
    }
  },
  onUnload() { this.unsub?.() },

  async load() {
    const ps = createPageState(this.setData.bind(this))
    try {
      const bookings = await ps.run(() => listMyBookings())
      const rows: Row[] = []
      for (let i = 0; i < bookings.length; i++) {
        const b = bookings[i]
        const walker = await getWalkerById(b.walkerId).catch(() => null)
        const meta = STATUS_META[b.status]
        const unit = b.serviceType === 'walking' || b.serviceType === 'house_visit' ? 'min'
                  : b.serviceType === 'daycare' ? '天' : '晚'
        rows.push({
          ...b,
          walkerName:    walker?.name || '守护者',
          walkerAvatar:  walker?.avatar,
          walkerInitial: (walker?.name || '?').charAt(0),
          bg:            PASTELS[i % PASTELS.length],
          serviceLabel:  SERVICE_TYPE_LABEL[b.serviceType],
          dateLabel:     formatDateTime(b.date),
          petLabel:      `时长 ${b.durationMin} ${unit}`,
          statusLabel:   meta.label,
          statusBg:      meta.bg,
          statusFg:      meta.fg,
          statusDesc:    meta.desc,
          descColor:     meta.fg,
          tabKey:        meta.tabKey,
          canAct:        b.status !== 'declined' && b.status !== 'cancelled'
        })
      }
      this.setData({ all: rows })
      this.applyTab()
    } catch (e) { showAppError(e) }
  },

  applyTab() {
    const t = this.data.tab
    const filtered = t === '全部' ? this.data.all : this.data.all.filter(r => r.tabKey === t)
    this.setData({ filtered, pageStatus: filtered.length === 0 ? 'empty' : 'loaded' })
  },

  onTab(e: WechatMiniprogram.BaseEvent) {
    const t = e.currentTarget.dataset.tab as TabKey
    this.setData({ tab: t })
    this.applyTab()
  },

  onTap(e: WechatMiniprogram.BaseEvent) {
    wx.navigateTo({ url: `/pages/booking/index?id=${e.currentTarget.dataset.id}` })
  },
  onOpenChat(e: WechatMiniprogram.BaseEvent) {
    wx.navigateTo({ url: `/pages/chat/index?bookingId=${e.currentTarget.dataset.id}` })
  },
  onPay(e: WechatMiniprogram.BaseEvent) {
    wx.navigateTo({ url: `/pages/booking/index?id=${e.currentTarget.dataset.id}` })
  },
  onReview(e: WechatMiniprogram.BaseEvent) {
    wx.navigateTo({ url: `/pages/review/index?bookingId=${e.currentTarget.dataset.id}` })
  },

  onPullDownRefresh() { this.load().finally(() => wx.stopPullDownRefresh()) }
})
