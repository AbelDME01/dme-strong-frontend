import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { DsInputComponent } from '../../../../shared/components/ds-input/ds-input.component';
import { UsersService } from '../../../../core/api/users.service';
import { MeasurementsService } from '../../../../core/api/measurements.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { friendlyAuthError } from '../../../../core/auth/auth-error.util';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, DsIconComponent, DsInputComponent],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss',
})
export class EditProfileComponent implements OnInit {
  private usersService = inject(UsersService);
  private measurementsService = inject(MeasurementsService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Form fields backed by signals.
  readonly fullName = signal('');
  readonly heightCm = signal('');
  readonly weightKg = signal('');

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  get email(): string {
    return this.authService.user()?.email ?? '';
  }

  ngOnInit(): void {
    this.usersService.getProfile().subscribe({
      next: (profile) => {
        this.fullName.set(profile.full_name ?? '');
        this.heightCm.set(profile.height_cm != null ? String(profile.height_cm) : '');
        this.loading.set(false);
      },
      error: (err) => {
        // 404 = the user has no profile row yet (e.g. never set a name):
        // start with an empty form instead of surfacing an error.
        if (!(err instanceof HttpErrorResponse && err.status === 404)) {
          this.error.set(friendlyAuthError(err));
        }
        this.loading.set(false);
      },
    });
  }

  save(): void {
    if (this.saving()) return;
    this.error.set(null);

    const height = this.parseNumber(this.heightCm());
    if (height !== undefined && (height < 50 || height > 300)) {
      this.error.set('La altura debe estar entre 50 y 300 cm.');
      return;
    }

    this.saving.set(true);
    this.usersService
      .updateProfile({
        fullName: this.fullName().trim() || undefined,
        heightCm: height,
      })
      .subscribe({
        next: () => this.afterProfileSaved(),
        error: (err) => {
          this.error.set(friendlyAuthError(err));
          this.saving.set(false);
        },
      });
  }

  /** Optionally records today's weight as a new measurement, then navigates back. */
  private afterProfileSaved(): void {
    const weight = this.parseNumber(this.weightKg());
    if (weight === undefined || weight <= 0) {
      this.done();
      return;
    }
    this.measurementsService.create({ weightKg: weight }).subscribe({
      next: () => this.done(),
      // Profile already saved; surface measurement failure but don't lose the profile update.
      error: (err) => {
        this.error.set(friendlyAuthError(err));
        this.saving.set(false);
      },
    });
  }

  private done(): void {
    this.saving.set(false);
    this.router.navigate(['/profile']);
  }

  private parseNumber(raw: string): number | undefined {
    const value = raw.trim().replace(',', '.');
    if (!value) return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
}
