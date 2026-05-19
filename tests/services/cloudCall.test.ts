import { describe, it, expect, beforeEach } from 'vitest'
import { setCallFnHandler, resetWxMock } from '../helpers'
import { cloudCall } from '@/services/cloudCall'
import { AppError } from '@/utils/errorHandler'

describe('cloudCall', () => {
  beforeEach(() => resetWxMock())

  it('returns data on ok result', async () => {
    setCallFnHandler(async () => ({ ok: true, data: { hello: 'world' } }))
    const r = await cloudCall<{ hello: string }>('whatever', {})
    expect(r).toEqual({ hello: 'world' })
  })

  it('throws AppError on not-ok result', async () => {
    setCallFnHandler(async () => ({ ok: false, code: 'FORBIDDEN', msg: 'nope' }))
    await expect(cloudCall('whatever', {})).rejects.toBeInstanceOf(AppError)
    try { await cloudCall('whatever', {}) } catch (e: any) {
      expect(e.code).toBe('FORBIDDEN')
      expect(e.message).toBe('nope')
    }
  })

  it('wraps unexpected throw as INTERNAL AppError', async () => {
    setCallFnHandler(async () => { throw new Error('boom') })
    await expect(cloudCall('whatever', {})).rejects.toMatchObject({ code: 'INTERNAL' })
  })
})
