// v2 — BookingRequestScreen. Spec §2.7.
//
// Renders three stacked sections:
//   (a) page header  : 22/800 "订单" + ll-order-tab-bar
//   (b) draft section: only when activeTab === '全部' && draftGuardians.length
//   (c) apps list    : batch-grouped active + historical
import { listMyBookings, createBookingBatch } from '../../services/bookingService'
import { getWalkerById } from '../../services/walkerService'
import {
  getDraftGuardians, getDraftConfig,
  updateConfig, removeGuardian, clearDraft,
  type DraftGuardian, type DraftConfig,
} from '../../services/draftBasketService'
import { showAppError } from '../../utils/errorHandler'
import { bus, BUS_EVENTS } from '../../utils/bus'
import { SERVICE_TYPE_LABEL, type ServiceType } from '../../models/index'
import {
  toV2Status, STATUS_TAB_KEY, isHistorical,
  type V2Status,
} from '../../utils/orderStatus'

interface CardRow {
  id: string
  status: V2Status
  guardianName: string
  guardianPhoto?: string
  guardianInitial?: string
  guardianInitialBg?: string
  service: string
  dateStart: string
  dateEnd?: string
  pet: string
  batchId: string
  batchTime: number
}

interface Batch {
  key: string
  time: number
  timeLabel: string
  apps: CardRow[]
}

interface DraftRow {
  guardian: DraftGuardian
  checked: boolean
  price: number
  unit: string
}

type TabKey = '全部' | '待确认' | '待付款' | '待完成' | '已完成' | '已失效'

interface Data {
  activeTab: TabKey
  config: DraftConfig
  draftRows: DraftRow[]
  hasDraft: boolean
  checkedCount: number
  batches: Batch[]
  historical: CardRow[]
  hasAny: boolean
  pageStatus: string
}

const STATUS_PRIORITY: Record<V2Status, number> = {
  accepted: 0, pending: 1, in_progress: 2, completed: 9, rejected: 9, cancelled: 9,
}

