// v3 — Cancel-order modal. Spec/source: design/lou-lou-design-system/project/ui_kits/wechat-mini-program/BookingSummaryScreen.jsx BsCancelOrderModal.
// Bottom-anchored card w/ 3 tiers (全额退款 / 部分扣款 / 多日订单) + 确认取消 red CTA + 暂不取消 ghost.
Component({
  options: { addGlobalClass: true },
  properties: {
    visible:       { type: Boolean, value: false },
    cancelDateStr: { type: String,  value: '服务前一天' },
  },
  methods: {
    onClose()   { this.triggerEvent('close') },
    onConfirm() { this.triggerEvent('confirm') },
    noop() { /* prevent backdrop tap bubbling */ },
  },
})
