import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/env', () => ({ __USE_MOCK__: true }))

import { submitWalkReport, getWalkReportForBooking } from '@/services/walkReportService'
import { uploadImage } from '@/services/storageService'
import { resetMockDb, mockDb } from '@/mocks/db'

const futureDate = () => Date.now() + 86400000

beforeEach(() => {
  resetMockDb()
  mockDb.walkers.insert({ _id: 'w1', name: 'A', areas: [], serviceTypes: ['walking'], pricePerWalk: 30, rating: 4.0, reviewCount: 0, photos: [], bio: '', avatar: '', demo: true } as any)
  mockDb.bookings.insert({ _id: 'b1', ownerId: 'mock-owner-1', walkerId: 'w1', dogId: 'd1', date: futureDate(), durationMin: 30, status: 'accepted', mockPayment: { amount: 30, paid: true }, createdAt: 0, updatedAt: 0 } as any)
})

describe('walkReportService (mock path)', () => {
  it('submitWalkReport inserts + flips booking to completed', async () => {
    const r = await submitWalkReport({ bookingId: 'b1', photos: ['p1'], notes: 'Great', durationMin: 40, peeCount: 2, poopCount: 1 })
    expect(r.reportId).toBeTruthy()
    const report = mockDb.walkReports.list()[0]
    expect(report.bookingId).toBe('b1')
    expect(report.notes).toBe('Great')
    expect(report.durationMin).toBe(40)
    expect(report.peeCount).toBe(2)
    expect(report.poopCount).toBe(1)
    expect(report.walkerId).toBe('w1')
    expect(mockDb.bookings.get('b1')?.status).toBe('completed')
  })

  it('submitWalkReport throws NOT_FOUND on missing booking', async () => {
    await expect(submitWalkReport({ bookingId: 'nope', photos: [], notes: 'x', durationMin: 30, peeCount: 0, poopCount: 0 }))
      .rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('submitWalkReport throws CONFLICT on already completed', async () => {
    mockDb.bookings.update('b1', { status: 'completed' } as any)
    await expect(submitWalkReport({ bookingId: 'b1', photos: [], notes: 'x', durationMin: 30, peeCount: 0, poopCount: 0 }))
      .rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('getWalkReportForBooking returns null when no report', async () => {
    const r = await getWalkReportForBooking('b1')
    expect(r).toBeNull()
  })

  it('getWalkReportForBooking returns the submitted report', async () => {
    await submitWalkReport({ bookingId: 'b1', photos: [], notes: 'X', durationMin: 30, peeCount: 0, poopCount: 0 })
    const r = await getWalkReportForBooking('b1')
    expect(r?.notes).toBe('X')
  })

  it('uploadImage returns mock-file:// url', async () => {
    const url = await uploadImage('/local/path.jpg', 'walkreport')
    expect(url).toMatch(/^mock-file:\/\/walkreport\//)
  })
})
