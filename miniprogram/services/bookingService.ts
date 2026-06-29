import { cloudCall } from './cloudCall'
import { __USE_MOCK__ } from '../utils/env'
import { mockDb } from '../mocks/db'
import { AppError } from '../utils/errorHandler'
import { mintOrderNo } from '../utils/orderStatus'
import type { Booking, ServiceType } from '../models'

const MOCK_OWNER_ID = 'mock-owner-1'

export interface CreateBookingInput {
  walkerId: string
  dogId: string
  date: number
  serviceType: ServiceType
  durationMin: number
  notes?: string
}

export async function createBooking(input: CreateBookingInput): Promise<{ bookingId: string }> {
  if (__USE_MOCK__) return createMock(input)
  return cloudCall<{ bookingId: string }>('createBooking', input)
}

export async function listMyBookings(): Promise<Booking[]> {
  if (__USE_MOCK__) {
    return mockDb.bookings
      .list()
      .filter(b => b.ownerId === MOCK_OWNER_ID)
      .sort((a, b) => b.date - a.date)
  }
  return cloudCall<Booking[]>('listBookings', {})
}

export async function getBookingById(bookingId: string): Promise<Booking> {
  if (__USE_MOCK__) {
    const b = mockDb.bookings.get(bookingId)
    if (!b) throw new AppError('NOT_FOUND', 'Booking not found')
    return b
  }
  return cloudCall<Booking>('getBooking', { bookingId })
}

export async function cancelBooking(bookingId: string): Promise<{ cancelled: boolean }> {
  if (__USE_MOCK__) {
    const b = mockDb.bookings.get(bookingId)
    if (!b) throw new AppError('NOT_FOUND', 'Booking not found')
    if (b.ownerId !== MOCK_OWNER_ID) throw new AppError('FORBIDDEN', 'Not your booking')
    if (b.status === 'completed') throw new AppError('CONFLICT', 'Cannot cancel completed booking')
    mockDb.bookings.update(bookingId, { status: 'cancelled', updatedAt: Date.now() })
    return { cancelled: true }
  }
  return cloudCall<{ cancelled: boolean }>('cancelBooking', { bookingId })
}

export async function acceptBooking(bookingId: string): Promise<{ accepted: boolean }> {
  if (__USE_MOCK__) {
    const b = mockDb.bookings.get(bookingId)
    if (!b) throw new AppError('NOT_FOUND', 'Booking not found')
    if (b.status !== 'requested') throw new AppError('CONFLICT', 'Booking is not pending')
    mockDb.bookings.update(bookingId, { status: 'accepted', updatedAt: Date.now() })
    return { accepted: true }
  }
  return cloudCall<{ accepted: boolean }>('acceptBooking', { bookingId })
}

export async function declineBooking(bookingId: string): Promise<{ declined: boolean }> {
  if (__USE_MOCK__) {
    const b = mockDb.bookings.get(bookingId)
    if (!b) throw new AppError('NOT_FOUND', 'Booking not found')
    if (b.status !== 'requested') throw new AppError('CONFLICT', 'Booking is not pending')
    mockDb.bookings.update(bookingId, { status: 'declined', updatedAt: Date.now() })
    return { declined: true }
  }
  return cloudCall<{ declined: boolean }>('declineBooking', { bookingId })
}

// v2 — multi-guardian batch booking (spec 2026-06-29 §3 + §5).
// The user submits one request that fans out to N guardians: one primary +
// (N-1) recommended extras. All bookings share batchId + batchTime.
//
// Mock mode also schedules the auto-accept/reject simulation:
//   - primary (or guardian id 'r2') → accepted after 3s
//   - extras → rejected after 5s
// On flip, an internal event is emitted via the chatService (system message)
// and notification badges are bumped via storageService.
//
// The cloud-fn variant is `createBookingBatch` (returns booking ids).

export interface BatchBookingInput extends CreateBookingInput {
  primaryWalkerId: string                   // the guardian the user explicitly chose
  additionalWalkerIds?: string[]            // recommended extras to also notify
  unitPrice?: number
  nights?: number
  dropoffStart?: number
  dropoffEnd?: number
  pickupStart?: number
  pickupEnd?: number
}

export interface BatchBookingResult {
  batchId: string
  bookingIds: string[]
  primaryBookingId: string
}

const simulatedBatch = new Set<string>()

export async function createBookingBatch(input: BatchBookingInput): Promise<BatchBookingResult> {
  if (__USE_MOCK__) return createBatchMock(input)
  return cloudCall<BatchBookingResult>('createBookingBatch', input)
}

