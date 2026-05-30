Component({
  options: { addGlobalClass: true },
  properties: {
    title:   { type: String, value: '' },
    sub:     { type: String, value: '' },
    bg:      { type: String, value: 'butter' },    // butter | lavender | mint | peach
    image:   { type: String, value: '' },
    offset:  { type: Number, value: 0 },           // rpx (negative → overlap previous)
    iconBg:  { type: String, value: 'chart-bar' }
  },
  methods: {
    onTap() { this.triggerEvent('tap') }
  }
})
