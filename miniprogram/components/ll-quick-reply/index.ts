// v2 — chat quick-reply pill. Spec §2.10.
//  - mode='meet' : 申请见面 — red #E63946 outline pill
//  - mode='tip'  : 打赏    — amber outline + tip-bg + hand-coins icon
Component({
  options: { addGlobalClass: true },
  properties: {
    mode: { type: String, value: 'meet' },
  },
  methods: {
    onTap() { this.triggerEvent('tap') },
  },
})
