import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DsIconComponent } from '../../shared/components/ds-icon/ds-icon.component';
import { DsLogoComponent } from '../../shared/components/ds-logo/ds-logo.component';
import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, DsIconComponent, DsLogoComponent],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
})
export class SideNavComponent {
  private authService = inject(AuthService);

  navItems: NavItem[] = [
    { icon: 'home',     label: 'Inicio',    route: '/home' },
    { icon: 'dumbbell', label: 'Rutinas',   route: '/routines' },
    { icon: 'calendar', label: 'Historial', route: '/history' },
    { icon: 'user',     label: 'Perfil',    route: '/profile' },
  ];

  readonly displayName = computed(() => {
    const meta = this.authService.user()?.user_metadata as { full_name?: string } | undefined;
    const name = meta?.full_name ?? this.authService.user()?.email?.split('@')[0] ?? '';
    return name || 'Atleta';
  });

  readonly email = computed(() => this.authService.user()?.email ?? '');

  readonly avatarInitial = computed(() => (this.displayName().charAt(0) || 'A').toUpperCase());
}
