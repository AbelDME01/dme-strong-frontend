import { fakeAsync, tick } from '@angular/core/testing';
import { defer, of, throwError } from 'rxjs';
import { ApiCacheService } from './api-cache.service';

describe('ApiCacheService', () => {
  let service: ApiCacheService;

  beforeEach(() => {
    service = new ApiCacheService();
  });

  it('reuses the cached source instead of calling the factory again', () => {
    const factory = jasmine.createSpy('factory').and.returnValue(of([1, 2, 3]));

    service.get('k', factory).subscribe();
    service.get('k', factory).subscribe();

    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('rebuilds the source once the TTL has elapsed', fakeAsync(() => {
    const factory = jasmine.createSpy('factory').and.returnValue(of('data'));

    service.get('k', factory, 1000).subscribe();
    tick(1001);
    service.get('k', factory, 1000).subscribe();

    expect(factory).toHaveBeenCalledTimes(2);
  }));

  it('invalidate drops every entry matching the prefix', () => {
    const routines = jasmine.createSpy('routines').and.returnValue(of([]));
    const users = jasmine.createSpy('users').and.returnValue(of({}));

    service.get('routines:all', routines).subscribe();
    service.get('users:profile', users).subscribe();
    service.invalidate('routines');

    service.get('routines:all', routines).subscribe();
    service.get('users:profile', users).subscribe();

    expect(routines).toHaveBeenCalledTimes(2);
    expect(users).toHaveBeenCalledTimes(1);
  });

  it('does not cache a failed source', () => {
    const factory = jasmine
      .createSpy('factory')
      .and.returnValues(
        defer(() => throwError(() => new Error('boom'))),
        of('ok'),
      );

    service.get('k', factory).subscribe({ error: () => undefined });
    service.get('k', factory).subscribe();

    expect(factory).toHaveBeenCalledTimes(2);
  });
});
