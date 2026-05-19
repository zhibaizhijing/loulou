export type ErrCode =
  | 'UNAUTH' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION' | 'CONFLICT' | 'INTERNAL'

export type FnResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ErrCode; msg: string }

export const ok = <T>(data: T): FnResult<T> => ({ ok: true, data })
export const err = (code: ErrCode, msg: string): FnResult<never> => ({ ok: false, code, msg })
