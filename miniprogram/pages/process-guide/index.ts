// v2 — Process guide overlay page. Spec §2.14.
Page({
  data: { visible: true },
  onLoad() { this.setData({ visible: true }) },
  onClose() { wx.navigateBack({}).catch?.(() => undefined) },
  onStart() { wx.navigateBack({}).catch?.(() => undefined) },
})
