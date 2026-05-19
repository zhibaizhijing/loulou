import { submitReview } from '../../services/reviewService'
import { showAppError } from '../../utils/errorHandler'
import { bus, BUS_EVENTS } from '../../utils/bus'

interface Data { stars: 1|2|3|4|5; text: string; submitting: boolean }

Page<Data, WechatMiniprogram.IAnyObject>({
  data: { stars: 5, text: '', submitting: false },
  bookingId: '' as string,

  onLoad(q: Record<string, string>) { this.bookingId = q.bookingId },

  onStars(e: WechatMiniprogram.CustomEvent<{ value: number }>) {
    this.setData({ stars: e.detail.value as 1|2|3|4|5 })
  },

  async onSubmit() {
    if (!this.data.text.trim()) {
      wx.showToast({ title: 'Please add a comment', icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    try {
      await submitReview({ bookingId: this.bookingId, stars: this.data.stars, text: this.data.text })
      bus.emit(BUS_EVENTS.REVIEW_SUBMITTED, { bookingId: this.bookingId })
      wx.showToast({ title: 'Thanks!', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 600)
    } catch (e) {
      showAppError(e)
    } finally {
      this.setData({ submitting: false })
    }
  }
})
