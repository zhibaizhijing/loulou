// P0-C — escrow + commission + refund engine. Mock-mode only.
// When 商户号 lands at Stage 1.M, swap the bodies of requestPayment / refundPayment
// to call real WeChat Pay APIs; the contracts here stay identical.

import { mockDb } from '../mocks/db'
import { __USE_MOCK__ } from '../utils/env'
import { cloudCall } from './cloudCall'
import { AppError } from '../utils/errorHandler'
import type { BookingPayment, PaymentState, Payout, PayoutKind } from '../models'

// P0 config defaults (will move to config singleton in P0-L).
export const COMMISSION_RATE = 0.15
// Real value: 48h (172_800_000). Sped up for demo so owners can see release happen.
export const DEMO_RELEASE_DELAY_MS = 20_000

// P0 cancellation tier table (strict bucket per spec §9.1 default).
export interface CancellationTier { hoursBeforeStart: number; refundPct: number }
export const CANCELLATION_TIERS: CancellationTier[] = [
  { hoursBeforeStart: 24, refundPct: 0.8 },
  { hoursBeforeStart: 12, refundPct: 0.5 },
  { hoursBeforeStart: 0,  refundPct: 0.0 }
]

/**
 * Pure: pick refund fraction (0..1) from tier table based on lead time before start.
 * Tiers are sorted descending by hoursBeforeStart; first tier whose threshold is met wins.
 */
export function calcRefundPct(hoursBeforeStart: number, tiers: CancellationTier[] = CANCELLATION_TIERS): number {
  const sorted = tiers.slice().sort((a, b) => b.hoursBeforeStart - a.hoursBeforeStart)
  for (const t of sorted) {
    if (hoursBeforeStart >= t.hoursBeforeStart) return t.refundPct
  }
  return 0
}

export interface RequestPaymentInput {
  bookingId: string
  idempotencyKey: string
}

/**
 * Owner pays into platform escrow. Mock: assumes the caller already showed a confirm
 * modal. State unpaid → held. Writes a `credit` ledger row for the caregiver.
 */
export async function requestPayment(input: RequestPaymentInput): Promise<{ paymentState: PaymentState }> {
  if (__USE_MOCK__) return requestPaymentMock(input)
  const r = await cloudCall<{ paymentState: PaymentState }>('requestPayment', input)
  return r
}

function requestPaymentMock(input: RequestPaymentInput): { paymentState: PaymentState } {
  const b = mockDb.bookings.get(input.bookingId)
  if (!b) throw new AppError('NOT_FOUND', 'Booking not found')
  const pay = b.payment
  if (!pay) throw new AppError('VALIDATION', 'Booking has no payment record')

  // Idempotency: same key → return current state.
  if (pay.idempotencyKey === input.idempotencyKey && pay.state !== 'unpaid') {
    return { paymentState: pay.state }
  }
  if (pay.state !== 'unpaid') {
    throw new AppError('CONFLICT', `Cannot pay booking in state ${pay.state}`)
  }

  const now = Date.now()
  const next: BookingPayment = {
    ...pay,
    state: 'held',
    idempotencyKey: input.idempotencyKey,
    paidAt: now
  }
  mockDb.bookings.update(b._id, { payment: next, mockPayment: { amount: pay.amount, paid: true }, updatedAt: now })
  appendLedger({
    caregiverId: b.walkerId,
    bookingId: b._id,
    kind: 'credit',
    amount: pay.amount,
    idempotencyKey: input.idempotencyKey,
    note: 'Owner paid into escrow'
  })
  return { paymentState: 'held' }
}

export interface ReleasePaymentInput {
  bookingId: string
  idempotencyKey: string
}

/**
 * Platform releases held funds to caregiver (minus commission).
 * State: held → released. Writes commission + payout ledger rows.
 */
export async function releasePayment(input: ReleasePaymentInput): Promise<{ paymentState: PaymentState; payoutAmount: number; commission: number }> {
  if (__USE_MOCK__) return releasePaymentMock(input)
  return cloudCall('releasePayment', input)
}

function releasePaymentMock(input: ReleasePaymentInput): { paymentState: PaymentState; payoutAmount: number; commission: number } {
  const b = mockDb.bookings.get(input.bookingId)
  if (!b) throw new AppError('NOT_FOUND', 'Booking not found')
  const pay = b.payment
  if (!pay) throw new AppError('VALIDATION', 'Booking has no payment record')

  // Idempotency: same key once already released → no-op.
  if (pay.state === 'released' && pay.idempotencyKey === input.idempotencyKey) {
    return { paymentState: 'released', payoutAmount: pay.payoutAmount, commission: pay.commission }
  }
  if (pay.state !== 'held') {
    throw new AppError('CONFLICT', `Cannot release booking in state ${pay.state}`)
  }

  const commission = Math.round(pay.amount * pay.commissionRate * 100) / 100
  const payoutAmount = Math.round((pay.amount - commission) * 100) / 100
  const now = Date.now()

  const next: BookingPayment = {
    ...pay,
    state: 'released',
    commission,
    payoutAmount,
    idempotencyKey: input.idempotencyKey,
    releasedAt: now
  }
  mockDb.bookings.update(b._id, { payment: next, updatedAt: now })
  appendLedger({
    caregiverId: b.walkerId,
    bookingId: b._id,
    kind: 'commission',
    amount: -commission,
    idempotencyKey: input.idempotencyKey + ':commission',
    note: `Platform commission (${(pay.commissionRate * 100).toFixed(0)}%)`
  })
  appendLedger({
    caregiverId: b.walkerId,
    bookingId: b._id,
    kind: 'payout',
    amount: -payoutAmount,
    idempotencyKey: input.idempotencyKey + ':payout',
    note: 'Payout to caregiver wallet'
  })
  return { paymentState: 'released', payoutAmount, commission }
}

