import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Workout, WorkoutSet } from './models';

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
  private base = `${environment.apiUrl}/workouts`;

  getAll(): Observable<Workout[]> {
    return this.http.get<PaginatedWorkouts>(this.base).pipe(map((r) => r.data));
  }

  getById(id: string): Observable<Workout> {
    return this.http.get<Workout>(`${this.base}/${id}`);
  }

  /**
   * Returns recent workouts with their `workout_sets` hydrated. The list
   * endpoint omits nested sets, so this fetches the detail of the most recent
   * `max` workouts in parallel. Bounded by `max` to keep it scalable.
   */
  getRecentWithSets(max = 20): Observable<Workout[]> {
    return this.getAll().pipe(
      switchMap((workouts) => {
        const slice = workouts.slice(0, max);
        if (slice.length === 0) return of<Workout[]>([]);
        return forkJoin(slice.map((w) => this.getById(w.id)));
      }),
    );
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
    return this.http.post<WorkoutSet>(`${this.base}/${workoutId}/sets`, data);
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
