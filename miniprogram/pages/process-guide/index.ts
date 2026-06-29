// v2 — ProcessGuideScreen. Spec/source: ui_kits/wechat-mini-program/HomeMarketplaceScreen.jsx
// Butter hero + stacked deck of step cards that reveal as the user scrolls.
export {}

interface Step {
  icon: string
  title: string
  desc: string
  perk: string
}

const STEPS: Step[] = [
  { icon: 'user',             title: '注册 · 完善宠物资料',  desc: '微信一键登录，填写宠物的品种、健康、性格与喂养习惯。资料越完整，守护者照护越贴心。', perk: '一次填写，长期复用' },
  { icon: 'shield-check',     title: '挑选放心的守护者',     desc: '按服务、距离、评分自由筛选。每位守护者都经过实名认证、资质证书与背景的严格审核。',     perk: '守护者严格筛选 · 认证可查' },
  { icon: 'chat-circle-dots', title: '发起预约 · 线上沟通',  desc: '可同时联系多位守护者，先聊天、约线下见面熟悉，再决定把宝贝托付给谁。',                  perk: '先沟通见面，零压力' },
  { icon: 'currency-cny',     title: '确认订单 · 平台担保付款', desc: '守护者确认后订单才正式生效。款项由平台担保，若 24 小时内未确认，全额原路退回。',          perk: '平台担保 · 24h 未确认全退' },
  { icon: 'camera',           title: '服务进行中 · 实时同步', desc: '遛狗路线、喂食、互动照片与视频实时同步，宝贝的每一刻你都看得见。',                     perk: '每日照片视频 · 安心可见' },
  { icon: 'shield-check',     title: '灵活退款保障',         desc: '服务开始前一天 12:00 前可免费取消、全额退款；临时变动也按透明规则清晰结算。',          perk: '灵活退款 · 规则透明' },
  { icon: 'star',             title: '完成订单 · 评价与打赏', desc: '服务完成后可给守护者评价，满意还能直接打赏——打赏 100% 全额到守护者，平台不抽成。',     perk: '全额打赏 · 平台 0 抽成' },
]

interface Data {
  steps: (Step & { num: string; open: boolean })[]
  revealed: number
  total: number
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    steps: [],
    revealed: 1,
    total: STEPS.length,
  },

  onLoad() { this.refresh(1) },

  refresh(revealed: number) {
    const r = Math.max(1, Math.min(STEPS.length, revealed))
    const steps = STEPS.map((s, i) => ({
      ...s,
      num: `STEP ${String(i + 1).padStart(2, '0')}`,
      open: i < r,
    }))
    this.setData({ steps, revealed: r })
  },

  onTapCard(e: WechatMiniprogram.BaseEvent) {
    const i = Number(e.currentTarget.dataset.i)
    this.refresh(Math.max(this.data.revealed, i + 1))
  },

  onClose() { wx.navigateBack({}).catch?.(() => undefined) },
  onStart() { wx.switchTab({ url: '/pages/home/index' }).catch?.(() => undefined) },
})
