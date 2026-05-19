export type PageStatus = 'loading' | 'empty' | 'error' | 'loaded'

type SetData = (patch: { pageStatus: PageStatus; pageError: string }) => void

export function createPageState(setData: SetData) {
  return {
    async run<T>(fn: () => Promise<T>, opts?: { onEmpty?: (v: T) => boolean }): Promise<T> {
      setData({ pageStatus: 'loading', pageError: '' })
      try {
        const v = await fn()
        const empty = opts?.onEmpty?.(v) ?? false
        setData({ pageStatus: empty ? 'empty' : 'loaded', pageError: '' })
        return v
      } catch (e: any) {
        setData({ pageStatus: 'error', pageError: e?.message || 'Error' })
        throw e
      }
    },
    setEmpty() { setData({ pageStatus: 'empty', pageError: '' }) },
    setLoaded() { setData({ pageStatus: 'loaded', pageError: '' }) }
  }
}
