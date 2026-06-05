import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PersonalRecord } from './models';

@Injectable({ providedIn: 'root' })
export class RecordsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/records`;

  getAll(): Observable<PersonalRecord[]> {
    return this.http.get<PersonalRecord[]>(this.base);
  }
}
