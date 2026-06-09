import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DsBadgeComponent } from '../../../../shared/components/ds-badge/ds-badge.component';
import { DsButtonComponent } from '../../../../shared/components/ds-button/ds-button.component';
import { DsCardComponent } from '../../../../shared/components/ds-card/ds-card.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { WorkoutsService } from '../../../../core/api/workouts.service';
import { RecordsService } from '../../../../core/api/records.service';
import { RoutinesService } from '../../../../core/api/routines.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { PersonalRecord, Workout } from '../../../../core/api/models';

interface PrRow {
  exercise: string;
  weight: string;
  date: string;
}

interface TodayRoutine {
  name: string;
  meta: string;
}

@Component({
  selector: 'app-home-a',
  standalone: true,
  imports: [CommonModule, DsBadgeComponent, DsButtonComponent, DsCardComponent, DsIconComponent],
  templateUrl: './home-a.component.html',
  styleUrl: './home-a.component.scss',
})
export class HomeAComponent implements OnInit {
  private workoutsService = inject(WorkoutsService);
  private recordsService = inject(RecordsService);
  private routinesService = inject(RoutinesService);
  private authService = inject(AuthService);

  days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  dayNumbers = this.buildWeekNumbers();
  todayIndex = (new Date().getDay() + 6) % 7;

  workoutCount = signal<number>(0);
  prs = signal<PrRow[]>([]);
  todayRoutine = signal<TodayRoutine | null>(null);
  weekDone = signal<boolean[]>([false, false, false, false, false, false, false]);

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
    this.workoutsService.getAll().subscribe({
      next: (data) => {
        this.workoutCount.set(data.length);
        this.stats.update((s) => [
          { ...s[0], value: String(data.length) },
          s[1],
          s[2],
        ]);
        this.weekDone.set(this.computeWeekDone(data));
      },
      error: (err) => console.error(err),
    });

    this.recordsService.getAll().subscribe({
      next: (data) => this.prs.set(data.slice(0, 2).map((r) => this.toPrRow(r))),
      error: (err) => console.error(err),
    });

    this.routinesService.getAll().subscribe({
      next: (routines) => {
        if (routines.length > 0) {
          const r = routines[0];
          const count = r.routine_exercises?.length ?? 0;
          this.todayRoutine.set({
            name: r.name,
            meta: `${count} ${count === 1 ? 'ejercicio' : 'ejercicios'}`,
          });
        } else {
          this.todayRoutine.set(null);
        }
      },
      error: (err) => console.error(err),
    });
  }

  /** Marks the weekday (Mon=0..Sun=6) of each workout done in the current week. */
  private computeWeekDone(workouts: Workout[]): boolean[] {
    const done = [false, false, false, false, false, false, false];
    const monday = new Date();
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    for (const w of workouts) {
      const d = new Date(w.started_at);
      const idx = (d.getDay() + 6) % 7;
      if (d >= monday) done[idx] = true;
    }
    return done;
  }

  private toPrRow(r: PersonalRecord): PrRow {
    const exercise = r.exercises?.name ?? r.exercise?.name ?? 'Ejercicio';
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
