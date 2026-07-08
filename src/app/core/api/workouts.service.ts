import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Workout, WorkoutSet } from './models';
import { ApiCacheService } from './api-cache.service';

interface PaginatedWorkouts {
  data: Workout[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

/** Request payload for starting a workout (camelCase). */
export interface CreateWorkoutPayload {
  name: string;
  notes?: string;
  routineId?: string;
  startedAt?: string;
}

/** Request payload for updating a workout, e.g. marking it finished (camelCase). */
export interface UpdateWorkoutPayload {
  name?: string;
  notes?: string;
  finishedAt?: string;
  durationSeconds?: number;
}

/** Request payload for logging/updating a set (camelCase). */
export interface SetPayload {
  exerciseId: string;
  setNumber?: number;
  reps?: number;
  weightKg?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  rpe?: number;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class WorkoutsService {
  private http = inject(HttpClient);
  private cache = inject(ApiCacheService);
  private base = `${environment.apiUrl}/workouts`;

  getAll(): Observable<Workout[]> {
    return this.http.get<PaginatedWorkouts>(this.base).pipe(map((r) => r.data));
  }

  getById(id: string): Observable<Workout> {
    return this.http.get<Workout>(`${this.base}/${id}`);
  }

  /** Returns recent workouts with sets already hydrated — single request via includeSets. */
  getRecentWithSets(max = 20): Observable<Workout[]> {
    const params = new HttpParams()
      .set('includeSets', 'true')
      .set('limit', String(max));
    return this.http
      .get<PaginatedWorkouts>(this.base, { params })
      .pipe(map((r) => r.data));
  }

  create(data: CreateWorkoutPayload): Observable<Workout> {
    return this.http.post<Workout>(this.base, data);
  }

  update(id: string, data: UpdateWorkoutPayload): Observable<Workout> {
    return this.http.patch<Workout>(`${this.base}/${id}`, data);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  addSet(workoutId: string, data: SetPayload): Observable<WorkoutSet> {
    return this.http
      .post<WorkoutSet>(`${this.base}/${workoutId}/sets`, data)
      .pipe(tap(() => this.cache.invalidate('records')));
  }

  updateSet(
    workoutId: string,
    setId: string,
    data: Partial<SetPayload>,
  ): Observable<WorkoutSet> {
    return this.http.patch<WorkoutSet>(
      `${this.base}/${workoutId}/sets/${setId}`,
      data,
    );
  }

  removeSet(workoutId: string, setId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${workoutId}/sets/${setId}`);
  }
}
