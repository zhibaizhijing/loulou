import { ICONS } from './icons'

function buildDataUri(name: string, weight: 'regular' | 'fill', color: string): string {
  const entry = ICONS[name]
  if (!entry) return ''
  const d = (weight === 'fill' && entry.fill) ? entry.fill : entry.regular
  const fill = (weight === 'regular') ? 'none' : color
  const stroke = (weight === 'regular') ? color : 'none'
  const sw = weight === 'regular' ? 18 : 0
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

Component({
  options: { multipleSlots: false, addGlobalClass: true },
  properties: {
    name:   { type: String, value: '' },
    size:   { type: Number, value: 48 },          // rpx (24px)
    color:  { type: String, value: '#1E1E24' },
    weight: { type: String, value: 'regular' }   // 'regular' | 'fill'
  },
  data: {
    src: ''
  },
  observers: {
    'name,color,weight'(name: string, color: string, weight: 'regular' | 'fill') {
      if (!name) { this.setData({ src: '' }); return }
      this.setData({ src: buildDataUri(name, weight, color || '#1E1E24') })
    }
  }
})
