Component({
  options: { addGlobalClass: true, multipleSlots: true },
  properties: {
    text:      { type: String,  value: '' },
    disabled:  { type: Boolean, value: false },
    loading:   { type: Boolean, value: false },
    secondary: { type: Boolean, value: false },
    full:      { type: Boolean, value: true },
    danger:    { type: Boolean, value: false }
  },
  data: { pressed: false },
  methods: {
    onTap() {
      if (this.data.pressed) this.setData({ pressed: false })
      if (this.properties.disabled || this.properties.loading) return
      this.triggerEvent('tap')
    },
    onPressIn()  { this.setData({ pressed: true })  },
    onPressOut() { this.setData({ pressed: false }) }
  }
})
