# E2E tests (Playwright)

End-to-end coverage of the key user flows: authentication, edit profile, web
dashboard and exercise detail.

## Prerequisites

1. A **Supabase test user** must exist in the project referenced by
   `src/environments/environment.ts`. The user should ideally have some seed
   data (a routine, a couple of workouts with sets, a personal record) so the
   data-driven screens render real content.
2. The backend (`dme-strong-backend`) must be runnable with its own `.env`
   (`SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET`, `PORT=3000`).

## Running

```bash
# from dme-strong-frontend/
export E2E_EMAIL="qa@dme.app"
export E2E_PASSWORD="••••••••"
npm run e2e            # boots backend (:3000) + frontend (:4200) automatically
npm run e2e:ui        # interactive runner
npm run e2e:report    # open the last HTML report
```

If `E2E_EMAIL` / `E2E_PASSWORD` are **not** set, the auth-dependent specs skip
themselves and only the public flows (login redirect, validation) run, so the
suite stays green in environments without credentials.

## Notes

- `global-setup.ts` signs in once via the login UI and stores the Supabase
  session in `e2e/.auth/user.json` (git-ignored); specs reuse it.
- `webServer` in `playwright.config.ts` starts both servers; set
  `E2E_BASE_URL` to target an already-running deployment instead.
