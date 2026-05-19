function pad(n: number): string { return n < 10 ? '0' + n : '' + n }

export function formatDateTime(epochMs: number): string {
  const d = new Date(epochMs)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatDate(epochMs: number): string {
  const d = new Date(epochMs)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function formatTime(epochMs: number): string {
  const d = new Date(epochMs)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function isFuture(epochMs: number): boolean {
  return epochMs > Date.now()
}

export function plusMinutes(epochMs: number, min: number): number {
  return epochMs + min * 60_000
}
