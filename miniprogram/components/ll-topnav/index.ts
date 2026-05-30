Component({
  options: { addGlobalClass: true, multipleSlots: true },
  properties: {
    title:       { type: String,  value: '' },
    subtitle:    { type: String,  value: '' },
    back:        { type: Boolean, value: true },
    transparent: { type: Boolean, value: false }
  },
  methods: {
    onBack() {
      this.triggerEvent('back')
      const pages = getCurrentPages()
      if (pages.length > 1) wx.navigateBack({}).catch?.(() => undefined)
    }
  }
})
