import { getWalkerById } from '../../services/walkerService'
import { createBooking, cancelBooking } from '../../services/bookingService'
import { listActiveServicesForCaregiver } from '../../services/serviceItemService'
import { requestPayment } from '../../services/paymentService'
import { showAppError } from '../../utils/errorHandler'
import { formatDate } from '../../utils/date'
import { bus, BUS_EVENTS } from '../../utils/bus'
import { cloudCall } from '../../services/cloudCall'
import { __USE_MOCK__ } from '../../utils/env'
import { mockDb } from '../../mocks/db'
import { SERVICE_TYPE_LABEL } from '../../models/index'
import type { Walker, Dog, ServiceType, ServiceItem, User } from '../../models/index'

const MOCK_OWNER_ID = 'mock-owner-1'

interface SvcChoice { id: ServiceType; label: string; loc: string }
interface ExtraItem  { id: string; label: string; desc: string; price: number; qty: number }
interface ExtraBreak { id: string; label: string; qty: number; subtotal: number }
interface SuccessStep { icon: string; bg: string; title: string; desc: string }

interface Data {
  stage: 'form' | 'success'
  walker: Walker | null
  dogs: Dog[]
  selectedDogIds: Record<string, boolean>
  addingDog: boolean
  datePart: string
  timePart: string
  dropoffTime: string
  pickupTime: string
  dropoffLabel: string
  pickupLabel: string
  checkOutDate: string
  serviceType: ServiceType
  serviceLabelCN: string
  locLabel: string
  locColor: 'guardian' | 'owner'
  availableServices: ServiceType[]
  serviceChips: SvcChoice[]
  services: ServiceItem[]
  variant: 'minute' | 'stepper' | 'range'
  minuteOptions: number[]
  maxQuantity: number
  durationMin: number
  durationLabel: string
  notes: string
  minDate: string
  minCheckOutDate: string
  submitting: boolean

  // Pricing
  computedAmount: number
  serviceSubtotal: number
  platformFee: number
  priceFormula: string
  priceSummary: string

  // Extras
  extras: ExtraItem[]
  extrasBreakdown: ExtraBreak[]

  // Sheets
  svcSheetOpen: boolean
  priceDrawerOpen: boolean

  // Success
  successSteps: SuccessStep[]

  labels: Record<ServiceType, string>
}

const LOC: Record<ServiceType, { label: string; color: 'guardian' | 'owner' }> = {
  boarding:    { label: '在守护者家',    color: 'guardian' },
  daycare:     { label: '在守护者家',    color: 'guardian' },
  walking:     { label: '在你的小区周边', color: 'owner'    },
  house_visit: { label: '在宠物主家',    color: 'owner'    },
  live_in:     { label: '在宠物主家',    color: 'owner'    }
}

const SVC_CN: Record<ServiceType, string> = {
  boarding: '寄养', daycare: '日托', walking: '遛狗',
  house_visit: '上门喂养', live_in: '伴宠留宿'
}

const SUCCESS_STEPS: SuccessStep[] = [
  { icon: 'clock',            bg: 'butter',   title: '守护者即将回复', desc: '您联系的守护者通常会在 30 分钟内回复。' },
  { icon: 'chat-circle-dots', bg: 'lavender', title: '安排会面熟悉',   desc: '守护者回复后，可以约一次服务前的线下见面，让您、您的宠物和守护者互相认识。' },
  { icon: 'check-circle',     bg: 'mint',     title: '确认并支付',     desc: '双方都满意后，您可以付款托管，正式开始这次守护时刻。' }
]

