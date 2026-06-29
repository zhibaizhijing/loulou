// v2 — new-user pet reminder sheet. Spec §2.15.
Component({
  options: { addGlobalClass: true },
  properties: {
    visible: { type: Boolean, value: false },
  },
  methods: {
    onViewPets() { this.triggerEvent('viewpets') },
    onContinue() { this.triggerEvent('continue') },
    onDismiss()  { this.triggerEvent('dismiss')  },
    noop() { /* prevent backdrop tap bubbling */ },
  },
})
