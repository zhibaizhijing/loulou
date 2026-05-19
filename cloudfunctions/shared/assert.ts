export class FnError extends Error {
  constructor(public code: string, message: string) { super(`${code}: ${message}`) }
}

export function assertAuth(ctx: { OPENID?: string }): string {
  if (!ctx.OPENID) throw new FnError('UNAUTH', 'Login required')
  return ctx.OPENID
}

export function assertString(v: unknown, field: string): string {
  if (typeof v !== 'string' || v.length === 0) throw new FnError('VALIDATION', `${field} must be non-empty string`)
  return v
}

export function assertNumber(v: unknown, field: string): number {
  if (typeof v !== 'number' || Number.isNaN(v)) throw new FnError('VALIDATION', `${field} must be number`)
  return v
}

export function assertOneOf<T>(v: unknown, allowed: readonly T[], field: string): T {
  if (!allowed.includes(v as T)) throw new FnError('VALIDATION', `${field} must be one of ${allowed.join(',')}`)
  return v as T
}

export function assertFutureDate(v: unknown, field: string): number {
  const n = assertNumber(v, field)
  if (n <= Date.now()) throw new FnError('VALIDATION', `${field} must be in the future`)
  return n
}
