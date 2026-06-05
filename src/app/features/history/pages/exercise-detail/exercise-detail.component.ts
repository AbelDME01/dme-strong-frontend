import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DsCardComponent } from '../../../../shared/components/ds-card/ds-card.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { WorkoutsService } from '../../../../core/api/workouts.service';
import { RecordsService } from '../../../../core/api/records.service';
import { ExercisesService } from '../../../../core/api/exercises.service';
import { Workout, PersonalRecord } from '../../../../core/api/models';
import {
  exerciseProgression,
  recentSetsForExercise,
  ProgressionPoint,
} from '../../../../core/api/stats.util';

interface RecentSetRow {
  date: string;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  pr: boolean;
}

/** Range filters in months; null = all time. */
const RANGE_MONTHS: (number | null)[] = [1, 3, 6, null];

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DsCardComponent, DsIconComponent],
  templateUrl: './exercise-detail.component.html',
  styleUrl: './exercise-detail.component.scss',
})
export class ExerciseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private workoutsService = inject(WorkoutsService);
  private recordsService = inject(RecordsService);
  private exercisesService = inject(ExercisesService);

  // Chart geometry (unchanged from the original design).
  chartW = 340;
  chartH = 140;
  pad = 12;

  ranges = ['1M', '3M', '6M', '1A'];
  readonly activeRange = signal(3);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly exerciseName = signal('Ejercicio');

  private readonly exerciseId = signal<string>('');
  private readonly progression = signal<ProgressionPoint[]>([]);
  private readonly allRecentSets = signal<RecentSetRow[]>([]);
  private readonly records = signal<PersonalRecord[]>([]);

  /** Progression points filtered by the active range, as plain weight numbers. */
  readonly pts = computed<number[]>(() => {
    const months = RANGE_MONTHS[this.activeRange()];
    let points = this.progression();
    if (months !== null) {
      const cutoff = Date.now() - months * 30 * 86400000;
      points = points.filter((p) => new Date(p.date).getTime() >= cutoff);
    }
    return points.map((p) => p.weightKg);
  });

  readonly recentSets = computed(() => this.allRecentSets().slice(0, 6));

  /** Best weight record for the exercise (heaviest), or null. */
  readonly prValue = computed<number | null>(() => {
    const weights = this.records()
      .filter((r) => r.exercise_id === this.exerciseId())
      .map((r) => r.value);
    if (weights.length) return Math.max(...weights);
    const prog = this.progression();
    return prog.length ? Math.max(...prog.map((p) => p.weightKg)) : null;
  });

  readonly hasChart = computed(() => this.pts().length >= 2);

  get max(): number { return Math.max(...this.pts()); }
  get min(): number { return Math.min(...this.pts()); }
  get lastPt(): number { const p = this.pts(); return p[p.length - 1]; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.exerciseId.set(id);

    forkJoin({
      exercise: this.exercisesService.getById(id),
      workouts: this.workoutsService.getRecentWithSets(),
      records: this.recordsService.getAll(),
    }).subscribe({
      next: ({ exercise, workouts, records }) => {
        this.exerciseName.set(exercise?.name ?? 'Ejercicio');
        this.records.set(records);
        this.progression.set(exerciseProgression(workouts, id));
        this.allRecentSets.set(this.buildRecentSets(workouts, id, records));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudo cargar el ejercicio.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  private buildRecentSets(
    workouts: Workout[],
    exerciseId: string,
    records: PersonalRecord[],
  ): RecentSetRow[] {
    const prWeight = Math.max(
      0,
      ...records.filter((r) => r.exercise_id === exerciseId).map((r) => r.value),
    );
    return recentSetsForExercise(workouts, exerciseId, 10).map((s) => ({
      date: this.formatDate(s.date),
      weight: s.weightKg,
      reps: s.reps,
      rpe: s.rpe,
      pr: prWeight > 0 && s.weightKg != null && s.weightKg >= prWeight,
    }));
  }

  private formatDate(iso: string): string {
    return new Date(iso)
      .toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
      .replace('.', '');
  }

  // --- Chart scaling (operates on the filtered pts) ---
  sx(i: number): number {
    const n = this.pts().length;
    if (n <= 1) return this.pad;
    return this.pad + (i / (n - 1)) * (this.chartW - 2 * this.pad);
  }

  sy(v: number): number {
    const span = this.max - this.min;
    if (span === 0) return this.chartH / 2;
    return this.pad + (1 - (v - this.min) / span) * (this.chartH - 2 * this.pad);
  }

  get linePath(): string {
    return this.pts()
      .map((v, i) => `${i === 0 ? 'M' : 'L'}${this.sx(i)} ${this.sy(v)}`)
      .join(' ');
  }

  get areaPath(): string {
    const n = this.pts().length;
    if (n < 2) return '';
    return (
      this.linePath +
      ` L${this.sx(n - 1)} ${this.chartH - this.pad} L${this.sx(0)} ${this.chartH - this.pad} Z`
    );
  }
}
