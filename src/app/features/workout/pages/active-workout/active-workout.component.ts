import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DsButtonComponent } from '../../../../shared/components/ds-button/ds-button.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';

@Component({
  selector: 'app-active-workout',
  standalone: true,
  imports: [CommonModule, RouterLink, DsButtonComponent, DsIconComponent],
  templateUrl: './active-workout.component.html',
  styleUrl: './active-workout.component.scss',
})
export class ActiveWorkoutComponent {
  sets = [
    { n: 1, weight: 70, reps: 10, rpe: 7,    done: true,  active: false },
    { n: 2, weight: 80, reps: 8,  rpe: 8,    done: true,  active: false },
    { n: 3, weight: 85, reps: 7,  rpe: 9,    done: false, active: true  },
    { n: 4, weight: 85, reps: 6,  rpe: null, done: false, active: false },
  ];

  rpeColor(rpe: number | null): string {
    if (!rpe) return 'var(--dme-text-mute)';
    if (rpe >= 9) return 'var(--dme-coral)';
    if (rpe >= 8) return 'var(--dme-amber)';
    return 'var(--dme-mint)';
  }
}
