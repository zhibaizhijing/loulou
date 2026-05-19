import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/env', () => ({ __USE_MOCK__: true }))

import { applyCaregiver, getMyApplication } from '@/services/applicationService'
import { resetMockDb, mockDb } from '@/mocks/db'

const VALID_INPUT = {
  realName: 'Ana Demo',
  idPhotoUrl: 'mock-file://id.jpg',
  indoorPhotos: ['mock-file://room1.jpg'],
  bio: 'I love pets and have a quiet home for them.',
  proposedServiceTypes: ['walking' as const, 'boarding' as const]
}

beforeEach(() => {
  resetMockDb()
})

describe('applicationService (mock)', () => {
  it('applyCaregiver inserts application in submitted state', async () => {
    const r = await applyCaregiver(VALID_INPUT)
    expect(r.applicationId).toBeTruthy()
    const app = mockDb.applications.get(r.applicationId)!
    expect(app.status).toBe('submitted')
    expect(app.realName).toBe('Ana Demo')
    expect(app.proposedServiceTypes).toEqual(['walking', 'boarding'])
  })

  it('applyCaregiver idempotency — second call returns same id while non-rejected', async () => {
    const r1 = await applyCaregiver(VALID_INPUT)
    const r2 = await applyCaregiver({ ...VALID_INPUT, bio: 'Different bio that meets length.' })
    expect(r1.applicationId).toBe(r2.applicationId)
    expect(mockDb.applications.list()).toHaveLength(1)
  })

  it('applyCaregiver VALIDATION on missing real name', async () => {
    await expect(applyCaregiver({ ...VALID_INPUT, realName: '   ' }))
      .rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('applyCaregiver VALIDATION on short bio', async () => {
    await expect(applyCaregiver({ ...VALID_INPUT, bio: 'hi' }))
      .rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('applyCaregiver VALIDATION on no indoor photos', async () => {
    await expect(applyCaregiver({ ...VALID_INPUT, indoorPhotos: [] }))
      .rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('applyCaregiver VALIDATION on no proposed services', async () => {
    await expect(applyCaregiver({ ...VALID_INPUT, proposedServiceTypes: [] }))
      .rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('getMyApplication returns null when none', async () => {
    expect(await getMyApplication()).toBeNull()
  })

  it('getMyApplication returns the submitted application', async () => {
    await applyCaregiver(VALID_INPUT)
    const app = await getMyApplication()
    expect(app?.status).toBe('submitted')
  })

  it('mock auto-approval transitions submitted → reviewing → approved with new caregiver', async () => {
    vi.useFakeTimers()
    try {
      const r = await applyCaregiver(VALID_INPUT)
      // First setTimeout (1500ms) — submitted → reviewing
      await vi.advanceTimersByTimeAsync(1500)
      let app = mockDb.applications.get(r.applicationId)!
      expect(app.status).toBe('reviewing')
      // Second setTimeout (800ms) — reviewing → approved + create caregiver
      await vi.advanceTimersByTimeAsync(800)
      app = mockDb.applications.get(r.applicationId)!
      expect(app.status).toBe('approved')
      expect(app.resultingCaregiverId).toBeTruthy()
      const cg = mockDb.caregivers.get(app.resultingCaregiverId!)!
      expect(cg.name).toBe('Ana Demo')
      expect(cg.serviceTypes).toEqual(['walking', 'boarding'])
      expect(cg.status).toBe('active')
    } finally {
      vi.useRealTimers()
    }
  })
})
