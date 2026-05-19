// Probe home page runtime state to diagnose blank rendering.
import automator from 'miniprogram-automator'

const CLI_PATH = '/Applications/wechatwebdevtools.app/Contents/MacOS/cli'
const PROJECT_PATH = '/Users/juntingma/Developer/jt/project/miniprogram/pet'

async function main() {
  const mini = await automator.launch({ cliPath: CLI_PATH, projectPath: PROJECT_PATH })
  try {
    await mini.reLaunch('/pages/home/index')
    await new Promise(r => setTimeout(r, 2500))
    const state = await (mini as any).evaluate(function () {
      var pages = getCurrentPages()
      var p = pages[pages.length - 1] as any
      var keys = p && p.data ? Object.keys(p.data) : []
      var raw: any = {}
      for (var i = 0; i < keys.length; i++) {
        var v = p.data[keys[i]]
        raw[keys[i]] = Array.isArray(v) ? '[arr len=' + v.length + ']' : (typeof v === 'object' ? JSON.stringify(v).slice(0, 80) : v)
      }
      var app = getApp() as any
      return {
        route: p && p.route,
        keys: keys,
        raw: raw,
        bootError: app && app.globalData ? String(app.globalData.bootError || '') : ''
      }
    })
    console.log(JSON.stringify(state, null, 2))
  } finally {
    await mini.close().catch(() => undefined)
  }
}

main().catch(function (e) { console.error('FATAL:', e && e.message ? e.message : e); process.exit(1) })
