import { listWalkers } from '../../services/walkerService'
import { createPageState } from '../../utils/usePageState'
import { showAppError } from '../../utils/errorHandler'
import { SIZE_BAND_LABEL } from '../../models/index'
import type { Walker, ServiceType, SizeBand } from '../../models'

interface SizeBandOpt { value: SizeBand; label: string }

interface Data {
  walkers: Walker[]
  q: string
  serviceType: string         // 'all' | ServiceType
  sizeBand: string            // '' (any) | SizeBand
  canMedicate: boolean
  sizeBandOptions: SizeBandOpt[]
  pageStatus: string
  pageError: string
}

const SIZE_BANDS: SizeBand[] = ['xs', 's', 'm', 'l', 'xl']

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    walkers: [], q: '', serviceType: 'all',
    sizeBand: '', canMedicate: false,
    sizeBandOptions: SIZE_BANDS.map(b => ({ value: b, label: SIZE_BAND_LABEL[b] })),
    pageStatus: 'loading', pageError: ''
  },

  onLoad() { this.load() },
  onPullDownRefresh() { this.load().finally(() => wx.stopPullDownRefresh()) },

  async load() {
    const ps = createPageState(this.setData.bind(this))
    try {
      const filter: { q?: string; serviceType?: ServiceType; sizeBand?: SizeBand; canMedicate?: boolean } = {}
      if (this.data.q) filter.q = this.data.q
      if (this.data.serviceType !== 'all') filter.serviceType = this.data.serviceType as ServiceType
      if (this.data.sizeBand) filter.sizeBand = this.data.sizeBand as SizeBand
      if (this.data.canMedicate) filter.canMedicate = true

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
  onSizeBandTap(e: WechatMiniprogram.BaseEvent) {
    const v = String(e.currentTarget.dataset.value || '')
    this.setData({ sizeBand: v === this.data.sizeBand ? '' : v })
    this.load()
  },
  onMedicateToggle() {
    this.setData({ canMedicate: !this.data.canMedicate })
    this.load()
  },
  onRetry() { this.load() }
})
