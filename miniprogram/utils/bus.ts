type Handler = (payload: any) => void

class Bus {
  private map = new Map<string, Set<Handler>>()
  on(event: string, fn: Handler): () => void {
    if (!this.map.has(event)) this.map.set(event, new Set())
    this.map.get(event)!.add(fn)
    return () => this.map.get(event)?.delete(fn)
  }
  emit(event: string, payload?: unknown) {
    this.map.get(event)?.forEach(fn => fn(payload))
  }
}

export const bus = new Bus()

export const BUS_EVENTS = {
  BOOKING_CREATED:        'booking:created',
  BOOKING_UPDATED:        'booking:updated',
  BOOKING_ACCEPTED:       'booking:accepted',
  BOOKING_DECLINED:       'booking:declined',
  REVIEW_SUBMITTED:       'review:submitted',
  WALK_REPORT_SUBMITTED:  'walkreport:submitted',
  AUTH_CHANGED:           'auth:changed'
} as const
