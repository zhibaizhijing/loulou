import { AppError, toAppError, ErrCode } from '../utils/errorHandler'

export type FnResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ErrCode; msg: string }

export async function cloudCall<T>(name: string, data: unknown): Promise<T> {
  try {
    const r = await (wx.cloud.callFunction({ name, data: data as WechatMiniprogram.IAnyObject }) as Promise<ICloud.CallFunctionResult>)
    const body = r.result as FnResult<T>
    if (!body || typeof body !== 'object') {
      throw new AppError('INTERNAL', 'Malformed function response')
    }
    if (body.ok) return body.data
    throw new AppError(body.code, body.msg)
  } catch (e) {
    if (e instanceof AppError) throw e
    throw toAppError(e)
  }
}
