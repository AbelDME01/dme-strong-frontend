import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DsButtonComponent } from '../../../../shared/components/ds-button/ds-button.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { DsInputComponent } from '../../../../shared/components/ds-input/ds-input.component';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, DsButtonComponent, DsIconComponent, DsInputComponent],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss',
})
export class EditProfileComponent {
  goals = ['Fuerza', 'Hipertrofia', 'Resistencia'];
  selectedGoal = 1;

  experience = ['Principiante', 'Intermedio', 'Avanzado'];
  selectedExp = 2;
}
