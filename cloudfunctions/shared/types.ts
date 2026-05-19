export interface Dog { id: string; name: string; breed?: string; sizeKg?: number; notes?: string }
export interface User { _id?: string; openid: string; name: string; avatar?: string; phone?: string; dogs: Dog[]; createdAt: number }
export interface Walker { _id?: string; name: string; avatar: string; bio: string; photos: string[]; areas: string[]; pricePerWalk: number; rating: number; reviewCount: number; demo: boolean }
export type BookingStatus = 'requested'|'accepted'|'declined'|'in_progress'|'completed'|'cancelled'
export type WalkDuration = 30 | 45 | 60
export interface Booking { _id?: string; ownerId: string; walkerId: string; dogId: string; date: number; serviceType: ServiceType; durationMin: number; status: BookingStatus; notes?: string; mockPayment: { amount: number; paid: boolean }; createdAt: number; updatedAt: number }
export type MessageRole = 'owner' | 'walker'
export interface Message { _id?: string; bookingId: string; senderId: string; senderRole: MessageRole; text: string; photoUrl?: string; createdAt: number }
export interface WalkReport { _id?: string; bookingId: string; walkerId: string; photos: string[]; notes: string; durationMin: number; peeCount: number; poopCount: number; createdAt: number }
export interface Review { _id?: string; bookingId: string; ownerId: string; walkerId: string; stars: 1|2|3|4|5; text: string; createdAt: number }
export type ServiceType = 'walking' | 'boarding' | 'daycare' | 'house_visit' | 'live_in'
export type ApplicationStatus = 'submitted' | 'reviewing' | 'approved' | 'rejected'
export interface Caregiver { _id?: string; name: string; avatar: string; bio: string; photos: string[]; areas: string[]; serviceTypes: ServiceType[]; pricePerWalk: number; rating: number; reviewCount: number; demo: boolean; status?: 'pending' | 'active' | 'suspended' }
export interface CaregiverApplication { _id?: string; candidateUserId: string; realName: string; idPhotoUrl: string; indoorPhotos: string[]; bio: string; proposedServiceTypes: ServiceType[]; status: ApplicationStatus; reviewerNote?: string; createdAt: number; updatedAt: number; resultingCaregiverId?: string }
export interface ServiceItem { _id?: string; caregiverId: string; serviceType: ServiceType; price: number; active: boolean; surchargeRules?: string; createdAt: number; updatedAt: number }
export interface AvailabilitySlot { _id?: string; caregiverId: string; date: string; available: boolean }
