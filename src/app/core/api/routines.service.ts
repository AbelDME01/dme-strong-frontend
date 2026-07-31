import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Routine } from './models';
import { ApiCacheService } from './api-cache.service';

/** Input shape for a routine exercise — camelCase to match the backend DTO. */
export interface RoutineExerciseInput {
  exerciseId: string;
  orderIndex?: number;
  targetSets?: number;
  targetReps?: number;
  targetWeight?: number;
  restSeconds?: number;
}

/** Request payload for creating/updating a routine (camelCase). */
export interface RoutinePayload {
  name: string;
  description?: string;
  exercises?: RoutineExerciseInput[];
}

@Injectable({ providedIn: 'root' })
export class RoutinesService {
  private http = inject(HttpClient);
  private cache = inject(ApiCacheService);
  private base = `${environment.apiUrl}/routines`;

  getAll(): Observable<Routine[]> {
    return this.cache.get('routines:all', () =>
      this.http.get<Routine[]>(this.base),
    );
  }

  getById(id: string): Observable<Routine> {
    return this.http.get<Routine>(`${this.base}/${id}`);
  }

  create(data: RoutinePayload): Observable<Routine> {
    return this.http
      .post<Routine>(this.base, data)
      .pipe(tap(() => this.cache.invalidate('routines')));
  }

  update(id: string, data: Partial<RoutinePayload>): Observable<Routine> {
    return this.http
      .patch<Routine>(`${this.base}/${id}`, data)
      .pipe(tap(() => this.cache.invalidate('routines')));
  }

  remove(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/${id}`)
      .pipe(tap(() => this.cache.invalidate('routines')));
  }
}
