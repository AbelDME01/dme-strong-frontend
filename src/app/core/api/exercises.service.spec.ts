import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ExercisesService } from './exercises.service';
import { environment } from '../../../environments/environment';

describe('ExercisesService', () => {
  let service: ExercisesService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/exercises`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExercisesService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ExercisesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll unwraps the paginated data array and requests a generous limit', () => {
    let result: unknown;
    service.getAll().subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === base);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('limit')).toBe('100');
    req.flush({
      data: [{ id: 'ex1' }],
      meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
    });

    expect(result).toEqual([{ id: 'ex1' }] as never);
  });

  it('getAll forwards optional filters as query params', () => {
    service.getAll({ muscleGroup: 'chest', search: 'press', limit: 20 }).subscribe();

    const req = httpMock.expectOne((r) => r.url === base);
    expect(req.request.params.get('muscleGroup')).toBe('chest');
    expect(req.request.params.get('search')).toBe('press');
    expect(req.request.params.get('limit')).toBe('20');
    req.flush({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });
  });

  it('getById requests a single exercise', () => {
    service.getById('ex1').subscribe();
    const req = httpMock.expectOne(`${base}/ex1`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'ex1' });
  });
});
