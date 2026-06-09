import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { UsersService } from './users.service';
import { environment } from '../../../environments/environment';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UsersService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getProfile GETs /users/me', () => {
    let result: unknown;
    service.getProfile().subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'p1', full_name: 'QA' });

    expect(result).toEqual({ id: 'p1', full_name: 'QA' } as never);
  });

  it('updateProfile PUTs the camelCase payload to /users/me', () => {
    const payload = { fullName: 'New Name', heightCm: 180 };
    let result: unknown;
    service.updateProfile(payload).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'p1', full_name: 'New Name', height_cm: 180 });

    expect(result).toEqual({ id: 'p1', full_name: 'New Name', height_cm: 180 } as never);
  });
});