const BASE_EXTRAS: ExtraItem[] = [
  { id: 'pickup', label: '守护者上门接送', desc: '守护者上门接送您的宠物，省心省力', price: 30, qty: 0 },
  { id: 'bath',   label: '洗澡护理',       desc: '专业清洁，宠物回家干净舒适',         price: 68, qty: 0 }
]

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    stage: 'form',
    walker: null, dogs: [], selectedDogIds: {}, addingDog: false,
    datePart: '', timePart: '', checkOutDate: '',
    dropoffTime: '', pickupTime: '',
    dropoffLabel: '送达时间段',
    pickupLabel: '接回时间段',
    serviceType: 'walking',
    serviceLabelCN: '遛狗',
    locLabel: '在你的小区周边',
    locColor: 'owner',
    availableServices: ['walking'],
    serviceChips: [{ id: 'walking', label: '遛狗', loc: '在你的小区周边' }],
    services: [],
    variant: 'minute',
    minuteOptions: [30, 45, 60],
    maxQuantity: 7,
    durationMin: 30,
    durationLabel: 'Walk duration',
    notes: '',
    minDate: formatDate(Date.now()),
    minCheckOutDate: formatDate(Date.now() + 86_400_000),
    submitting: false,

    computedAmount: 0,
    serviceSubtotal: 0,
    platformFee: 0,
    priceFormula: '',
    priceSummary: '请选择日期',

    extras: BASE_EXTRAS.map(e => ({ ...e })),
    extrasBreakdown: [],

    svcSheetOpen: false,
    priceDrawerOpen: false,

    successSteps: SUCCESS_STEPS,

    labels: SERVICE_TYPE_LABEL
  },
  walkerId: '' as string,

  async onLoad(query: Record<string, string>) {
    this.walkerId = query.walkerId
    try {
      const walker = await getWalkerById(this.walkerId)
      const services = await listActiveServicesForCaregiver(this.walkerId).catch(() => [] as ServiceItem[])
      const offered: ServiceType[] = walker.serviceTypes && walker.serviceTypes.length > 0 ? walker.serviceTypes : ['walking']
      const initialType: ServiceType = offered.includes('walking') ? 'walking' : offered[0] as ServiceType
      const serviceChips: SvcChoice[] = offered.map(s => ({ id: s, label: SVC_CN[s], loc: LOC[s].label }))
      this.setData({ walker, services, availableServices: offered, serviceChips })
      this.applyServiceType(initialType)
      await this.loadDogs()
    } catch (e) { showAppError(e) }
  },

  async loadDogs() {
    let dogs: Dog[] = []
    if (__USE_MOCK__) {
      const u = mockDb.users.list().find(x => x._id === MOCK_OWNER_ID)
      dogs = u?.dogs || []
    } else {
      const r = await cloudCall<{ dogs?: Dog[] }>('getMyProfile', {}).catch(() => ({ dogs: [] as Dog[] }))
      dogs = r.dogs || []
    }
    const selectedDogIds: Record<string, boolean> = {}
    if (dogs.length === 1) selectedDogIds[dogs[0].id] = true
    this.setData({ dogs, selectedDogIds })
  },

  onTogglePet(e: WechatMiniprogram.BaseEvent) {
    const id = String(e.currentTarget.dataset.id)
    const next = { ...this.data.selectedDogIds }
    next[id] = !next[id]
    if (!next[id]) delete next[id]
    this.setData({ selectedDogIds: next }, () => this.recomputeAmount())
  },

  onToggleAddDog() { this.setData({ addingDog: !this.data.addingDog }) },

  async onSaveDog(e: WechatMiniprogram.CustomEvent<{ dog: Dog }>) {
    const dog = e.detail.dog
    const dogs = [...this.data.dogs, dog]
    const selectedDogIds = { ...this.data.selectedDogIds, [dog.id]: true }
    this.setData({ dogs, selectedDogIds, addingDog: false })
    if (__USE_MOCK__) {
      const u = mockDb.users.list().find(x => x._id === MOCK_OWNER_ID)
      if (u) mockDb.users.update(u._id, { dogs } as Partial<User>)
    } else {
      await cloudCall('updateProfile', { name: '__keep__', dogs }).catch(() => undefined)
    }
  },

  onDate(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    const datePart = String(e.detail.value)
    const minCheckOutDate = formatDate(new Date(datePart).getTime() + 86_400_000)
    let checkOutDate = this.data.checkOutDate
    if (checkOutDate && checkOutDate < minCheckOutDate) checkOutDate = minCheckOutDate
    this.setData({ datePart, minCheckOutDate, checkOutDate })
    this.syncRangeDuration()
  },
  onTime(e: WechatMiniprogram.CustomEvent<{ value: string }>) { this.setData({ timePart: String(e.detail.value) }) },
  onCheckOutDate(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ checkOutDate: String(e.detail.value) })
    this.syncRangeDuration()
  },
  onDropoff(e: WechatMiniprogram.CustomEvent<{ value: string }>) { this.setData({ dropoffTime: String(e.detail.value) }) },
  onPickup(e: WechatMiniprogram.CustomEvent<{ value: string }>)  { this.setData({ pickupTime: String(e.detail.value) }) },

  syncRangeDuration() {
    if (this.data.variant !== 'range') return
    const { datePart, checkOutDate } = this.data
    if (!datePart || !checkOutDate) return
    const ci = new Date(datePart).getTime()
    const co = new Date(checkOutDate).getTime()
    const nights = Math.max(1, Math.round((co - ci) / 86_400_000))
    this.setData({ durationMin: nights }, () => this.recomputeAmount())
  },

  applyServiceType(s: ServiceType) {
    let variant: 'minute' | 'stepper' | 'range' = 'minute'
    let minuteOptions = [30, 45, 60]
    let maxQuantity = 7
    let durationMin = 30
    let durationLabel = 'Duration'
    let dropoffLabel = '送达时间段'
    let pickupLabel = '接回时间段'

    switch (s) {
      case 'walking':
        variant = 'minute'; minuteOptions = [30, 45, 60]; durationMin = 30
        durationLabel = 'Walk duration'
        break
      case 'house_visit':
        variant = 'minute'; minuteOptions = [30, 60, 90]; durationMin = 30
        durationLabel = 'Visit duration'
        break
      case 'boarding':
        variant = 'range'; durationMin = 1
        durationLabel = 'Check-in → check-out'
        break
      case 'daycare':
        variant = 'stepper'; maxQuantity = 5; durationMin = 1
        durationLabel = 'Days'
        break
      case 'live_in':
        variant = 'range'; durationMin = 1
        durationLabel = 'Check-in → check-out'
        dropoffLabel = '守护者到达时间段'
        pickupLabel = '守护者离开时间段'
        break
    }
    const loc = LOC[s]
    this.setData({
      serviceType: s, variant, minuteOptions, maxQuantity, durationMin, durationLabel,
      serviceLabelCN: SVC_CN[s], locLabel: loc.label, locColor: loc.color,
      dropoffLabel, pickupLabel
    })
    this.syncRangeDuration()
    this.recomputeAmount()
  },

  petCount(): number {
    return Math.max(1, Object.values(this.data.selectedDogIds).filter(Boolean).length)
  },

  recomputeAmount() {
    const w = this.data.walker
    if (!w) return
    const svc = this.data.services.find(s => s.serviceType === this.data.serviceType && s.active)
    const unitPrice = svc ? svc.price : w.pricePerWalk
    const d = this.data.durationMin
    const pc = this.petCount()
    const svcType = this.data.serviceType
    let serviceSubtotal = 0
    let formula = ''
    let priceSummary = ''
    let unit = '次'
    if (svcType === 'walking' || svcType === 'house_visit') {
      const sessions = Math.ceil(d / 30)
      serviceSubtotal = unitPrice * sessions * pc
      formula = `¥${unitPrice} × ${sessions} 次${pc > 1 ? ` × ${pc} 只` : ''}`
      priceSummary = `${sessions} 次${pc > 1 ? ` × ${pc} 只` : ''}`
    } else {
      unit = svcType === 'daycare' ? '天' : '晚'
      serviceSubtotal = unitPrice * d * pc
      formula = `¥${unitPrice} × ${d} ${unit}${pc > 1 ? ` × ${pc} 只` : ''}`
      priceSummary = `${d} ${unit}${pc > 1 ? ` × ${pc} 只` : ''}`
    }
    const extrasTotal = this.data.extras.reduce((s, e) => s + e.qty * e.price, 0)
    const subtotal = serviceSubtotal + extrasTotal
    const platformFee = Math.round(subtotal * 0.15)
    const total = subtotal + platformFee
    const extrasBreakdown: ExtraBreak[] = this.data.extras
      .filter(e => e.qty > 0)
      .map(e => ({ id: e.id, label: e.label, qty: e.qty, subtotal: e.qty * e.price }))
    const hasDate = svcType === 'walking' || svcType === 'house_visit'
      ? Boolean(this.data.datePart && this.data.timePart)
      : Boolean(this.data.datePart && (this.data.variant === 'stepper' || this.data.checkOutDate))
    this.setData({
      computedAmount: hasDate ? total : 0,
      serviceSubtotal,
      platformFee,
      priceFormula: formula,
      priceSummary: hasDate ? priceSummary : '请选择日期',
      extrasBreakdown
    })
  },

  onMinTap(e: WechatMiniprogram.BaseEvent) {
    const v = Number(e.currentTarget.dataset.value)
    this.setData({ durationMin: v }, () => this.recomputeAmount())
  },
  onStepInc() {
    const next = Math.min(this.data.maxQuantity, this.data.durationMin + 1)
    this.setData({ durationMin: next }, () => this.recomputeAmount())
  },
  onStepDec() {
    const next = Math.max(1, this.data.durationMin - 1)
    this.setData({ durationMin: next }, () => this.recomputeAmount())
  },

  onExtraInc(e: WechatMiniprogram.BaseEvent) {
    const id = String(e.currentTarget.dataset.id)
    const extras = this.data.extras.map(x => x.id === id ? { ...x, qty: x.qty + 1 } : x)
    this.setData({ extras }, () => this.recomputeAmount())
  },
  onExtraDec(e: WechatMiniprogram.BaseEvent) {
    const id = String(e.currentTarget.dataset.id)
    const extras = this.data.extras.map(x => x.id === id ? { ...x, qty: Math.max(0, x.qty - 1) } : x)
    this.setData({ extras }, () => this.recomputeAmount())
  },

  onOpenSvcSheet()  { this.setData({ svcSheetOpen: true }) },
  onCloseSvcSheet() { this.setData({ svcSheetOpen: false }) },
  onPickSvcFromSheet(e: WechatMiniprogram.BaseEvent) {
    const id = e.currentTarget.dataset.id as ServiceType
    this.applyServiceType(id)
    this.setData({ svcSheetOpen: false })
  },

  onOpenPriceDrawer()  { if (this.data.computedAmount > 0) this.setData({ priceDrawerOpen: true }) },
  onClosePriceDrawer() { this.setData({ priceDrawerOpen: false }) },

  onBack()       { wx.navigateBack({}).catch?.(() => undefined) },
  onGoToOrders() {
    wx.switchTab({ url: '/pages/bookings/index', fail: () => wx.reLaunch({ url: '/pages/bookings/index' }) })
  },

  async onSubmit() {
    const selectedIds = Object.keys(this.data.selectedDogIds).filter(id => this.data.selectedDogIds[id])
    const selectedDogId = selectedIds[0] || ''
    const { datePart, timePart, durationMin, notes, serviceType, variant, checkOutDate } = this.data
    if (!selectedDogId) return wx.showToast({ title: '请选择宠物', icon: 'none' })
    if (!datePart) return wx.showToast({ title: '请选择日期', icon: 'none' })
    if (variant !== 'range' && !timePart) return wx.showToast({ title: '请选择时间', icon: 'none' })
    if (variant === 'range' && !checkOutDate) return wx.showToast({ title: '请选择退房日期', icon: 'none' })
    const dateTime = variant === 'range' ? `${datePart}T12:00:00` : `${datePart}T${timePart}:00`
    const date = new Date(dateTime).getTime()
    if (!(date > Date.now())) return wx.showToast({ title: '时间必须在未来', icon: 'none' })

    this.setData({ submitting: true })
    let createdBookingId = ''
    try {
      const r = await createBooking({ walkerId: this.walkerId, dogId: selectedDogId, date, serviceType, durationMin, notes })
      createdBookingId = r.bookingId

      const amount = this.data.computedAmount
      const confirm = await wx.showModal({
        title: 'Mock WeChat Pay',
        content: `支付 ¥${amount} 进入平台担保托管？`,
        confirmText: '支付',
        cancelText: '取消'
      })
      if (!confirm.confirm) {
        await cancelBooking(createdBookingId).catch(() => undefined)
        this.setData({ submitting: false })
        wx.showToast({ title: '已取消', icon: 'none' })
        return
      }

      await requestPayment({ bookingId: createdBookingId, idempotencyKey: `pay-${createdBookingId}-${Date.now()}` })
      bus.emit(BUS_EVENTS.BOOKING_CREATED, { bookingId: createdBookingId })
      this.setData({ stage: 'success' })
    } catch (e) {
      if (createdBookingId) await cancelBooking(createdBookingId).catch(() => undefined)
      showAppError(e)
    } finally {
      this.setData({ submitting: false })
    }
  }
})
