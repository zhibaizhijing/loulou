Component({
  options: { addGlobalClass: true, multipleSlots: true },
  properties: {
    icon:    { type: String,  value: '' },
    label:   { type: String,  value: '' },
    value:   { type: String,  value: '' },
    badge:   { type: String,  value: '' },
    iconBg:  { type: String,  value: '' },      // 'ink' | 'butter' | 'lavender' | 'mint' | 'peach' | 'neutral'
    danger:  { type: Boolean, value: false },
    isLast:  { type: Boolean, value: false },
    hideChevron: { type: Boolean, value: false }
  },
  methods: {
    onTap() { this.triggerEvent('tap') }
  }
})
