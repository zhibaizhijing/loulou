// P0-C — scheduled auto-release of escrowed funds.
// Real production: a CloudBase scheduled trigger calls releasePayment 48h after both
// reviews submitted (or after completion confirmed). For demo/mock, a setInterval in
// the app boot polls every few seconds and releases bookings whose completedAt is
// older than DEMO_RELEASE_DELAY_MS.

import { mockDb } from '../mocks/db'
import { releasePayment, DEMO_RELEASE_DELAY_MS } from './paymentService'
import { __USE_MOCK__ } from '../utils/env'
import { createLogger } from '../utils/logger'

const log = createLogger('autoRelease')
const POLL_INTERVAL_MS = 5_000
let started = false

export function startAutoReleaseTick(): () => void {
  if (!__USE_MOCK__ || started) return () => undefined
  started = true
  const handle = setInterval(scan, POLL_INTERVAL_MS)
  log.info('started — checking every', POLL_INTERVAL_MS / 1000, 's')
  return () => { clearInterval(handle); started = false }
}

function scan() {
  try {
    const now = Date.now()
    const due = mockDb.bookings.list().filter(b => {
      const pay = b.payment
      if (!pay || pay.state !== 'held') return false
      if (b.status !== 'completed') return false
      const completedAt = b.completedAt ?? b.updatedAt
      return now - completedAt >= DEMO_RELEASE_DELAY_MS
    })
    for (const b of due) {
      try {
        releasePayment({ bookingId: b._id, idempotencyKey: `auto-release-${b._id}` })
        log.info('released', b._id)
      } catch (e) { log.error('release failed', b._id, e) }
    }
  } catch (e) { log.error('scan failed', e) }
}
