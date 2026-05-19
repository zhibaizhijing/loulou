import { describe, it, expect, vi } from 'vitest'
import { createPageState, PageStatus } from '@/utils/usePageState'

describe('usePageState', () => {
  it('transitions loading → loaded on resolve', async () => {
    const setData = vi.fn()
    const ps = createPageState(setData)
    const promise = ps.run(async () => 'value')
    expect(setData).toHaveBeenCalledWith({ pageStatus: 'loading' as PageStatus, pageError: '' })
    const r = await promise
    expect(r).toBe('value')
    const lastCall = setData.mock.calls[setData.mock.calls.length - 1][0]
    expect(lastCall.pageStatus).toBe('loaded')
  })

  it('transitions loading → error on reject', async () => {
    const setData = vi.fn()
    const ps = createPageState(setData)
    await ps.run(async () => { throw new Error('boom') }).catch(() => undefined)
    const lastCall = setData.mock.calls[setData.mock.calls.length - 1][0]
    expect(lastCall.pageStatus).toBe('error')
    expect(lastCall.pageError).toBe('boom')
  })

  it('setEmpty flips to empty', () => {
    const setData = vi.fn()
    const ps = createPageState(setData)
    ps.setEmpty()
    expect(setData).toHaveBeenLastCalledWith({ pageStatus: 'empty' as PageStatus, pageError: '' })
  })
})
