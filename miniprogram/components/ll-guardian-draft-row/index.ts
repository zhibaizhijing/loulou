// v2 — draft guardian row in BookingRequest basket. Spec §2.7 + GuardianDraftRow.
Component({
  options: { addGlobalClass: true },
  properties: {
    guardian: { type: Object, value: {} },
    checked:  { type: Boolean, value: false },
    service:  { type: String, value: '' },
    price:    { type: Number, value: 0 },
    unit:     { type: String, value: '次' },
  },
  methods: {
    onToggle() { this.triggerEvent('toggle') },
    onRemove() { this.triggerEvent('remove') },
  },
})
