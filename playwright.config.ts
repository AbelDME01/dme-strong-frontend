import { defineConfig, devices } from '@playwright/test';

/**
 * E2E configuration for DME-Strong frontend.
 *
 * Requires a seeded Supabase test user. Provide credentials via env vars:
 *   E2E_EMAIL, E2E_PASSWORD
 * (see e2e/README.md). The global setup signs in once and reuses the session.
 *
 * `npm run e2e` boots both the NestJS backend (:3000) and the Angular app (:4200).
 */
const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:4200';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  globalSetup: './e2e/global-setup.ts',

  use: {
    baseURL: BASE_URL,
    storageState: 'e2e/.auth/user.json',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  webServer: [
    {
      command: 'npm --prefix ../dme-strong-backend run start:dev',
      url: 'http://localhost:3000/api/v1/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'npm start',
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
});
