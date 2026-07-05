// v3 primitive — Button. Spec: docs/superpowers/specs/2026-07-05-loulou-design-system-v3.md §2.1
// Contract mirrors design/lou-lou-design-system/project/components/Button/Button.jsx.
//
// Deprecated aliases (still work; will emit console.warn):
//   secondary=true  → variant='secondary'
//   danger=true     → variant='danger'  (mini-program only; design has no danger variant)
//   full=false      → block=false       (block defaults to true, matching pre-v3 behavior)
Component({
  options: { addGlobalClass: true, multipleSlots: true },
  properties: {
    text:      { type: String,  value: '' },
    variant:   { type: String,  value: 'primary' },     // 'primary' | 'secondary' | 'ghost' | 'danger'
    size:      { type: String,  value: 'md' },          // 'sm' | 'md' | 'lg'
    block:     { type: Boolean, value: true },
    disabled:  { type: Boolean, value: false },
    loading:   { type: Boolean, value: false },
    // Deprecated aliases (default null so we can detect explicit sets)
    full:      { type: null,    value: null },
    secondary: { type: null,    value: null },
    danger:    { type: null,    value: null },
  },
  data: {
    pressed: false,
    resolvedVariant: 'primary',
    resolvedBlock: true,
  },
  observers: {
    'variant, size, block, secondary, danger, full'(
      variant: string, _size: string, block: boolean, secondary: unknown, danger: unknown, full: unknown,
    ) {
      let v = variant || 'primary'
      if (secondary === true) v = 'secondary'
      if (danger === true)    v = 'danger'
      const b = full === false ? false : (full === true ? true : block)
      this.setData({ resolvedVariant: v, resolvedBlock: b })
    },
  },
  methods: {
    onTap() {
      if (this.data.pressed) this.setData({ pressed: false })
      if (this.properties.disabled || this.properties.loading) return
      this.triggerEvent('tap')
    },
    onPressIn()  { this.setData({ pressed: true })  },
    onPressOut() { this.setData({ pressed: false }) },
  },
})
