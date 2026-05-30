export {}

interface Data {
  invitedCount: number
  rewardAmount: number
  code: string
  copied: boolean
  rules: string[]
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    invitedCount: 3,
    rewardAmount: 60,
    code: 'LOULOU888',
    copied: false,
    rules: [
      '好友通过邀请码注册后，双方各得 ¥20 优惠券',
      '好友完成首笔订单后，您额外获得 ¥10 奖励',
      '优惠券有效期 90 天，请及时使用'
    ]
  },

  onCopy() {
    wx.setClipboardData({ data: this.data.code })
    this.setData({ copied: true })
    setTimeout(() => this.setData({ copied: false }), 2000)
  },

  onShare() {
    wx.showToast({ title: '即将上线', icon: 'none' })
  }
})
