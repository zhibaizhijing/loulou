import type { Walker, ServiceType, SizeBand } from '../models'
import { AppError } from '../utils/errorHandler'
import { __USE_MOCK__ } from '../utils/env'
import { mockDb } from '../mocks/db'

export interface WalkerFilter {
  q?: string          // free-text, case-insensitive substring match vs name + areas
  maxPrice?: number
  minRating?: number
  serviceType?: ServiceType
  sizeBand?: SizeBand        // intake filter — caregiver must accept this size band
  canMedicate?: boolean      // intake filter — caregiver must be able to administer meds
  limit?: number
}

export async function listWalkers(f: WalkerFilter): Promise<Walker[]> {
  if (__USE_MOCK__) return listMock(f)
  return listLive(f)
}

export async function getWalkerById(id: string): Promise<Walker> {
  if (__USE_MOCK__) {
    const w = mockDb.walkers.get(id)
    if (!w) throw new AppError('NOT_FOUND', 'Walker not found')
    return w
  }
  try {
    const db = wx.cloud.database()
    const r = await db.collection('walkers').doc(id).get()
    return (r as any).data as Walker
  } catch {
    throw new AppError('NOT_FOUND', 'Walker not found')
  }
}

function matchesQuery(w: Walker, q: string): boolean {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  if (w.name.toLowerCase().includes(needle)) return true
  return w.areas.some(a => a.toLowerCase().includes(needle))
}

function listMock(f: WalkerFilter): Walker[] {
  let rows = mockDb.walkers.list()
  if (f.q)                       rows = rows.filter(w => matchesQuery(w, f.q as string))
  if (f.maxPrice !== undefined)  rows = rows.filter(w => w.pricePerWalk <= (f.maxPrice as number))
  if (f.minRating !== undefined) rows = rows.filter(w => w.rating >= (f.minRating as number))
  if (f.serviceType) rows = rows.filter(w => Array.isArray((w as any).serviceTypes) && (w as any).serviceTypes.includes(f.serviceType))
  if (f.sizeBand) rows = rows.filter(w => Array.isArray(w.acceptedSizeBands) && w.acceptedSizeBands.includes(f.sizeBand as SizeBand))
  if (f.canMedicate) rows = rows.filter(w => w.canMedicate === true)
  rows = rows.slice().sort((a, b) => b.rating - a.rating)
  return rows.slice(0, f.limit ?? 20)
}

async function listLive(f: WalkerFilter): Promise<Walker[]> {
  // Free-text search is done client-side because CloudBase NoSQL has no
  // case-insensitive substring operator across array elements. Pre-filter
  // numeric constraints on the server, then apply text + sort + limit locally.
  const db = wx.cloud.database()
  const _ = (db as any).command
  let q: any = db.collection('walkers')
  const where: Record<string, unknown> = {}
  if (f.maxPrice !== undefined)  where.pricePerWalk = _.lte(f.maxPrice)
  if (f.minRating !== undefined) where.rating = _.gte(f.minRating)
  if (Object.keys(where).length) q = q.where(where)
  q = q.orderBy('rating', 'desc').limit(200)  // fetch a wider slice to filter from
  const r = await q.get()
  let rows = (r.data as Walker[])
  if (f.q) rows = rows.filter(w => matchesQuery(w, f.q as string))
  if (f.serviceType) rows = rows.filter(w => Array.isArray((w as any).serviceTypes) && (w as any).serviceTypes.includes(f.serviceType))
  if (f.sizeBand) rows = rows.filter(w => Array.isArray(w.acceptedSizeBands) && w.acceptedSizeBands.includes(f.sizeBand as SizeBand))
  if (f.canMedicate) rows = rows.filter(w => w.canMedicate === true)
  return rows.slice(0, f.limit ?? 20)
}
