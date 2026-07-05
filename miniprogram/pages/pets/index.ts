// Pets management page.
// v3 audit: supports design's `?mode=add&returnTo=<url>` flow used by pet-reminder
// gate on walker page. When returnTo is set, on save we resume the caller instead
// of just staying on this page.
import { __USE_MOCK__ } from '../../utils/env'
import { mockDb } from '../../mocks/db'
import { cloudCall } from '../../services/cloudCall'
import { showAppError } from '../../utils/errorHandler'
import type { User, Dog } from '../../models'

interface PetRow { id: string; name: string; breed: string; detail: string }

interface Data {
  pets: PetRow[]
  addingDog: boolean
  mode: 'list' | 'add'
  completeLabel: string
}

const MOCK_OWNER_ID = 'mock-owner-1'

Page<Data, WechatMiniprogram.IAnyObject>({
  data: { pets: [], addingDog: false, mode: 'list', completeLabel: '保存' },
  returnTo: '' as string,

  onLoad(q: Record<string, string>) {
    const mode = q.mode === 'add' ? 'add' : 'list'
    this.returnTo = q.returnTo ? decodeURIComponent(q.returnTo) : ''
    // In add-mode we open the form immediately + change the CTA label so the
    // user knows saving will resume the booking they just came from.
    this.setData({
      mode,
      addingDog: mode === 'add',
      completeLabel: this.returnTo ? '保存并继续预约' : '保存',
    })
  },

  onShow() { this.load() },

  async load() {
    try {
      let profile: User | null = null
      if (__USE_MOCK__) {
        profile = mockDb.users.list().find(u => u._id === MOCK_OWNER_ID) ?? null
      } else {
        profile = await cloudCall<User>('getMyProfile', {})
      }
      const dogs = profile?.dogs || []
      const pets: PetRow[] = dogs.map(d => ({
        id: d.id,
        name: d.name,
        breed: d.breed || '混血',
        detail: '',
      }))
      this.setData({ pets })
    } catch (e) { showAppError(e) }
  },

  onPickPet() {
    wx.showToast({ title: '宠物详情即将上线', icon: 'none' })
  },

  onToggleAdd() { this.setData({ addingDog: !this.data.addingDog }) },

  async onSaveDog(e: WechatMiniprogram.CustomEvent<{ dog: Dog }>) {
    try {
      if (__USE_MOCK__) {
        const u = mockDb.users.list().find(x => x._id === MOCK_OWNER_ID)
        if (u) {
          const dogs = [...(u.dogs || []), e.detail.dog]
          mockDb.users.update(u._id, { dogs } as Partial<User>)
        }
      } else {
        wx.showToast({ title: '功能即将上线', icon: 'none' })
      }
      this.setData({ addingDog: false })
      await this.load()
      // Resume the caller (e.g. walker page → booking-new) if we were opened
      // via the pet-reminder gate.
      if (this.returnTo) {
        wx.redirectTo({
          url: this.returnTo,
          fail: () => wx.navigateBack({}).catch?.(() => undefined),
        })
      }
    } catch (e2) { showAppError(e2) }
  },
})
