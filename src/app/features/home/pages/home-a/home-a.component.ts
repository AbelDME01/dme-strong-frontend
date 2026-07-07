import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DsBadgeComponent } from '../../../../shared/components/ds-badge/ds-badge.component';
import { DsButtonComponent } from '../../../../shared/components/ds-button/ds-button.component';
import { DsCardComponent } from '../../../../shared/components/ds-card/ds-card.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { DashboardHomeComponent } from '../../../dashboard/pages/dashboard-home/dashboard-home.component';
import { ViewportService } from '../../../../core/viewport/viewport.service';
import { WorkoutsService } from '../../../../core/api/workouts.service';
import { RecordsService } from '../../../../core/api/records.service';
import { RoutinesService } from '../../../../core/api/routines.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { PersonalRecord, Workout } from '../../../../core/api/models';
import { weekVolume, computeWeekDone, streakDays } from '../../../../core/api/stats.util';

interface PrRow {
  exercise: string;
  weight: string;
  date: string;
}

interface TodayRoutine {
  routineId: string;
  name: string;
  meta: string;
}

@Component({
  selector: 'app-home-a',
  standalone: true,
  imports: [CommonModule, DsBadgeComponent, DsButtonComponent, DsCardComponent, DsIconComponent, DashboardHomeComponent],
  templateUrl: './home-a.component.html',
  styleUrl: './home-a.component.scss',
})
export class HomeAComponent implements OnInit {
  readonly vp = inject(ViewportService);

  private workoutsService = inject(WorkoutsService);
  private recordsService = inject(RecordsService);
  private routinesService = inject(RoutinesService);
  private authService = inject(AuthService);
  private router = inject(Router);

  days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  dayNumbers = this.buildWeekNumbers();
  todayIndex = (new Date().getDay() + 6) % 7;

  prs = signal<PrRow[]>([]);
  todayRoutine = signal<TodayRoutine | null>(null);
  weekDone = signal<boolean[]>([false, false, false, false, false, false, false]);
  starting = signal(false);
  apiError = signal<string | null>(null);

  stats = signal([
    { label: 'Entrenamientos', value: '0', trend: '' },
    { label: 'Volumen sem.', value: '—', trend: '' },
    { label: 'Racha', value: '—', trend: 'días' },
  ]);

  get today(): string {
    return new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
  }

  get userName(): string {
    const user = this.authService.user();
    return user?.user_metadata?.['full_name']?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Hola';
  }

  ngOnInit(): void {
    // The list endpoint omits workout_sets, so volume would always be 0:
    // hydrate the recent workouts to compute the weekly volume correctly.
    this.workoutsService.getRecentWithSets().subscribe({
      next: (data) => this.applyWorkoutStats(data),
      error: () => this.apiError.set('No se pudo cargar el historial de entrenamientos.'),
    });

    this.recordsService.getAll().subscribe({
      next: (data) => this.prs.set(data.slice(0, 2).map((r) => this.toPrRow(r))),
      error: () => { /* PRs are non-critical; silently skip */ },
    });

    this.routinesService.getAll().subscribe({
      next: (routines) => {
        if (routines.length > 0) {
          const r = routines[0];
          const count = r.routine_exercises?.length ?? 0;
          this.todayRoutine.set({
            routineId: r.id,
            name: r.name,
            meta: `${count} ${count === 1 ? 'ejercicio' : 'ejercicios'}`,
          });
        } else {
          this.todayRoutine.set(null);
        }
      },
      error: () => this.apiError.set('No se pudieron cargar tus rutinas.'),
    });
  }

  startWorkout(): void {
    const routine = this.todayRoutine();
    if (!routine || this.starting()) return;
    this.starting.set(true);
    this.workoutsService.create({ name: routine.name, routineId: routine.routineId }).subscribe({
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
    const routine = this.todayRoutine();
    if (!routine) return;
    this.router.navigate(['/routines/builder'], { queryParams: { id: routine.routineId } });
  }

  createRoutine(): void {
    this.router.navigate(['/routines/builder']);
  }

  goToHistory(): void {
    this.router.navigate(['/history']);
  }

  private applyWorkoutStats(data: Workout[]): void {
    const vol = weekVolume(data);
    const volLabel = vol >= 1000 ? `${(vol / 1000).toFixed(1)}t` : `${Math.round(vol)} kg`;
    const streak = streakDays(data);
    this.weekDone.set(computeWeekDone(data));
    this.stats.set([
      { label: 'Entrenamientos', value: String(data.length), trend: '' },
      { label: 'Volumen sem.', value: volLabel, trend: '' },
      { label: 'Racha', value: String(streak), trend: 'días' },
    ]);
  }

  private toPrRow(r: PersonalRecord): PrRow {
    const exercise = r.exercises?.name ?? r.exercise?.name ?? '—';
    const weight = `${r.value} ${r.unit}`;
    const date = this.relativeDate(new Date(r.achieved_at));
    return { exercise, weight, date };
  }

  private relativeDate(date: Date): string {
    const diff = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    return `Hace ${diff} días`;
  }

  private buildWeekNumbers(): number[] {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.getDate();
    });
  }
}
