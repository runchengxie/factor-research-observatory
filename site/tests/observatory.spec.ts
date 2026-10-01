import { expect, test } from '@playwright/test'

const chinese = /[\u4e00-\u9fff]/

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('quant-factor-locale', 'en-US')
  })
})

test('English public pages do not render Chinese catalog content', async ({ page }) => {
  for (const route of ['/', '/studies', '/factors', '/fundamentals', '/jumps', '/hermite', '/alpha810']) {
    const routePage = await page.context().newPage()
    routePage.on('pageerror', (error) => console.error(`Browser error on ${route}: ${error.message}`))
    await routePage.goto(route)
    await expect(routePage.locator('main'), route).toBeVisible({ timeout: 15000 })
    expect(await routePage.locator('main').innerText(), route).not.toMatch(chinese)
    await routePage.close()
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

test('R&D study shows annual sample counts and an accessible public method note', async ({ page }) => {
  await page.goto('studies/rd-investment')
  await expect(page.getByRole('heading', { name: 'What was measured' })).toBeVisible()
  await expect(page.getByText('TTM R&D expense divided by equity market capitalization', { exact: false })).toBeVisible()
  await page.locator('.study-page > div[style*="min-height"]').scrollIntoViewIfNeeded()
  await expect(page.getByRole('heading', { name: 'How the signal changed over time' })).toBeVisible({ timeout: 15000 })
  await expect(page.getByRole('columnheader', { name: 'Monthly cross-sections' })).toBeVisible()
  await expect(page.locator('.annual-table tbody tr').last()).toContainText('2026')
  await expect(page.locator('.annual-table tbody tr').last()).toContainText('5')
  await page.getByRole('link', { name: 'Public methodology note' }).click()
  await expect(page.getByRole('heading', { name: 'R&D investment relative to valuation' })).toBeVisible()
  await expect(page.getByText(/revision_safe=false/)).toBeVisible()
})

test('theme switch persists across reloads', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Dark mode/ }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByRole('button', { name: /Light mode/ })).toBeVisible()
})

test('chart routes render without React runtime errors', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('pageerror', (error) => runtimeErrors.push(error.message))
  const cases = [
    { route: 'jumps', heading: 'Volatility is not one number.', chart: '.chart-panel .echarts-for-react, .chart-panel .chart-empty' },
    { route: 'hermite', heading: 'Find the cracks in the distribution.', chart: '.chart-panel .echarts-for-react' },
  ]
  for (const { route, heading, chart } of cases) {
    await page.goto(route)
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
    await expect(page.locator(chart).first()).toBeVisible()
    expect(runtimeErrors, route).toEqual([])
  }
})

test('Hermite explorer separates indicator scales and explains the demo window', async ({ page }) => {
  await page.goto('hermite')
  await expect(page.getByLabel('Hermite indicator')).toBeVisible()
  await expect(page.getByLabel('Ticker')).toBeVisible()
  await expect(page.getByText('42 daily observations')).toBeVisible()
  await page.getByLabel('Hermite indicator').selectOption('h_daily_close60_ts_h3_60')
  await expect(page.getByRole('heading', { name: /Third-order shape component/ })).toBeVisible()
  await expect(page.getByText(/Do not interpret its sign as a standardized skewness value/i)).toBeVisible()
})

test('jump page lets readers compare additive components as shares', async ({ page }) => {
  await page.goto('jumps')
  await expect(page.getByLabel('Example observation')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Share of realized variance' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Composition of jump variance' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Share of RJV' })).toBeVisible()
  await expect(page.getByText('RV = IVhat + RJV', { exact: false })).toBeVisible()
  await expect(page.getByText('RJV = RLJV + RSJV', { exact: false })).toBeVisible()
  await expect(page.getByText('Decomposition check passed')).toBeVisible()
})

test('jump decomposition flow stacks legibly on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('jumps')
  await expect(page.locator('.jump-flow')).toHaveCSS('display', 'grid')
  const columns = await page.locator('.jump-flow').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length)
  expect(columns).toBe(1)
})

test('fundamentals explorer selects published series and shows cross-sectional quantiles', async ({ page }) => {
  await page.goto('fundamentals')
  await expect(page.getByLabel('Series metric')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Latest operating-profit cross-section', exact: true })).toBeVisible()
  await expect(page.getByText('p01', { exact: true })).toBeVisible()
  await expect(page.getByText(/public time-series examples are available for only three representative tickers/)).toBeVisible()
  await page.getByLabel('Series metric').selectOption('roe')
  await expect(page.getByRole('heading', { name: 'Return on equity (ROE)' })).toBeVisible()
})

test('exploration pages localize new controls and evidence notes into Chinese', async ({ page }) => {
  await page.goto('hermite')
  await page.getByRole('button', { name: 'Switch to 中文' }).click()
  await expect(page.getByRole('heading', { name: '寻找分布形状的变化。' })).toBeVisible()
  await expect(page.getByLabel('Hermite 指标')).toBeVisible()

  await page.goto('jumps')
  await page.getByRole('button', { name: 'Switch to 中文' }).click()
  await expect(page.getByRole('heading', { name: '波动并不只有一个数字。' })).toBeVisible()
  await expect(page.getByText('分解恒等式核对通过')).toBeVisible()

  await page.goto('fundamentals')
  await page.getByRole('button', { name: 'Switch to 中文' }).click()
  await expect(page.getByLabel('序列指标')).toBeVisible()
  await expect(page.getByRole('heading', { name: '最新营业利润横截面' })).toBeVisible()

  await page.goto('studies/rd-investment')
  await page.getByRole('button', { name: 'Switch to 中文' }).click()
  await expect(page.getByText(/口径修正后的回放未重跑交易成本与组合验证/)).toBeVisible()
  await expect(page.getByText(/探索后.*fwd20.*Top-10%.*七个变体的毛收益均为负/)).toBeVisible()
  await expect(page.getByText(/最终样本外检验与成分股生效时点审计仍未完成/)).toBeVisible()
})

test('deferred charts do not blank the page on a mobile viewport', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('pageerror', (error) => runtimeErrors.push(error.message))
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Turn market data into readable structure.' })).toBeVisible()
  await page.getByRole('heading', { name: 'Factor map' }).scrollIntoViewIfNeeded()
  await expect(page.locator('.research-chart .echarts-for-react')).toBeVisible()
  expect(runtimeErrors).toEqual([])
  await expect(page.locator('main')).toBeVisible()
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
    'research-studies.json',
  ]))
  await expect(page.getByRole('heading', { name: 'What the published evidence says' })).toBeVisible()
  await expect(page.locator('.home-finding-card').first()).toContainText('Evidence boundary')
  expect(homeNames).not.toContain('alpha810-snapshot.json')
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
