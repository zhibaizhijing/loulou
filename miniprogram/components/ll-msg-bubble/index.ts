// v2 — chat message bubble. Spec §2.10.
//  - system (no action): centered gray hint
//  - system action='summary': white tappable card → triggers 'opensummary'
//  - user: ink bg, right-aligned, top-right rounded
//  - guardian: white bg, left-aligned + 34px avatar
Component({
  options: { addGlobalClass: true },
  properties: {
    from:    { type: String, value: 'user' },   // 'system' | 'user' | 'guardian'
    text:    { type: String, value: '' },
    time:    { type: String, value: '' },
    action:  { type: String, value: '' },
    photo:   { type: String, value: '' },
    initial: { type: String, value: '' },       // fallback char when no photo
  },
  methods: {
    onSummary() { this.triggerEvent('opensummary') },
  },
})
