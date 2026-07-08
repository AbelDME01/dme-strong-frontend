import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UserProfile } from './models';
import { ApiCacheService } from './api-cache.service';

/** Request payload for updating the current user's profile (camelCase to match the backend DTO). */
export interface UpdateProfilePayload {
  fullName?: string;
  avatarUrl?: string;
  heightCm?: number;
  birthDate?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private cache = inject(ApiCacheService);
  private base = `${environment.apiUrl}/users`;

  getProfile(): Observable<UserProfile> {
    return this.cache.get('users:profile', () =>
      this.http.get<UserProfile>(`${this.base}/me`),
    );
  }

  updateProfile(data: UpdateProfilePayload): Observable<UserProfile> {
    return this.http
      .put<UserProfile>(`${this.base}/me`, data)
      .pipe(tap(() => this.cache.invalidate('users')));
  }
}
