interface Tab { path: string; label: string; icon: string }

const TABS: Tab[] = [
  { path: '/pages/home/index',     label: 'Home',     icon: '🏠' },
  { path: '/pages/bookings/index', label: 'Bookings', icon: '📅' },
  { path: '/pages/me/index',       label: 'Me',       icon: '👤' }
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
