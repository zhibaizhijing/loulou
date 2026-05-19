import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/env', () => ({ __USE_MOCK__: true }))

import { getMonthAvailability, setDayAvailability, isAvailable } from '@/services/availabilityService'
import { resetMockDb, mockDb } from '@/mocks/db'

const CG = 'cg-1'

beforeEach(() => { resetMockDb() })

describe('availabilityService (mock)', () => {
  it('isAvailable defaults true when no slot', async () => {
    expect(await isAvailable(CG, '2026-06-01')).toBe(true)
  })

  it('setDayAvailability(false) marks day blocked', async () => {
    await setDayAvailability(CG, '2026-06-01', false)
    expect(await isAvailable(CG, '2026-06-01')).toBe(false)
  })

  it('setDayAvailability toggles existing slot', async () => {
    await setDayAvailability(CG, '2026-06-01', false)
    await setDayAvailability(CG, '2026-06-01', true)
    expect(await isAvailable(CG, '2026-06-01')).toBe(true)
    expect(mockDb.availability.list()).toHaveLength(1)
  })

  it('getMonthAvailability returns slots in given month', async () => {
    await setDayAvailability(CG, '2026-06-01', false)
    await setDayAvailability(CG, '2026-06-15', false)
    await setDayAvailability(CG, '2026-07-01', false)
    const r = await getMonthAvailability(CG, '2026-06')
    expect(r).toHaveLength(2)
  })

  it('getMonthAvailability scopes by caregiver', async () => {
    await setDayAvailability(CG, '2026-06-01', false)
    await setDayAvailability('other', '2026-06-01', false)
    const r = await getMonthAvailability(CG, '2026-06')
    expect(r).toHaveLength(1)
    expect(r[0].caregiverId).toBe(CG)
  })

  it('setDayAvailability VALIDATION on bad date format', async () => {
    await expect(setDayAvailability(CG, '06/01/2026', false)).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('getMonthAvailability VALIDATION on bad yearMonth format', async () => {
    await expect(getMonthAvailability(CG, '2026/06')).rejects.toMatchObject({ code: 'VALIDATION' })
  })
})
