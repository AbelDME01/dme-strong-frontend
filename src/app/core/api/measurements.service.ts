import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Measurement } from './models';

interface PaginatedMeasurements {
  data: Measurement[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

@Injectable({ providedIn: 'root' })
export class MeasurementsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/measurements`;

  getAll(): Observable<Measurement[]> {
    return this.http.get<PaginatedMeasurements>(this.base).pipe(map((r) => r.data));
  }
}
