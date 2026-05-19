import type { CaregiverApplication, Caregiver, ServiceType, CaregiverIntake } from '../models'
import { mockDb } from '../mocks/db'
import { __USE_MOCK__ } from '../utils/env'
import { cloudCall } from './cloudCall'
import { AppError } from '../utils/errorHandler'

const MOCK_OWNER_ID = 'mock-owner-1'
const AUTO_APPROVE_DELAY_MS = 1500   // simulate admin review latency

const DEFAULT_INTAKE: CaregiverIntake = {
  acceptedPetTypes: ['dog'],
  acceptedSizeBands: ['s', 'm'],
  maxConcurrent: 1,
  canMedicate: false,
  acceptsAggressive: false,
  acceptsPuppy: false,
  acceptsSenior: false,
  intakeNotes: ''
}

export interface ApplyInput {
  realName: string
  idPhotoUrl: string
  indoorPhotos: string[]
  bio: string
  proposedServiceTypes: ServiceType[]
  intake?: CaregiverIntake
}

export async function applyCaregiver(input: ApplyInput): Promise<{ applicationId: string }> {
  validate(input)
  if (__USE_MOCK__) return applyMock(input)
  return cloudCall<{ applicationId: string }>('applyCaregiver', input)
}

export async function getMyApplication(): Promise<CaregiverApplication | null> {
  if (__USE_MOCK__) {
    return mockDb.applications.list().find(a => a.candidateUserId === MOCK_OWNER_ID) ?? null
  }
  return cloudCall<CaregiverApplication | null>('getMyApplication', {})
}

function validate(input: ApplyInput): void {
  if (!input.realName.trim()) throw new AppError('VALIDATION', 'Real name required')
  if (!input.idPhotoUrl) throw new AppError('VALIDATION', 'ID photo required')
  if (input.indoorPhotos.length === 0) throw new AppError('VALIDATION', 'At least 1 indoor photo')
  if (input.bio.trim().length < 10) throw new AppError('VALIDATION', 'Bio must be at least 10 characters')
  if (input.proposedServiceTypes.length === 0) throw new AppError('VALIDATION', 'Pick at least 1 service')
}

function applyMock(input: ApplyInput): { applicationId: string } {
  // Idempotency: if user already has a non-rejected application, return it
  const existing = mockDb.applications.list().find(
    a => a.candidateUserId === MOCK_OWNER_ID && a.status !== 'rejected'
  )
  if (existing) return { applicationId: existing._id }

  const now = Date.now()
  const inserted = mockDb.applications.insert({
    candidateUserId: MOCK_OWNER_ID,
    realName: input.realName.trim(),
    idPhotoUrl: input.idPhotoUrl,
    indoorPhotos: input.indoorPhotos,
    bio: input.bio.trim(),
    proposedServiceTypes: input.proposedServiceTypes,
    intake: input.intake ?? DEFAULT_INTAKE,
    status: 'submitted',
    createdAt: now,
    updatedAt: now
  } as Omit<CaregiverApplication, '_id'>)

  // Schedule mock admin auto-approval
  setTimeout(() => mockAutoApprove(inserted._id), AUTO_APPROVE_DELAY_MS)
  return { applicationId: inserted._id }
}

function mockAutoApprove(applicationId: string): void {
  const app = mockDb.applications.get(applicationId)
  if (!app || app.status !== 'submitted') return

  // Transition: submitted -> reviewing -> approved (collapsed for demo)
  mockDb.applications.update(applicationId, { status: 'reviewing', updatedAt: Date.now() })

  setTimeout(() => {
    const stillReviewing = mockDb.applications.get(applicationId)
    if (!stillReviewing || stillReviewing.status !== 'reviewing') return

    // Create caregiver doc from application
    const intake = stillReviewing.intake ?? DEFAULT_INTAKE
    const caregiver: Omit<Caregiver, '_id'> = {
      name: stillReviewing.realName,
      avatar: '',
      bio: stillReviewing.bio,
      photos: stillReviewing.indoorPhotos,
      areas: [],
      serviceTypes: stillReviewing.proposedServiceTypes,
      pricePerWalk: 30,   // sensible default; caregiver can edit later in T5
      rating: 0,
      reviewCount: 0,
      demo: false,
      status: 'active',
      ...intake
    }
    const newCaregiver = mockDb.caregivers.insert(caregiver as Omit<Caregiver, '_id'>)

    mockDb.applications.update(applicationId, {
      status: 'approved',
      resultingCaregiverId: newCaregiver._id,
      updatedAt: Date.now()
    })
  }, 800)
}
