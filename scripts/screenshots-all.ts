// Drive the simulator through every registered page, capture one PNG per page.
// Output: /tmp/loulou-shot-<slug>.png
// Usage: npx tsx scripts/screenshots-all.ts

import automator from 'miniprogram-automator'

const CLI_PATH = '/Applications/wechatwebdevtools.app/Contents/MacOS/cli'
const PROJECT_PATH = '/Users/juntingma/Developer/jt/project/miniprogram/pet'

interface PageSpec {
  path: string
  slug: string
  // Some pages need query params or pre-conditions.
  query?: string
  postNavWaitMs?: number
}

const PAGES: PageSpec[] = [
  { path: 'pages/home/index',              slug: 'home' },
  { path: 'pages/bookings/index',          slug: 'bookings' },
  { path: 'pages/me/index',                slug: 'me' },
  { path: 'pages/walker/index',            slug: 'walker',            query: 'id=walker-1' },
  { path: 'pages/booking-new/index',       slug: 'booking-new',       query: 'walkerId=walker-1' },
  { path: 'pages/caregiver-apply/index',   slug: 'caregiver-apply' },
  { path: 'pages/caregiver-home/index',    slug: 'caregiver-home' },
  { path: 'pages/caregiver-services/index',slug: 'caregiver-services' },
  { path: 'pages/caregiver-service-edit/index', slug: 'caregiver-service-edit' },
  { path: 'pages/caregiver-calendar/index',slug: 'caregiver-calendar' },
  { path: 'pages/caregiver-inbox/index',   slug: 'caregiver-inbox' }
]

async function main() {
  console.error(`[shots] launching IDE`)
  const mini = await automator.launch({ cliPath: CLI_PATH, projectPath: PROJECT_PATH })
  const results: { slug: string; ok: boolean; path?: string; error?: string }[] = []
  try {
    for (const spec of PAGES) {
      const url = '/' + spec.path + (spec.query ? '?' + spec.query : '')
      const out = `/tmp/loulou-shot-${spec.slug}.png`
      try {
        console.error(`[shots] → ${url}`)
        await mini.reLaunch(url)
        await new Promise(r => setTimeout(r, spec.postNavWaitMs ?? 1500))
        await (mini as any).screenshot({ path: out, fullPage: false })
        results.push({ slug: spec.slug, ok: true, path: out })
        console.error(`[shots]   saved ${out}`)
      } catch (e: any) {
        results.push({ slug: spec.slug, ok: false, error: e?.message || String(e) })
        console.error(`[shots]   FAILED ${spec.slug}: ${e?.message || e}`)
      }
    }
  } finally {
    await mini.close().catch(() => undefined)
  }
  console.log(JSON.stringify(results, null, 2))
}

main().catch(e => {
  console.error('[shots] FATAL:', e?.message || e)
  process.exit(1)
})
