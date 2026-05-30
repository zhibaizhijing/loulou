import { currentCaregiverId } from '../../services/caregiverAuth'
import { getEarningsSummary } from '../../services/paymentService'
import { formatDateTime } from '../../utils/date'
import type { Payout, PayoutKind } from '../../models'

interface Row extends Payout {
  dateLabel: string
  kindLabel: string
  amountLabel: string
}

interface Data {
  loading: boolean
  noCaregiver: boolean
  balance: number
  totalCredited: number
  totalCommission: number
  totalPayout: number
  totalRefunded: number
  rows: Row[]
}

const KIND_LABEL: Record<PayoutKind, string> = {
  credit:     '+ 主人支付',
  commission: '− 平台佣金',
  payout:     '− 结算到账',
  refund:     '− 退款',
  adjustment: '± 调整'
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    loading: true, noCaregiver: false,
    balance: 0, totalCredited: 0, totalCommission: 0, totalPayout: 0, totalRefunded: 0,
    rows: []
  },

  onShow() { this.load() },

  load() {
    const cgId = currentCaregiverId()
    if (!cgId) { this.setData({ noCaregiver: true, loading: false }); return }
    const summary = getEarningsSummary(cgId)
    const rows: Row[] = summary.entries.map(p => ({
      ...p,
      dateLabel: formatDateTime(p.createdAt),
      kindLabel: KIND_LABEL[p.kind] || p.kind,
      amountLabel: (p.amount >= 0 ? '+' : '') + '¥' + p.amount.toFixed(2)
    }))
    this.setData({
      noCaregiver: false, loading: false,
      balance: summary.balance,
      totalCredited: summary.totalCredited,
      totalCommission: summary.totalCommission,
      totalPayout: summary.totalPayout,
      totalRefunded: summary.totalRefunded,
      rows
    })
  },

  onBack() { wx.navigateBack() }
})
