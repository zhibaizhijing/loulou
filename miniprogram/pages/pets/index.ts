import { __USE_MOCK__ } from '../../utils/env'
import { mockDb } from '../../mocks/db'
import { cloudCall } from '../../services/cloudCall'
import { showAppError } from '../../utils/errorHandler'
import type { User, Dog } from '../../models'

interface PetRow { id: string; name: string; breed: string; detail: string }

interface Data {
  pets: PetRow[]
  addingDog: boolean
}

const MOCK_OWNER_ID = 'mock-owner-1'

Page<Data, WechatMiniprogram.IAnyObject>({
  data: { pets: [], addingDog: false },

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
        detail: ''
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
      this.load()
    } catch (e2) { showAppError(e2) }
  }
})
