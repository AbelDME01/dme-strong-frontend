import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Exercise } from './models';
import { ApiCacheService } from './api-cache.service';

/** The catalog changes rarely, so it can be cached for longer than live data. */
const CATALOG_TTL_MS = 5 * 60_000;

interface PaginatedExercises {
  data: Exercise[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

/** Optional filters for the exercise catalog (camelCase to match the backend DTO). */
export interface ExerciseQuery {
  muscleGroup?: string;
  equipment?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateExercisePayload {
  name: string;
  muscleGroup: string;
  description?: string;
  isPublic?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ExercisesService {
  private http = inject(HttpClient);
  private cache = inject(ApiCacheService);
  private base = `${environment.apiUrl}/exercises`;

  /**
   * Returns the exercise catalog. The endpoint is paginated, so the wrapper is
   * unwrapped to its `data` array. Defaults to a generous page size since the
   * routine builder filters the catalog client-side. Results are cached per
   * query so navigating back into the builder reuses the last response.
   */
  getAll(query: ExerciseQuery = {}): Observable<Exercise[]> {
    const key = `exercises:all:${JSON.stringify(query)}`;
    return this.cache.get(
      key,
      () => {
        const { limit = 100, ...rest } = query;
        let params = new HttpParams().set('limit', String(limit));
        for (const [field, value] of Object.entries(rest)) {
          if (value !== undefined && value !== null && value !== '') {
            params = params.set(field, String(value));
          }
        }
        return this.http
          .get<PaginatedExercises>(this.base, { params })
          .pipe(map((r) => r.data));
      },
      CATALOG_TTL_MS,
    );
  }

  getById(id: string): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.base}/${id}`);
  }

  create(payload: CreateExercisePayload): Observable<Exercise> {
    return this.http
      .post<Exercise>(this.base, payload)
      .pipe(tap(() => this.cache.invalidate('exercises')));
  }
}
