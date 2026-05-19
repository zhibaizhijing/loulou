import { bus } from '../utils/bus'

const EVENT = 'mockdb:change'
type Op = 'insert' | 'update' | 'delete'
interface ChangeEvent { coll: string; op: Op; row: { _id: string; [k: string]: unknown } }

export function emitChange(coll: string, op: Op, row: { _id: string }) {
  bus.emit(EVENT, { coll, op, row } as ChangeEvent)
}

export function watchMockCollection<T extends { _id: string }>(
  coll: string,
  filter: (row: T) => boolean,
  onChange: (op: Op, row: T) => void
): () => void {
  return bus.on(EVENT, (evt: unknown) => {
    const e = evt as ChangeEvent
    if (e.coll !== coll) return
    if (!filter(e.row as T)) return
    onChange(e.op, e.row as T)
  })
}
