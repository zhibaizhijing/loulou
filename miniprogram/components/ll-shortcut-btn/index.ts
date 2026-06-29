// v2 — chat shortcut row button. Spec §2.10 shortcut row.
Component({
  options: { addGlobalClass: true },
  properties: {
    icon:    { type: String,  value: '' },
    label:   { type: String,  value: '' },
    primary: { type: Boolean, value: false },
  },
  methods: {
    onTap() { this.triggerEvent('tap') },
  },
})
