import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/env', () => ({ __USE_MOCK__: false }))

import { setCallFnHandler, resetWxMock } from '../helpers'
import { createBooking, listMyBookings, getBookingById, cancelBooking } from '@/services/bookingService'

beforeEach(() => resetWxMock())

describe('bookingService (live path)', () => {
  it('createBooking calls createBooking fn and returns id', async () => {
    setCallFnHandler(async (n, d: any) => {
      expect(n).toBe('createBooking')
      expect(d.walkerId).toBe('w1')
      return { ok: true, data: { bookingId: 'b1' } }
    })
    const r = await createBooking({ walkerId: 'w1', dogId: 'd1', date: Date.now() + 86400000, serviceType: 'walking', durationMin: 30 })
    expect(r.bookingId).toBe('b1')
  })

  it('listMyBookings calls listBookings fn', async () => {
    const fn = vi.fn(async () => ({ ok: true, data: [] }))
    setCallFnHandler(fn)
    await listMyBookings()
    expect(fn).toHaveBeenCalledWith('listBookings', {})
  })

  it('getBookingById passes id', async () => {
    setCallFnHandler(async (_n, d: any) => ({ ok: true, data: { _id: d.bookingId } }))
    const r = await getBookingById('b1')
    expect(r._id).toBe('b1')
  })

  it('cancelBooking forwards bookingId', async () => {
    setCallFnHandler(async (n, d: any) => {
      expect(n).toBe('cancelBooking'); expect(d.bookingId).toBe('b1')
      return { ok: true, data: { cancelled: true } }
    })
    await cancelBooking('b1')
  })
})
