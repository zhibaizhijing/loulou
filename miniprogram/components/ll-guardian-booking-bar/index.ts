// v2 — sticky booking bar on guardian profile. Spec §2.4.
export {}

interface SvcRef { id: string; price: number; unit: string }

Component({
  options: { addGlobalClass: true },
  properties: {
    services:       { type: Array,  value: [] as SvcRef[] },
    initialService: { type: String, value: '' },
  },
  data: {
    svcId: '' as string,
    svc:   null as SvcRef | null,
    drawerOpen: false,
  },
  observers: {
    'services, initialService'(services: SvcRef[], initial: string) {
      const valid = initial && services.some(s => s.id === initial) ? initial : (services[0]?.id || '')
      const svc = services.find(s => s.id === valid) || services[0] || null
      this.setData({ svcId: valid, svc })
    },
  },
  methods: {
    onOpenDrawer()  { this.setData({ drawerOpen: true })  },
    onCloseDrawer() { this.setData({ drawerOpen: false }) },
    onPickSvc(e: WechatMiniprogram.CustomEvent<{ id: string }>) {
      const id = e.detail.id
      const svc = (this.properties.services as SvcRef[]).find(s => s.id === id) || this.data.svc
      this.setData({ svcId: id, svc, drawerOpen: false })
    },
    onPolicy()  { this.triggerEvent('policy') },
    onBook()    { this.triggerEvent('book', { id: this.data.svcId, svc: this.data.svc }) },
  },
})
