import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CacheEntry {
  /** Shared, replayed source so concurrent subscribers reuse a single request. */
  obs$: Observable<unknown>;
  /** Epoch millis after which the entry is considered stale. */
  expiresAt: number;
}

/**
 * In-memory cache for repeated GET requests, keyed by a caller-provided string.
 *
 * The goal is to avoid re-fetching the same data when navigating back and forth
 * between screens. Entries share a single underlying request via `shareReplay`
 * and expire after their TTL. Failed sources are never cached so the next call
 * retries cleanly.
 */
@Injectable({ providedIn: 'root' })
export class ApiCacheService {
  private readonly entries = new Map<string, CacheEntry>();

  /**
   * Returns the cached observable for `key` if it is still fresh, otherwise
   * builds a new one from `factory` and caches it.
   */
  get<T>(key: string, factory: () => Observable<T>, ttlMs = 60_000): Observable<T> {
    const cached = this.entries.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.obs$ as Observable<T>;
    }

    const obs$ = factory().pipe(
      tap({ error: () => this.entries.delete(key) }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.entries.set(key, { obs$, expiresAt: Date.now() + ttlMs });
    return obs$;
  }

  /** Drops every entry whose key starts with `prefix`. */
  invalidate(prefix: string): void {
    for (const key of this.entries.keys()) {
      if (key.startsWith(prefix)) {
        this.entries.delete(key);
      }
    }
  }

  /** Empties the whole cache — e.g. on logout. */
  clear(): void {
    this.entries.clear();
  }
}
