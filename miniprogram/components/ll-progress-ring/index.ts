function buildSvg(percent: number): string {
  const size = 400, sw = 28, r = (size - sw) / 2
  const C = 2 * Math.PI * r
  const dashOffset = C * (1 - Math.max(0, Math.min(100, percent)) / 100)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="ll-ring" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stop-color="#FEE7A6"/>
        <stop offset="35%"  stop-color="#D8CAE8"/>
        <stop offset="70%"  stop-color="#C7E8D8"/>
        <stop offset="100%" stop-color="#FBD3C4"/>
      </linearGradient>
    </defs>
    <g transform="rotate(-90 ${size / 2} ${size / 2})">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="#EEEEF2" stroke-width="${sw}" fill="none"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="url(#ll-ring)" stroke-width="${sw}" fill="none" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${dashOffset}"/>
    </g>
  </svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

Component({
  options: { addGlobalClass: true },
  properties: {
    percent: { type: Number, value: 0 },
    target:  { type: String, value: '' },
    size:    { type: Number, value: 400 }   // rpx
  },
  data: { src: '' },
  observers: {
    percent(p: number) { this.setData({ src: buildSvg(p) }) }
  },
  lifetimes: {
    attached() { this.setData({ src: buildSvg(this.properties.percent) }) }
  }
})
