import { applyCaregiver, getMyApplication } from '../../services/applicationService'
import { switchToCaregiver } from '../../services/caregiverAuth'
import { uploadImage } from '../../services/storageService'
import { showAppError } from '../../utils/errorHandler'
import { SERVICE_TYPE_LABEL } from '../../models/index'
import type { ServiceType, CaregiverApplication } from '../../models/index'

type Phase = 'form' | 'status'

interface Data {
  phase: Phase
  step: number
  realName: string
  idPhotoUrl: string
  indoorPhotos: string[]
  bio: string
  proposedServiceTypes: ServiceType[]
  serviceOptions: { value: ServiceType; label: string }[]
  serviceLabels: Record<ServiceType, string>
  submitting: boolean
  application: CaregiverApplication | null
  statusIcon: string
  statusTitle: string
  statusSub: string
}

const ALL_SERVICES: ServiceType[] = ['walking', 'boarding', 'daycare', 'house_visit', 'live_in']

const STATUS_VIEW: Record<string, { icon: string; title: string; sub: string }> = {
  submitted: { icon: '📨', title: 'Application submitted',  sub: 'We have received your details.' },
  reviewing: { icon: '🔍', title: 'Under review',           sub: 'An admin is verifying your photos.' },
  approved:  { icon: '🎉', title: 'You\'re approved!',      sub: 'You can now start receiving bookings.' },
  rejected:  { icon: '❌', title: 'Application rejected',   sub: 'Please contact support.' }
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    phase: 'form',
    step: 1,
    realName: '',
    idPhotoUrl: '',
    indoorPhotos: [],
    bio: '',
    proposedServiceTypes: [],
    serviceOptions: ALL_SERVICES.map(s => ({ value: s, label: SERVICE_TYPE_LABEL[s] })),
    serviceLabels: SERVICE_TYPE_LABEL,
    submitting: false,
    application: null,
    statusIcon: '', statusTitle: '', statusSub: ''
  },
  pollHandle: 0 as ReturnType<typeof setInterval> | 0,

  async onLoad() {
    try {
      const existing = await getMyApplication()
      if (existing && existing.status !== 'rejected') {
        this.setData({ phase: 'status', application: existing, ...STATUS_VIEW[existing.status] })
        this.startPolling()
        return
      }
    } catch { /* ignore */ }
  },

  onUnload() { this.stopPolling() },

  checkCanAdvance(): boolean {
    const { step, realName, idPhotoUrl, indoorPhotos, bio, proposedServiceTypes } = this.data
    switch (step) {
      case 1: return realName.trim().length > 0
      case 2: return !!idPhotoUrl
      case 3: return indoorPhotos.length >= 1
      case 4: return bio.trim().length >= 10 && proposedServiceTypes.length > 0
      case 5: return true
      default: return false
    }
  },

  onFieldChange() {
    // no-op: model:value keeps data in sync; validation fires on onNext
  },

  onBack() {
    if (this.data.step > 1) this.setData({ step: this.data.step - 1 })
  },

  onNext() {
    if (!this.checkCanAdvance()) {
      wx.showToast({ title: 'Please complete this step', icon: 'none' })
      return
    }
    if (this.data.step < 5) this.setData({ step: this.data.step + 1 })
  },

  async onPickIdPhoto() {
    try {
      const r = await wx.chooseMedia({ count: 1, mediaType: ['image'] })
      const url = await uploadImage(r.tempFiles[0].tempFilePath, 'caregiver-id')
      this.setData({ idPhotoUrl: url })
    } catch (e: any) {
      if (e?.errMsg && /cancel/.test(e.errMsg)) return
      showAppError(e)
    }
  },

  async onPickIndoorPhotos() {
    try {
      const remaining = 3 - this.data.indoorPhotos.length
      if (remaining <= 0) return
      const r = await wx.chooseMedia({ count: remaining, mediaType: ['image'] })
      const urls: string[] = []
      for (const f of r.tempFiles) {
        urls.push(await uploadImage(f.tempFilePath, 'caregiver-indoor'))
      }
      this.setData({ indoorPhotos: [...this.data.indoorPhotos, ...urls] })
    } catch (e: any) {
      if (e?.errMsg && /cancel/.test(e.errMsg)) return
      showAppError(e)
    }
  },

  onServicesChange(e: WechatMiniprogram.CustomEvent<{ value: ServiceType[] }>) {
    this.setData({ proposedServiceTypes: e.detail.value })
  },

  async onSubmit() {
    this.setData({ submitting: true })
    try {
      await applyCaregiver({
        realName: this.data.realName,
        idPhotoUrl: this.data.idPhotoUrl,
        indoorPhotos: this.data.indoorPhotos,
        bio: this.data.bio,
        proposedServiceTypes: this.data.proposedServiceTypes
      })
      const app = await getMyApplication()
      this.setData({
        phase: 'status',
        application: app,
        ...(app ? STATUS_VIEW[app.status] : STATUS_VIEW['submitted'])
      })
      this.startPolling()
    } catch (e) { showAppError(e) }
    finally { this.setData({ submitting: false }) }
  },

  startPolling() {
    this.stopPolling()
    this.pollHandle = setInterval(async () => {
      const app = await getMyApplication()
      if (!app) return
      const prev = this.data.application?.status
      if (app.status !== prev) {
        this.setData({ application: app, ...STATUS_VIEW[app.status] })
      }
      if (app.status === 'approved' || app.status === 'rejected') {
        this.stopPolling()
      }
    }, 500)
  },

  stopPolling() {
    if (this.pollHandle) {
      clearInterval(this.pollHandle as unknown as number)
      this.pollHandle = 0
    }
  },

  onSwitchToCaregiver() {
    const cgId = this.data.application?.resultingCaregiverId
    if (!cgId) return
    try {
      switchToCaregiver(cgId)
      wx.showToast({ title: 'Switched to caregiver mode', icon: 'success' })
      setTimeout(() => wx.switchTab({ url: '/pages/home/index' }), 600)
    } catch (e) { showAppError(e) }
  },

  onBackHome() {
    wx.switchTab({ url: '/pages/home/index' })
  }
})
