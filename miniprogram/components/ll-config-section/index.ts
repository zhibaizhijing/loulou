// v2 — draft basket service-info card. Spec §2.7 (c) / ConfigSection.
Component({
  options: { addGlobalClass: true },
  properties: {
    config:        { type: Object, value: {} },
    serviceOptions:{ type: Array,  value: ['寄养', '日托', '遛狗', '上门喂养', '伴宠留宿'] },
  },
  data: {
    fields: [
      { key: 'pet',       label: '宠物' },
      { key: 'dateStart', label: '开始日期' },
      { key: 'dateEnd',   label: '结束日期' },
      { key: 'area',      label: '地点' },
    ],
  },
  methods: {
    onPickSvc(e: WechatMiniprogram.BaseEvent) {
      const value = String(e.currentTarget.dataset.value)
      this.triggerEvent('change', { field: 'service', value })
    },
    onFieldInput(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
      const field = String(e.currentTarget.dataset.field)
      this.triggerEvent('change', { field, value: e.detail.value })
    },
  },
})
