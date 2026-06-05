import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DsButtonComponent } from '../../../../shared/components/ds-button/ds-button.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { friendlyAuthError } from '../../../../core/auth/auth-error.util';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, DsButtonComponent, DsIconComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  fullName = '';
  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);
  info = signal<string | null>(null);
  submitted = signal(false);

  private emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  get nameInvalid(): boolean {
    return this.submitted() && this.fullName.trim().length === 0;
  }

  get emailInvalid(): boolean {
    return this.submitted() && !this.emailPattern.test(this.email.trim());
  }

  get passwordInvalid(): boolean {
    return this.submitted() && this.password.length < 8;
  }

  async onSubmit(): Promise<void> {
    this.submitted.set(true);
    this.error.set(null);
    this.info.set(null);
    if (this.nameInvalid || this.emailInvalid || this.passwordInvalid) return;
    this.loading.set(true);
    try {
      await this.authService.signUp(
        this.email.trim(),
        this.password,
        this.fullName.trim(),
      );
      // Supabase may require email confirmation before a session exists.
      if (this.authService.isAuthenticated()) {
        await this.router.navigate(['/home']);
      } else {
        this.info.set(
          'Cuenta creada. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.',
        );
      }
    } catch (err: unknown) {
      this.error.set(friendlyAuthError(err));
    } finally {
      this.loading.set(false);
    }
  }
}
