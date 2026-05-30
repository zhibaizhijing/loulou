interface Data {
  minutes: string
  km: string
  percent: number
  target: string
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    minutes: '45',
    km: '2.5',
    percent: 75,
    target: '60 分钟'
  },

  onShow() {
    const tb = this.getTabBar?.() as WechatMiniprogram.Component.TrivialInstance | undefined
    if (tb && typeof tb.setData === 'function') {
      tb.setData({ activePath: '/pages/activity/index' })
    }
  },

  onLog()     { wx.showToast({ title: '已记录守护时刻 · +1', icon: 'none' }) },
  onHistory() { wx.showToast({ title: '历史回顾即将上线', icon: 'none' }) }
})

export {}
