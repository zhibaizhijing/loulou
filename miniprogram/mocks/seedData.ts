// MUST stay in sync with cloudfunctions/seedDemoData/index.ts (WALKERS, REVIEWS_TEMPLATE).
// Single source of truth would require build tooling we don't have yet.
// Pre-Stage-1.M check: diff these two files manually before deploy.

import type { Caregiver, User, ServiceType } from '../models'

export const SEED_WALKERS: Omit<Caregiver, '_id'>[] = [
  {
    name: 'Alex Tan',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200',
    bio: 'Lifelong dog lover, 5+ yrs walking experience in Bukit Timah area. Comfortable with large breeds.',
    photos: [
      'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=800',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800'
    ],
    areas: ['Bukit Timah', 'Holland Village'],
    serviceTypes: ['walking', 'boarding'],
    pricePerWalk: 30,
    rating: 4.8,
    reviewCount: 23,
    demo: true,
    acceptedPetTypes: ['dog'],
    acceptedSizeBands: ['s', 'm', 'l', 'xl'],
    maxConcurrent: 2,
    canMedicate: true,
    acceptsAggressive: false,
    acceptsPuppy: true,
    acceptsSenior: true,
    intakeNotes: 'Large dogs welcome — fenced yard.'
  },
  {
    name: 'Mei Lin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    bio: 'Cert. dog trainer. Patient with anxious pups. Loyang and East Coast.',
    photos: ['https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800'],
    areas: ['Loyang', 'East Coast'],
    serviceTypes: ['walking', 'daycare'],
    pricePerWalk: 25,
    rating: 4.9,
    reviewCount: 41,
    demo: true,
    acceptedPetTypes: ['dog', 'cat'],
    acceptedSizeBands: ['xs', 's', 'm'],
    maxConcurrent: 3,
    canMedicate: true,
    acceptsAggressive: false,
    acceptsPuppy: true,
    acceptsSenior: false,
    intakeNotes: 'Anxious / puppy specialist. Up to 20kg.'
  },
  {
    name: 'Ravi Kumar',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    bio: 'Weekend walker around Kembangan & Simei. Friendly with cats too.',
    photos: [],
    areas: ['Kembangan', 'Simei'],
    serviceTypes: ['walking'],
    pricePerWalk: 28,
    rating: 4.6,
    reviewCount: 12,
    demo: true,
    acceptedPetTypes: ['dog', 'cat', 'small_animal'],
    acceptedSizeBands: ['xs', 's', 'm'],
    maxConcurrent: 1,
    canMedicate: false,
    acceptsAggressive: false,
    acceptsPuppy: false,
    acceptsSenior: true,
    intakeNotes: 'Weekends only. Small-to-medium pets.'
  },
  {
    name: 'Priya Wong',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    bio: 'Live-in pet sitter. I move into your home for the duration of your trip — pets stay in their own environment.',
    photos: [
      'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800'
    ],
    areas: ['Bukit Timah', 'Holland Village', 'Tanglin'],
    serviceTypes: ['walking', 'live_in'],
    pricePerWalk: 35,
    rating: 4.7,
    reviewCount: 18,
    demo: true,
    acceptedPetTypes: ['dog', 'cat'],
    acceptedSizeBands: ['xs', 's', 'm', 'l'],
    maxConcurrent: 2,
    canMedicate: true,
    acceptsAggressive: false,
    acceptsPuppy: true,
    acceptsSenior: true,
    intakeNotes: 'Live-in sitter. Medication, senior care.'
  }
]

export const SEED_CAREGIVER_SERVICE_TYPES: Record<string, ServiceType[]> = {
  'Alex Tan':   ['walking', 'boarding'],
  'Mei Lin':    ['walking', 'daycare'],
  'Ravi Kumar': ['walking'],
  'Priya Wong': ['walking', 'live_in']
}

export const SEED_REVIEWS_TEMPLATE = [
  { stars: 5 as const, text: 'Great walker, Buddy came back happy!' },
  { stars: 5 as const, text: 'Sent photos throughout — very reassuring.' },
  { stars: 4 as const, text: 'On time and friendly.' },
  { stars: 5 as const, text: 'Will book again!' },
  { stars: 5 as const, text: 'My dog adores them.' }
]

export const SEED_OWNER: User = {
  _id: 'mock-owner-1',
  openid: 'mock-owner-1',
  name: 'Demo Owner',
  dogs: [
    { id: 'dog-1', name: 'Buddy', breed: 'Golden Retriever', sizeKg: 25, notes: 'Friendly, energetic' }
  ],
  createdAt: Date.now()
}
