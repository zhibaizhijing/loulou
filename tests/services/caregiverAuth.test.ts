import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/env', () => ({ __USE_MOCK__: true }))

import { currentCaregiverId, isCaregiverMode, getCurrentCaregiver, switchToCaregiver, exitCaregiverMode } from '@/services/caregiverAuth'
import { resetMockDb, mockDb } from '@/mocks/db'

beforeEach(() => {
  resetMockDb()
  mockDb.caregivers.insert({ _id: 'c1', name: 'Alex', avatar: '', bio: '', photos: [], areas: [], serviceTypes: ['walking'], pricePerWalk: 30, rating: 4.5, reviewCount: 0, demo: true } as any)
  exitCaregiverMode()
})

describe('caregiverAuth', () => {
  it('starts out not in caregiver mode', () => {
    expect(currentCaregiverId()).toBeNull()
    expect(isCaregiverMode()).toBe(false)
    expect(getCurrentCaregiver()).toBeNull()
  })

  it('switchToCaregiver sets session + returns caregiver', () => {
    const c = switchToCaregiver('c1')
    expect(c._id).toBe('c1')
    expect(currentCaregiverId()).toBe('c1')
    expect(isCaregiverMode()).toBe(true)
    expect(getCurrentCaregiver()?._id).toBe('c1')
  })

  it('switchToCaregiver throws NOT_FOUND on missing id', () => {
    expect(() => switchToCaregiver('nope')).toThrowError(/NOT_FOUND/)
  })

  it('exitCaregiverMode clears session', () => {
    switchToCaregiver('c1')
    exitCaregiverMode()
    expect(currentCaregiverId()).toBeNull()
  })
})
