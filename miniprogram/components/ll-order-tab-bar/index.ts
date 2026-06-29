// v2 — OrderTabBar. Spec §2.7 (b).
Component({
  options: { addGlobalClass: true },
  properties: {
    tabs:   { type: Array,  value: ['全部', '待确认', '待付款', '待完成', '已完成', '已失效'] },
    active: { type: String, value: '全部' },
  },
  methods: {
    onPick(e: WechatMiniprogram.BaseEvent) {
      const tab = String(e.currentTarget.dataset.tab)
      if (tab === this.properties.active) return
      this.triggerEvent('change', { tab })
    },
  },
})
