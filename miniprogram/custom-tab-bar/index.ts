// 5-tab uniform bar per Lou Lou design (app.jsx). No mode split.

interface Tab { path: string; label: string; icon: string }

const TABS: Tab[] = [
  { path: '/pages/home/index',     label: '首页',     icon: 'house' },
  { path: '/pages/bookings/index', label: '订单',     icon: 'receipt' },
  { path: '/pages/chat/index',     label: '消息',     icon: 'chat-circle-dots' },
  { path: '/pages/activity/index', label: '守护时刻', icon: 'paw-print' },
  { path: '/pages/me/index',       label: '我的',     icon: 'user' }
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
    activePath: ''
  },
  attached() {
    this.setData({ activePath: currentPagePath() })
  },
  pageLifetimes: {
    show() {
      this.setData({ activePath: currentPagePath() })
    }
  },
  methods: {
    onTap(e: WechatMiniprogram.BaseEvent) {
      const path = String(e.currentTarget.dataset.path)
      if (path === this.data.activePath) return
      const isTabPage = TABS.some(t => t.path === path)
      if (isTabPage) {
        wx.switchTab({ url: path, fail: () => wx.reLaunch({ url: path }) })
      } else {
        wx.navigateTo({ url: path })
      }
    }
  }
})
