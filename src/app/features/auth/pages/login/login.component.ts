import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DsLogoComponent } from '../../../../shared/components/ds-logo/ds-logo.component';
import { DsInputComponent } from '../../../../shared/components/ds-input/ds-input.component';
import { DsButtonComponent } from '../../../../shared/components/ds-button/ds-button.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, DsLogoComponent, DsInputComponent, DsButtonComponent, DsIconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {}
