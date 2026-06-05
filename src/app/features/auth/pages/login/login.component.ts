import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DsLogoComponent } from '../../../../shared/components/ds-logo/ds-logo.component';
import { DsButtonComponent } from '../../../../shared/components/ds-button/ds-button.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { friendlyAuthError } from '../../../../core/auth/auth-error.util';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, DsLogoComponent, DsButtonComponent, DsIconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);

  private emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  get emailInvalid(): boolean {
    return this.submitted() && !this.emailPattern.test(this.email.trim());
  }

  get passwordInvalid(): boolean {
    return this.submitted() && this.password.length === 0;
  }

  async onSubmit(): Promise<void> {
    this.submitted.set(true);
    this.error.set(null);
    if (this.emailInvalid || this.passwordInvalid) return;
    this.loading.set(true);
    try {
      await this.authService.signIn(this.email.trim(), this.password);
      await this.router.navigate(['/home']);
    } catch (err: unknown) {
      this.error.set(friendlyAuthError(err));
    } finally {
      this.loading.set(false);
    }
  }
}
