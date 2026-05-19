import type { Caregiver } from '../models'
import { mockDb } from '../mocks/db'
import { __USE_MOCK__ } from '../utils/env'
import { AppError } from '../utils/errorHandler'

const SESSION_KEY = 'caregiver:currentId'

export function currentCaregiverId(): string | null {
  try {
    const v = wx.getStorageSync(SESSION_KEY)
    return v ? String(v) : null
  } catch { return null }
}

export function isCaregiverMode(): boolean {
  return currentCaregiverId() !== null
}

export function getCurrentCaregiver(): Caregiver | null {
  const id = currentCaregiverId()
  if (!id) return null
  if (__USE_MOCK__) {
    return mockDb.caregivers.get(id)
  }
  // Live path: future — cloud fetch by id.
  return null
}

export function switchToCaregiver(caregiverId: string): Caregiver {
  if (__USE_MOCK__) {
    const c = mockDb.caregivers.get(caregiverId)
    if (!c) throw new AppError('NOT_FOUND', 'NOT_FOUND: Caregiver not found')
    wx.setStorageSync(SESSION_KEY, caregiverId)
    return c
  }
  // Live path: future — server-side verification that this user owns the caregiver doc.
  throw new AppError('INTERNAL', 'Live caregiver auth not implemented')
}

export function exitCaregiverMode(): void {
  try { wx.removeStorageSync(SESSION_KEY) } catch { /* ignore */ }
}