function fmtBatchTime(t: number): string {
  if (!t) return '已发送'
  const now = Date.now()
  const diffMin = Math.floor((now - t) / 60000)
  if (diffMin < 1) return '刚刚发送'
  if (diffMin < 60) return `${diffMin}分钟前发送`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}小时前发送`
  const d = new Date(t)
  return `${d.getMonth() + 1}月${d.getDate()}日发送`
}

function fmtDateCN(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    activeTab: '全部',
    config: { service: '寄养', pet: '狗·豆豆', dateStart: '', dateEnd: '', area: '朝阳区·望京' },
    draftRows: [],
    hasDraft: false,
    checkedCount: 0,
    batches: [],
    historical: [],
    hasAny: false,
    pageStatus: 'loading',
  },
  checkedIds: new Set<string>() as Set<string>,
  unsub: null as null | (() => void),

  onLoad() {
    this.unsub = bus.on(BUS_EVENTS.BOOKING_CREATED, () => this.load())
    this.hydrateDraft()
    this.load()
  },
  onShow() {
    this.hydrateDraft()
    if (this.data.batches.length || this.data.historical.length) this.load()
    const tb = this.getTabBar?.() as WechatMiniprogram.Component.TrivialInstance | undefined
    if (tb && typeof tb.setData === 'function') {
      tb.setData({ activePath: '/pages/bookings/index' })
    }
    // Clear orders badge once user sees this page
    try { wx.removeStorageSync('loulou:badge:orders') } catch { /* noop */ }
  },
  onUnload() { this.unsub?.() },

  hydrateDraft() {
    const guardians = getDraftGuardians()
    const config = getDraftConfig()
    // Auto-check all draft guardians on first hydrate; preserve user's prior choice otherwise.
    if (this.checkedIds.size === 0 && guardians.length) {
      guardians.forEach(g => this.checkedIds.add(g.id))
    }
    const draftRows: DraftRow[] = guardians.map(g => ({
      guardian: g,
      checked: this.checkedIds.has(g.id),
      price: g.servicePrice || 0,
      unit: g.serviceUnit || '次',
    }))
    this.setData({
      config,
      draftRows,
      hasDraft: draftRows.length > 0,
      checkedCount: draftRows.filter(r => r.checked).length,
    })
  },

  async load() {
    try {
      const bookings = await listMyBookings()
      const rows: CardRow[] = []
      for (const b of bookings) {
        const w = await getWalkerById(b.walkerId).catch(() => null)
        const status = toV2Status(b.status)
        rows.push({
          id: b._id,
          status,
          guardianName: w?.name || '守护者',
          guardianPhoto: w?.avatar,
          guardianInitial: (w?.name || '?').charAt(0),
          guardianInitialBg: '#EDE5F7',
          service: SERVICE_TYPE_LABEL[b.serviceType],
          dateStart: fmtDateCN(b.date),
          dateEnd: undefined,
          pet: `时长 ${b.durationMin}`,
          batchId: b.batchId || `solo-${b._id}`,
          batchTime: b.batchTime || b.createdAt,
        })
      }
      this.applyTab(rows)
    } catch (e) { showAppError(e) }
  },

  applyTab(allRows?: CardRow[]) {
    // Re-collect rows from state if not passed
    if (!allRows) {
      allRows = [...this.data.batches.flatMap(b => b.apps), ...this.data.historical]
    }
    const tab = this.data.activeTab
    const filtered = tab === '全部'
      ? allRows
      : allRows.filter(r => STATUS_TAB_KEY[r.status] === tab)

    const active     = filtered.filter(r => !isHistorical(r.status))
    const historical = filtered.filter(r =>  isHistorical(r.status))

    // Group active by batchId
    const map = new Map<string, CardRow[]>()
    active.forEach(r => {
      const arr = map.get(r.batchId) || []
      arr.push(r); map.set(r.batchId, arr)
    })
    const batches: Batch[] = []
    map.forEach((apps, key) => {
      apps.sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status])
      const time = apps[0]?.batchTime || 0
      batches.push({ key, time, timeLabel: fmtBatchTime(time), apps })
    })
    batches.sort((a, b) => b.time - a.time)
    historical.sort((a, b) => b.batchTime - a.batchTime)

    const hasAny = batches.length > 0 || historical.length > 0
    this.setData({
      batches,
      historical,
      hasAny,
      pageStatus: hasAny ? 'loaded' : 'empty',
    })
  },

  onPickTab(e: WechatMiniprogram.CustomEvent<{ tab: TabKey }>) {
    this.setData({ activeTab: e.detail.tab })
    this.applyTab()
  },

  onConfigChange(e: WechatMiniprogram.CustomEvent<{ field: keyof DraftConfig; value: string }>) {
    updateConfig(e.detail.field, e.detail.value)
    this.setData({ config: getDraftConfig() })
  },

  onToggleDraft(e: WechatMiniprogram.BaseEvent) {
    const id = String(e.currentTarget.dataset.id)
    if (this.checkedIds.has(id)) this.checkedIds.delete(id)
    else this.checkedIds.add(id)
    this.hydrateDraft()
  },

  onRemoveDraft(e: WechatMiniprogram.BaseEvent) {
    const id = String(e.currentTarget.dataset.id)
    removeGuardian(id)
    this.checkedIds.delete(id)
    this.hydrateDraft()
  },

  onBrowseMore() {
    wx.switchTab({ url: '/pages/home/index' })
  },

  async onSubmit() {
    const ids = [...this.checkedIds]
    if (!ids.length) return
    const cfg = this.data.config
    const today = new Date()
    const serviceMap: Record<string, ServiceType> = {
      '寄养': 'boarding', '日托': 'daycare', '遛狗': 'walking',
      '上门喂养': 'house_visit', '伴宠留宿': 'live_in',
    }
    const serviceType = serviceMap[String(cfg.service)] || 'boarding'
    try {
      const r = await createBookingBatch({
        walkerId: ids[0],
        primaryWalkerId: ids[0],
        additionalWalkerIds: ids.slice(1),
        dogId: 'mock-dog-1',
        date: today.getTime(),
        serviceType,
        durationMin: 1,
        notes: '',
      })
      clearDraft(ids)
      ids.forEach(id => this.checkedIds.delete(id))
      this.hydrateDraft()
      this.load()
      wx.showToast({ title: `申请已发送给 ${r.bookingIds.length} 位守护者`, icon: 'success' })
    } catch (e) { showAppError(e) }
  },

  onOpenSummary(e: WechatMiniprogram.CustomEvent<{ id: string }>) {
    wx.navigateTo({ url: `/pages/booking/index?id=${e.detail.id}` })
  },
  onOpenChat(e: WechatMiniprogram.CustomEvent<{ id: string }>) {
    wx.navigateTo({ url: `/pages/chat/index?bookingId=${e.detail.id}` })
  },
  onRebook(e: WechatMiniprogram.CustomEvent<{ id: string }>) {
    const row = [...this.data.batches.flatMap(b => b.apps), ...this.data.historical].find(r => r.id === e.detail.id)
    if (!row) return
    wx.navigateTo({ url: `/pages/booking/index?id=${row.id}` })
  },
  onWriteReview(e: WechatMiniprogram.CustomEvent<{ id: string }>) {
    wx.navigateTo({ url: `/pages/review/index?bookingId=${e.detail.id}` })
  },

  onPullDownRefresh() { this.load().finally(() => wx.stopPullDownRefresh()) },
})
