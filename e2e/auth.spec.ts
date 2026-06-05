import { test, expect } from '@playwright/test';
import { hasAuth } from './helpers';

test.describe('Authentication', () => {
  test('unauthenticated user is redirected to login', async ({ browser }) => {
    // Fresh context with no stored session.
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto('/home');
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await context.close();
  });

  test('login screen shows validation errors on empty submit', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto('/auth/login');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await expect(page.getByText(/correo válido/i)).toBeVisible();
    await context.close();
  });

  test('seeded user reaches the home screen', async ({ page }) => {
    test.skip(!hasAuth(), 'Requires E2E credentials.');
    // Session restored from storageState (global setup) → home is reachable.
    await page.goto('/home');
    await expect(page).toHaveURL(/\/home/);
  });
});
