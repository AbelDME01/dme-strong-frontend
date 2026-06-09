import { test, expect } from '@playwright/test';
import { requireAuth } from './helpers';

const API_URL = process.env.E2E_API_URL ?? 'http://localhost:3000/api/v1';

/** Reads the Supabase access token the app stored in localStorage. */
async function accessToken(page: import('@playwright/test').Page): Promise<string | null> {
  return page.evaluate(() => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('auth-token')) {
        try {
          const parsed = JSON.parse(localStorage.getItem(key) as string);
          return parsed?.access_token ?? null;
        } catch {
          return null;
        }
      }
    }
    return null;
  });
}

test.describe('Exercise detail', () => {
  test.beforeEach(() => requireAuth());

  test('renders real progression data for an exercise', async ({ page }) => {
    // Land on an authenticated page so the Supabase session is in localStorage.
    await page.goto('/home');
    const token = await accessToken(page);
    expect(token, 'expected a Supabase access token in localStorage').toBeTruthy();

    // Resolve a real exercise id from the backend.
    const res = await page.request.get(`${API_URL}/exercises`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    const exercises: Array<{ id: string }> = Array.isArray(json) ? json : (json?.data ?? []);
    test.skip(exercises.length === 0, 'No exercises available to inspect.');

    await page.goto(`/history/exercise/${exercises[0].id}`);
    await expect(page.locator('.exercise__name')).toBeVisible();
    await expect(page.locator('.exercise__pr')).toBeVisible();
    // The seeded exercise has >=2 progression points, so the chart line renders,
    // and its recent sets are listed.
    await expect(page.locator('path[stroke="#00E5A0"]').first()).toBeVisible();
    await expect(page.locator('.exercise__set').first()).toBeVisible();
  });
});
