// v2 — OrderModifyScreen. Spec §2.12.
export {}

interface SvcOpt { id: string; label: string }

const SERVICE_OPTIONS: SvcOpt[] = [
  { id: 'boarding',    label: '寄养' },
  { id: 'daycare',     label: '日托' },
  { id: 'walking',     label: '遛狗' },
  { id: 'house_visit', label: '上门喂养' },
  { id: 'live_in',     label: '伴宠留宿' },
]

interface OmData {
  bookingId: string
  serviceOptions: SvcOpt[]
  service: string
  dateStart: string
  dateEnd: string
  note: string
}

Page<OmData, WechatMiniprogram.IAnyObject>({
  data: {
    bookingId: '',
    serviceOptions: SERVICE_OPTIONS,
    service: 'boarding',
    dateStart: '',
    dateEnd: '',
    note: '',
  },

  onLoad(q: Record<string, string>) {
    this.setData({ bookingId: q.id || '' })
  },

  onPickSvc(e: WechatMiniprogram.BaseEvent) {
    this.setData({ service: String(e.currentTarget.dataset.id) })
  },
  onStartDate(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ dateStart: e.detail.value })
  },
  onEndDate(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ dateEnd: e.detail.value })
  },
  onNote(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ note: e.detail.value })
  },

  onConfirm() {
    wx.showToast({ title: '修改已提交', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 600)
  },

  onBack() { wx.navigateBack({}).catch?.(() => undefined) },
})
