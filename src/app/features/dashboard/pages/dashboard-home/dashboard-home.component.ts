import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { DsBadgeComponent } from '../../../../shared/components/ds-badge/ds-badge.component';
import { DsButtonComponent } from '../../../../shared/components/ds-button/ds-button.component';
import { DsCardComponent } from '../../../../shared/components/ds-card/ds-card.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { WorkoutsService } from '../../../../core/api/workouts.service';
import { RecordsService } from '../../../../core/api/records.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Workout, PersonalRecord } from '../../../../core/api/models';
import { workoutVolume } from '../../../../core/api/stats.util';

interface PrRow { exercise: string; weight: string; date: string }
interface WorkoutRow { date: string; name: string; vol: string; sets: number; time: string; prs: number }

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, DsBadgeComponent, DsButtonComponent, DsCardComponent, DsIconComponent],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss',
})
export class DashboardHomeComponent implements OnInit {
  private workoutsService = inject(WorkoutsService);
  private recordsService = inject(RecordsService);
  private authService = inject(AuthService);

  exerciseTags = ['Press banca', 'Press inclinado', 'Aperturas', 'Press militar', '+2'];
  weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  // --- Live data ---
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly volumeBars = signal<number[]>([]);
  readonly recentPRs = signal<PrRow[]>([]);
  readonly recentWorkouts = signal<WorkoutRow[]>([]);

  readonly displayName = computed(() => {
    const meta = this.authService.user()?.user_metadata as { full_name?: string } | undefined;
    const name = meta?.full_name ?? this.authService.user()?.email?.split('@')[0] ?? '';
    return name ? name.split(' ')[0] : 'atleta';
  });

  readonly todayLabel = computed(() => {
    const label = new Date().toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  });

  private maxBar = 1;

  ngOnInit(): void {
    forkJoin({
      workouts: this.workoutsService.getRecentWithSets(12),
      records: this.recordsService.getAll(),
    }).subscribe({
      next: ({ workouts, records }) => {
        const sorted = [...workouts].sort(
          (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
        );
        this.recentWorkouts.set(sorted.slice(0, 6).map((w) => this.toWorkoutRow(w)));
        this.buildVolumeBars(sorted);
        this.recentPRs.set(this.toPrRows(records));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudieron cargar los datos del panel.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  /** Volume (in tonnes) of the last 12 workouts, oldest → newest, for the bar chart. */
  private buildVolumeBars(sortedDesc: Workout[]): void {
    const bars = sortedDesc
      .slice(0, 12)
      .reverse()
      .map((w) => +(workoutVolume(w.workout_sets) / 1000).toFixed(1));
    this.maxBar = Math.max(1, ...bars);
    this.volumeBars.set(bars);
  }

  private toWorkoutRow(w: Workout): WorkoutRow {
    const date = new Date(w.started_at);
    return {
      date: this.relativeDateTime(date),
      name: w.name,
      vol: this.formatTonnes(workoutVolume(w.workout_sets)),
      sets: w.workout_sets?.length ?? 0,
      time: w.duration_seconds ? `${Math.round(w.duration_seconds / 60)}m` : '—',
      prs: 0,
    };
  }

  private toPrRows(records: PersonalRecord[]): PrRow[] {
    return [...records]
      .sort((a, b) => new Date(b.achieved_at).getTime() - new Date(a.achieved_at).getTime())
      .slice(0, 4)
      .map((r) => ({
        exercise: r.exercises?.name ?? r.exercise?.name ?? 'Ejercicio',
        weight: `${r.value} ${r.unit ?? 'kg'}`,
        date: this.relativeDate(new Date(r.achieved_at)),
      }));
  }

  private formatTonnes(kg: number): string {
    return kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${Math.round(kg)} kg`;
  }

  private relativeDate(date: Date): string {
    const diff = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (diff <= 0) return 'Hoy';
    if (diff === 1) return 'Hace 1d';
    if (diff < 7) return `Hace ${diff}d`;
    return `Hace ${Math.floor(diff / 7)}s`;
  }

  private relativeDateTime(date: Date): string {
    const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `${this.relativeDate(date)} ${time}`;
  }

  barPct(val: number): number {
    return (val / this.maxBar) * 100;
  }
}
