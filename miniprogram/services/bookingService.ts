import { cloudCall } from './cloudCall'
import { __USE_MOCK__ } from '../utils/env'
import { mockDb } from '../mocks/db'
import { AppError } from '../utils/errorHandler'
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
    mockPayment: { amount, paid: true },
    createdAt: now,
    updatedAt: now
  } as Omit<Booking, '_id'>)
  return { bookingId: inserted._id }
}
