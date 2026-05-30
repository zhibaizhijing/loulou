Component({
  options: { addGlobalClass: true },
  properties: {
    value:    { type: Boolean, value: false },
    disabled: { type: Boolean, value: false }
  },
  methods: {
    onTap() {
      if (this.properties.disabled) return
      const next = !this.properties.value
      this.triggerEvent('change', { value: next })
    }
  }
})
