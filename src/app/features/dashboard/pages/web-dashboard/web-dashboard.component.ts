import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DsBadgeComponent } from '../../../../shared/components/ds-badge/ds-badge.component';
import { DsButtonComponent } from '../../../../shared/components/ds-button/ds-button.component';
import { DsCardComponent } from '../../../../shared/components/ds-card/ds-card.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { DsLogoComponent } from '../../../../shared/components/ds-logo/ds-logo.component';

@Component({
  selector: 'app-web-dashboard',
  standalone: true,
  imports: [CommonModule, DsBadgeComponent, DsButtonComponent, DsCardComponent, DsIconComponent, DsLogoComponent],
  templateUrl: './web-dashboard.component.html',
  styleUrl: './web-dashboard.component.scss',
})
export class WebDashboardComponent {
  navItems = [
    { icon: 'home',     label: 'Inicio',      active: true },
    { icon: 'dumbbell', label: 'Rutinas',      active: false },
    { icon: 'calendar', label: 'Historial',    active: false },
    { icon: 'chart',    label: 'Progreso',     active: false },
    { icon: 'trophy',   label: 'Récords',      active: false },
    { icon: 'ruler',    label: 'Medidas',      active: false },
  ];

  exerciseTags = ['Press banca', 'Press inclinado', 'Aperturas', 'Press militar', '+2'];

  weekDays = ['L','M','X','J','V','S','D'];

  volumeBars = [14.2, 15.8, 16.1, 14.9, 17.2, 15.6, 16.8, 17.5, 18.1, 17.9, 16.4, 18.4];

  recentPRs = [
    { exercise: 'Press banca', weight: '92.5 kg', date: 'Hace 2d' },
    { exercise: 'Peso muerto',  weight: '145 kg',  date: 'Hace 5d' },
    { exercise: 'Sentadilla',   weight: '120 kg',  date: 'Hace 1s' },
  ];

  recentWorkouts = [
    { date: 'Hoy 18:42',      name: 'Empuje · Pecho y tríceps', vol: '4.2t', sets: 18, time: '52m', prs: 1 },
    { date: 'Ayer 07:10',     name: 'Tirón · Espalda y bíceps', vol: '5.1t', sets: 22, time: '58m', prs: 0 },
    { date: 'Dom 11:30',      name: 'Pierna · Cuádriceps',       vol: '6.8t', sets: 20, time: '65m', prs: 2 },
    { date: 'Vie 19:20',      name: 'Empuje · Pecho y tríceps', vol: '4.0t', sets: 18, time: '50m', prs: 0 },
  ];

  barPct(val: number): number {
    return (val / 20) * 100;
  }
}
