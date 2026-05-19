Component({
  properties: { count: { type: Number, value: 3 } },
  data: { rows: [1, 2, 3] as number[] },
  observers: {
    'count'(c: number) { this.setData({ rows: Array.from({ length: c }, (_, i) => (i % 3) + 1) }) }
  }
})
