import { defineConfig, devices } from '@playwright/test';

const evidence = !!process.env.EVIDENCE;

export default defineConfig({
  testDir: './e2e',
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1280, height: 800 },
    screenshot: evidence ? { mode: 'on', fullPage: true } : 'only-on-failure',
    video: evidence ? 'on' : 'retain-on-failure',
    trace: evidence ? 'on' : 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
});
