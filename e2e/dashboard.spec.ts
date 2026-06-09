import { test, expect } from '@playwright/test';
import { requireAuth } from './helpers';

test.describe('Web dashboard', () => {
  test.beforeEach(() => requireAuth());

  test('renders the dashboard shell with a dynamic greeting', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('.dashboard')).toBeVisible();
    await expect(page.locator('.dashboard__greeting')).toContainText(/Buenas,/);
    // The recent-workouts table renders (data rows or an empty-state message).
    await expect(page.locator('.dashboard__table-section')).toBeVisible();
  });
});
