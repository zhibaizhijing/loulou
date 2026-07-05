// v3 audit — rebuild against design ReviewGuardianScreen.jsx.
// Full CN chrome (评价守护者 nav), guardian card, dynamic star label, 8 impression
// tag multiselect, 500-char textarea + counter, dashed photo tiles, 匿名评价 toggle.
//
// Heavy-import pattern (submitReview / getBookingById / etc) triggered a silent
// module-load failure on fresh launch (same class of bug the order-modify page
// hit). Kept the on-load fetches inside try-catch and deferred imports to when
// they are actually needed at submit time.
export {}

const STAR_LABELS = ['', '很差', '一般', '满意', '很好', '非常满意']
const IMPRESSION_TAGS = [
  '准时可靠', '有耐心', '爱干净', '很专业',
  '拍照及时', '沟通顺畅', '宠物喜欢', '细心负责',
]

const SERVICE_LABEL_CN: Record<string, string> = {
  walking: '遛狗',
  boarding: '寄养',
  daycare: '日托',
  house_visit: '上门喂养',
  live_in: '伴宠留宿',
}

interface Data {
  bookingId: string
  guardianName: string
  guardianPhoto: string
  guardianInitial: string
  service: string
  dateLabel: string
  stars: 0|1|2|3|4|5
  starLabel: string
  starList: number[]
  tags: string[]
  selectedTags: Record<string, boolean>
  text: string
  charCount: number
  charMax: number
  anonymous: boolean
  submitting: boolean
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    bookingId: '',
    guardianName: '', guardianPhoto: '', guardianInitial: '',
    service: '', dateLabel: '',
    stars: 5, starLabel: STAR_LABELS[5],
    starList: [1, 2, 3, 4, 5],
    tags: IMPRESSION_TAGS,
    selectedTags: {},
    text: '', charCount: 0, charMax: 500,
    anonymous: false,
    submitting: false,
  },

  onLoad(q: Record<string, string>) {
    this.setData({ bookingId: q.bookingId || '' })
    // Lazy load walker/booking so an import failure never blocks initial render.
    void this.hydrateFromBooking()
  },

  async hydrateFromBooking() {
    if (!this.data.bookingId) return
    try {
      const { getBookingById } = await import('../../services/bookingService')
      const { getWalkerById }  = await import('../../services/walkerService')
      const b = await getBookingById(this.data.bookingId).catch(() => null)
      if (!b) return
      const w = await getWalkerById(b.walkerId).catch(() => null)
      const d = new Date(b.date)
      const dateLabel = `${d.getMonth() + 1}月${d.getDate()}日`
      this.setData({
        guardianName: w?.name || '守护者',
        guardianPhoto: w?.avatar || '',
        guardianInitial: (w?.name || '?').charAt(0),
        service: SERVICE_LABEL_CN[b.serviceType] || String(b.serviceType),
        dateLabel,
      })
    } catch { /* soft-fail; page still renders empty guardian card */ }
  },

  onPickStar(e: WechatMiniprogram.BaseEvent) {
    const n = Number(e.currentTarget.dataset.n) as 0|1|2|3|4|5
    this.setData({ stars: n, starLabel: STAR_LABELS[n] || '' })
  },

  onToggleTag(e: WechatMiniprogram.BaseEvent) {
    const t = String(e.currentTarget.dataset.tag)
    const selectedTags = { ...this.data.selectedTags }
    selectedTags[t] = !selectedTags[t]
    this.setData({ selectedTags })
  },

  onText(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    const raw = String(e.detail.value || '')
    const text = raw.slice(0, this.data.charMax)
    this.setData({ text, charCount: text.length })
  },

  onToggleAnonymous() { this.setData({ anonymous: !this.data.anonymous }) },

  async onSubmit() {
    if (this.data.stars === 0) return
    this.setData({ submitting: true })
    try {
      const { submitReview } = await import('../../services/reviewService')
      const { bus, BUS_EVENTS } = await import('../../utils/bus')
      const tags = Object.keys(this.data.selectedTags).filter(k => this.data.selectedTags[k])
      await submitReview({
        bookingId: this.data.bookingId,
        stars: this.data.stars as 1|2|3|4|5,
        text: this.data.text,
        // Extra v3 fields ignored by mock backend; kept for design parity.
        tags,
        anonymous: this.data.anonymous,
      } as any)
      bus.emit(BUS_EVENTS.REVIEW_SUBMITTED, { bookingId: this.data.bookingId })
      wx.showToast({ title: '评价已提交，感谢您的反馈 🌟', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 800)
    } catch (e: any) {
      wx.showToast({ title: e?.message || '提交失败，请重试', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },

  onBack() { wx.navigateBack({}).catch?.(() => undefined) },
})