export interface RefundPaymentInput {
  bookingId: string
  refundAmount: number     // 0 < refundAmount <= payment.amount
  idempotencyKey: string
  reason?: string
}

/**
 * Refund (full or partial) from held escrow back to owner.
 * State: held → refunded (any refund amount marks the payment as refunded for P0).
 */
export async function refundPayment(input: RefundPaymentInput): Promise<{ paymentState: PaymentState; refundAmount: number }> {
  if (__USE_MOCK__) return refundPaymentMock(input)
  return cloudCall('refundPayment', input)
}

function refundPaymentMock(input: RefundPaymentInput): { paymentState: PaymentState; refundAmount: number } {
  const b = mockDb.bookings.get(input.bookingId)
  if (!b) throw new AppError('NOT_FOUND', 'Booking not found')
  const pay = b.payment
  if (!pay) throw new AppError('VALIDATION', 'Booking has no payment record')

  if (pay.state === 'refunded' && pay.idempotencyKey === input.idempotencyKey) {
    return { paymentState: 'refunded', refundAmount: pay.refundAmount ?? input.refundAmount }
  }
  if (pay.state !== 'held') {
    throw new AppError('CONFLICT', `Cannot refund booking in state ${pay.state}`)
  }
  if (input.refundAmount <= 0 || input.refundAmount > pay.amount) {
    throw new AppError('VALIDATION', 'Invalid refund amount')
  }

  const now = Date.now()
  const next: BookingPayment = {
    ...pay,
    state: 'refunded',
    refundAmount: input.refundAmount,
    idempotencyKey: input.idempotencyKey,
    refundedAt: now
  }
  mockDb.bookings.update(b._id, { payment: next, updatedAt: now })
  appendLedger({
    caregiverId: b.walkerId,
    bookingId: b._id,
    kind: 'refund',
    amount: -input.refundAmount,
    idempotencyKey: input.idempotencyKey,
    note: input.reason || 'Refund to owner'
  })
  return { paymentState: 'refunded', refundAmount: input.refundAmount }
}

/**
 * Compute refund preview for owner-initiated cancellation.
 * Returns the refundable amount + the tier-derived pct.
 */
export function previewCancelRefund(bookingId: string, now: number = Date.now()): { refundAmount: number; refundPct: number; hoursBeforeStart: number } {
  const b = mockDb.bookings.get(bookingId)
  if (!b) throw new AppError('NOT_FOUND', 'Booking not found')
  const pay = b.payment
  const baseAmount = pay?.amount ?? b.mockPayment.amount

  // Caregiver hasn't accepted yet → full refund regardless of timing.
  if (b.status === 'requested') {
    return { refundAmount: baseAmount, refundPct: 1, hoursBeforeStart: Number.POSITIVE_INFINITY }
  }

  const hoursBeforeStart = Math.max(0, (b.date - now) / 3_600_000)
  const refundPct = calcRefundPct(hoursBeforeStart)
  const refundAmount = Math.round(baseAmount * refundPct * 100) / 100
  return { refundAmount, refundPct, hoursBeforeStart }
}

// ── Ledger helpers ─────────────────────────────────────────────────────────────

function getCaregiverBalance(caregiverId: string): number {
  const rows = mockDb.payouts.list().filter(p => p.caregiverId === caregiverId)
  return rows.reduce((acc, p) => acc + p.amount, 0)
}

interface LedgerInput {
  caregiverId: string
  bookingId?: string
  kind: PayoutKind
  amount: number
  idempotencyKey?: string
  note?: string
}

function appendLedger(input: LedgerInput): Payout {
  // Idempotency: same key → return existing.
  if (input.idempotencyKey) {
    const existing = mockDb.payouts.list().find(p => p.idempotencyKey === input.idempotencyKey)
    if (existing) return existing
  }
  const balanceAfter = Math.round((getCaregiverBalance(input.caregiverId) + input.amount) * 100) / 100
  const inserted = mockDb.payouts.insert({
    caregiverId: input.caregiverId,
    bookingId: input.bookingId,
    kind: input.kind,
    amount: input.amount,
    balanceAfter,
    createdAt: Date.now(),
    idempotencyKey: input.idempotencyKey,
    note: input.note
  } as Omit<Payout, '_id'>)
  return inserted
}

export interface EarningsSummary {
  balance: number
  totalCredited: number
  totalCommission: number
  totalPayout: number
  totalRefunded: number
  entries: Payout[]
}

/**
 * Aggregate ledger view for a caregiver. P0 stand-in for the earnings page.
 * Balance is the sum of all entries (insertion-order independent).
 */
export function getEarningsSummary(caregiverId: string): EarningsSummary {
  const raw = mockDb.payouts.list().filter(p => p.caregiverId === caregiverId)
  let totalCredited = 0, totalCommission = 0, totalPayout = 0, totalRefunded = 0, balance = 0
  for (const p of raw) {
    balance += p.amount
    if (p.kind === 'credit') totalCredited += p.amount
    else if (p.kind === 'commission') totalCommission += -p.amount
    else if (p.kind === 'payout') totalPayout += -p.amount
    else if (p.kind === 'refund') totalRefunded += -p.amount
  }
  balance = Math.round(balance * 100) / 100
  const entries = raw.slice().sort((a, b) => b.createdAt - a.createdAt)
  return { balance, totalCredited, totalCommission, totalPayout, totalRefunded, entries }
}
