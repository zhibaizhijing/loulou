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

interface Data {
  walker: Walker | null
  dogs: Dog[]
  selectedDogId: string
  addingDog: boolean
  datePart: string
  timePart: string
  checkOutDate: string               // for range variant (boarding / live_in)
  serviceType: ServiceType
  availableServices: ServiceType[]
  services: ServiceItem[]            // caregiver's active service items
  variant: 'minute' | 'stepper' | 'range'  // form variant
  minuteOptions: number[]            // for minute variant
  maxQuantity: number                // for stepper variant
  durationMin: number                // semantics: minutes (walking/house_visit), days (daycare), nights (boarding/live_in)
  durationLabel: string
  notes: string
  minDate: string
  minCheckOutDate: string
  submitting: boolean
  computedAmount: number
  priceFormula: string
  labels: Record<ServiceType, string>
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    walker: null, dogs: [], selectedDogId: '', addingDog: false,
    datePart: '', timePart: '', checkOutDate: '',
    serviceType: 'walking',
    availableServices: ['walking'],
    services: [],
    variant: 'minute',
    minuteOptions: [30, 45, 60],
    maxQuantity: 7,
    durationMin: 30,
    durationLabel: 'Duration',
    notes: '',
    minDate: formatDate(Date.now()),
    minCheckOutDate: formatDate(Date.now() + 86_400_000),
    submitting: false,
    computedAmount: 0,
    priceFormula: '',
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
      this.setData({ walker, services, availableServices: offered })
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
    const selectedDogId = dogs.length === 1 ? dogs[0].id : this.data.selectedDogId
    this.setData({ dogs, selectedDogId })
  },

  onPickDog(e: WechatMiniprogram.BaseEvent) {
    this.setData({ selectedDogId: String(e.currentTarget.dataset.id) })
  },

  onToggleAddDog() { this.setData({ addingDog: !this.data.addingDog }) },

  async onSaveDog(e: WechatMiniprogram.CustomEvent<{ dog: Dog }>) {
    const dog = e.detail.dog
    const dogs = [...this.data.dogs, dog]
    this.setData({ dogs, selectedDogId: dog.id, addingDog: false })
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
        break
    }
    this.setData({ serviceType: s, variant, minuteOptions, maxQuantity, durationMin, durationLabel })
    this.syncRangeDuration()
    this.recomputeAmount()
  },

  recomputeAmount() {
    const w = this.data.walker
    if (!w) return
    const svc = this.data.services.find(s => s.serviceType === this.data.serviceType && s.active)
    const unitPrice = svc ? svc.price : w.pricePerWalk
    const d = this.data.durationMin
    let amount = 0
    let formula = ''
    if (this.data.serviceType === 'walking' || this.data.serviceType === 'house_visit') {
      amount = unitPrice * (d / 30)
      formula = `S$${unitPrice} × ${d} min / 30 = S$${amount}`
    } else {
      amount = unitPrice * d
      const unit = this.data.serviceType === 'daycare' ? 'day' : 'night'
      formula = `S$${unitPrice} × ${d} ${unit}${d > 1 ? 's' : ''} = S$${amount}`
    }
    this.setData({ computedAmount: amount, priceFormula: formula })
  },

  onServiceTypeChange(e: WechatMiniprogram.CustomEvent<{ value: ServiceType }>) {
    this.applyServiceType(e.detail.value)
  },

  onDuration(e: WechatMiniprogram.CustomEvent<{ value: number }>) {
    this.setData({ durationMin: Number(e.detail.value) }, () => this.recomputeAmount())
  },

  onStepper(e: WechatMiniprogram.CustomEvent<{ value: number }>) {
    this.setData({ durationMin: Number(e.detail.value) }, () => this.recomputeAmount())
  },

  async onSubmit() {
    const { selectedDogId, datePart, timePart, durationMin, notes, serviceType, variant, checkOutDate } = this.data
    if (!selectedDogId) return wx.showToast({ title: 'Pick a dog', icon: 'none' })
    if (!datePart || !timePart) return wx.showToast({ title: 'Pick date & time', icon: 'none' })
    if (variant === 'range' && !checkOutDate) return wx.showToast({ title: 'Pick check-out date', icon: 'none' })
    const date = new Date(`${datePart}T${timePart}:00`).getTime()
    if (!(date > Date.now())) return wx.showToast({ title: 'Time must be in future', icon: 'none' })

    this.setData({ submitting: true })
    let createdBookingId = ''
    try {
      const r = await createBooking({ walkerId: this.walkerId, dogId: selectedDogId, date, serviceType, durationMin, notes })
      createdBookingId = r.bookingId

      const amount = this.data.computedAmount
      const confirm = await wx.showModal({
        title: 'Mock WeChat Pay',
        content: `Pay S$${amount} into platform escrow?`,
        confirmText: `Pay S$${amount}`,
        cancelText: 'Cancel'
      })
      if (!confirm.confirm) {
        // Owner backed out — best-effort cancel so the unpaid booking doesn't linger.
        await cancelBooking(createdBookingId).catch(() => undefined)
        this.setData({ submitting: false })
        wx.showToast({ title: 'Booking cancelled', icon: 'none' })
        return
      }

      await requestPayment({ bookingId: createdBookingId, idempotencyKey: `pay-${createdBookingId}-${Date.now()}` })
      bus.emit(BUS_EVENTS.BOOKING_CREATED, { bookingId: createdBookingId })
      wx.showToast({ title: 'Paid — held in escrow', icon: 'success' })
      wx.redirectTo({ url: `/pages/booking/index?id=${createdBookingId}` })
    } catch (e) {
      // If payment failed but booking was created, cancel it to leave a clean state.
      if (createdBookingId) await cancelBooking(createdBookingId).catch(() => undefined)
      showAppError(e)
    } finally {
      this.setData({ submitting: false })
    }
  }
})
