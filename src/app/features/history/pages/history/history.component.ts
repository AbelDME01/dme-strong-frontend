import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DsCardComponent } from '../../../../shared/components/ds-card/ds-card.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { DsTabBarComponent } from '../../../../shared/components/ds-tab-bar/ds-tab-bar.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, DsCardComponent, DsIconComponent, DsTabBarComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
})
export class HistoryComponent {
  chartBars = [12, 18, 22, 30, 38, 25, 32, 28, 35, 42, 38, 45, 50, 44];

  workouts = [
    { date: 'Hoy', day: 21, time: '18:42', name: 'Empuje · Pecho y tríceps', vol: '4.2t', sets: 18, dur: '52min', prs: 1 },
    { date: 'Ayer', day: 20, time: '07:10', name: 'Tirón · Espalda', vol: '5.1t', sets: 22, dur: '58min', prs: 0 },
    { date: 'Domingo', day: 19, time: '11:30', name: 'Pierna · Cuádriceps', vol: '6.8t', sets: 20, dur: '65min', prs: 2 },
    { date: 'Viernes', day: 17, time: '19:20', name: 'Empuje · Pecho y tríceps', vol: '4.0t', sets: 18, dur: '50min', prs: 0 },
  ];

  barHeight(val: number): string {
    return `${val}%`;
  }
}
