import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { RoutinesService } from './routines.service';
import { environment } from '../../../environments/environment';

describe('RoutinesService', () => {
  let service: RoutinesService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/routines`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RoutinesService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(RoutinesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll requests the routine list', () => {
    service.getAll().subscribe();
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getById requests a single routine', () => {
    service.getById('r1').subscribe();
    const req = httpMock.expectOne(`${base}/r1`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'r1' });
  });

  it('create POSTs the camelCase payload', () => {
    const payload = {
      name: 'Push',
      exercises: [{ exerciseId: 'ex1', orderIndex: 0, targetSets: 4, targetReps: 10 }],
    };
    service.create(payload).subscribe();
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'r1' });
  });

  it('update PATCHes the routine', () => {
    service.update('r1', { name: 'Pull' }).subscribe();
    const req = httpMock.expectOne(`${base}/r1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ name: 'Pull' });
    req.flush({ id: 'r1' });
  });

  it('remove DELETEs the routine', () => {
    service.remove('r1').subscribe();
    const req = httpMock.expectOne(`${base}/r1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
