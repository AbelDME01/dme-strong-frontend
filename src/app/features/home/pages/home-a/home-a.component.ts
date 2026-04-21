import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DsBadgeComponent } from '../../../../shared/components/ds-badge/ds-badge.component';
import { DsButtonComponent } from '../../../../shared/components/ds-button/ds-button.component';
import { DsCardComponent } from '../../../../shared/components/ds-card/ds-card.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { DsTabBarComponent } from '../../../../shared/components/ds-tab-bar/ds-tab-bar.component';

@Component({
  selector: 'app-home-a',
  standalone: true,
  imports: [CommonModule, DsBadgeComponent, DsButtonComponent, DsCardComponent, DsIconComponent, DsTabBarComponent],
  templateUrl: './home-a.component.html',
  styleUrl: './home-a.component.scss',
})
export class HomeAComponent {
  stats = [
    { label: 'Entrenamientos', value: '47', trend: '+3' },
    { label: 'Volumen sem.', value: '18.4t', trend: '+12%' },
    { label: 'Racha', value: '12', trend: 'días' },
  ];

  days = ['L','M','X','J','V','S','D'];
  dayNumbers = [18,19,20,21,22,23,24];

  prs = [
    { exercise: 'Press banca', weight: '92.5 kg', date: 'Hace 2 días' },
    { exercise: 'Peso muerto',  weight: '145 kg',  date: 'Hace 5 días' },
  ];
}
