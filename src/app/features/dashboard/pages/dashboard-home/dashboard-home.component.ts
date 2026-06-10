import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DsBadgeComponent } from '../../../../shared/components/ds-badge/ds-badge.component';
import { DsButtonComponent } from '../../../../shared/components/ds-button/ds-button.component';
import { DsCardComponent } from '../../../../shared/components/ds-card/ds-card.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { WorkoutsService } from '../../../../core/api/workouts.service';
import { RecordsService } from '../../../../core/api/records.service';
import { RoutinesService } from '../../../../core/api/routines.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Workout, PersonalRecord, Routine } from '../../../../core/api/models';
import {
  workoutVolume,
  weekVolume,
  computeWeekDone,
  streakDays,
} from '../../../../core/api/stats.util';

export type DateRange = 'week' | 'month' | 'all';

interface PrRow { exercise: string; weight: string; date: string }
interface WorkoutRow { id: string; date: string; name: string; vol: string; sets: number; time: string }

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, FormsModule, DsBadgeComponent, DsButtonComponent, DsCardComponent, DsIconComponent],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss',
})
export class DashboardHomeComponent implements OnInit {
  private workoutsService = inject(WorkoutsService);
  private recordsService = inject(RecordsService);
  private routinesService = inject(RoutinesService);
  private authService = inject(AuthService);
  private router = inject(Router);

  weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly starting = signal(false);

  readonly volumeBars = signal<number[]>([]);
  readonly recentPRs = signal<PrRow[]>([]);
  readonly allWorkouts = signal<Workout[]>([]);
  readonly todayRoutine = signal<Routine | null>(null);

  readonly dateRange = signal<DateRange>('week');
  readonly nameFilter = signal('');
  readonly showRangePicker = signal(false);
  readonly showFilterPanel = signal(false);

  private maxBar = 1;

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

  readonly streak = computed(() => streakDays(this.allWorkouts()));
  readonly todayWeekIndex = (new Date().getDay() + 6) % 7;

  readonly weekDone = computed(() => computeWeekDone(this.allWorkouts()));

  readonly filteredWorkouts = computed<WorkoutRow[]>(() => {
    const range = this.dateRange();
    const filter = this.nameFilter().toLowerCase().trim();
    const now = Date.now();
    const cutoff =
      range === 'week' ? now - 7 * 86400000 :
      range === 'month' ? now - 30 * 86400000 :
      0;
    return this.allWorkouts()
      .filter((w) => new Date(w.started_at).getTime() >= cutoff)
      .filter((w) => !filter || w.name.toLowerCase().includes(filter))
      .slice(0, 10)
      .map((w) => this.toWorkoutRow(w));
  });

  readonly chartBars = computed<number[]>(() => {
    const range = this.dateRange();
    const now = Date.now();
    const cutoff =
      range === 'week' ? now - 7 * 86400000 :
      range === 'month' ? now - 30 * 86400000 :
      0;
    const bars = [...this.allWorkouts()]
      .filter((w) => new Date(w.started_at).getTime() >= cutoff)
      .reverse()
      .slice(0, 12)
      .map((w) => +(workoutVolume(w.workout_sets) / 1000).toFixed(1));
    this.maxBar = Math.max(1, ...bars);
    return bars;
  });

  readonly weekVolumeLabel = computed(() => {
    const vol = weekVolume(this.allWorkouts());
    return vol >= 1000 ? `${(vol / 1000).toFixed(1)} t` : `${Math.round(vol)} kg`;
  });

  readonly todayExerciseTags = computed(() => {
    const r = this.todayRoutine();
    if (!r?.routine_exercises?.length) return [];
    const names = r.routine_exercises
      .slice()
      .sort((a, b) => a.order_index - b.order_index)
      .map((re) => re.exercise?.name)
      .filter((n): n is string => !!n);
    if (names.length <= 4) return names;
    return [...names.slice(0, 4), `+${names.length - 4}`];
  });

  ngOnInit(): void {
    forkJoin({
      workouts: this.workoutsService.getRecentWithSets(50),
      records: this.recordsService.getAll(),
      routines: this.routinesService.getAll(),
    }).subscribe({
      next: ({ workouts, records, routines }) => {
        const sorted = [...workouts].sort(
          (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
        );
        this.allWorkouts.set(sorted);
        this.recentPRs.set(this.toPrRows(records));
        this.todayRoutine.set(routines[0] ?? null);
        this.buildVolumeBars(sorted);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudieron cargar los datos del panel.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  startWorkout(): void {
    const r = this.todayRoutine();
    if (!r || this.starting()) return;
    this.starting.set(true);
    this.workoutsService.create({ name: r.name, routineId: r.id }).subscribe({
      next: (workout) => {
        this.starting.set(false);
        this.router.navigate(['/workout/active'], { queryParams: { id: workout.id } });
      },
      error: (err) => {
        this.starting.set(false);
        console.error(err);
      },
    });
  }

  editRoutine(): void {
    const r = this.todayRoutine();
    if (!r) return;
    this.router.navigate(['/routines/builder'], { queryParams: { id: r.id } });
  }

  createRoutine(): void {
    this.router.navigate(['/routines/builder']);
  }

  goToHistory(): void {
    this.router.navigate(['/history']);
  }

  goToWorkout(row: WorkoutRow): void {
    this.router.navigate(['/history']);
  }

  setRange(range: DateRange): void {
    this.dateRange.set(range);
    this.showRangePicker.set(false);
  }

  toggleRangePicker(): void {
    this.showRangePicker.update((v) => !v);
    this.showFilterPanel.set(false);
  }

  toggleFilterPanel(): void {
    this.showFilterPanel.update((v) => !v);
    this.showRangePicker.set(false);
  }

  readonly rangeOptions: DateRange[] = ['week', 'month', 'all'];

  rangeLabelMap: Record<DateRange, string> = {
    week: 'Esta semana',
    month: 'Este mes',
    all: 'Todo',
  };

  barPct(val: number): number {
    return (val / this.maxBar) * 100;
  }

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
      id: w.id,
      date: this.relativeDateTime(date),
      name: w.name,
      vol: this.formatTonnes(workoutVolume(w.workout_sets)),
      sets: w.workout_sets?.length ?? 0,
      time: w.duration_seconds ? `${Math.round(w.duration_seconds / 60)}m` : '—',
    };
  }

  private toPrRows(records: PersonalRecord[]): PrRow[] {
    return [...records]
      .sort((a, b) => new Date(b.achieved_at).getTime() - new Date(a.achieved_at).getTime())
      .slice(0, 4)
      .map((r) => ({
        exercise: r.exercises?.name ?? r.exercise?.name ?? '—',
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
}
