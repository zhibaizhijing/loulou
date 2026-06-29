// v2 — order status pill. Spec §2.8 STATUS_META.
import { STATUS_LABEL, type V2Status } from '../../utils/orderStatus'

Component({
  options: { addGlobalClass: true },
  properties: {
    status: { type: String, value: 'pending' },
  },
  data: { label: '' },
  observers: {
    status(s: string) {
      const v = (s || 'pending') as V2Status
      this.setData({ label: STATUS_LABEL[v] || '' })
    },
  },
})
