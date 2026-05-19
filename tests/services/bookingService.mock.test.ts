import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/env', () => ({ __USE_MOCK__: true }))

import { createBooking, listMyBookings, getBookingById, cancelBooking, acceptBooking, declineBooking, listCaregiverPendingBookings } from '@/services/bookingService'
import { resetMockDb, mockDb } from '@/mocks/db'

const futureDate = () => Date.now() + 86400000

beforeEach(() => {
  resetMockDb()
  mockDb.walkers.insert({ _id: 'w1', name: 'Alex', areas: ['BT'], serviceTypes: ['walking'], pricePerWalk: 30, rating: 4.8, reviewCount: 10, photos: [], bio: '', avatar: '', demo: true } as any)
})

describe('bookingService (mock path)', () => {
  it('createBooking writes to mockDb with computed amount and requested status', async () => {
    const d = futureDate()
    const r = await createBooking({ walkerId: 'w1', dogId: 'd1', date: d, serviceType: 'walking', durationMin: 60 })
    expect(r.bookingId).toBeTruthy()
    const b = mockDb.bookings.get(r.bookingId)!
    expect(b.status).toBe('requested')
    expect(b.mockPayment.amount).toBe(60)  // 30 × (60/30)
    expect(b.mockPayment.paid).toBe(true)
  })

  it('createBooking idempotency — same (owner, walker, date, serviceType) returns existing id', async () => {
    const d = futureDate()
    const r1 = await createBooking({ walkerId: 'w1', dogId: 'd1', date: d, serviceType: 'walking', durationMin: 30 })
    const r2 = await createBooking({ walkerId: 'w1', dogId: 'd1', date: d, serviceType: 'walking', durationMin: 30 })
    expect(r1.bookingId).toBe(r2.bookingId)
    expect(mockDb.bookings.list()).toHaveLength(1)
  })

  it('createBooking boarding multiplies price by nights (not /30)', async () => {
    mockDb.services.insert({ _id: 's-board', caregiverId: 'w1', serviceType: 'boarding', price: 150, active: true, createdAt: 0, updatedAt: 0 } as any)
    const r = await createBooking({ walkerId: 'w1', dogId: 'd1', date: futureDate(), serviceType: 'boarding', durationMin: 3 })
    const b = mockDb.bookings.get(r.bookingId)!
    expect(b.serviceType).toBe('boarding')
    expect(b.durationMin).toBe(3)
    expect(b.mockPayment.amount).toBe(450)   // 150 × 3
  })

  it('createBooking throws NOT_FOUND on missing walker', async () => {
    await expect(createBooking({ walkerId: 'nope', dogId: 'd1', date: futureDate(), serviceType: 'walking', durationMin: 30 }))
      .rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('listMyBookings returns mock-owner-1 bookings sorted by date desc', async () => {
    const d1 = futureDate()
    const d2 = d1 + 86400000
    await createBooking({ walkerId: 'w1', dogId: 'd1', date: d1, serviceType: 'walking', durationMin: 30 })
    await createBooking({ walkerId: 'w1', dogId: 'd1', date: d2, serviceType: 'walking', durationMin: 30 })
    const r = await listMyBookings()
    expect(r).toHaveLength(2)
    expect(r[0].date).toBe(d2)
    expect(r[1].date).toBe(d1)
  })

  it('getBookingById returns booking', async () => {
    const c = await createBooking({ walkerId: 'w1', dogId: 'd1', date: futureDate(), serviceType: 'walking', durationMin: 30 })
    const r = await getBookingById(c.bookingId)
    expect(r._id).toBe(c.bookingId)
  })

  it('getBookingById throws NOT_FOUND on missing id', async () => {
    await expect(getBookingById('nope')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('cancelBooking flips status to cancelled', async () => {
    const c = await createBooking({ walkerId: 'w1', dogId: 'd1', date: futureDate(), serviceType: 'walking', durationMin: 30 })
    const r = await cancelBooking(c.bookingId)
    expect(r.cancelled).toBe(true)
    expect(mockDb.bookings.get(c.bookingId)?.status).toBe('cancelled')
  })

  it('cancelBooking throws CONFLICT on completed booking', async () => {
    const c = await createBooking({ walkerId: 'w1', dogId: 'd1', date: futureDate(), serviceType: 'walking', durationMin: 30 })
    mockDb.bookings.update(c.bookingId, { status: 'completed' } as any)
    await expect(cancelBooking(c.bookingId)).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('acceptBooking flips status to accepted', async () => {
    const c = await createBooking({ walkerId: 'w1', dogId: 'd1', date: futureDate(), serviceType: 'walking', durationMin: 30 })
    const r = await acceptBooking(c.bookingId)
    expect(r.accepted).toBe(true)
    expect(mockDb.bookings.get(c.bookingId)?.status).toBe('accepted')
  })

  it('declineBooking flips status to declined', async () => {
    const c = await createBooking({ walkerId: 'w1', dogId: 'd1', date: futureDate(), serviceType: 'walking', durationMin: 30 })
    const r = await declineBooking(c.bookingId)
    expect(r.declined).toBe(true)
    expect(mockDb.bookings.get(c.bookingId)?.status).toBe('declined')
  })

  it('acceptBooking throws CONFLICT on already-accepted booking', async () => {
    const c = await createBooking({ walkerId: 'w1', dogId: 'd1', date: futureDate(), serviceType: 'walking', durationMin: 30 })
    await acceptBooking(c.bookingId)
    await expect(acceptBooking(c.bookingId)).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('listCaregiverPendingBookings returns only requested bookings for caregiver', async () => {
    mockDb.walkers.insert({ _id: 'w2', name: 'Blake', areas: ['BT'], serviceTypes: ['walking'], pricePerWalk: 30, rating: 4.5, reviewCount: 5, photos: [], bio: '', avatar: '', demo: true } as any)
    const c1 = await createBooking({ walkerId: 'w1', dogId: 'd1', date: futureDate(),     serviceType: 'walking', durationMin: 30 })
    const c2 = await createBooking({ walkerId: 'w1', dogId: 'd1', date: futureDate() + 1, serviceType: 'walking', durationMin: 30 })
    await createBooking({ walkerId: 'w2', dogId: 'd1', date: futureDate() + 2, serviceType: 'walking', durationMin: 30 })
    await acceptBooking(c2.bookingId)
    const r = await listCaregiverPendingBookings('w1')
    expect(r).toHaveLength(1)
    expect(r[0]._id).toBe(c1.bookingId)
  })
})
