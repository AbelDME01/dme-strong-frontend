import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DsBadgeComponent } from '../../../../shared/components/ds-badge/ds-badge.component';
import { DsButtonComponent } from '../../../../shared/components/ds-button/ds-button.component';
import { DsCardComponent } from '../../../../shared/components/ds-card/ds-card.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { DsTabBarComponent } from '../../../../shared/components/ds-tab-bar/ds-tab-bar.component';
import { UsersService } from '../../../../core/api/users.service';
import { MeasurementsService } from '../../../../core/api/measurements.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { UserProfile, Measurement } from '../../../../core/api/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, DsBadgeComponent, DsButtonComponent, DsCardComponent, DsIconComponent, DsTabBarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private usersService = inject(UsersService);
  private measurementsService = inject(MeasurementsService);
  private authService = inject(AuthService);
  private router = inject(Router);

  profile = signal<UserProfile | null>(null);
  latestMeasurement = signal<Measurement | null>(null);

  get userEmail(): string {
    return this.authService.user()?.email ?? '';
  }

  get displayName(): string {
    return this.profile()?.full_name ?? this.userEmail.split('@')[0];
  }

  get avatarLetter(): string {
    return this.displayName.charAt(0).toUpperCase();
  }

  get bodyStats(): { label: string; value: string; unit: string; trend: string | null }[] {
    const m = this.latestMeasurement();
    const p = this.profile();
    return [
      { label: 'Peso', value: m?.weight_kg?.toFixed(1) ?? '—', unit: 'kg', trend: null },
      { label: 'Altura', value: p?.height_cm?.toFixed(0) ?? '—', unit: 'cm', trend: null },
      { label: '% Grasa', value: m?.body_fat_percentage?.toFixed(1) ?? '—', unit: '%', trend: null },
    ];
  }

  accountMenu = [
    { icon: 'user', label: 'Editar perfil', route: '/profile/edit', right: null },
    { icon: 'ruler', label: 'Medidas corporales', route: null, right: null },
    { icon: 'trophy', label: 'Mis récords', route: null, right: null },
    { icon: 'dumbbell', label: 'Equipamiento', route: null, right: null },
  ];

  prefsMenu = [
    { icon: 'bell', label: 'Notificaciones', right: null },
    { icon: 'weight', label: 'Unidades', right: 'kg · cm' },
    { icon: 'note', label: 'Idioma', right: 'Español' },
  ];

  ngOnInit(): void {
    this.usersService.getProfile().subscribe({
      next: (p) => this.profile.set(p),
      error: (err) => console.error(err),
    });

    this.measurementsService.getAll().subscribe({
      next: (data) => {
        if (data.length > 0) {
          const sorted = [...data].sort(
            (a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime()
          );
          this.latestMeasurement.set(sorted[0]);
        }
      },
      error: (err) => console.error(err),
    });
  }

  async signOut(): Promise<void> {
    await this.authService.signOut();
    await this.router.navigate(['/auth/login']);
  }
}
