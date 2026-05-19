import { bus } from '../../utils/bus'
import { isOnline } from '../../utils/network'

Component({
  data: { online: true },
  attached() {
    this.setData({ online: isOnline() })
    ;(this as any).unsub = bus.on('network:changed', (v: boolean) => this.setData({ online: v }))
  },
  detached() {
    const u = (this as any).unsub as (() => void) | null
    if (u) u()
  },
  methods: {}
})
