// v3 primitive — Tag. Spec: docs/superpowers/specs/2026-07-05-loulou-design-system-v3.md §2.2
// Contract mirrors design/lou-lou-design-system/project/components/Tag/Tag.jsx.
Component({
  options: { addGlobalClass: true, multipleSlots: true },
  properties: {
    text: { type: String, value: '' },
    tone: { type: String, value: 'butter' },  // 'butter' | 'lavender' | 'mint' | 'peach' | 'neutral'
  },
})
