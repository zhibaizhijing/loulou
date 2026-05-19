import { silentLogin } from './services/authService'
import { initNetworkWatcher } from './utils/network'
import { createLogger } from './utils/logger'
import { __USE_MOCK__ } from './utils/env'

const log = createLogger('app')

App<IAppOption>({
  globalData: { openid: '', bootError: null },
  async onLaunch() {
    log.info('launch', __USE_MOCK__ ? '(MOCK MODE)' : '(LIVE)')
    try {
      if (!__USE_MOCK__) {
        wx.cloud.init({ env: 'pet-dev', traceUser: true })
      }
      initNetworkWatcher()
      await silentLogin()
    } catch (e: any) {
      log.error('boot failed', e)
      this.globalData.bootError = e
    }
  }
})
