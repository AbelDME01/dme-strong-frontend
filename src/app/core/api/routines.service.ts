import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Routine } from './models';

@Injectable({ providedIn: 'root' })
export class RoutinesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/routines`;

  getAll(): Observable<Routine[]> {
    return this.http.get<Routine[]>(this.base);
  }

  getById(id: string): Observable<Routine> {
    return this.http.get<Routine>(`${this.base}/${id}`);
  }

  create(data: Partial<Routine>): Observable<Routine> {
    return this.http.post<Routine>(this.base, data);
  }
}
