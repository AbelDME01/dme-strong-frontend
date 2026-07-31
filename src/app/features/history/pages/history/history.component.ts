import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DsCardComponent } from '../../../../shared/components/ds-card/ds-card.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { DsSkeletonComponent } from '../../../../shared/components/ds-skeleton/ds-skeleton.component';
import { WorkoutsService } from '../../../../core/api/workouts.service';
import { Workout, WorkoutSet } from '../../../../core/api/models';

/** One exercise performed in a workout, with its sets as "peso×reps" chips. */
interface ExerciseRow {
  name: string;
  sets: string[];
}

interface WorkoutRow {
  id: string;
  date: string;
  day: number;
  month: string;
  time: string;
  name: string;
  vol: string;
  sets: number;
  dur: string;
  prs: number;
  exercises: ExerciseRow[];
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, DsCardComponent, DsIconComponent, DsSkeletonComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
})
export class HistoryComponent implements OnInit {
  private workoutsService = inject(WorkoutsService);
  private router = inject(Router);

  rawWorkouts = signal<Workout[]>([]);
  loading = signal(false);
  showFilters = signal(false);
  activePeriod = signal<'all' | 'week' | 'month' | '3m'>('all');

  /** Last 14 weeks of workout counts, derived from real data. */
  chartBars = computed<number[]>(() => {
    const workouts = this.rawWorkouts();
    const weeks: number[] = new Array(14).fill(0);
    const now = Date.now();
    for (const w of workouts) {
      const msAgo = now - new Date(w.started_at).getTime();
      const weeksAgo = Math.floor(msAgo / (7 * 86400000));
      if (weeksAgo >= 0 && weeksAgo < 14) {
        weeks[13 - weeksAgo]++;
      }
    }
    return weeks;
  });

  readonly periods: { key: 'all' | 'week' | 'month' | '3m'; label: string }[] = [
    { key: 'all', label: 'Todo' },
    { key: 'week', label: 'Semana' },
    { key: 'month', label: 'Mes' },
    { key: '3m', label: '3 meses' },
  ];

  workouts = computed<WorkoutRow[]>(() => {
    const period = this.activePeriod();
    let list = this.rawWorkouts();
    if (period !== 'all') {
      const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
      const cutoff = Date.now() - days * 86400000;
      list = list.filter((w) => new Date(w.started_at).getTime() >= cutoff);
    }
    return list.map((w) => this.toRow(w));
  });

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
    const exercises = this.toExerciseRows(w.workout_sets ?? []);
    return { id: w.id, date: dateLabel, day, month, time, name: w.name, vol, sets, dur, prs: 0, exercises };
  }

  /** Groups the workout sets by exercise, preserving set order within each one. */
  private toExerciseRows(sets: WorkoutSet[]): ExerciseRow[] {
    const byExercise = new Map<string, { name: string; sets: WorkoutSet[] }>();
    for (const s of sets) {
      const entry = byExercise.get(s.exercise_id) ?? {
        name: s.exercise?.name ?? 'Ejercicio',
        sets: [],
      };
      entry.sets.push(s);
      byExercise.set(s.exercise_id, entry);
    }
    return [...byExercise.values()].map((e) => ({
      name: e.name,
      sets: e.sets
        .sort((a, b) => a.set_number - b.set_number)
        .map((s) => this.setLabel(s)),
    }));
  }

  /** "80×8" (kg × reps); falls back gracefully when one of the two is missing. */
  private setLabel(s: WorkoutSet): string {
    const weight = s.weight_kg != null ? `${s.weight_kg}kg` : null;
    const reps = s.reps != null ? `${s.reps}` : null;
    if (weight && reps) return `${weight}×${reps}`;
    return weight ?? (reps ? `${reps} reps` : '—');
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

  openWorkout(id: string): void {
    this.router.navigate(['/history/workout', id]);
  }

  barHeight(val: number): string {
    if (val === 0) return '8%';
    const max = Math.max(...this.chartBars(), 1);
    const pct = Math.round((val / max) * 100);
    return `${Math.max(pct, 16)}%`;
  }
}
