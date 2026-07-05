// 5-tab uniform bar per Lou Lou design (app.jsx). No mode split.
// v3 audit: badges (orders / chat) synced with wx.setStorageSync from
// services/bookingService.scheduleAutoSim on state flip. Read on show + attach.

interface Tab { path: string; label: string; icon: string; badgeKey?: string }

const TABS: Tab[] = [
  { path: '/pages/home/index',     label: '首页',     icon: 'house' },
  { path: '/pages/bookings/index', label: '订单',     icon: 'receipt',          badgeKey: 'loulou:badge:orders' },
  { path: '/pages/chat/index',     label: '消息',     icon: 'chat-circle-dots', badgeKey: 'loulou:badge:chat'   },
  { path: '/pages/activity/index', label: '守护时刻', icon: 'paw-print' },
  { path: '/pages/me/index',       label: '我的',     icon: 'user' },
]

function currentPagePath(): string {
  const pages = getCurrentPages()
  if (!pages.length) return ''
  const route = pages[pages.length - 1].route || ''
  return '/' + route
}

Component({
  data: {
    tabs: TABS,
    activePath: '',
    badges: { orders: false, chat: false } as Record<string, boolean>,
  },
  attached() {
    this.setData({ activePath: currentPagePath() })
    ;(this as unknown as { refreshBadges: () => void }).refreshBadges()
  },
  pageLifetimes: {
    show() {
      this.setData({ activePath: currentPagePath() })
      ;(this as unknown as { refreshBadges: () => void }).refreshBadges()
    },
  },
  methods: {
    refreshBadges() {
      let orders = false
      let chat = false
      try { orders = !!wx.getStorageSync('loulou:badge:orders') } catch { /* noop */ }
      try { chat   = !!wx.getStorageSync('loulou:badge:chat')   } catch { /* noop */ }
      this.setData({ badges: { orders, chat } })
    },
    onTap(e: WechatMiniprogram.BaseEvent) {
      const path = String(e.currentTarget.dataset.path)
      if (path === this.data.activePath) return
      const isTabPage = TABS.some(t => t.path === path)
      if (isTabPage) {
        wx.switchTab({ url: path, fail: () => wx.reLaunch({ url: path }) })
      } else {
        wx.navigateTo({ url: path })
      }
    },
  },
})
