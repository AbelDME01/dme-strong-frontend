import { TestBed } from '@angular/core/testing';
import { BP_DESKTOP, BP_TABLET, ViewportService } from './viewport.service';

describe('ViewportService', () => {
  let service: ViewportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewportService);
  });

  it('reflects the real window width on creation', () => {
    const width = window.innerWidth;
    expect(service.isTabletUp()).toBe(width >= BP_TABLET);
    expect(service.isDesktop()).toBe(width >= BP_DESKTOP);
  });

  it('keeps isMobile as the inverse of isTabletUp', () => {
    expect(service.isMobile()).toBe(!service.isTabletUp());
  });

  it('derives a single coherent viewport name', () => {
    const vp = service.viewport();
    if (service.isDesktop()) {
      expect(vp).toBe('desktop');
    } else if (service.isTabletUp()) {
      expect(vp).toBe('tablet');
    } else {
      expect(vp).toBe('mobile');
    }
  });
});