function createBatchMock(input: BatchBookingInput): BatchBookingResult {
  const now = Date.now()
  const batchId = `batch-${now}`
  const ids = [input.primaryWalkerId, ...(input.additionalWalkerIds || [])]
  const bookingIds: string[] = []
  let primaryBookingId = ''

  for (let i = 0; i < ids.length; i++) {
    const walkerId = ids[i]
    const isPrimary = i === 0
    const walker = mockDb.walkers.get(walkerId)
    if (!walker) continue
    const svc = mockDb.services.list().find(s => s.caregiverId === walkerId && s.serviceType === input.serviceType && s.active)
    const unitPrice = input.unitPrice ?? (svc ? svc.price : walker.pricePerWalk)
    const amount =
      input.serviceType === 'walking' || input.serviceType === 'house_visit'
        ? unitPrice * (input.durationMin / 30)
        : unitPrice * input.durationMin

    const inserted = mockDb.bookings.insert({
      ownerId: MOCK_OWNER_ID,
      walkerId,
      dogId: input.dogId,
      date: input.date,
      serviceType: input.serviceType,
      durationMin: input.durationMin,
      status: 'requested',
      notes: input.notes,
      mockPayment: { amount, paid: false },
      payment: { state: 'unpaid', amount, commissionRate: 0.15, commission: 0, payoutAmount: 0 },
      orderNo: mintOrderNo(now + i),
      batchId,
      batchTime: now,
      isPrimary,
      nights: input.nights ?? input.durationMin,
      unitPrice,
      dropoffStart: input.dropoffStart,
      dropoffEnd: input.dropoffEnd,
      pickupStart: input.pickupStart,
      pickupEnd: input.pickupEnd,
      createdAt: now,
      updatedAt: now,
    } as Omit<Booking, '_id'>)
    bookingIds.push(inserted._id)
    if (isPrimary) primaryBookingId = inserted._id
  }

  scheduleAutoSim(bookingIds)
  return { batchId, bookingIds, primaryBookingId }
}

/** Auto-accept primary (or r2) after 3s; auto-reject extras after 5s. Idempotent. */
function scheduleAutoSim(ids: string[]) {
  ids.forEach(id => {
    if (simulatedBatch.has(id)) return
    simulatedBatch.add(id)
    const b = mockDb.bookings.get(id)
    if (!b) return
    const accepted = b.isPrimary === true || b.walkerId === 'r2'
    const delay = accepted ? 3000 : 5000
    setTimeout(() => {
      const fresh = mockDb.bookings.get(id)
      if (!fresh || fresh.status !== 'requested') return
      mockDb.bookings.update(id, {
        status: accepted ? 'accepted' : 'declined',
        updatedAt: Date.now(),
      })
      // Best-effort badge bump via wx.setStorage; pages read on show.
      try {
        const key = accepted ? 'loulou:badge:orders' : 'loulou:badge:orders'
        wx.setStorageSync(key, true)
        if (accepted) wx.setStorageSync('loulou:badge:chat', true)
      } catch { /* mock test env */ }
    }, delay)
  })
}

export async function listCaregiverPendingBookings(caregiverId: string): Promise<Booking[]> {
  if (__USE_MOCK__) {
    return mockDb.bookings
      .list()
      .filter(b => b.walkerId === caregiverId && b.status === 'requested')
      .sort((a, b) => a.date - b.date)
  }
  return cloudCall<Booking[]>('listCaregiverPendingBookings', { caregiverId })
}

function createMock(input: CreateBookingInput): { bookingId: string } {
  // Idempotency stub: same (owner, walker, date, serviceType) returns existing booking.
  const idemKey = `${MOCK_OWNER_ID}|${input.walkerId}|${input.date}|${input.serviceType}`
  const existing = mockDb.bookings.list().find(b => `${b.ownerId}|${b.walkerId}|${b.date}|${b.serviceType}` === idemKey)
  if (existing) return { bookingId: existing._id }

  const walker = mockDb.walkers.get(input.walkerId)
  if (!walker) throw new AppError('NOT_FOUND', 'Walker not found')

  const svc = mockDb.services.list().find(s => s.caregiverId === input.walkerId && s.serviceType === input.serviceType && s.active)
  const unitPrice = svc ? svc.price : walker.pricePerWalk

  // amount semantics:
  //  walking + house_visit: unitPrice × (durationMin / 30)   (per-30min walking, per-30min visit)
  //  boarding + live_in:    unitPrice × durationMin           (per-night × nights)
  //  daycare:               unitPrice × durationMin           (per-day × days)
  const amount =
    input.serviceType === 'walking' || input.serviceType === 'house_visit'
      ? unitPrice * (input.durationMin / 30)
      : unitPrice * input.durationMin

  const now = Date.now()
  const inserted = mockDb.bookings.insert({
    ownerId: MOCK_OWNER_ID,
    walkerId: input.walkerId,
    dogId: input.dogId,
    date: input.date,
    serviceType: input.serviceType,
    durationMin: input.durationMin,
    status: 'requested',
    notes: input.notes,
    mockPayment: { amount, paid: false },
    // P0-C: new bookings start unpaid; paymentService.requestPayment flips to held
    payment: { state: 'unpaid', amount, commissionRate: 0.15, commission: 0, payoutAmount: 0 },
    createdAt: now,
    updatedAt: now
  } as Omit<Booking, '_id'>)
  return { bookingId: inserted._id }
}
