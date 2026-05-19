import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/env', () => ({ __USE_MOCK__: false }))

import { resetWxMock, setCallFnHandler, setDbHandler, mockCollection } from '../helpers'
import { submitWalkReport, getWalkReportForBooking } from '@/services/walkReportService'

beforeEach(() => resetWxMock())

describe('walkReportService (live path)', () => {
  it('submit calls submitWalkReport fn', async () => {
    setCallFnHandler(async (n, d: any) => {
      expect(n).toBe('submitWalkReport')
      expect(d.bookingId).toBe('b1')
      return { ok: true, data: { reportId: 'r1' } }
    })
    const r = await submitWalkReport({ bookingId: 'b1', photos: [], notes: 'great walk', durationMin: 30, peeCount: 1, poopCount: 1 })
    expect(r.reportId).toBe('r1')
  })

  it('get reads from walkReports collection', async () => {
    setDbHandler({ collection: () => mockCollection([
      { _id: 'r1', bookingId: 'b1', photos: [], notes: '', durationMin: 30, peeCount: 0, poopCount: 0, walkerId: 'w1', createdAt: 1 }
    ])})
    const r = await getWalkReportForBooking('b1')
    expect(r?._id).toBe('r1')
  })
})
