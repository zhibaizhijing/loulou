import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/utils/env', () => ({ __USE_MOCK__: true }))

import {
  requestPayment, releasePayment, refundPayment,
  calcRefundPct, previewCancelRefund, getEarningsSummary,
  COMMISSION_RATE, CANCELLATION_TIERS
} from '@/services/paymentService'
import { resetMockDb, mockDb } from '@/mocks/db'
import type { Booking } from '@/models'

const HOUR = 3_600_000
const futureDate = (h: number) => Date.now() + h * HOUR

function seedBooking(opts: Partial<Booking> = {}): string {
  const b = mockDb.bookings.insert({
    ownerId: 'mock-owner-1',
    walkerId: 'w1',
    dogId: 'd1',
    date: futureDate(48),
    serviceType: 'walking',
    durationMin: 30,
    status: 'requested',
    mockPayment: { amount: 30, paid: false },
    payment: { state: 'unpaid', amount: 30, commissionRate: COMMISSION_RATE, commission: 0, payoutAmount: 0 },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...opts
  } as Omit<Booking, '_id'>)
  return b._id
}

beforeEach(() => {
  resetMockDb()
  mockDb.walkers.insert({
    _id: 'w1', name: 'Alex', areas: ['BT'], serviceTypes: ['walking'], pricePerWalk: 30,
    rating: 4.8, reviewCount: 10, photos: [], bio: '', avatar: '', demo: true
  } as any)
})

describe('calcRefundPct', () => {
  it('full tier (>= 24h)', () => {
    expect(calcRefundPct(48)).toBe(0.8)
    expect(calcRefundPct(24)).toBe(0.8)
  })
  it('mid tier (12..24h)', () => {
    expect(calcRefundPct(23.9)).toBe(0.5)
    expect(calcRefundPct(12)).toBe(0.5)
  })
  it('no-refund tier (< 12h)', () => {
    expect(calcRefundPct(11)).toBe(0)
    expect(calcRefundPct(0)).toBe(0)
  })
  it('uses default CANCELLATION_TIERS when omitted', () => {
    expect(CANCELLATION_TIERS.length).toBeGreaterThan(0)
  })
})

