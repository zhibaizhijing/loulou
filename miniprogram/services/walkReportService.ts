import { cloudCall } from './cloudCall'
import { __USE_MOCK__ } from '../utils/env'
import { mockDb } from '../mocks/db'
import { AppError } from '../utils/errorHandler'
import type { WalkReport } from '../models'

export interface SubmitWalkReportInput {
  bookingId: string
  photos: string[]
  notes: string
  durationMin: number
  peeCount: number
  poopCount: number
}

export async function submitWalkReport(input: SubmitWalkReportInput): Promise<{ reportId: string }> {
  if (__USE_MOCK__) return submitMock(input)
  return cloudCall<{ reportId: string }>('submitWalkReport', input)
}

export async function getWalkReportForBooking(bookingId: string): Promise<WalkReport | null> {
  if (__USE_MOCK__) {
    return mockDb.walkReports.list().find(r => r.bookingId === bookingId) ?? null
  }
  const db = wx.cloud.database()
  const r = await db.collection('walkReports').where({ bookingId }).limit(1).get()
  const d = (r as any).data as WalkReport[]
  return d[0] || null
}

function submitMock(input: SubmitWalkReportInput): { reportId: string } {
  const booking = mockDb.bookings.get(input.bookingId)
  if (!booking) throw new AppError('NOT_FOUND', 'Booking not found')
  if (booking.status === 'completed') throw new AppError('CONFLICT', 'Already completed')

  const inserted = mockDb.walkReports.insert({
    bookingId: input.bookingId,
    walkerId: booking.walkerId,
    photos: input.photos ?? [],
    notes: input.notes,
    durationMin: input.durationMin,
    peeCount: input.peeCount,
    poopCount: input.poopCount,
    createdAt: Date.now()
  } as Omit<WalkReport, '_id'>)

  const now = Date.now()
  mockDb.bookings.update(input.bookingId, { status: 'completed', completedAt: now, updatedAt: now } as any)
  return { reportId: inserted._id }
}
