// Draft basket — collects guardians the user wants to send a batch booking to.
// Spec: docs/superpowers/specs/2026-06-29-loulou-design-system-v2.md §2.7

import type { ServiceType, Walker } from '../models'

const STORAGE_KEY = 'loulou:draft:v1'

export interface DraftGuardian {
  id: string
  name: string
  photo?: string
  initial?: { char: string; bg: string }
  rating?: number
  bg?: string
  servicePrice?: number
  serviceUnit?: string
}

export interface DraftConfig {
  service: ServiceType | string
  pet: string
  dateStart: string         // user-facing 'M月D日'
  dateEnd: string           // optional second date for boarding-style services
  area: string
}

interface DraftState {
  guardians: DraftGuardian[]
  config: DraftConfig
}

const DEFAULT_CONFIG: DraftConfig = {
  service: 'boarding',
  pet: '狗·豆豆',
  dateStart: '',
  dateEnd: '',
  area: '朝阳区·望京',
}

function read(): DraftState {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY)
    if (raw && typeof raw === 'object') {
      return {
        guardians: Array.isArray(raw.guardians) ? raw.guardians : [],
        config: { ...DEFAULT_CONFIG, ...(raw.config || {}) },
      }
    }
  } catch { /* test env */ }
  return { guardians: [], config: { ...DEFAULT_CONFIG } }
}

function write(s: DraftState) {
  try { wx.setStorageSync(STORAGE_KEY, s) } catch { /* test env */ }
}

export function getDraftGuardians(): DraftGuardian[] { return read().guardians }
export function getDraftConfig(): DraftConfig { return read().config }

export function addGuardian(g: DraftGuardian): void {
  const s = read()
  if (!s.guardians.find(x => x.id === g.id)) s.guardians.push(g)
  write(s)
}

export function removeGuardian(id: string): void {
  const s = read()
  s.guardians = s.guardians.filter(g => g.id !== id)
  write(s)
}

export function updateConfig(field: keyof DraftConfig, value: string): void {
  const s = read()
  ;(s.config as any)[field] = value
  write(s)
}

export function clearDraft(ids?: string[]): void {
  const s = read()
  if (ids && ids.length) s.guardians = s.guardians.filter(g => !ids.includes(g.id))
  else s.guardians = []
  write(s)
}

/** Hydrate from a Walker record so home / search-results can call addGuardian(walker). */
export function walkerToDraftGuardian(w: Walker, service?: ServiceType): DraftGuardian {
  return {
    id: w._id,
    name: w.name,
    photo: (w as any).avatar || (w as any).avatarUrl,
    initial: { char: (w.name || '?').charAt(0), bg: '#EDE5F7' },
    rating: w.rating,
    servicePrice: w.pricePerWalk,
    serviceUnit: service === 'walking' ? '次' : service === 'boarding' || service === 'live_in' ? '晚' : '次',
  }
}
