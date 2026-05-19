import { describe, it, expect, vi } from 'vitest'
import { bus } from '@/utils/bus'
import { formatDateTime, isFuture } from '@/utils/date'

describe('bus', () => {
  it('emits to subscribers and unsubscribes via returned fn', () => {
    const fn = vi.fn()
    const off = bus.on('test', fn)
    bus.emit('test', { a: 1 })
    bus.emit('test', { a: 2 })
    off()
    bus.emit('test', { a: 3 })
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith({ a: 2 })
  })
})

describe('date', () => {
  it('formatDateTime returns YYYY-MM-DD HH:mm', () => {
    const t = new Date('2026-05-16T08:30:00Z').getTime()
    expect(formatDateTime(t)).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
  })
  it('isFuture works', () => {
    expect(isFuture(Date.now() + 60_000)).toBe(true)
    expect(isFuture(Date.now() - 60_000)).toBe(false)
  })
})
