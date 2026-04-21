import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DsBadgeComponent } from '../../../../shared/components/ds-badge/ds-badge.component';
import { DsButtonComponent } from '../../../../shared/components/ds-button/ds-button.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';

@Component({
  selector: 'app-builder',
  standalone: true,
  imports: [CommonModule, RouterLink, DsBadgeComponent, DsButtonComponent, DsIconComponent],
  templateUrl: './builder.component.html',
  styleUrl: './builder.component.scss',
})
export class BuilderComponent {
  exercises = [
    { name: 'Press banca', sets: 4, muscle: 'Pecho' },
    { name: 'Press inclinado con mancuernas', sets: 4, muscle: 'Pecho' },
    { name: 'Aperturas en polea', sets: 3, muscle: 'Pecho' },
    { name: 'Press militar', sets: 3, muscle: 'Hombros' },
    { name: 'Fondos en paralelas', sets: 3, muscle: 'Tríceps' },
    { name: 'Extensión de tríceps', sets: 3, muscle: 'Tríceps' },
  ];
}
