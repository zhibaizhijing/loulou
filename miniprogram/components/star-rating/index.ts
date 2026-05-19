Component({
  properties: {
    value:    { type: Number, value: 0 },
    readonly: { type: Boolean, value: false }
  },
  data: { filled: 0 },
  observers: { 'value'(v: number) { this.setData({ filled: v }) } },
  methods: {
    onTap(e: WechatMiniprogram.BaseEvent) {
      if (this.data.readonly) return
      const v = Number(e.currentTarget.dataset.v)
      this.setData({ filled: v })
      this.triggerEvent('change', { value: v })
    }
  }
})
