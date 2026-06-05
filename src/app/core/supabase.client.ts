import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export const supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
  auth: {
    // Bypass navigator.locks to avoid NavigatorLockAcquireTimeoutError in
    // environments where exclusive locks fail immediately (e.g. Playwright).
    lock: <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>) => fn(),
  },
});
