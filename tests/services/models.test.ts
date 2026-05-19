import { describe, it, expectTypeOf } from 'vitest'
import type {
  User, Dog, Walker, Booking, BookingStatus, Message, WalkReport, Review
} from '@/models'

describe('models', () => {
  it('Booking status is union of expected literals', () => {
    expectTypeOf<BookingStatus>().toEqualTypeOf<
      'requested' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'cancelled'
    >()
  })
  it('User has dogs array of Dog', () => {
    const u: User = { _id: 'u', openid: 'o', name: 'n', createdAt: 0, dogs: [] as Dog[] }
    expectTypeOf(u.dogs).items.toEqualTypeOf<Dog>()
  })
  it('Walker has required marketplace fields', () => {
    const w: Walker = {
      _id: 'w', name: 'n', avatar: 'a', bio: 'b', photos: [], areas: ['Loyang'],
      serviceTypes: ['walking'], pricePerWalk: 30, rating: 4.5, reviewCount: 10, demo: true,
      acceptedPetTypes: ['dog'], acceptedSizeBands: ['s'], maxConcurrent: 1,
      canMedicate: false, acceptsAggressive: false, acceptsPuppy: false, acceptsSenior: false,
      intakeNotes: ''
    }
    expectTypeOf(w.pricePerWalk).toBeNumber()
  })
  it('Booking, Message, WalkReport, Review are defined types', () => {
    expectTypeOf<Booking>().toBeObject()
    expectTypeOf<Message>().toBeObject()
    expectTypeOf<WalkReport>().toBeObject()
    expectTypeOf<Review>().toBeObject()
  })
})
