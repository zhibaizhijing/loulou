export type ErrCode =
  | 'UNAUTH' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION' | 'CONFLICT' | 'INTERNAL' | 'OFFLINE'

export class AppError extends Error {
  constructor(public code: ErrCode, message: string) {
    super(message)
    this.name = 'AppError'
  }
}

const TOAST_MSG: Record<ErrCode, string> = {
  UNAUTH:     '请重新登录',
  FORBIDDEN:  '无权操作',
  NOT_FOUND:  '内容不存在',
  VALIDATION: '请检查输入',
  CONFLICT:   '操作已存在',
  INTERNAL:   '服务异常，请重试',
  OFFLINE:    '离线，操作未提交'
}

function extractMessage(err: unknown): string {
  if (typeof err === 'string') return err
  if (!err) return ''
  const any = err as { message?: unknown; errMsg?: unknown; errno?: unknown }
  if (typeof any.message === 'string' && any.message) return any.message
  if (typeof any.errMsg === 'string' && any.errMsg) return any.errMsg
  try {
    const s = JSON.stringify(err)
    if (s && s !== '{}') return s
  } catch { /* circular */ }
  return ''
}

export function showAppError(err: unknown) {
  const e = err instanceof AppError ? err : new AppError('INTERNAL', extractMessage(err) || 'Unknown error')
  wx.showToast({ title: e.message || TOAST_MSG[e.code], icon: 'none', duration: 2000 })
}

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err
  return new AppError('INTERNAL', extractMessage(err) || 'Unknown error')
}
