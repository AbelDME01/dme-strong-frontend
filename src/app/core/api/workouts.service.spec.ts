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

  it('getRecentWithSets hydrates each listed workout via its detail endpoint', () => {
    let result: unknown[] = [];
    service.getRecentWithSets(2).subscribe((r) => (result = r));

    // 1) the list call
    const listReq = httpMock.expectOne(base);
    listReq.flush({
      data: [{ id: 'w1' }, { id: 'w2' }],
      meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
    });

    // 2) one detail call per workout, with sets attached
    httpMock.expectOne(`${base}/w1`).flush({ id: 'w1', workout_sets: [{ id: 's1' }] });
    httpMock.expectOne(`${base}/w2`).flush({ id: 'w2', workout_sets: [] });

    expect(result.length).toBe(2);
    expect((result[0] as { workout_sets: unknown[] }).workout_sets.length).toBe(1);
  });

  it('getRecentWithSets makes no detail calls when the list is empty', () => {
    let result: unknown[] = [{ placeholder: true }];
    service.getRecentWithSets().subscribe((r) => (result = r));
    httpMock.expectOne(base).flush({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });
    expect(result).toEqual([]);
  });

  it('create POSTs the payload', () => {
    service.create({ name: 'Push' }).subscribe();
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Push' });
    req.flush({ id: 'w1', name: 'Push' });
  });

  it('update PATCHes the workout (e.g. mark finished)', () => {
    const finishedAt = '2026-06-04T10:00:00.000Z';
    service.update('w1', { finishedAt }).subscribe();
    const req = httpMock.expectOne(`${base}/w1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ finishedAt });
    req.flush({ id: 'w1' });
  });

  it('remove DELETEs the workout', () => {
    service.remove('w1').subscribe();
    const req = httpMock.expectOne(`${base}/w1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('addSet POSTs a set to the workout', () => {
    service.addSet('w1', { exerciseId: 'ex1', reps: 10, weightKg: 80 }).subscribe();
    const req = httpMock.expectOne(`${base}/w1/sets`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ exerciseId: 'ex1', reps: 10, weightKg: 80 });
    req.flush({ id: 's1' });
  });

  it('updateSet PATCHes a specific set', () => {
    service.updateSet('w1', 's1', { reps: 8 }).subscribe();
    const req = httpMock.expectOne(`${base}/w1/sets/s1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ reps: 8 });
    req.flush({ id: 's1' });
  });

  it('removeSet DELETEs a specific set', () => {
    service.removeSet('w1', 's1').subscribe();
    const req = httpMock.expectOne(`${base}/w1/sets/s1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
