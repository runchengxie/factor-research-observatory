import { expect, test } from '@playwright/test'

const chinese = /[\u4e00-\u9fff]/

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('quant-factor-locale', 'en-US')
  })
})

test('English public pages do not render Chinese catalog content', async ({ page }) => {
  for (const route of ['/', '/studies', '/factors', '/fundamentals', '/jumps', '/hermite', '/alpha810']) {
    await page.goto(route)
    await expect(page.locator('main'), route).toBeVisible({ timeout: 15000 })
    expect(await page.locator('main').innerText(), route).not.toMatch(chinese)
  }
})

test('English overview translates every factor group label', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Intraday risk states' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Distribution shape states' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Fundamental research' })).toBeVisible()
})

test('language switch changes the rendered study catalog', async ({ page }) => {
  await page.goto('studies')
  await expect(page.getByRole('heading', { name: 'Research studies' })).toBeVisible()
  await page.getByRole('button', { name: 'Switch to 中文' }).click()
  await expect(page.getByRole('heading', { name: '因子研究专题' })).toBeVisible()
  await expect(page.getByText('研发投入相对估值：信号还是规模暴露？')).toBeVisible()
  await page.getByRole('button', { name: 'Switch to English' }).click()
  await expect(page.getByRole('heading', { name: 'Research studies' })).toBeVisible()
  await expect(page.getByText('R&D Investment Relative to Valuation: Signal or Size Exposure?')).toBeVisible()
})

test('theme switch persists across reloads', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Dark mode/ }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByRole('button', { name: /Light mode/ })).toBeVisible()
})

test('routes request only the public data snapshots they need', async ({ page }) => {
  const dataResponses: Array<{ name: string; body: Promise<Buffer> }> = []
  let echartsRequested = false
  page.on('response', (response) => {
    const url = new URL(response.url())
    const match = url.pathname.match(/\/data\/([^/]+\.json)$/)
    if (match) dataResponses.push({ name: match[1], body: response.body() })
  })
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.includes('echarts-')) echartsRequested = true
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Intraday risk states' })).toBeVisible()
  const homeNames = dataResponses.map((response) => response.name)
  expect(homeNames).toEqual(expect.arrayContaining([
    'factor-snapshot.json',
    'fundamental-factor-catalog.json',
    'fundamental-snapshot.json',
  ]))
  expect(homeNames).not.toContain('alpha810-snapshot.json')
  expect(homeNames).not.toContain('research-studies.json')
  expect(homeNames).not.toContain('rd-investment-annual.json')
  const homeBytes = (await Promise.all(dataResponses.map((response) => response.body))).reduce((total, body) => total + body.byteLength, 0)
  console.info(`Observed overview JSON response bodies: ${homeBytes} bytes`)

  dataResponses.length = 0
  await page.goto('alpha810')
  await expect(page.getByRole('heading', { name: /Classic factors/ })).toBeVisible()
  const alphaNames = dataResponses.map((response) => response.name)
  expect(alphaNames).toEqual(['alpha810-snapshot.json'])
  expect(echartsRequested).toBe(false)
  await page.getByRole('heading', { name: 'Coverage by factor' }).scrollIntoViewIfNeeded()
  await expect.poll(() => echartsRequested).toBe(true)

  dataResponses.length = 0
  await page.goto('studies')
  await expect(page.getByRole('heading', { name: 'Research studies' })).toBeVisible()
  expect(dataResponses.map((response) => response.name)).toEqual(['research-studies.json'])

  dataResponses.length = 0
  await page.goto('studies/rd-investment')
  await expect(page.getByRole('heading', { name: 'R&D Investment Relative to Valuation: Signal or Size Exposure?' })).toBeVisible()
  expect(dataResponses.map((response) => response.name).sort()).toEqual(['rd-investment-annual.json', 'research-studies.json'])
})
