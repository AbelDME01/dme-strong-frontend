import { Injectable, computed, signal } from '@angular/core';

// Mantener en sync con src/theme/_breakpoints.scss ($bp-tablet / $bp-desktop)
export const BP_TABLET = 768;
export const BP_DESKTOP = 1024;

export type Viewport = 'mobile' | 'tablet' | 'desktop';

@Injectable({ providedIn: 'root' })
export class ViewportService {
  private readonly tabletMq = window.matchMedia(`(min-width: ${BP_TABLET}px)`);
  private readonly desktopMq = window.matchMedia(`(min-width: ${BP_DESKTOP}px)`);

  readonly isTabletUp = signal(this.tabletMq.matches);
  readonly isDesktop = signal(this.desktopMq.matches);
  readonly isMobile = computed(() => !this.isTabletUp());

  readonly viewport = computed<Viewport>(() =>
    this.isDesktop() ? 'desktop' : this.isTabletUp() ? 'tablet' : 'mobile',
  );

  constructor() {
    this.tabletMq.addEventListener('change', (e) => this.isTabletUp.set(e.matches));
    this.desktopMq.addEventListener('change', (e) => this.isDesktop.set(e.matches));
  }
}
