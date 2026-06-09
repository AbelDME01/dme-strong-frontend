import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { MeasurementsService } from './measurements.service';
import { environment } from '../../../environments/environment';

describe('MeasurementsService', () => {
  let service: MeasurementsService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/measurements`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MeasurementsService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(MeasurementsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll unwraps the paginated data array', () => {
    let result: unknown;
    service.getAll().subscribe((r) => (result = r));

    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [{ id: 'm1' }], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } });

    expect(result).toEqual([{ id: 'm1' }] as never);
  });

  it('create POSTs the camelCase payload', () => {
    const payload = { weightKg: 80.5 };
    service.create(payload).subscribe();

    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'm2', weight_kg: 80.5 });
  });
});
