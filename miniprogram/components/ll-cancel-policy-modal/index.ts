// v2 — Cancel policy modal. Spec §2.16. P0 stub — real content lands in P1.
Component({
  options: { addGlobalClass: true },
  properties: {
    visible: { type: Boolean, value: false },
  },
  methods: {
    onClose() { this.triggerEvent('close') },
    noop() { /* prevent backdrop tap bubbling */ },
  },
})
