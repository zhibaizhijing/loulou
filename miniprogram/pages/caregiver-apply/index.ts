import { applyCaregiver, getMyApplication } from '../../services/applicationService'
import { switchToCaregiver } from '../../services/caregiverAuth'
import { uploadImage } from '../../services/storageService'
import { showAppError } from '../../utils/errorHandler'
import { SERVICE_TYPE_LABEL, PET_TYPE_LABEL, SIZE_BAND_LABEL } from '../../models/index'
import type { ServiceType, CaregiverApplication, PetType, SizeBand, CaregiverIntake } from '../../models/index'

type Phase = 'intro' | 'form' | 'status'

interface Data {
  phase: Phase
  benefits: { icon: string; text: string }[]
  requirements: string[]
  step: number
  totalSteps: number
  realName: string
  idPhotoUrl: string
  indoorPhotos: string[]
  bio: string
  proposedServiceTypes: ServiceType[]
  serviceOptions: { value: ServiceType; label: string }[]
  serviceLabels: Record<ServiceType, string>
  // Intake (P0-B Task 111)
  acceptedPetTypes: PetType[]
  acceptedSizeBands: SizeBand[]
  maxConcurrent: number
  canMedicate: boolean
  acceptsAggressive: boolean
  acceptsPuppy: boolean
  acceptsSenior: boolean
  intakeNotes: string
  petTypeOptions: { value: PetType; label: string }[]
  sizeBandOptions: { value: SizeBand; label: string }[]
  petTypeLabels: Record<PetType, string>
  sizeBandLabels: Record<SizeBand, string>
  submitting: boolean
  application: CaregiverApplication | null
  statusIcon: string
  statusTitle: string
  statusSub: string
}

const ALL_SERVICES: ServiceType[] = ['walking', 'boarding', 'daycare', 'house_visit', 'live_in']
const ALL_PET_TYPES: PetType[] = ['dog', 'cat', 'small_animal']
const ALL_SIZE_BANDS: SizeBand[] = ['xs', 's', 'm', 'l', 'xl']
const TOTAL_STEPS = 6

const STATUS_VIEW: Record<string, { icon: string; title: string; sub: string }> = {
  submitted: { icon: '📨', title: '已提交申请',  sub: '我们已收到您的资料' },
  reviewing: { icon: '🔍', title: '审核中',     sub: '审核员正在验证您的照片' },
  approved:  { icon: '🎉', title: '审核通过',   sub: '您现在可以开始接受预约' },
  rejected:  { icon: '❌', title: '申请被拒',   sub: '请联系客服了解详情' }
}

const BENEFITS = [
  { icon: 'currency-cny',   text: '灵活赚取收入，自定服务价格' },
  { icon: 'calendar-blank', text: '自主管理日程，随时暂停接单' },
  { icon: 'shield-check',   text: '平台保险保障，安全无忧' },
  { icon: 'headset',        text: '7×24 小时专属客服支持' }
]
const REQUIREMENTS = ['年满 18 周岁', '爱宠人士，有养宠经验', '通过平台认证培训', '提供安全、整洁的住所']

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    phase: 'intro',
    benefits: BENEFITS,
    requirements: REQUIREMENTS,
    step: 1,
    totalSteps: TOTAL_STEPS,
    realName: '',
    idPhotoUrl: '',
    indoorPhotos: [],
    bio: '',
    proposedServiceTypes: [],
    serviceOptions: ALL_SERVICES.map(s => ({ value: s, label: SERVICE_TYPE_LABEL[s] })),
    serviceLabels: SERVICE_TYPE_LABEL,
    acceptedPetTypes: ['dog'],
    acceptedSizeBands: ['s', 'm'],
    maxConcurrent: 1,
    canMedicate: false,
    acceptsAggressive: false,
    acceptsPuppy: false,
    acceptsSenior: false,
    intakeNotes: '',
    petTypeOptions: ALL_PET_TYPES.map(t => ({ value: t, label: PET_TYPE_LABEL[t] })),
    sizeBandOptions: ALL_SIZE_BANDS.map(b => ({ value: b, label: SIZE_BAND_LABEL[b] })),
    petTypeLabels: PET_TYPE_LABEL,
    sizeBandLabels: SIZE_BAND_LABEL,
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

  onStartApply() { this.setData({ phase: 'form' }) },

  checkCanAdvance(): boolean {
    const { step, realName, idPhotoUrl, indoorPhotos, bio, proposedServiceTypes,
            acceptedPetTypes, acceptedSizeBands, maxConcurrent } = this.data
    switch (step) {
      case 1: return realName.trim().length > 0
      case 2: return !!idPhotoUrl
      case 3: return indoorPhotos.length >= 1
      case 4: return bio.trim().length >= 10 && proposedServiceTypes.length > 0
      case 5: return acceptedPetTypes.length > 0 && acceptedSizeBands.length > 0 && maxConcurrent >= 1
      case 6: return true
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
    if (this.data.step < TOTAL_STEPS) this.setData({ step: this.data.step + 1 })
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

  onPetTypesChange(e: WechatMiniprogram.CustomEvent<{ value: PetType[] }>) {
    this.setData({ acceptedPetTypes: e.detail.value })
  },
  onSizeBandsChange(e: WechatMiniprogram.CustomEvent<{ value: SizeBand[] }>) {
    this.setData({ acceptedSizeBands: e.detail.value })
  },
  onMaxConcurrentChange(e: WechatMiniprogram.CustomEvent<{ value: number }>) {
    this.setData({ maxConcurrent: Number(e.detail.value) })
  },
  onCanMedicateChange(e: WechatMiniprogram.CustomEvent<{ value: boolean }>) {
    this.setData({ canMedicate: !!e.detail.value })
  },
  onAcceptsAggressiveChange(e: WechatMiniprogram.CustomEvent<{ value: boolean }>) {
    this.setData({ acceptsAggressive: !!e.detail.value })
  },
  onAcceptsPuppyChange(e: WechatMiniprogram.CustomEvent<{ value: boolean }>) {
    this.setData({ acceptsPuppy: !!e.detail.value })
  },
  onAcceptsSeniorChange(e: WechatMiniprogram.CustomEvent<{ value: boolean }>) {
    this.setData({ acceptsSenior: !!e.detail.value })
  },

  async onSubmit() {
    this.setData({ submitting: true })
    const intake: CaregiverIntake = {
      acceptedPetTypes: this.data.acceptedPetTypes,
      acceptedSizeBands: this.data.acceptedSizeBands,
      maxConcurrent: this.data.maxConcurrent,
      canMedicate: this.data.canMedicate,
      acceptsAggressive: this.data.acceptsAggressive,
      acceptsPuppy: this.data.acceptsPuppy,
      acceptsSenior: this.data.acceptsSenior,
      intakeNotes: this.data.intakeNotes.trim().slice(0, 200)
    }
    try {
      await applyCaregiver({
        realName: this.data.realName,
        idPhotoUrl: this.data.idPhotoUrl,
        indoorPhotos: this.data.indoorPhotos,
        bio: this.data.bio,
        proposedServiceTypes: this.data.proposedServiceTypes,
        intake
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
