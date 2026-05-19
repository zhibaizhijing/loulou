import type { ServiceItem, ServiceType } from '../models'
import { mockDb } from '../mocks/db'
import { __USE_MOCK__ } from '../utils/env'
import { cloudCall } from './cloudCall'
import { AppError } from '../utils/errorHandler'

export interface PublishServiceInput {
  caregiverId: string
  serviceType: ServiceType
  price: number
  surchargeRules?: string
}

export async function listMyServices(caregiverId: string): Promise<ServiceItem[]> {
  if (__USE_MOCK__) {
    return mockDb.services.list().filter(s => s.caregiverId === caregiverId)
  }
  return cloudCall<ServiceItem[]>('listMyServices', { caregiverId })
}

export async function listActiveServicesForCaregiver(caregiverId: string): Promise<ServiceItem[]> {
  if (__USE_MOCK__) {
    return mockDb.services.list().filter(s => s.caregiverId === caregiverId && s.active)
  }
  return cloudCall<ServiceItem[]>('listActiveServicesForCaregiver', { caregiverId })
}

export async function getServiceById(serviceId: string): Promise<ServiceItem> {
  if (__USE_MOCK__) {
    const s = mockDb.services.get(serviceId)
    if (!s) throw new AppError('NOT_FOUND', 'Service not found')
    return s
  }
  return cloudCall<ServiceItem>('getServiceById', { serviceId })
}

export async function publishService(input: PublishServiceInput): Promise<{ serviceId: string }> {
  validate(input)
  if (__USE_MOCK__) {
    // One service per (caregiver, serviceType). Replace if exists.
    const existing = mockDb.services.list().find(s => s.caregiverId === input.caregiverId && s.serviceType === input.serviceType)
    if (existing) {
      mockDb.services.update(existing._id, {
        price: input.price,
        surchargeRules: input.surchargeRules,
        active: true,
        updatedAt: Date.now()
      })
      return { serviceId: existing._id }
    }
    const now = Date.now()
    const r = mockDb.services.insert({
      caregiverId: input.caregiverId,
      serviceType: input.serviceType,
      price: input.price,
      surchargeRules: input.surchargeRules,
      active: true,
      createdAt: now,
      updatedAt: now
    } as Omit<ServiceItem, '_id'>)
    return { serviceId: r._id }
  }
  return cloudCall<{ serviceId: string }>('publishService', input)
}

export async function updateServicePrice(serviceId: string, price: number): Promise<{ updated: boolean }> {
  if (price <= 0) throw new AppError('VALIDATION', 'Price must be positive')
  if (__USE_MOCK__) {
    const s = mockDb.services.get(serviceId)
    if (!s) throw new AppError('NOT_FOUND', 'Service not found')
    mockDb.services.update(serviceId, { price, updatedAt: Date.now() })
    return { updated: true }
  }
  return cloudCall<{ updated: boolean }>('updateServicePrice', { serviceId, price })
}

export async function toggleServiceActive(serviceId: string, active: boolean): Promise<{ updated: boolean }> {
  if (__USE_MOCK__) {
    const s = mockDb.services.get(serviceId)
    if (!s) throw new AppError('NOT_FOUND', 'Service not found')
    mockDb.services.update(serviceId, { active, updatedAt: Date.now() })
    return { updated: true }
  }
  return cloudCall<{ updated: boolean }>('toggleServiceActive', { serviceId, active })
}

export async function unpublishService(serviceId: string): Promise<{ deleted: boolean }> {
  if (__USE_MOCK__) {
    const ok = mockDb.services.delete(serviceId)
    if (!ok) throw new AppError('NOT_FOUND', 'Service not found')
    return { deleted: true }
  }
  return cloudCall<{ deleted: boolean }>('unpublishService', { serviceId })
}

function validate(input: PublishServiceInput): void {
  if (!input.caregiverId) throw new AppError('VALIDATION', 'caregiverId required')
  if (!input.serviceType) throw new AppError('VALIDATION', 'serviceType required')
  if (input.price <= 0) throw new AppError('VALIDATION', 'Price must be positive')
}
