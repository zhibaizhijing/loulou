type Level = 'debug' | 'info' | 'warn' | 'error'

function emit(level: Level, scope: string, ...args: unknown[]) {
  const app = getApp<IAppOption>()
  const openid = app?.globalData?.openid || '-'
  const prefix = `[${level}][${scope}][${openid}]`
  console[level === 'debug' ? 'log' : level](prefix, ...args)
}

export function createLogger(scope: string) {
  return {
    debug: (...a: unknown[]) => emit('debug', scope, ...a),
    info:  (...a: unknown[]) => emit('info',  scope, ...a),
    warn:  (...a: unknown[]) => emit('warn',  scope, ...a),
    error: (...a: unknown[]) => emit('error', scope, ...a)
  }
}
