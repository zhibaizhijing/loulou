interface ChipItem { id: string; label: string }

Component({
  options: { addGlobalClass: true },
  properties: {
    items:  { type: Array,  value: [] as ChipItem[] },
    active: { type: String, value: '' }
  },
  methods: {
    onPick(e: WechatMiniprogram.BaseEvent) {
      const id = String(e.currentTarget.dataset.id)
      this.triggerEvent('change', { value: id })
    }
  }
})
