export {}

interface Coupon {
  id: string
  type: string
  icon: string
  title: string
  desc: string
  expires: string
  tag?: string
  bg: 'butter' | 'lavender' | 'mint' | 'peach' | 'neutral'
}

interface CpTab { id: 'valid' | 'used' | 'expired'; label: string }

interface Data {
  tab: 'valid' | 'used' | 'expired'
  tabs: CpTab[]
  tabLabel: string
  list: Coupon[]
  data: Record<'valid' | 'used' | 'expired', Coupon[]>
}

const COUPONS: Data['data'] = {
  valid: [
    { id: 'c1', type: '生日专享', icon: 'cake',      title: '宠物生日折扣券', desc: '生日当月享 9 折，不限服务', expires: '2026 年 12 月 31 日', tag: '即将到期', bg: 'butter' },
    { id: 'c2', type: '邀请奖励', icon: 'users',     title: '邀请好友奖励券', desc: '满 ¥100 立减 ¥20',         expires: '2026 年 06 月 30 日',                  bg: 'lavender' }
  ],
  used: [],
  expired: [
    { id: 'c3', type: '商家合作', icon: 'handshake', title: '噜噜 × 萌宠乐园合作券', desc: '满 ¥100 减 ¥15', expires: '2026 年 04 月 30 日', tag: '已过期', bg: 'neutral' }
  ]
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    tab: 'valid',
    tabs: [
      { id: 'valid',   label: '未使用' },
      { id: 'used',    label: '已使用' },
      { id: 'expired', label: '已过期' }
    ],
    tabLabel: '未使用',
    list: COUPONS.valid,
    data: COUPONS
  },

  onTab(e: WechatMiniprogram.BaseEvent) {
    const id = e.currentTarget.dataset.id as 'valid' | 'used' | 'expired'
    const t = this.data.tabs.find(t => t.id === id)
    this.setData({ tab: id, list: this.data.data[id], tabLabel: t?.label || '' })
  }
})
