import { listWalkers } from '../../services/walkerService'
import { createPageState } from '../../utils/usePageState'
import { showAppError } from '../../utils/errorHandler'
import type { Walker, ServiceType } from '../../models'

interface Data {
  walkers: Walker[]
  q: string
  serviceType: string         // 'all' | ServiceType
  pageStatus: string
  pageError: string
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: { walkers: [], q: '', serviceType: 'all', pageStatus: 'loading', pageError: '' },

  onLoad() { this.load() },
  onPullDownRefresh() { this.load().finally(() => wx.stopPullDownRefresh()) },

  async load() {
    const ps = createPageState(this.setData.bind(this))
    try {
      const filter: { q?: string; serviceType?: ServiceType } = {}
      if (this.data.q) filter.q = this.data.q
      if (this.data.serviceType !== 'all') filter.serviceType = this.data.serviceType as ServiceType

      const walkers = await ps.run(
        () => listWalkers(filter),
        { onEmpty: v => v.length === 0 }
      )
      this.setData({ walkers })
    } catch (e) { showAppError(e) }
  },

  onSearch() { this.load() },
  onChange(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ q: e.detail.value })
    this.load()
  },
  onClearSearch() { this.setData({ q: '' }); this.load() },
  onTypeChange(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ serviceType: e.detail.value })
    this.load()
  },
  onRetry() { this.load() }
})
