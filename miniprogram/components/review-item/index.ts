import { formatDate } from '../../utils/date'
import type { Review } from '../../models'

Component({
  properties: { review: { type: Object } },
  data: { dateText: '' },
  observers: {
    'review'(r: Review | null) {
      this.setData({ dateText: r ? formatDate(r.createdAt) : '' })
    }
  }
})
