import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { DsButtonComponent } from '../../../../shared/components/ds-button/ds-button.component';
import { DsSkeletonComponent } from '../../../../shared/components/ds-skeleton/ds-skeleton.component';
import { WorkoutsService } from '../../../../core/api/workouts.service';
import { Workout, WorkoutSet } from '../../../../core/api/models';

/** All the sets of a single exercise within the workout, in set order. */
interface ExerciseGroup {
  exerciseId: string;
  name: string;
  muscleGroup: string | null;
  sets: WorkoutSet[];
}

/** Editable fields of a set, held as strings while the inline form is open. */
interface SetDraft {
  weightKg: string;
  reps: string;
  rpe: string;
  notes: string;
}

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DsIconComponent,
    DsButtonComponent,
    DsSkeletonComponent,
  ],
  templateUrl: './workout-detail.component.html',
  styleUrl: './workout-detail.component.scss',
})
export class WorkoutDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workoutsService = inject(WorkoutsService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);

  private readonly workout = signal<Workout | null>(null);
  private readonly workoutId = signal<string>('');

  /** Id of the set whose inline edit form is open; null when none. */
  readonly editingSetId = signal<string | null>(null);
  /** Id of the set awaiting delete confirmation; null when none. */
  readonly confirmingSetId = signal<string | null>(null);
  /** Whether the "delete whole session" confirmation is showing. */
  readonly confirmingWorkoutDelete = signal(false);

  readonly draft = signal<SetDraft>({ weightKg: '', reps: '', rpe: '', notes: '' });

  readonly name = computed(() => this.workout()?.name ?? 'Entrenamiento');
  readonly dateLabel = computed(() => this.formatDate(this.workout()?.started_at));
  readonly durationLabel = computed(() => this.formatDuration(this.workout()?.duration_seconds));
  readonly volumeLabel = computed(() => this.formatVolume(this.workout()?.workout_sets ?? []));
  readonly totalSets = computed(() => this.workout()?.workout_sets?.length ?? 0);
  readonly notes = computed(() => this.workout()?.notes ?? null);

  readonly exerciseGroups = computed<ExerciseGroup[]>(() =>
    this.groupByExercise(this.workout()?.workout_sets ?? []),
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.workoutId.set(id);
    this.loadWorkout(id);
  }

  private loadWorkout(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.workoutsService.getById(id).subscribe({
      next: (workout) => {
        this.workout.set(workout);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudo cargar el entrenamiento.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  // ── Inline edit ────────────────────────────────────────────────────────────

  startEdit(set: WorkoutSet): void {
    this.confirmingSetId.set(null);
    this.editingSetId.set(set.id);
    this.draft.set({
      weightKg: set.weight_kg != null ? String(set.weight_kg) : '',
      reps: set.reps != null ? String(set.reps) : '',
      rpe: set.rpe != null ? String(set.rpe) : '',
      notes: set.notes ?? '',
    });
  }

  cancelEdit(): void {
    this.editingSetId.set(null);
  }

  patchDraft(field: keyof SetDraft, value: string): void {
    this.draft.update((d) => ({ ...d, [field]: value }));
  }

  saveEdit(set: WorkoutSet): void {
    const draft = this.draft();
    const payload = {
      exerciseId: set.exercise_id,
      weightKg: this.parseNumber(draft.weightKg),
      reps: this.parseNumber(draft.reps),
      rpe: this.parseNumber(draft.rpe),
      notes: draft.notes.trim(),
    };

    this.saving.set(true);
    this.workoutsService.updateSet(this.workoutId(), set.id, payload).subscribe({
      next: (updated) => {
        this.replaceSet(updated);
        this.editingSetId.set(null);
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set('No se pudo guardar la serie.');
        this.saving.set(false);
        console.error(err);
      },
    });
  }

  // ── Delete set ─────────────────────────────────────────────────────────────

  askDeleteSet(set: WorkoutSet): void {
    this.editingSetId.set(null);
    this.confirmingSetId.set(set.id);
  }

  cancelDeleteSet(): void {
    this.confirmingSetId.set(null);
  }

  confirmDeleteSet(set: WorkoutSet): void {
    this.saving.set(true);
    this.workoutsService.removeSet(this.workoutId(), set.id).subscribe({
      next: () => {
        this.removeSetFromState(set.id);
        this.confirmingSetId.set(null);
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set('No se pudo borrar la serie.');
        this.saving.set(false);
        console.error(err);
      },
    });
  }

  // ── Delete workout ─────────────────────────────────────────────────────────

  askDeleteWorkout(): void {
    this.confirmingWorkoutDelete.set(true);
  }

  cancelDeleteWorkout(): void {
    this.confirmingWorkoutDelete.set(false);
  }

  confirmDeleteWorkout(): void {
    this.saving.set(true);
    this.workoutsService.remove(this.workoutId()).subscribe({
      next: () => {
        this.router.navigate(['/history']);
      },
      error: (err) => {
        this.error.set('No se pudo borrar el entrenamiento.');
        this.saving.set(false);
        this.confirmingWorkoutDelete.set(false);
        console.error(err);
      },
    });
  }

  // ── Display helpers ──────────────────────────────────────────────────────────

  setLift(set: WorkoutSet): string {
    const weight = set.weight_kg != null ? `${set.weight_kg} kg` : null;
    const reps = set.reps != null ? `${set.reps}` : null;
    if (weight && reps) return `${weight} × ${reps}`;
    return weight ?? (reps != null ? `${reps} reps` : '—');
  }

  // ── Immutable state updates ──────────────────────────────────────────────────

  private replaceSet(updated: WorkoutSet): void {
    this.workout.update((w) => {
      if (!w?.workout_sets) return w;
      return {
        ...w,
        workout_sets: w.workout_sets.map((s) =>
          s.id === updated.id ? { ...s, ...updated } : s,
        ),
      };
    });
  }

  private removeSetFromState(setId: string): void {
    this.workout.update((w) => {
      if (!w?.workout_sets) return w;
      return { ...w, workout_sets: w.workout_sets.filter((s) => s.id !== setId) };
    });
  }

  // ── Pure formatting / parsing ────────────────────────────────────────────────

  private groupByExercise(sets: WorkoutSet[]): ExerciseGroup[] {
    const byExercise = new Map<string, ExerciseGroup>();
    for (const set of sets) {
      const group = byExercise.get(set.exercise_id) ?? {
        exerciseId: set.exercise_id,
        name: set.exercise?.name ?? 'Ejercicio',
        muscleGroup: set.exercise?.muscle_group ?? null,
        sets: [],
      };
      group.sets.push(set);
      byExercise.set(set.exercise_id, group);
    }
    for (const group of byExercise.values()) {
      group.sets.sort((a, b) => a.set_number - b.set_number);
    }
    return [...byExercise.values()];
  }

  private parseNumber(value: string): number | undefined {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private formatDate(iso: string | null | undefined): string {
    if (!iso) return '';
    const label = new Date(iso).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  private formatDuration(seconds: number | null | undefined): string {
    if (!seconds) return '—';
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
  }

  private formatVolume(sets: WorkoutSet[]): string {
    const total = sets.reduce(
      (sum, s) => sum + (s.weight_kg ?? 0) * (s.reps ?? 0),
      0,
    );
    return total > 0 ? `${Math.round(total)} kg` : '—';
  }
}
