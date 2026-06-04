import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { WorkoutsService } from './workouts.service';
import { environment } from '../../../environments/environment';

describe('WorkoutsService', () => {
  let service: WorkoutsService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/workouts`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WorkoutsService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(WorkoutsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll unwraps the paginated data array', () => {
    let result: unknown;
    service.getAll().subscribe((r) => (result = r));

    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush({
      data: [{ id: 'w1' }],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    });

    expect(result).toEqual([{ id: 'w1' }] as never);
  });

  it('getById requests the workout by id', () => {
    service.getById('w1').subscribe();
    const req = httpMock.expectOne(`${base}/w1`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'w1' });
  });

  it('create POSTs the payload', () => {
    service.create({ name: 'Push' }).subscribe();
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Push' });
    req.flush({ id: 'w1', name: 'Push' });
  });
});
