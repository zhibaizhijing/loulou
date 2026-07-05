// Order-status adapter: bridge repo BookingStatus ↔ design StatusPill enum.
//
// Repo BookingStatus (source of truth): 'requested' | 'accepted' | 'declined' |
//                                       'in_progress' | 'completed' | 'cancelled'
//
// Design StatusPill enum (v3 spec 2026-07-05 §2.3):
//   'pending' | 'accepted' | 'progress' | 'completed' | 'rejected'
//
//   - `progress`  (not `in_progress`) — matches components/StatusPill/StatusPill.jsx
//   - `cancelled` collapses into `rejected` (design has no cancelled state)

import type { BookingStatus } from '../models'

/** Design canonical status enum (from StatusPill primitive). */
export type StatusPillStatus = 'pending' | 'accepted' | 'progress' | 'completed' | 'rejected'

/** V2 alias — kept for backwards compat with existing callers. */
export type V2Status = StatusPillStatus | 'in_progress' | 'cancelled'

export const STATUS_LABEL: Record<StatusPillStatus, string> = {
  pending:   '待确认',
  accepted:  '待付款',
  progress:  '待完成',
  completed: '已完成',
  rejected:  '已失效',
}

export const STATUS_TAB_KEY: Record<StatusPillStatus, string> = {
  pending:   '待确认',
  accepted:  '待付款',
  progress:  '待完成',
  completed: '已完成',
  rejected:  '已失效',
}

export const STATUS_DESC: Record<StatusPillStatus, string> = {
  pending:   '申请已发出，等待守护者接受',
  accepted:  '守护者已确认接单，请尽快付款',
  progress:  '服务进行中',
  completed: '服务已完成，感谢信任',
  rejected:  '守护者暂时无法接受此申请',
}

export const ORDER_TABS = ['全部', '待确认', '待付款', '待完成', '已完成', '已失效'] as const

/** Repo → design status. Canonical for v3+. */
export function toDesignStatus(s: BookingStatus): StatusPillStatus {
  switch (s) {
    case 'requested':   return 'pending'
    case 'accepted':    return 'accepted'
    case 'in_progress': return 'progress'
    case 'completed':   return 'completed'
    case 'declined':    return 'rejected'
    case 'cancelled':   return 'rejected'
    default:            return 'pending'
  }
}

/** @deprecated Use `toDesignStatus`. Kept as thin alias for v2 callers. */
export function toV2Status(s: BookingStatus): StatusPillStatus {
  return toDesignStatus(s)
}

/** Normalize any legacy in_progress / cancelled string to the design enum. */
export function normalizeStatus(s: string): StatusPillStatus {
  if (s === 'in_progress') return 'progress'
  if (s === 'cancelled')   return 'rejected'
  if (s === 'pending' || s === 'accepted' || s === 'progress' || s === 'completed' || s === 'rejected') {
    return s as StatusPillStatus
  }
  return 'pending'
}

export function isHistorical(s: StatusPillStatus): boolean {
  return s === 'completed' || s === 'rejected'
}

/** Generate a user-facing order number: 'LL' + last10 of ts + 2-digit random. */
export function mintOrderNo(now: number = Date.now()): string {
  const ts = String(now).slice(-10)
  const rand = String(Math.floor(Math.random() * 90) + 10)
  return `LL${ts}${rand}`
}
