import { test } from '@playwright/test';

/** Skips the current test when no test-user credentials are configured. */
export const hasAuth = (): boolean => !!(process.env.E2E_EMAIL && process.env.E2E_PASSWORD);

/** Use at the top of a test/describe block that needs an authenticated session. */
export function requireAuth(): void {
  test.skip(!hasAuth(), 'Set E2E_EMAIL and E2E_PASSWORD to run authenticated e2e specs.');
}
