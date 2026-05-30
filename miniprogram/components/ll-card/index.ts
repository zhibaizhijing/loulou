Component({
  options: { addGlobalClass: true, multipleSlots: true },
  properties: {
    padding: { type: String, value: 'normal' },   // 'tight' | 'normal' | 'loose' | 'none'
    flat:    { type: Boolean, value: false }      // no shadow when true
  }
})
