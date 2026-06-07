import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Exercise } from './models';

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

@Injectable({ providedIn: 'root' })
export class ExercisesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/exercises`;

  /**
   * Returns the exercise catalog. The endpoint is paginated, so the wrapper is
   * unwrapped to its `data` array. Defaults to a generous page size since the
   * routine builder filters the catalog client-side.
   */
  getAll(query: ExerciseQuery = {}): Observable<Exercise[]> {
    const { limit = 100, ...rest } = query;
    let params = new HttpParams().set('limit', String(limit));
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http
      .get<PaginatedExercises>(this.base, { params })
      .pipe(map((r) => r.data));
  }

  getById(id: string): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.base}/${id}`);
  }
}
