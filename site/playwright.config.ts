import { defineConfig, devices } from '@playwright/test'

const port = Number(process.env.PLAYWRIGHT_PORT ?? 4173)

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'line',
  use: { baseURL: `http://127.0.0.1:${port}/`, ...devices['Desktop Chrome'] },
  webServer: {
    command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}/`,
    reuseExistingServer: !process.env.CI,
  },
})
