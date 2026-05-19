import type { Caregiver, Review, Booking, Message, WalkReport, User, ServiceItem, AvailabilitySlot, CaregiverApplication } from '../models'
import { emitChange } from './realtime'
import { loadAll, saveAll } from './storage'
import { SEED_WALKERS, SEED_REVIEWS_TEMPLATE, SEED_OWNER } from './seedData'

type Record_ = { _id: string }

class Collection<T extends Record_> {
  private rows: T[] = []
  constructor(public readonly name: string) {}

  load(initial: T[]) { this.rows = initial.map(r => ({ ...r })) }
  snapshot(): T[] { return this.rows.map(r => ({ ...r })) }
  list(): T[] { return this.snapshot() }

  get(id: string): T | null {
    return this.rows.find(r => r._id === id) ?? null
  }

  insert(doc: Omit<T, '_id'> & { _id?: string }): T {
    const id = doc._id ?? `${this.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const row = { ...doc, _id: id } as T
    this.rows.push(row)
    persistAndNotify(this.name, 'insert', row)
    return { ...row }
  }

  update(id: string, patch: Partial<T>): T | null {
    const i = this.rows.findIndex(r => r._id === id)
    if (i < 0) return null
    this.rows[i] = { ...this.rows[i], ...patch }
    persistAndNotify(this.name, 'update', this.rows[i])
    return { ...this.rows[i] }
  }

  delete(id: string): boolean {
    const i = this.rows.findIndex(r => r._id === id)
    if (i < 0) return false
    const [removed] = this.rows.splice(i, 1)
    persistAndNotify(this.name, 'delete', removed)
    return true
  }
}

const caregiversCollection = new Collection<Caregiver>('caregivers')

export const mockDb = {
  caregivers:   caregiversCollection,
  walkers:      caregiversCollection,    // alias — points to SAME instance
  reviews:      new Collection<Review>('reviews'),
  bookings:     new Collection<Booking>('bookings'),
  messages:     new Collection<Message>('messages'),
  walkReports:  new Collection<WalkReport>('walkReports'),
  users:        new Collection<User>('users'),
  applications: new Collection<CaregiverApplication>('applications'),
  services:     new Collection<ServiceItem>('services'),
  availability: new Collection<AvailabilitySlot>('availability')
}

function persistAndNotify(coll: string, op: 'insert' | 'update' | 'delete', row: Record_) {
  saveAll(snapshotAll())
  emitChange(coll, op, row)
}

function snapshotAll() {
  return {
    caregivers:   mockDb.caregivers.snapshot(),
    reviews:      mockDb.reviews.snapshot(),
    bookings:     mockDb.bookings.snapshot(),
    messages:     mockDb.messages.snapshot(),
    walkReports:  mockDb.walkReports.snapshot(),
    users:        mockDb.users.snapshot(),
    applications: mockDb.applications.snapshot(),
    services:     mockDb.services.snapshot(),
    availability: mockDb.availability.snapshot()
  }
}

let initialised = false

export function initMockDb() {
  if (initialised) return
  initialised = true
  const restored = loadAll()
  if (restored && (restored.caregivers?.length || restored.walkers?.length)) {
    const cgData = (restored.caregivers ?? restored.walkers) as Caregiver[]
    caregiversCollection.load(cgData)
    mockDb.reviews.load(restored.reviews as Review[])
    mockDb.bookings.load(restored.bookings as Booking[])
    mockDb.messages.load(restored.messages as Message[])
    mockDb.walkReports.load(restored.walkReports as WalkReport[])
    mockDb.users.load(restored.users as User[])
    if (restored.applications?.length) mockDb.applications.load(restored.applications as CaregiverApplication[])
    if (restored.services?.length) mockDb.services.load(restored.services as ServiceItem[])
    if (restored.availability?.length) mockDb.availability.load(restored.availability as AvailabilitySlot[])
    return
  }
  // Cold seed
  const now = Date.now()
  const caregivers: Caregiver[] = SEED_WALKERS.map((w, i) => ({ ...w, _id: `walker-${i + 1}` }))
  caregiversCollection.load(caregivers)

  const reviews: Review[] = []
  caregivers.forEach((w, wIdx) => {
    SEED_REVIEWS_TEMPLATE.slice(0, 2).forEach((t, rIdx) => {
      reviews.push({
        _id: `review-${wIdx + 1}-${rIdx + 1}`,
        bookingId: `seed-${w._id}`,
        ownerId: SEED_OWNER._id,
        walkerId: w._id,
        stars: t.stars,
        text: t.text,
        createdAt: now - reviews.length * 86_400_000
      })
    })
  })
  mockDb.reviews.load(reviews)
  mockDb.users.load([{ ...SEED_OWNER }])

  // Seed service items
  const serviceItems: ServiceItem[] = []
  let svcIdx = 0
  caregivers.forEach(c => {
    c.serviceTypes.forEach(st => {
      let price: number
      if (st === 'walking') price = c.pricePerWalk
      else if (st === 'boarding') price = Math.round(c.pricePerWalk * 5)
      else if (st === 'live_in') price = 120
      else price = Math.round(c.pricePerWalk * 1.5)  // daycare / house_visit
      serviceItems.push({
        _id: `service-${++svcIdx}`,
        caregiverId: c._id,
        serviceType: st,
        price,
        active: true,
        createdAt: now,
        updatedAt: now
      })
    })
  })
  mockDb.services.load(serviceItems)

  saveAll(snapshotAll())
}

export function resetMockDb() {
  caregiversCollection.load([])
  mockDb.reviews.load([])
  mockDb.bookings.load([])
  mockDb.messages.load([])
  mockDb.walkReports.load([])
  mockDb.users.load([])
  mockDb.applications.load([])
  mockDb.services.load([])
  mockDb.availability.load([])
  initialised = false
  saveAll({})
}
