import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/env', () => ({ __USE_MOCK__: true }))

import {
  listMyServices, listActiveServicesForCaregiver, getServiceById,
  publishService, updateServicePrice, toggleServiceActive, unpublishService
} from '@/services/serviceItemService'
import { resetMockDb, mockDb } from '@/mocks/db'

const CG = 'cg-test'

beforeEach(() => {
  resetMockDb()
})

describe('serviceItemService (mock)', () => {
  it('publishService inserts new service', async () => {
    const r = await publishService({ caregiverId: CG, serviceType: 'walking', price: 30 })
    expect(r.serviceId).toBeTruthy()
    expect(mockDb.services.get(r.serviceId)?.price).toBe(30)
  })

  it('publishService updates instead of inserting when same (caregiver, serviceType) exists', async () => {
    const r1 = await publishService({ caregiverId: CG, serviceType: 'walking', price: 30 })
    const r2 = await publishService({ caregiverId: CG, serviceType: 'walking', price: 40 })
    expect(r1.serviceId).toBe(r2.serviceId)
    expect(mockDb.services.get(r1.serviceId)?.price).toBe(40)
    expect(mockDb.services.list()).toHaveLength(1)
  })

  it('publishService allows multiple services for same caregiver across different types', async () => {
    await publishService({ caregiverId: CG, serviceType: 'walking', price: 30 })
    await publishService({ caregiverId: CG, serviceType: 'boarding', price: 150 })
    expect(mockDb.services.list()).toHaveLength(2)
  })

  it('listMyServices returns only services for given caregiver', async () => {
    await publishService({ caregiverId: CG, serviceType: 'walking', price: 30 })
    await publishService({ caregiverId: 'other', serviceType: 'boarding', price: 150 })
    const r = await listMyServices(CG)
    expect(r).toHaveLength(1)
  })

  it('listActiveServicesForCaregiver excludes inactive', async () => {
    const r1 = await publishService({ caregiverId: CG, serviceType: 'walking', price: 30 })
    await publishService({ caregiverId: CG, serviceType: 'boarding', price: 150 })
    await toggleServiceActive(r1.serviceId, false)
    const r = await listActiveServicesForCaregiver(CG)
    expect(r).toHaveLength(1)
    expect(r[0].serviceType).toBe('boarding')
  })

  it('updateServicePrice patches price', async () => {
    const r = await publishService({ caregiverId: CG, serviceType: 'walking', price: 30 })
    await updateServicePrice(r.serviceId, 35)
    expect(mockDb.services.get(r.serviceId)?.price).toBe(35)
  })

  it('updateServicePrice VALIDATION on non-positive', async () => {
    const r = await publishService({ caregiverId: CG, serviceType: 'walking', price: 30 })
    await expect(updateServicePrice(r.serviceId, 0)).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('toggleServiceActive flips active state', async () => {
    const r = await publishService({ caregiverId: CG, serviceType: 'walking', price: 30 })
    await toggleServiceActive(r.serviceId, false)
    expect(mockDb.services.get(r.serviceId)?.active).toBe(false)
  })

  it('unpublishService removes', async () => {
    const r = await publishService({ caregiverId: CG, serviceType: 'walking', price: 30 })
    await unpublishService(r.serviceId)
    expect(mockDb.services.get(r.serviceId)).toBeNull()
  })

  it('getServiceById throws NOT_FOUND on missing', async () => {
    await expect(getServiceById('nope')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('publishService VALIDATION on missing caregiverId', async () => {
    await expect(publishService({ caregiverId: '', serviceType: 'walking', price: 30 }))
      .rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('publishService VALIDATION on price 0', async () => {
    await expect(publishService({ caregiverId: CG, serviceType: 'walking', price: 0 }))
      .rejects.toMatchObject({ code: 'VALIDATION' })
  })
})
