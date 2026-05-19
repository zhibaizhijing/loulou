const KEY = 'demo:walkerMode'

export function isWalkerMode(): boolean {
  try {
    const v = wx.getStorageSync(KEY)
    return !!v
  } catch { return false }
}

export function setWalkerMode(on: boolean) {
  wx.setStorageSync(KEY, on)
}

export function toggleWalkerMode(): boolean {
  const next = !isWalkerMode()
  setWalkerMode(next)
  return next
}
