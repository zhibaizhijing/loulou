import type { Dog } from '../../models'

Component({
  properties: { initial: { type: Object } },
  data: {
    id: '',
    name: '',
    breed: '',
    sizeKgStr: '',
    notes: ''
  },
  attached() {
    const d = (this.data as unknown as { initial: Dog | null }).initial
    if (d) this.setData({
      id: d.id,
      name: d.name,
      breed: d.breed ?? '',
      sizeKgStr: d.sizeKg?.toString() ?? '',
      notes: d.notes ?? ''
    })
  },
  methods: {
    onSave() {
      const { id, name, breed, sizeKgStr, notes } = this.data
      if (!name.trim()) {
        wx.showToast({ title: 'Dog name required', icon: 'none' })
        return
      }
      const dog: Dog = {
        id: id || 'd-' + Date.now(),
        name: name.trim(),
        breed: breed || undefined,
        sizeKg: sizeKgStr ? Number(sizeKgStr) : undefined,
        notes: notes || undefined
      }
      this.triggerEvent('save', { dog })
    }
  }
})
