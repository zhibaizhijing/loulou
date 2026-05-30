export {}

interface Item { label: string; type: 'nav' | 'toggle'; value?: string; key?: 'notif' | 'mktg' }
interface Section { title: string; items: Item[] }

interface Data {
  sections: Section[]
  notif: boolean
  mktg: boolean
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    sections: [
      {
        title: '账号安全',
        items: [
          { label: '手机号码', type: 'nav', value: '+86 138 **** 8888' },
          { label: '修改密码', type: 'nav' },
          { label: '绑定邮箱', type: 'nav', value: '已绑定' }
        ]
      },
      {
        title: '通知设置',
        items: [
          { label: '推送通知',     type: 'toggle', key: 'notif' },
          { label: '营销活动推送', type: 'toggle', key: 'mktg' },
          { label: '订单状态提醒', type: 'nav' }
        ]
      },
      {
        title: '通用',
        items: [
          { label: '清除缓存',   type: 'nav', value: '12.5 MB' },
          { label: '反馈与帮助', type: 'nav' }
        ]
      }
    ],
    notif: true,
    mktg: false
  },

  onRowTap(e: WechatMiniprogram.BaseEvent) {
    if (e.currentTarget.dataset.type === 'toggle') return
    wx.showToast({ title: '即将上线', icon: 'none' })
  },

  onToggleChange(e: WechatMiniprogram.CustomEvent<{ value: boolean }>) {
    const key = String(e.currentTarget.dataset.key) as 'notif' | 'mktg'
    if (key === 'notif') this.setData({ notif: e.detail.value })
    else if (key === 'mktg') this.setData({ mktg: e.detail.value })
  },

  onLogout() {
    wx.showModal({ title: '确认退出登录？', content: '需重新登录后才能访问' })
  }
})
