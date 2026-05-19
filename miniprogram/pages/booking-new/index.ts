import { getWalkerById } from '../../services/walkerService'
import { createBooking } from '../../services/bookingService'
import { listActiveServicesForCaregiver } from '../../services/serviceItemService'
import { showAppError } from '../../utils/errorHandler'
import { formatDate } from '../../utils/date'
import { bus, BUS_EVENTS } from '../../utils/bus'
import { cloudCall } from '../../services/cloudCall'
import { SERVICE_TYPE_LABEL } from '../../models/index'
import type { Walker, Dog, ServiceType, ServiceItem } from '../../models/index'

interface Data {
  walker: Walker | null
  dogs: Dog[]
  selectedDogId: string
  addingDog: boolean
  datePart: string
  timePart: string
  serviceType: ServiceType
  availableServices: ServiceType[]
  services: ServiceItem[]            // caregiver's active service items
  variant: 'minute' | 'stepper'      // form variant
  minuteOptions: number[]            // for minute variant
  maxQuantity: number                // for stepper variant
  durationMin: number
  durationLabel: string
  notes: string
  minDate: string
  submitting: boolean
  computedAmount: number
  priceFormula: string
  labels: Record<ServiceType, string>
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    walker: null, dogs: [], selectedDogId: '', addingDog: false,
    datePart: '', timePart: '',
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
    const r = await cloudCall<{ dogs?: Dog[] }>('getMyProfile', {}).catch(() => ({ dogs: [] as Dog[] }))
    this.setData({ dogs: r.dogs || [] })
  },

  onPickDog(e: WechatMiniprogram.BaseEvent) {
    this.setData({ selectedDogId: String(e.currentTarget.dataset.id) })
  },

  onToggleAddDog() { this.setData({ addingDog: !this.data.addingDog }) },

  async onSaveDog(e: WechatMiniprogram.CustomEvent<{ dog: Dog }>) {
    const dog = e.detail.dog
    const dogs = [...this.data.dogs, dog]
    this.setData({ dogs, selectedDogId: dog.id, addingDog: false })
    await cloudCall('updateProfile', { name: '__keep__', dogs }).catch(() => undefined)
  },

  onDate(e: WechatMiniprogram.CustomEvent<{ value: string }>) { this.setData({ datePart: String(e.detail.value) }) },
  onTime(e: WechatMiniprogram.CustomEvent<{ value: string }>) { this.setData({ timePart: String(e.detail.value) }) },

  applyServiceType(s: ServiceType) {
    let variant: 'minute' | 'stepper' = 'minute'
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
        variant = 'stepper'; maxQuantity = 7; durationMin = 1
        durationLabel = 'Nights'
        break
      case 'daycare':
        variant = 'stepper'; maxQuantity = 5; durationMin = 1
        durationLabel = 'Days'
        break
      case 'live_in':
        variant = 'stepper'; maxQuantity = 30; durationMin = 1
        durationLabel = 'Nights'
        break
    }
    this.setData({ serviceType: s, variant, minuteOptions, maxQuantity, durationMin, durationLabel })
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
    const { selectedDogId, datePart, timePart, durationMin, notes, serviceType } = this.data
    if (!selectedDogId) return wx.showToast({ title: 'Pick a dog', icon: 'none' })
    if (!datePart || !timePart) return wx.showToast({ title: 'Pick date & time', icon: 'none' })
    const date = new Date(`${datePart}T${timePart}:00`).getTime()
    if (!(date > Date.now())) return wx.showToast({ title: 'Time must be in future', icon: 'none' })

    this.setData({ submitting: true })
    try {
      const r = await createBooking({ walkerId: this.walkerId, dogId: selectedDogId, date, serviceType, durationMin, notes })
      bus.emit(BUS_EVENTS.BOOKING_CREATED, { bookingId: r.bookingId })
      wx.showToast({ title: 'Booking confirmed', icon: 'success' })
      wx.redirectTo({ url: `/pages/booking/index?id=${r.bookingId}` })
    } catch (e) {
      showAppError(e)
    } finally {
      this.setData({ submitting: false })
    }
  }
})
