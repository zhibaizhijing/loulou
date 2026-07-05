// v2 — Sent application card. Spec §2.8.
import { STATUS_DESC, type StatusPillStatus } from '../../utils/orderStatus'

interface AppCardData {
  id: string
  status: StatusPillStatus
  guardianName: string
  guardianPhoto?: string
  guardianInitial?: string
  guardianInitialBg?: string
  service: string
  dateStart: string
  dateEnd?: string
  pet: string
}

Component({
  options: { addGlobalClass: true },
  properties: {
    app: { type: Object, value: {} as AppCardData },
  },
  data: {
    desc: '',
    isInactive: false,
    isCompleted: false,
    isAccepted: false,
    isPending: false,
  },
  observers: {
    'app.status'(s: StatusPillStatus) {
      this.setData({
        desc: STATUS_DESC[s] || '',
        isInactive: s === 'rejected',
        isCompleted: s === 'completed',
        isAccepted: s === 'accepted',
        isPending: s === 'pending',
      })
    },
  },
  methods: {
    onOpenSummary() {
      if (this.data.isInactive) return
      this.triggerEvent('opensummary', { id: (this.properties.app as any).id })
    },
    onOpenChat()   { this.triggerEvent('openchat',   { id: (this.properties.app as any).id }) },
    onRebook()     { this.triggerEvent('rebook',     { id: (this.properties.app as any).id }) },
    onWriteReview(){ this.triggerEvent('writereview',{ id: (this.properties.app as any).id }) },
    onPay()        { this.triggerEvent('opensummary',{ id: (this.properties.app as any).id, action: 'pay' }) },
  },
})
