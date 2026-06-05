import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DsCardComponent } from '../../../../shared/components/ds-card/ds-card.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DsCardComponent, DsIconComponent],
  templateUrl: './exercise-detail.component.html',
  styleUrl: './exercise-detail.component.scss',
})
export class ExerciseDetailComponent {
  pts = [72, 74, 75, 78, 80, 82, 83, 85, 88, 90, 89, 92.5];
  chartW = 340;
  chartH = 140;
  pad = 12;

  get max() { return Math.max(...this.pts); }
  get min() { return Math.min(...this.pts); }

  sx(i: number): number {
    return this.pad + (i / (this.pts.length - 1)) * (this.chartW - 2 * this.pad);
  }

  sy(v: number): number {
    return this.pad + (1 - (v - this.min) / (this.max - this.min)) * (this.chartH - 2 * this.pad);
  }

  get linePath(): string {
    return this.pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${this.sx(i)} ${this.sy(v)}`).join(' ');
  }

  get areaPath(): string {
    const n = this.pts.length;
    return this.linePath + ` L${this.sx(n - 1)} ${this.chartH - this.pad} L${this.sx(0)} ${this.chartH - this.pad} Z`;
  }

  ranges = ['1M', '3M', '6M', '1A'];
  activeRange = 1;

  recentSets = [
    { date: '21 abr', weight: 85,   reps: 7, rpe: 9, pr: false },
    { date: '18 abr', weight: 90,   reps: 4, rpe: 9, pr: true  },
    { date: '14 abr', weight: 85,   reps: 6, rpe: 8, pr: false },
    { date: '11 abr', weight: 82.5, reps: 7, rpe: 8, pr: false },
  ];
}
