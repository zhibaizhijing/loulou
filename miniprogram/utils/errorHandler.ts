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

export function showAppError(err: unknown) {
  const e = err instanceof AppError ? err : new AppError('INTERNAL', String((err as any)?.message || err))
  wx.showToast({ title: e.message || TOAST_MSG[e.code], icon: 'none', duration: 2000 })
}

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err
  return new AppError('INTERNAL', (err as any)?.message || 'Unknown error')
}
