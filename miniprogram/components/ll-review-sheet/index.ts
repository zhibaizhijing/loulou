// v2 — review action sheet. Spec §2.10.
Component({
  options: { addGlobalClass: true },
  properties: {
    visible: { type: Boolean, value: false },
  },
  data: {
    stars: 5,
    starList: [1, 2, 3, 4, 5],
  },
  methods: {
    onStar(e: WechatMiniprogram.BaseEvent) {
      this.setData({ stars: Number(e.currentTarget.dataset.n) })
    },
    onSubmit() { this.triggerEvent('submit', { stars: this.data.stars }) },
    onClose() { this.triggerEvent('close') },
    noop() { /* prevent backdrop tap bubbling */ },
  },
})
