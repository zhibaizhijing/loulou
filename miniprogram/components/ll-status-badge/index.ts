// v3 primitive — StatusPill. Spec §2.3 (2026-07-05).
// Contract mirrors design/lou-lou-design-system/project/components/StatusPill/StatusPill.jsx.
//
// Accepts the design's canonical 5-status enum; also accepts legacy
// `in_progress` / `cancelled` via `normalizeStatus` for callers still on v2.
import { STATUS_LABEL, normalizeStatus, type StatusPillStatus } from '../../utils/orderStatus'

Component({
  options: { addGlobalClass: true },
  properties: {
    status: { type: String, value: 'pending' },
    /** Optional label override (matches design `children`). */
    text:   { type: String, value: '' },
  },
  data: {
    label:    '',
    resolved: 'pending' as StatusPillStatus,
  },
  observers: {
    'status, text'(s: string, t: string) {
      const resolved = normalizeStatus(s)
      const label = t || STATUS_LABEL[resolved] || ''
      this.setData({ resolved, label })
    },
  },
})
