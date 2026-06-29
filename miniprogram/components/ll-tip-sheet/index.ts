// v2 — tip action sheet. Spec §2.10. Amounts hardcoded [8,18,38,66].
Component({
  options: { addGlobalClass: true },
  properties: {
    visible:       { type: Boolean, value: false },
    guardianName:  { type: String,  value: '' },
    petName:       { type: String,  value: '' },
  },
  data: {
    amounts: [8, 18, 38, 66],
  },
  methods: {
    onPick(e: WechatMiniprogram.BaseEvent) {
      const amt = Number(e.currentTarget.dataset.amt)
      this.triggerEvent('pick', { amount: amt })
    },
    onClose() { this.triggerEvent('close') },
    noop() { /* prevent backdrop tap bubbling */ },
  },
})
