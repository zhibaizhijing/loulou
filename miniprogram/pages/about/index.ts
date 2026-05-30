export {}

interface Doc { id: string; label: string; body: string | null }

interface Data {
  docs: Doc[]
  expanded: string
}

const DOCS: Doc[] = [
  { id: 'terms',      label: '用户服务协议', body: '欢迎使用 Loulou（噜噜）宠物服务平台。本协议约定您与平台之间的权利义务关系。\n\n一、服务内容\nLoulou 提供宠物寄养、遛狗、日托等预约撮合服务，平台为信息中介方。\n\n二、用户义务\n您需如实填写宠物信息，保证宠物已接种疫苗，配合守护者完成接送手续。\n\n三、平台职责\n平台负责守护者认证审核，提供支付担保及纠纷协调，但不对守护者的个人行为承担连带责任。\n\n四、争议解决\n本协议适用中华人民共和国法律，争议由平台注册地人民法院管辖。' },
  { id: 'privacy',    label: '隐私政策',     body: 'Loulou 重视用户隐私保护。本政策说明我们如何收集、使用和保护您的个人信息。\n\n一、信息收集\n我们收集您注册时填写的姓名、手机号、地址及使用过程中的行为数据。\n\n二、信息使用\n信息用于提供服务、改善产品体验、发送订单通知。\n\n三、信息共享\n我们不向无关第三方出售您的信息，仅在必要时与守护者共享联系方式。\n\n四、数据安全\n平台采用行业标准加密技术保障数据安全，如有泄漏将第一时间通知您。' },
  { id: 'disclaimer', label: '免责声明',     body: '一、服务限制\nLoulou 为撮合平台，对守护者与宠主因服务产生的纠纷不承担直接责任。\n\n二、意外责任\n服务过程中发生宠物意外，平台将协助保险理赔，最终责任认定依据相关法律。\n\n三、不可抗力\n因自然灾害、政府行为等不可抗力导致服务中断，平台不承担赔偿责任。' },
  { id: 'feedback',   label: '意见反馈',     body: null }
]

Page<Data, WechatMiniprogram.IAnyObject>({
  data: { docs: DOCS, expanded: '' },

  onToggle(e: WechatMiniprogram.BaseEvent) {
    const id = String(e.currentTarget.dataset.id)
    const doc = this.data.docs.find(d => d.id === id)
    if (!doc || !doc.body) {
      wx.showToast({ title: '即将上线', icon: 'none' })
      return
    }
    this.setData({ expanded: this.data.expanded === id ? '' : id })
  }
})
