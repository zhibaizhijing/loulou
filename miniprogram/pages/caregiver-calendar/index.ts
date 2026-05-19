import { getMonthAvailability, setDayAvailability } from '../../services/availabilityService'
import { currentCaregiverId } from '../../services/caregiverAuth'
import { showAppError } from '../../utils/errorHandler'

type CellKind = 'empty' | 'available' | 'blocked' | 'past'
interface Cell { key: string; date: string; day: number | null; kind: CellKind }

interface Data {
  yearMonth: string         // 'YYYY-MM'
  cells: Cell[]
  noCaregiver: boolean
  blockedDates: Record<string, boolean>   // date string → true if explicitly blocked
}

function pad(n: number): string { return n < 10 ? '0' + n : '' + n }
function todayYMD(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function nowYearMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

Page<Data, WechatMiniprogram.IAnyObject>({
  data: {
    yearMonth: nowYearMonth(),
    cells: [],
    noCaregiver: false,
    blockedDates: {}
  },

  onLoad() { this.load() },

  async load() {
    const cgId = currentCaregiverId()
    if (!cgId) { this.setData({ noCaregiver: true }); return }
    this.setData({ noCaregiver: false })
    try {
      const slots = await getMonthAvailability(cgId, this.data.yearMonth)
      const blocked: Record<string, boolean> = {}
      slots.forEach(s => { if (!s.available) blocked[s.date] = true })
      this.setData({ blockedDates: blocked, cells: this.buildCells(blocked) })
    } catch (e) { showAppError(e) }
  },

  buildCells(blocked: Record<string, boolean>): Cell[] {
    const [yStr, mStr] = this.data.yearMonth.split('-')
    const year = Number(yStr)
    const month = Number(mStr)
    const first = new Date(year, month - 1, 1)
    const last = new Date(year, month, 0)
    const daysInMonth = last.getDate()
    // Day of week: Monday = 0 in our grid (week starts Mon). JS: Sun=0
    const firstDow = (first.getDay() + 6) % 7
    const today = todayYMD()
    const cells: Cell[] = []
    for (let i = 0; i < firstDow; i++) {
      cells.push({ key: 'pad-' + i, date: '', day: null, kind: 'empty' })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${yStr}-${mStr}-${pad(d)}`
      let kind: CellKind = 'available'
      if (date < today) kind = 'past'
      else if (blocked[date]) kind = 'blocked'
      cells.push({ key: date, date, day: d, kind })
    }
    return cells
  },

  shiftMonth(delta: number) {
    const [yStr, mStr] = this.data.yearMonth.split('-')
    let year = Number(yStr)
    let month = Number(mStr) + delta
    while (month < 1) { month += 12; year -= 1 }
    while (month > 12) { month -= 12; year += 1 }
    this.setData({ yearMonth: `${year}-${pad(month)}` }, () => this.load())
  },

  onPrevMonth() { this.shiftMonth(-1) },
  onNextMonth() { this.shiftMonth(+1) },

  async onTapDay(e: WechatMiniprogram.BaseEvent) {
    const date = String(e.currentTarget.dataset.date)
    if (!date) return
    if (date < todayYMD()) return    // can't change past
    const cgId = currentCaregiverId()
    if (!cgId) return
    const isBlockedNow = !!this.data.blockedDates[date]
    try {
      await setDayAvailability(cgId, date, isBlockedNow ? true : false)
      const next = { ...this.data.blockedDates }
      if (isBlockedNow) delete next[date]
      else next[date] = true
      this.setData({ blockedDates: next, cells: this.buildCells(next) })
    } catch (e2) { showAppError(e2) }
  }
})
