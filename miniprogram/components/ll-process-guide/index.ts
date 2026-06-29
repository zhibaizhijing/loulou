// v2 — 4-step process guide overlay. Spec §2.14.

interface Step { icon: string; bg: string; title: string; desc: string }

const STEPS: Step[] = [
  { icon: 'magnifying-glass', bg: '#FEE7A6', title: '挑选守护者', desc: '按服务类型 / 地点 / 日期搜索；查看简介、评价和价格' },
  { icon: 'chat-circle-dots', bg: '#D8CAE8', title: '沟通确认',   desc: '发送申请单，与守护者聊聊宠物的需求' },
  { icon: 'currency-cny',     bg: '#C7E8D8', title: '安心付款',   desc: '守护者接单后，您支付的费用由平台保管' },
  { icon: 'star',             bg: '#FBD3C4', title: '服务完成',   desc: '完成服务后我们将费用结算给守护者，您可以发布评价' },
]

Component({
  options: { addGlobalClass: true },
  properties: {
    visible: { type: Boolean, value: false },
  },
  data: { steps: STEPS, idx: 0 },
  observers: {
    visible(v: boolean) { if (v) this.setData({ idx: 0 }) },
  },
  methods: {
    onDot(e: WechatMiniprogram.BaseEvent) {
      this.setData({ idx: Number(e.currentTarget.dataset.i) })
    },
    onNext() {
      if (this.data.idx < this.data.steps.length - 1) {
        this.setData({ idx: this.data.idx + 1 })
      } else {
        this.triggerEvent('start')
      }
    },
    onClose() { this.triggerEvent('close') },
  },
})
