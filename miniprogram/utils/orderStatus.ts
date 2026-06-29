// v2 design adapter: map repo BookingStatus → design StatusBadge keys.
// Spec: docs/superpowers/specs/2026-06-29-loulou-design-system-v2.md §2.8

import type { BookingStatus } from '../models'

export type V2Status = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected' | 'cancelled'

export const STATUS_TAB_KEY: Record<V2Status, string> = {
  pending:     '待确认',
  accepted:    '待付款',
  in_progress: '待完成',
  completed:   '已完成',
  rejected:    '已失效',
  cancelled:   '已失效',
}

export const STATUS_LABEL: Record<V2Status, string> = {
  pending:     '待确认',
  accepted:    '待付款',
  in_progress: '待完成',
  completed:   '已完成',
  rejected:    '已拒绝',
  cancelled:   '已取消',
}

export const STATUS_DESC: Record<V2Status, string> = {
  pending:     '申请已发出，等待守护者接受',
  accepted:    '守护者已确认接单，请尽快付款',
  in_progress: '服务进行中',
  completed:   '服务已完成，感谢信任',
  rejected:    '守护者暂时无法接受此申请',
  cancelled:   '订单已取消',
}

export const ORDER_TABS: ('全部' | string)[] = ['全部', '待确认', '待付款', '待完成', '已完成', '已失效']

/** Map repo BookingStatus to v2 design status. */
export function toV2Status(s: BookingStatus): V2Status {
  switch (s) {
    case 'requested': return 'pending'
    case 'accepted':  return 'accepted'
    case 'declined':  return 'rejected'
    case 'in_progress': return 'in_progress'
    case 'completed': return 'completed'
    case 'cancelled': return 'cancelled'
    default: return 'pending'
  }
}

export function isHistorical(s: V2Status): boolean {
  return s === 'completed' || s === 'rejected' || s === 'cancelled'
}

/** Generate a user-facing order number: 'LL' + last10 of ts + 2-digit random. */
export function mintOrderNo(now: number = Date.now()): string {
  const ts = String(now).slice(-10)
  const rand = String(Math.floor(Math.random() * 90) + 10)
  return `LL${ts}${rand}`
}
