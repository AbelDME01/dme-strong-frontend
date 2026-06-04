import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Workout } from './models';

interface PaginatedWorkouts {
  data: Workout[];
  meta: { total: number; page: number; limit: number; totalPages: number };
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

  create(data: Partial<Workout>): Observable<Workout> {
    return this.http.post<Workout>(this.base, data);
  }
}
