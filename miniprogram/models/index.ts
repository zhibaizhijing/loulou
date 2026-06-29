export interface Dog {
  id: string
  name: string
  breed?: string
  sizeKg?: number
  notes?: string
}

export interface User {
  _id: string
  openid: string
  name: string
  avatar?: string
  phone?: string
  dogs: Dog[]
  createdAt: number
}

export type ServiceType = 'walking' | 'boarding' | 'daycare' | 'house_visit' | 'live_in'

export const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  walking: '遛狗',
  boarding: '寄养',
  daycare: '日托',
  house_visit: '上门',
  live_in: '住家'
}

export type PricingUnit = 'per_walk' | 'per_night' | 'per_day' | 'per_visit' | 'per_stay'

export const PRICING_UNIT_FOR: Record<ServiceType, PricingUnit> = {
  walking: 'per_walk',
  boarding: 'per_night',
  daycare: 'per_day',
  house_visit: 'per_visit',
  live_in: 'per_stay'
}

// Caregiver is the new generic provider entity. Walker remains an alias for backwards compat.
export type PetType = 'dog' | 'cat' | 'small_animal'
export type SizeBand = 'xs' | 's' | 'm' | 'l' | 'xl'

export const PET_TYPE_LABEL: Record<PetType, string> = {
  dog: '狗',
  cat: '猫',
  small_animal: '小型宠物'
}

export const SIZE_BAND_LABEL: Record<SizeBand, string> = {
  xs: '<5kg',
  s:  '5–10kg',
  m:  '10–20kg',
  l:  '20–30kg',
  xl: '30kg+'
}

export interface CaregiverIntake {
  acceptedPetTypes: PetType[]
  acceptedSizeBands: SizeBand[]
  maxConcurrent: number          // 1..5; 5 means "5 or more"
  canMedicate: boolean
  acceptsAggressive: boolean
  acceptsPuppy: boolean          // <6 months
  acceptsSenior: boolean         // >10 years
  intakeNotes: string            // free-text caveats, ≤200 chars
}

export interface Caregiver extends CaregiverIntake {
  _id: string
  name: string
  avatar: string
  bio: string
  photos: string[]
  areas: string[]
  serviceTypes: ServiceType[]    // which services this caregiver offers
  pricePerWalk: number           // legacy field — kept for current walker-card / walker-profile UI
  rating: number
  reviewCount: number
  demo: boolean
  status?: 'pending' | 'active' | 'suspended'   // optional — old seed walkers have no status
}

export type Walker = Caregiver   // type alias — keeps existing code compiling

export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'declined'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type WalkDuration = 30 | 45 | 60

export interface MockPayment {
  amount: number
  paid: boolean
}

// P0-C — escrow lifecycle. unpaid: not yet collected. held: in platform escrow.
// released: paid out to caregiver after settle window. refunded: returned to owner.
export type PaymentState = 'unpaid' | 'held' | 'released' | 'refunded'

export interface BookingPayment {
  state: PaymentState
  amount: number                 // gross paid by owner (in cents-equivalent integer dollars for mock)
  commissionRate: number         // captured at payment time (e.g. 0.15)
  commission: number             // commission deducted on release
  payoutAmount: number           // amount caregiver receives on release (= amount - commission)
  refundAmount?: number          // for partial refunds
  idempotencyKey?: string        // dedupes provider calls
  paidAt?: number
  releasedAt?: number
  refundedAt?: number
}

export interface Booking {
  _id: string
  ownerId: string
  walkerId: string
  dogId: string
  date: number
  serviceType: ServiceType
  durationMin: number        // semantic varies by serviceType: minutes for walking/house_visit, nights for boarding/live_in, days for daycare
  status: BookingStatus
  notes?: string
  mockPayment: MockPayment   // legacy: kept for backwards compat with seeded bookings; new code reads `payment`
  payment?: BookingPayment   // P0-C escrow lifecycle; optional for legacy bookings
  completedAt?: number       // set when status → completed (used by auto-release scheduler)
  createdAt: number
  updatedAt: number
  // v2 design (2026-06-29-loulou-design-system-v2.md §3)
  orderNo?: string           // 'LL' + last10 ts + 2 random — user-facing
  batchId?: string           // shared by all orders sent in one booking-flow submission
  batchTime?: number         // epoch ms when batch was submitted
  isPrimary?: boolean        // true = the guardian the user explicitly chose
  nights?: number            // unit count (nights / days / 30-min units depending on serviceType)
  unitPrice?: number         // unit price snapshot at booking time
  dropoffStart?: number      // boarding/daycare dropoff window epoch ms
  dropoffEnd?: number
  pickupStart?: number
  pickupEnd?: number
  reviewed?: boolean         // true after owner submits a review
}

// P0-C ledger entries. One row per money movement.
export type PayoutKind = 'credit' | 'commission' | 'payout' | 'refund' | 'adjustment'

export interface Payout {
  _id: string
  caregiverId: string
  bookingId?: string
  kind: PayoutKind
  amount: number                 // signed: credits + / commission - / payout - / refund - / adjustment ±
  balanceAfter: number
  createdAt: number
  idempotencyKey?: string
  note?: string
}

export type MessageRole = 'owner' | 'walker'

export type MessageAction = 'summary'   // tappable system card → opens booking summary

export interface Message {
  _id: string
  bookingId: string
  senderId: string
  senderRole: MessageRole | 'system'  // 'system' added in v2 for batch / modify / review notices
  text: string
  photoUrl?: string
  action?: MessageAction
  createdAt: number
}

export interface WalkReport {
  _id: string
  bookingId: string
  walkerId: string
  photos: string[]
  notes: string
  durationMin: number
  peeCount: number
  poopCount: number
  createdAt: number
}

export type Stars = 1 | 2 | 3 | 4 | 5

export interface Review {
  _id: string
  bookingId: string
  ownerId: string
  walkerId: string
  stars: Stars
  text: string
  createdAt: number
}

export type ApplicationStatus = 'submitted' | 'reviewing' | 'approved' | 'rejected'

export interface CaregiverApplication {
  _id: string
  candidateUserId: string         // user._id of the applicant
  realName: string
  idPhotoUrl: string
  indoorPhotos: string[]
  bio: string
  proposedServiceTypes: ServiceType[]
  intake?: CaregiverIntake        // structured intake collected during onboarding (P0-B Task 111)
  status: ApplicationStatus
  reviewerNote?: string
  createdAt: number
  updatedAt: number
  resultingCaregiverId?: string   // set when approved
}

export interface ServiceItem {
  _id: string
  caregiverId: string
  serviceType: ServiceType
  price: number                   // in the unit indicated by PRICING_UNIT_FOR[serviceType]
  active: boolean
  surchargeRules?: string         // free-text for Phase 1 mock
  createdAt: number
  updatedAt: number
}

export interface AvailabilitySlot {
  _id: string
  caregiverId: string
  date: string                    // 'YYYY-MM-DD' day key
  available: boolean
}
