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
  await expect(page.getByRole('heading', { name: 'Turn market data into readable structure.' })).toBeVisible({ timeout: 15000 })
  await expect(page.getByRole('heading', { name: 'Distribution shape states' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Fundamental research' })).toBeVisible()
})

test('Alpha 810 schema 1.1 shows annual and uncertainty evidence', async ({ page }) => {
  await page.route('**/data/alpha810-snapshot.json', async (route) => {
    const response = await route.fetch()
    const snapshot = await response.json()
    snapshot.schema_version = '1.1'
    snapshot.factors[0].annual_slices = [{ label: '2025', valid_dates: 200, rank_ic_mean: 0.03, rank_ic_positive_rate: 0.6, group_returns: [{ group: 1, mean_return: 0, periods: 200 }, { group: 5, mean_return: 0.02, periods: 200 }] }]
    snapshot.factors[0].regime_slices = [{ label: 'bear', valid_dates: 80, rank_ic_mean: 0.01, rank_ic_positive_rate: 0.55, group_returns: [{ group: 1, mean_return: 0, periods: 80 }, { group: 5, mean_return: 0.01, periods: 80 }] }]
    snapshot.factors[0].uncertainty = { status: 'complete', method: 'newey_west_hac', holding_period_days: 1, estimate: 0.03, standard_error: 0.01, confidence_interval: [0.01, 0.05], p_value: 0.003, multiple_testing: { q_value_by: 0.04, q_value_bh: 0.02 } }
    snapshot.temporal_validation = { status: 'complete', annual_status: 'complete', market_regime: { status: 'complete' } }
    snapshot.uncertainty = { status: 'partial', method: 'newey_west_hac', holding_period_days: 1, tested_factor_count: 1, factor_count: 810 }
    snapshot.multiple_testing = { status: 'complete', method: 'benjamini_yekutieli', family_size: 810, tested_count: 810, factors: Object.fromEntries(snapshot.factors.map((factor, index) => [factor.name, { q_value_by: index === 0 ? 0.04 : null, q_value_bh: index === 0 ? 0.02 : null }])) }
    await route.fulfill({ response, json: snapshot })
  })
  await page.goto('alpha810/factors/alpha101_001')
  await expect(page.getByRole('heading', { name: 'How did the factor behave over time?' })).toBeVisible()
  await expect(page.locator('.annual-table tbody tr').nth(0)).toContainText('2025')
  await expect(page.locator('.annual-table tbody tr').nth(1)).toContainText('Regime: bear')
  await expect(page.getByText('BY adjusted q-value')).toBeVisible()
  await expect(page.getByText('0.0400')).toBeVisible()
  await expect(page.getByText('Raw p-value')).toBeVisible()
  await expect(page.getByText('0.0030')).toBeVisible()
  await page.getByRole('button', { name: 'Switch to 中文' }).click()
  await expect(page.getByRole('heading', { name: '因子随时间的表现如何？' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'RankIC 均值' })).toBeVisible()
  await page.getByRole('button', { name: 'Switch to English' }).click()
  await page.setViewportSize({ width: 360, height: 780 })
  await page.reload()
  await expect(page.locator('main')).toBeVisible()
  const overflow = await page.evaluate(() => Array.from(document.querySelectorAll('*'))
    .filter((element) => element.scrollWidth > element.clientWidth + 1)
    .map((element) => ({ tag: element.tagName, className: (element as HTMLElement).className, client: element.clientWidth, scroll: element.scrollWidth, overflowX: getComputedStyle(element).overflowX }))
    .slice(0, 12))
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), JSON.stringify(overflow)).toBe(true)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('alpha810')
  await expect(page.getByRole('heading', { name: 'How many factors have BY q ≤ 0.05?' })).toBeVisible()
  await expect(page.getByText('1 / 810', { exact: true })).toBeVisible()
  await expect(page.getByText('Available', { exact: true })).toBeVisible()
})

