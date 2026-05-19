import { cloudCall } from './cloudCall'
import { createLogger } from '../utils/logger'
import { __USE_MOCK__ } from '../utils/env'
import { initMockDb } from '../mocks/db'

const log = createLogger('auth')

interface LoginResult { openid: string; isNewUser: boolean }

export async function silentLogin(): Promise<LoginResult> {
  if (__USE_MOCK__) {
    initMockDb()
    const result: LoginResult = { openid: 'mock-owner-1', isNewUser: false }
    const app = getApp<IAppOption>()
    if (app?.globalData) app.globalData.openid = result.openid
    log.info('mock login', result.openid)
    return result
  }

  const r = await cloudCall<LoginResult>('login', {})
  const app = getApp<IAppOption>()
  if (app?.globalData) app.globalData.openid = r.openid
  if (r.isNewUser) {
    log.info('new user, seeding profile')
    await cloudCall('updateProfile', { name: 'Pet Owner' })
  }
  log.info('logged in', r.openid)
  return r
}

export function getCurrentOpenId(): string {
  const app = getApp<IAppOption>()
  return app?.globalData?.openid || ''
}

export function isLoggedIn(): boolean {
  return getCurrentOpenId().length > 0
}
