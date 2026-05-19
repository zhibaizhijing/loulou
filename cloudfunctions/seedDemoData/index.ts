// MUST stay in sync with miniprogram/mocks/seedData.ts (SEED_WALKERS, SEED_REVIEWS_TEMPLATE).
// Drift will cause mock and live demos to diverge.
import cloud from 'wx-server-sdk'
import { ok, err, FnResult } from '../shared/result'
import type { Walker, Review } from '../shared/types'

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as any })

const WALKERS: Omit<Walker, '_id'>[] = [
  {
    name: 'Alex Tan',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200',
    bio: 'Lifelong dog lover, 5+ yrs walking experience in Bukit Timah area. Comfortable with large breeds.',
    photos: [
      'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=800',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800'
    ],
    areas: ['Bukit Timah', 'Holland Village'],
    pricePerWalk: 30,
    rating: 4.8,
    reviewCount: 23,
    demo: true
  },
  {
    name: 'Mei Lin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    bio: 'Cert. dog trainer. Patient with anxious pups. Loyang and East Coast.',
    photos: [ 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800' ],
    areas: ['Loyang', 'East Coast'],
    pricePerWalk: 25,
    rating: 4.9,
    reviewCount: 41,
    demo: true
  },
  {
    name: 'Ravi Kumar',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    bio: 'Weekend walker around Kembangan & Simei. Friendly with cats too.',
    photos: [],
    areas: ['Kembangan', 'Simei'],
    pricePerWalk: 28,
    rating: 4.6,
    reviewCount: 12,
    demo: true
  }
]

const REVIEWS_TEMPLATE = [
  { stars: 5 as const, text: 'Great walker, Buddy came back happy!' },
  { stars: 5 as const, text: 'Sent photos throughout — very reassuring.' },
  { stars: 4 as const, text: 'On time and friendly.' },
  { stars: 5 as const, text: 'Will book again!' },
  { stars: 5 as const, text: 'My dog adores them.' }
]

export default async function handler(_event: unknown, _ctx: unknown): Promise<FnResult<{ walkers: number; reviews: number }>> {
  try {
    const db = cloud.database()
    const _ = (db as any).command

    for (const c of ['walkers', 'reviews', 'bookings', 'messages', 'walkReports']) {
      await (db.collection(c).where({ _id: _.exists(true) }).remove() as Promise<any>).catch(() => undefined)
    }

    const walkerIds: string[] = []
    for (const w of WALKERS) {
      const r = await db.collection('walkers').add({ data: w }) as any
      walkerIds.push(r._id as string)
    }

    let reviewCount = 0
    for (const wid of walkerIds) {
      const slice = REVIEWS_TEMPLATE.slice(0, 2)
      for (const tpl of slice) {
        const rev: Omit<Review, '_id'> = {
          bookingId: 'demo-' + wid,
          ownerId: 'demo-owner',
          walkerId: wid,
          stars: tpl.stars,
          text: tpl.text,
          createdAt: Date.now() - reviewCount * 86400000
        }
        await db.collection('reviews').add({ data: rev })
        reviewCount++
      }
    }
    return ok({ walkers: walkerIds.length, reviews: reviewCount })
  } catch (e: any) {
    console.error('[seedDemoData]', e)
    return err('INTERNAL', e?.message || 'Internal')
  }
}
