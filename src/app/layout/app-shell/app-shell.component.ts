import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { DsTabBarComponent } from '../../shared/components/ds-tab-bar/ds-tab-bar.component';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { TopBarComponent } from '../top-bar/top-bar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, DsTabBarComponent, SideNavComponent, TopBarComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  private router = inject(Router);

  // Sub-páginas con controles inferiores propios (builder, workout activo…)
  // declaran data.hideTabBar en sus rutas para no quedar tapadas en móvil.
  readonly showTabBar = signal(!this.routeHidesTabBar());

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.showTabBar.set(!this.routeHidesTabBar()));
  }

  private routeHidesTabBar(): boolean {
    let route: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    while (route) {
      if (route.data['hideTabBar']) return true;
      route = route.firstChild;
    }
    return false;
  }
}
