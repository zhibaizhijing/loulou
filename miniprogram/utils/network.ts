import { bus } from './bus'

let online = true
let initialised = false

export function isOnline(): boolean { return online }

export function initNetworkWatcher() {
  if (initialised) return
  initialised = true
  wx.getNetworkType({
    success: (res) => {
      online = res.networkType !== 'none'
      bus.emit('network:changed', online)
    }
  })
  wx.onNetworkStatusChange((res) => {
    online = res.isConnected
    bus.emit('network:changed', online)
  })
}