test('Published Alpha 810 snapshot shows full-period corrected evidence and caveats', async ({ page }) => {
  await page.goto('alpha810')
  await expect(page.getByRole('heading', { name: 'How many factors have BY q ≤ 0.05?' })).toBeVisible()
  await expect(page.getByText('781 / 810', { exact: true })).toBeVisible()
  await expect(page.getByText('806 / 810', { exact: true })).toBeVisible()
  await expect(page.getByText('Available', { exact: true })).toBeVisible()
  await expect(page.getByText(/Historical input point-in-time availability/)).toBeVisible()
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

test('fundamental research series shows source-backed A-share and historical Hong Kong studies in both locales', async ({ page }) => {
  await page.goto('studies')
  await expect(page.getByRole('heading', { name: 'Fundamental research across factors and markets' })).toBeVisible()
  await expect(page.getByText(/23 fundamental and human-capital candidates/)).toBeVisible()
  await expect(page.getByRole('link', { name: /Browse factor definitions/ })).toHaveAttribute('href', /fundamentals$/)
  await expect(page.getByRole('heading', { name: 'Fundamental-state forecasting: from financial predictions to cross-sectional selection' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Hong Kong PIT fundamentals: archived monthly and quarterly studies' })).toBeVisible()
  await expect(page.getByText('Historical archive').first()).toBeVisible()
  await page.getByRole('button', { name: 'Switch to 中文' }).click()
  await expect(page.getByRole('heading', { name: '跨因子与市场的基本面研究' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '港股基本面 PIT 研究：月频与季频历史归档' })).toBeVisible()
  await expect(page.getByText('港股', { exact: true }).first()).toBeVisible()
})

test('older study catalogs without series or taxonomy metadata still render', async ({ page }) => {
  await page.route('**/data/research-studies.json', async (route) => {
    const response = await route.fetch()
    const catalog = await response.json()
    delete catalog.series
    for (const study of catalog.studies) {
      delete study.series
      delete study.market
      delete study.method
      delete study.frequency
      delete study.evidence_stage
      delete study.publication_id
      delete study.source_ref
    }
    await route.fulfill({ response, json: catalog })
  })
  await page.goto('studies')
  await expect(page.getByRole('heading', { name: 'Research studies' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'PB and ROE: A Paired Test of Valuation and Profitability' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Fundamental research across factors and markets' })).toHaveCount(0)
})

test('R&D study shows corrected PIT evidence and an accessible public method note', async ({ page }) => {
  await page.goto('studies/rd-investment')
  await expect(page.getByRole('heading', { name: 'What was measured' })).toBeVisible()
  await expect(page.getByText('TTM R&D expense divided by equity market capitalization', { exact: false })).toBeVisible()
  await expect(page.getByText(/77 valid 20-day and 66 valid 220-day/).first()).toBeVisible()
  await expect(page.locator('.factor-table tbody tr').first()).toContainText('4.85%')
  await expect(page.locator('.annual-table')).toHaveCount(0)
  await page.getByRole('link', { name: 'Public methodology note' }).click()
  await expect(page.getByRole('heading', { name: 'R&D investment relative to valuation' })).toBeVisible()
  await expect(page.getByText(/77 valid monthly cross-sections/)).toBeVisible()
  await expect(page.getByText(/No frozen holdout metrics have been produced/)).toBeVisible()
})

test('R&D legacy annual snapshot is not requested by the current study page', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/data/')) requests.push(new URL(request.url()).pathname.split('/').pop() ?? '')
  })
  await page.goto('studies/rd-investment')
  await expect(page.getByRole('heading', { name: 'R&D Investment Relative to Valuation: Signal or Size Exposure?' })).toBeVisible()
  expect(requests).toEqual(['research-studies.json'])
})

test('R&D method note links to the fixed-cost diagnostic and states its limits', async ({ page }) => {
  await page.goto('studies/rd-investment')
  await page.getByRole('link', { name: 'Public methodology note' }).click()
  await expect(page.getByText(/25 bp one-way modeled cost/)).toBeVisible()
  await expect(page.getByText(/not the registered decile validation or a production portfolio/)).toBeVisible()
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

test('fundamentals catalog groups are keyboard-accessible disclosures on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('fundamentals')
  const group = page.locator('.catalog-grid details').first()
  await expect(group).toBeVisible()
  await expect(group).not.toHaveAttribute('open', '')
  const summary = group.locator('summary')
  await expect(summary).toBeVisible()
  await summary.focus()
  await page.keyboard.press('Enter')
  await expect(group).toHaveAttribute('open', '')
  await expect(group.locator('.catalog-row').first()).toBeVisible()
  const widths = await page.evaluate(() => ({ viewport: window.innerWidth, content: document.documentElement.scrollWidth }))
  expect(widths.content).toBeLessThanOrEqual(widths.viewport)
})

test('fundamentals route defers chart code until a chart section approaches view', async ({ page }) => {
  const chartRequests: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.includes('echarts-')) chartRequests.push(request.url())
  })
  await page.goto('fundamentals')
  await expect(page.getByRole('heading', { name: 'Operating states, slowly becoming signals.' })).toBeVisible()
  expect(chartRequests).toEqual([])
  await page.locator('.quantile-panel').scrollIntoViewIfNeeded()
  await expect(page.locator('.quantile-panel .echarts-for-react')).toBeVisible()
  await expect.poll(() => chartRequests.length).toBeGreaterThan(0)
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
  await expect(page.getByText(/77 个有效 20 日月度截面和 66 个有效 220 日月度截面/)).toBeVisible()
  await expect(page.getByText(/单独的固定 Top-200 平台探针.*12\.70%/)).toBeVisible()
  await expect(page.getByText(/2026-10 至 2027-09 的前瞻最终 OOS 协议已封存，但性能读取仍被门槛阻止/)).toBeVisible()
  await expect(page.getByText(/历史指数与行业生效时点也没有完全按点时核实/).first()).toBeVisible()
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
  await expect.poll(() => dataResponses.length).toBe(4)
  await expect(page.getByRole('heading', { name: 'What the published evidence says' })).toBeVisible()
  const homeNames = dataResponses.map((response) => response.name)
  expect(homeNames).toEqual(expect.arrayContaining([
    'factor-snapshot.json',
    'fundamental-factor-catalog.json',
    'fundamental-snapshot.json',
    'research-studies.json',
  ]))
  expect(homeNames).not.toContain('alpha810-snapshot.json')
  expect(homeNames).not.toContain('rd-investment-annual.json')
  await expect(page.locator('.home-finding-card').first()).toContainText('Evidence boundary')
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
  expect(dataResponses.map((response) => response.name)).toEqual(['research-studies.json'])
})
