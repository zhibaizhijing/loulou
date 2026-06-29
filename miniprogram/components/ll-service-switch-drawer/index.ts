// v2 — Service switch drawer. Spec §2.5 — two grouped chip rows.
export {}

//
// Owner-house services (purple group):  寄养, 日托
// Pet-owner-house services (green group): 遛狗, 上门喂养, 伴宠留宿
//
// `services` is the guardian's offering list. We filter each group to only the
// services that exist on the guardian.

interface SvcRef { id: string; price?: number; unit?: string }

const GROUPS = [
  { title: '在守护者家', ids: ['寄养', '日托'],                  theme: 'host'  as const },
  { title: '在宠物主家', ids: ['遛狗', '上门喂养', '伴宠留宿'],     theme: 'owner' as const },
]

Component({
  options: { addGlobalClass: true },
  properties: {
    visible:  { type: Boolean, value: false },
    services: { type: Array,   value: [] as SvcRef[] },
    value:    { type: String,  value: '' },
  },
  data: {
    rows: [] as { title: string; theme: 'host' | 'owner'; chips: { id: string; on: boolean }[] }[],
  },
  observers: {
    'services, value'(services: SvcRef[], value: string) {
      const rows = GROUPS.map(g => ({
        title: g.title,
        theme: g.theme,
        chips: g.ids
          .filter(id => services.some(s => s.id === id))
          .map(id => ({ id, on: id === value })),
      })).filter(r => r.chips.length > 0)
      this.setData({ rows })
    },
  },
  methods: {
    onPick(e: WechatMiniprogram.BaseEvent) {
      const id = String(e.currentTarget.dataset.id)
      this.triggerEvent('pick', { id })
    },
    onClose() { this.triggerEvent('close') },
    onPolicy() { this.triggerEvent('policy') },
    noop() { /* prevent backdrop tap bubbling */ },
  },
})
