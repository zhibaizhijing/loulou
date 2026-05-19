type CallFnHandler = (name: string, data: unknown) => unknown
type DbHandler = { collection: (name: string) => any }

interface WxMockState {
  callFn: CallFnHandler
  db: DbHandler
  storage: Record<string, unknown>
  online: boolean
}

const state: WxMockState = {
  callFn: () => { throw new Error('callFn handler not set') },
  db: { collection: () => { throw new Error('db handler not set') } },
  storage: {},
  online: true
}

export function setCallFnHandler(h: CallFnHandler) { state.callFn = h }
export function setDbHandler(h: DbHandler) { state.db = h }
export function setOnline(v: boolean) { state.online = v }
export function resetWxMock() {
  state.callFn = () => { throw new Error('callFn handler not set') }
  state.db = { collection: () => { throw new Error('db handler not set') } }
  state.storage = {}
  state.online = true
}

export function installWxMock() {
  ;(globalThis as any).wx = {
    cloud: {
      init: () => undefined,
      callFunction: async (opts: { name: string; data: unknown }) => ({
        result: await state.callFn(opts.name, opts.data),
        errMsg: 'cloud.callFunction:ok'
      }),
      database: () => state.db,
      uploadFile: async (opts: any) => ({ fileID: 'mock://' + opts.cloudPath })
    },
    login: async () => ({ code: 'mock-code', errMsg: 'login:ok' }),
    getStorage: (opts: any) => {
      if (opts.key in state.storage) opts.success?.({ data: state.storage[opts.key] })
      else opts.fail?.({ errMsg: 'getStorage:fail' })
    },
    setStorage: (opts: any) => { state.storage[opts.key] = opts.data; opts.success?.() },
    getStorageSync: (key: string) => state.storage[key],
    setStorageSync: (key: string, value: unknown) => { state.storage[key] = value },
    removeStorageSync: (key: string) => { delete state.storage[key] },
    getNetworkType: (opts: any) => opts.success?.({ networkType: state.online ? 'wifi' : 'none' }),
    onNetworkStatusChange: () => undefined,
    showToast: () => undefined,
    showModal: () => undefined,
    navigateTo: () => undefined,
    navigateBack: () => undefined,
    redirectTo: () => undefined,
    reportEvent: () => undefined
  }
}