describe('requestPayment', () => {
  it('flips unpaid → held and writes credit ledger row', async () => {
    const id = seedBooking()
    const r = await requestPayment({ bookingId: id, idempotencyKey: 'k1' })
    expect(r.paymentState).toBe('held')
    const b = mockDb.bookings.get(id)!
    expect(b.payment!.state).toBe('held')
    expect(b.payment!.paidAt).toBeGreaterThan(0)
    const ledger = mockDb.payouts.list().filter(p => p.bookingId === id)
    expect(ledger).toHaveLength(1)
    expect(ledger[0].kind).toBe('credit')
    expect(ledger[0].amount).toBe(30)
  })

  it('idempotent — same key after success is a no-op', async () => {
    const id = seedBooking()
    await requestPayment({ bookingId: id, idempotencyKey: 'k1' })
    await requestPayment({ bookingId: id, idempotencyKey: 'k1' })
    expect(mockDb.payouts.list().filter(p => p.bookingId === id && p.kind === 'credit')).toHaveLength(1)
  })

  it('throws CONFLICT if already paid with different key', async () => {
    const id = seedBooking()
    await requestPayment({ bookingId: id, idempotencyKey: 'k1' })
    await expect(requestPayment({ bookingId: id, idempotencyKey: 'k2' })).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('throws NOT_FOUND on missing booking', async () => {
    await expect(requestPayment({ bookingId: 'nope', idempotencyKey: 'k' })).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})

describe('releasePayment', () => {
  it('held → released, deducts commission, writes commission + payout ledger rows', async () => {
    const id = seedBooking()
    await requestPayment({ bookingId: id, idempotencyKey: 'pay' })
    const r = await releasePayment({ bookingId: id, idempotencyKey: 'rel' })
    expect(r.paymentState).toBe('released')
    expect(r.commission).toBe(4.5)        // 30 × 0.15
    expect(r.payoutAmount).toBe(25.5)     // 30 - 4.5
    const ledger = mockDb.payouts.list().filter(p => p.bookingId === id)
    expect(ledger.map(l => l.kind).sort()).toEqual(['commission', 'credit', 'payout'])
    expect(ledger[ledger.length - 1].balanceAfter).toBe(0)   // net zero after payout
  })

  it('throws CONFLICT if not held', async () => {
    const id = seedBooking()
    await expect(releasePayment({ bookingId: id, idempotencyKey: 'rel' })).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('idempotent — same key after release does not double-pay', async () => {
    const id = seedBooking()
    await requestPayment({ bookingId: id, idempotencyKey: 'pay' })
    await releasePayment({ bookingId: id, idempotencyKey: 'rel' })
    const before = mockDb.payouts.list().length
    await releasePayment({ bookingId: id, idempotencyKey: 'rel' })
    expect(mockDb.payouts.list().length).toBe(before)
  })
})

describe('refundPayment', () => {
  it('held → refunded with ledger entry', async () => {
    const id = seedBooking()
    await requestPayment({ bookingId: id, idempotencyKey: 'pay' })
    const r = await refundPayment({ bookingId: id, refundAmount: 30, idempotencyKey: 'ref' })
    expect(r.paymentState).toBe('refunded')
    expect(r.refundAmount).toBe(30)
    const refunds = mockDb.payouts.list().filter(p => p.kind === 'refund')
    expect(refunds).toHaveLength(1)
    expect(refunds[0].amount).toBe(-30)
  })

  it('partial refund accepted', async () => {
    const id = seedBooking()
    await requestPayment({ bookingId: id, idempotencyKey: 'pay' })
    const r = await refundPayment({ bookingId: id, refundAmount: 15, idempotencyKey: 'ref' })
    expect(r.refundAmount).toBe(15)
  })

  it('rejects refund > amount', async () => {
    const id = seedBooking()
    await requestPayment({ bookingId: id, idempotencyKey: 'pay' })
    await expect(refundPayment({ bookingId: id, refundAmount: 100, idempotencyKey: 'ref' })).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('throws CONFLICT when not held', async () => {
    const id = seedBooking()
    await expect(refundPayment({ bookingId: id, refundAmount: 30, idempotencyKey: 'ref' })).rejects.toMatchObject({ code: 'CONFLICT' })
  })
})

describe('previewCancelRefund', () => {
  it('requested booking — full refund regardless of timing', () => {
    const id = seedBooking({ date: futureDate(1), status: 'requested' })
    const p = previewCancelRefund(id)
    expect(p.refundPct).toBe(1)
    expect(p.refundAmount).toBe(30)
  })

  it('accepted, >24h out — 80% refund', () => {
    const id = seedBooking({ date: futureDate(48), status: 'accepted' })
    const p = previewCancelRefund(id)
    expect(p.refundPct).toBe(0.8)
    expect(p.refundAmount).toBe(24)
  })

  it('accepted, <12h out — no refund', () => {
    const id = seedBooking({ date: futureDate(6), status: 'accepted' })
    const p = previewCancelRefund(id)
    expect(p.refundPct).toBe(0)
    expect(p.refundAmount).toBe(0)
  })
})

describe('getEarningsSummary', () => {
  it('aggregates ledger entries for caregiver', async () => {
    const id = seedBooking()
    await requestPayment({ bookingId: id, idempotencyKey: 'pay' })
    await releasePayment({ bookingId: id, idempotencyKey: 'rel' })
    const s = getEarningsSummary('w1')
    expect(s.totalCredited).toBe(30)
    expect(s.totalCommission).toBe(4.5)
    expect(s.totalPayout).toBe(25.5)
    expect(s.balance).toBe(0)   // net-zero after payout
    expect(s.entries.length).toBe(3)
  })
})
