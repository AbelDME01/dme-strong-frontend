import { Injectable, signal, computed, inject } from '@angular/core';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase.client';
import { ApiCacheService } from '../api/api-cache.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private cache = inject(ApiCacheService);

  readonly session = signal<Session | null>(null);
  readonly user = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.session() !== null);

  constructor() {
    supabase.auth.onAuthStateChange((event, session) => {
      this.session.set(session);
      this.user.set(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        this.cache.clear();
      }
    });
  }

  async initialize(): Promise<void> {
    const { data } = await supabase.auth.getSession();
    this.session.set(data.session);
    this.user.set(data.session?.user ?? null);
  }

  async signIn(email: string, password: string): Promise<void> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.session.set(data.session);
    this.user.set(data.session?.user ?? null);
  }

  async signUp(email: string, password: string, fullName?: string): Promise<void> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: fullName ? { data: { full_name: fullName } } : undefined,
    });
    if (error) throw error;
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}
