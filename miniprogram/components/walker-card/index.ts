import type { Walker } from '../../models'

Component({
  properties: { walker: { type: Object } },
  methods: {
    onTap() {
      const w = (this.data as { walker: Walker | null }).walker
      if (!w) return
      wx.navigateTo({ url: `/pages/walker/index?id=${w._id}` })
    }
  }
})
