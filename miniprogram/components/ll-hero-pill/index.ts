Component({
  options: { addGlobalClass: true },
  properties: {
    avatar:   { type: String, value: '' },
    hasBadge: { type: Boolean, value: false }
  },
  methods: {
    onBell()   { this.triggerEvent('bell') },
    onAvatar() { this.triggerEvent('avatar') }
  }
})
