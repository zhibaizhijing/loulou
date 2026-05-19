import type { AvailabilitySlot } from '../models'
import { mockDb } from '../mocks/db'
import { __USE_MOCK__ } from '../utils/env'
import { cloudCall } from './cloudCall'
import { AppError } from '../utils/errorHandler'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function getMonthAvailability(
  caregiverId: string,
  yearMonth: string   // 'YYYY-MM'
): Promise<AvailabilitySlot[]> {
  if (!/^\d{4}-\d{2}$/.test(yearMonth)) throw new AppError('VALIDATION', 'yearMonth must be YYYY-MM')
  if (__USE_MOCK__) {
    return mockDb.availability.list().filter(s => s.caregiverId === caregiverId && s.date.startsWith(yearMonth))
  }
  return cloudCall<AvailabilitySlot[]>('getMonthAvailability', { caregiverId, yearMonth })
}

export async function setDayAvailability(
  caregiverId: string,
  date: string,
  available: boolean
): Promise<{ slotId: string }> {
  if (!DATE_RE.test(date)) throw new AppError('VALIDATION', 'date must be YYYY-MM-DD')
  if (__USE_MOCK__) {
    const existing = mockDb.availability.list().find(s => s.caregiverId === caregiverId && s.date === date)
    if (existing) {
      mockDb.availability.update(existing._id, { available })
      return { slotId: existing._id }
    }
    const r = mockDb.availability.insert({ caregiverId, date, available } as Omit<AvailabilitySlot, '_id'>)
    return { slotId: r._id }
  }
  return cloudCall<{ slotId: string }>('setDayAvailability', { caregiverId, date, available })
}

export async function isAvailable(caregiverId: string, date: string): Promise<boolean> {
  if (__USE_MOCK__) {
    const slot = mockDb.availability.list().find(s => s.caregiverId === caregiverId && s.date === date)
    if (!slot) return true   // default: available unless explicitly blocked
    return slot.available
  }
  const r = await cloudCall<{ available: boolean }>('isAvailable', { caregiverId, date })
  return r.available
}
