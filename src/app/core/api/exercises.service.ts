import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Exercise } from './models';

@Injectable({ providedIn: 'root' })
export class ExercisesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/exercises`;

  getAll(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(this.base);
  }

  getById(id: string): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.base}/${id}`);
  }
}
