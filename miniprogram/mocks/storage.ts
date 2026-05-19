const KEY = 'mockdb:v4'

interface AllRows { [coll: string]: Array<{ _id: string }> }

export function loadAll(): AllRows | null {
  try {
    const v = wx.getStorageSync(KEY)
    if (!v) return null
    return v as AllRows
  } catch {
    return null
  }
}

export function saveAll(snapshot: AllRows) {
  try {
    wx.setStorageSync(KEY, snapshot)
  } catch {
    // ignore — quota or test env without storage
  }
}
