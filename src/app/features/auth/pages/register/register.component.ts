import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DsInputComponent } from '../../../../shared/components/ds-input/ds-input.component';
import { DsButtonComponent } from '../../../../shared/components/ds-button/ds-button.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, DsInputComponent, DsButtonComponent, DsIconComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {}
