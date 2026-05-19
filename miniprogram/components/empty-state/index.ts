Component({
  properties: {
    icon:     { type: String, value: '📭' },
    title:    { type: String, value: 'Nothing here' },
    subtitle: { type: String, value: '' },
    ctaText:  { type: String, value: '' }
  },
  methods: { onCta() { this.triggerEvent('cta') } }
})
