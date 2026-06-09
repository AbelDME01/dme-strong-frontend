import { test, expect } from '@playwright/test';
import { requireAuth } from './helpers';

test.describe('Edit profile', () => {
  test.beforeEach(() => requireAuth());

  test('loads the profile and persists a name change', async ({ page }) => {
    await page.goto('/profile/edit');

    const nameInput = page.locator('.edit-profile__form input').first();
    await expect(nameInput).toBeVisible();

    const newName = `QA ${Date.now()}`;
    await nameInput.fill(newName);
    await page.getByRole('button', { name: /guardar/i }).click();

    // On success the app navigates back to the profile view.
    await expect(page).toHaveURL(/\/profile$/);

    // Re-open the editor: the new name must have persisted via the API.
    await page.goto('/profile/edit');
    await expect(page.locator('.edit-profile__form input').first()).toHaveValue(newName);
  });
});
