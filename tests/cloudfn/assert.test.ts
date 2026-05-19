import { describe, it, expect } from 'vitest'
import { assertAuth, assertString, assertOneOf } from '../../cloudfunctions/shared/assert'

describe('assertAuth', () => {
  it('returns openid when present', () => {
    expect(assertAuth({ OPENID: 'abc' })).toBe('abc')
  })
  it('throws UNAUTH when missing', () => {
    expect(() => assertAuth({})).toThrowError(/UNAUTH/)
  })
})

describe('assertString', () => {
  it('returns value when non-empty string', () => {
    expect(assertString('hi', 'field')).toBe('hi')
  })
  it('throws VALIDATION when empty', () => {
    expect(() => assertString('', 'field')).toThrowError(/VALIDATION/)
  })
})

describe('assertOneOf', () => {
  it('passes when value in list', () => {
    expect(assertOneOf(30, [30, 45, 60], 'dur')).toBe(30)
  })
  it('throws otherwise', () => {
    expect(() => assertOneOf(99, [30, 45, 60], 'dur')).toThrowError(/VALIDATION/)
  })
})
