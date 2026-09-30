import { expect, test } from '@playwright/test'

const chinese = /[\u4e00-\u9fff]/

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('quant-factor-locale', 'en-US')
  })
})

test('English public pages do not render Chinese catalog content', async ({ page }) => {
  for (const route of ['/', 'studies', 'factors', 'fundamentals', 'jumps', 'hermite', 'alpha810']) {
    await page.goto(route)
    await expect(page.locator('body')).toBeVisible()
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
