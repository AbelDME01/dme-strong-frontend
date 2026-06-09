import { chromium, FullConfig } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const AUTH_FILE = 'e2e/.auth/user.json';
const EMPTY_STATE = { cookies: [], origins: [] };

/**
 * Signs in once with the test user and persists the Supabase session so every
 * spec starts authenticated. When E2E_EMAIL/E2E_PASSWORD are not provided, it
 * writes an empty storage state and the auth-dependent specs skip themselves.
 */
async function globalSetup(config: FullConfig): Promise<void> {
  mkdirSync(dirname(AUTH_FILE), { recursive: true });

  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) {
    // eslint-disable-next-line no-console
    console.warn(
      '\n[e2e] E2E_EMAIL / E2E_PASSWORD not set — auth-dependent specs will be skipped.\n',
    );
    writeFileSync(AUTH_FILE, JSON.stringify(EMPTY_STATE));
    return;
  }

  const baseURL = config.projects[0]?.use?.baseURL ?? 'http://localhost:4200';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto(`${baseURL}/auth/login`);
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole('button', { name: /iniciar sesión|entrando/i }).click();
    await page.waitForURL(/\/home/, { timeout: 20_000 });
    await page.context().storageState({ path: AUTH_FILE });
  } finally {
    await browser.close();
  }
}

export default globalSetup;
