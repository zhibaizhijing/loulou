import { cloudCall } from '../../services/cloudCall'
import { showAppError } from '../../utils/errorHandler'
import { __USE_MOCK__ } from '../../utils/env'
import { mockDb, resetMockDb, initMockDb } from '../../mocks/db'
import { isCaregiverMode, exitCaregiverMode } from '../../services/caregiverAuth'
import { getMyApplication } from '../../services/applicationService'
import type { User, Dog } from '../../models'

interface Data {
  profile: User | null
  openid: string
  addingDog: boolean
  isCaregiver: boolean
  hasApplication: boolean
  applicationStatusLabel: string
}

const MOCK_OWNER_ID = 'mock-owner-1'

Page<Data, WechatMiniprogram.IAnyObject>({
  data: { profile: null, openid: '', addingDog: false, isCaregiver: false, hasApplication: false, applicationStatusLabel: '' },

  onShow() { this.load() },

  async load() {
    try {
      let profile: User | null = null
      if (__USE_MOCK__) {
        profile = mockDb.users.list().find(u => u._id === MOCK_OWNER_ID) ?? null
      } else {
        profile = await cloudCall<User>('getMyProfile', {})
      }
      const openid = (getApp<IAppOption>().globalData?.openid) || ''
      this.setData({ profile, openid })

      const isCaregiver = isCaregiverMode()
      let hasApplication = false
      let applicationStatusLabel = ''
      if (!isCaregiver) {
        const app = await getMyApplication().catch(() => null)
        if (app && app.status !== 'rejected') {
          hasApplication = true
          applicationStatusLabel = app.status === 'submitted' ? '提交中' : app.status === 'reviewing' ? '审核中' : app.status === 'approved' ? '已通过' : ''
        }
      }
      this.setData({ isCaregiver, hasApplication, applicationStatusLabel })
    } catch (e) { showAppError(e) }
  },

  onAddDogToggle() { this.setData({ addingDog: !this.data.addingDog }) },

  async onSaveDog(e: WechatMiniprogram.CustomEvent<{ dog: Dog }>) {
    const dogs = [...((this.data.profile?.dogs) || []), e.detail.dog]
    try {
      if (__USE_MOCK__) {
        const u = mockDb.users.list().find(x => x._id === MOCK_OWNER_ID)
        if (u) mockDb.users.update(u._id, { dogs } as any)
      } else {
        await cloudCall('updateProfile', { name: this.data.profile?.name || 'Pet Owner', dogs })
      }
      this.setData({ addingDog: false })
      this.load()
    } catch (e2) { showAppError(e2) }
  },

  async onResetMock() {
    if (!__USE_MOCK__) {
      wx.showToast({ title: 'Mock mode off', icon: 'none' })
      return
    }
    const m = await wx.showModal({ title: 'Reset mock data?', content: 'Wipes all bookings, chats, reports, reviews. Re-seeds walkers + owner.' })
    if (!m.confirm) return
    resetMockDb()
    initMockDb()
    wx.showToast({ title: 'Mock reset', icon: 'success' })
    this.load()
  },

  async onSeedCloud() {
    if (__USE_MOCK__) {
      wx.showToast({ title: 'Live mode only', icon: 'none' })
      return
    }
    wx.showLoading({ title: 'Seeding…' })
    try {
      const r = await cloudCall<{ walkers: number; reviews: number }>('seedDemoData', {})
      wx.showToast({ title: `Seeded ${r.walkers}w/${r.reviews}r`, icon: 'success' })
    } catch (e) { showAppError(e) }
    finally { wx.hideLoading() }
  },

  onApply() { wx.navigateTo({ url: '/pages/caregiver-apply/index' }) },
  onMyApplication() { wx.navigateTo({ url: '/pages/caregiver-apply/index' }) },
  onCaregiverHome() { wx.navigateTo({ url: '/pages/caregiver-home/index' }) },
  async onExitCaregiver() {
    exitCaregiverMode()
    this.setData({ isCaregiver: false })
    wx.showToast({ title: 'Exited caregiver mode', icon: 'success' })
  }
})
