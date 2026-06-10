import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DsCardComponent } from '../../../../shared/components/ds-card/ds-card.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { WorkoutsService } from '../../../../core/api/workouts.service';
import { Workout } from '../../../../core/api/models';

interface WorkoutRow {
  date: string;
  day: number;
  month: string;
  time: string;
  name: string;
  vol: string;
  sets: number;
  dur: string;
  prs: number;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, DsCardComponent, DsIconComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
})
export class HistoryComponent implements OnInit {
  private workoutsService = inject(WorkoutsService);

  chartBars = [12, 18, 22, 30, 38, 25, 32, 28, 35, 42, 38, 45, 50, 44];

  rawWorkouts = signal<Workout[]>([]);
  loading = signal(false);

  workouts = computed<WorkoutRow[]>(() =>
    this.rawWorkouts().map((w) => this.toRow(w))
  );

  monthLabel = computed(() => {
    const label = new Date().toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  });

  monthCount = computed(() => {
    const now = new Date();
    return this.rawWorkouts().filter((w) => {
      const d = new Date(w.started_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  });

  /** Percentage change vs previous month, or null when not computable. */
  monthTrend = computed<number | null>(() => {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevCount = this.rawWorkouts().filter((w) => {
      const d = new Date(w.started_at);
      return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear();
    }).length;
    if (prevCount === 0) return null;
    return Math.round(((this.monthCount() - prevCount) / prevCount) * 100);
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.workoutsService.getRecentWithSets().subscribe({
      next: (data) => {
        this.rawWorkouts.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  private toRow(w: Workout): WorkoutRow {
    const date = new Date(w.started_at);
    const day = date.getDate();
    const month = date
      .toLocaleDateString('es-ES', { month: 'short' })
      .replace('.', '')
      .toUpperCase();
    const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const dateLabel = this.relativeDate(date);
    const sets = w.workout_sets?.length ?? 0;
    const dur = w.duration_seconds ? `${Math.round(w.duration_seconds / 60)}min` : '—';
    const vol = this.computeVolume(w);
    return { date: dateLabel, day, month, time, name: w.name, vol, sets, dur, prs: 0 };
  }

  private computeVolume(w: Workout): string {
    const sets = w.workout_sets ?? [];
    const total = sets.reduce(
      (sum, s) => sum + (s.weight_kg ?? 0) * (s.reps ?? 0),
      0,
    );
    return total > 0 ? `${Math.round(total)} kg` : '—';
  }

  private relativeDate(date: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[date.getDay()];
  }

  barHeight(val: number): string {
    return `${val}%`;
  }
}
