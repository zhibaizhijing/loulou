// Launch the WeChat devtools simulator, navigate to a page, capture a PNG.
// Usage: npx tsx scripts/screenshot.ts <pagePath> [outPath]
//   pagePath defaults to pages/home/index
//   outPath  defaults to /tmp/loulou-screenshot.png

import automator from 'miniprogram-automator'
import path from 'path'

const CLI_PATH = '/Applications/wechatwebdevtools.app/Contents/MacOS/cli'
const PROJECT_PATH = '/Users/juntingma/Developer/jt/project/miniprogram/pet'

async function main() {
  const pagePath = process.argv[2] || 'pages/home/index'
  const outPath  = path.resolve(process.argv[3] || '/tmp/loulou-screenshot.png')

  const url = '/' + pagePath.replace(/^\//, '')
  console.error(`[shot] launching IDE — project=${PROJECT_PATH}`)

  const mini = await automator.launch({ cliPath: CLI_PATH, projectPath: PROJECT_PATH })
  try {
    console.error(`[shot] navigating to ${url}`)
    await mini.reLaunch(url)
    // Give the page time to render + run onLoad service calls (mock setTimeout chains in seed).
    await new Promise(r => setTimeout(r, 1500))
    const page = await mini.currentPage()
    console.error(`[shot] current page = ${page.path}`)
    await new Promise(r => setTimeout(r, 500))
    await (mini as any).screenshot({ path: outPath, fullPage: false })
    console.error(`[shot] saved → ${outPath}`)
    console.log(outPath)
  } finally {
    await mini.close().catch(() => undefined)
  }
}

main().catch(e => {
  console.error('[shot] FAILED:', e?.message || e)
  process.exit(1)
})
