import { formatTime } from '../../utils/date'
import type { Message } from '../../models'

Component({
  properties: {
    message: { type: Object },
    mine:    { type: Boolean, value: false }
  },
  data: { timeText: '' },
  observers: {
    'message'(m: Message | null) {
      this.setData({ timeText: m ? formatTime(m.createdAt) : '' })
    }
  }
})
