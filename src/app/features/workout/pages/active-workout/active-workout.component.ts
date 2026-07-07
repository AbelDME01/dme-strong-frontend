import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DsButtonComponent } from '../../../../shared/components/ds-button/ds-button.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { DsSkeletonComponent } from '../../../../shared/components/ds-skeleton/ds-skeleton.component';
import { WorkoutsService } from '../../../../core/api/workouts.service';
import { RoutinesService } from '../../../../core/api/routines.service';
import { Workout, WorkoutSet } from '../../../../core/api/models';

/** A single exercise within the active session, with its target. */
interface SessionExercise {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  targetSets: number | null;
  targetReps: number | null;
}

@Component({
  selector: 'app-active-workout',
  standalone: true,
  imports: [CommonModule, FormsModule, DsButtonComponent, DsIconComponent, DsSkeletonComponent],
  templateUrl: './active-workout.component.html',
  styleUrl: './active-workout.component.scss',
})
export class ActiveWorkoutComponent implements OnInit, OnDestroy {
  private workoutsService = inject(WorkoutsService);
  private routinesService = inject(RoutinesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  workoutId = signal<string | null>(null);
  workout = signal<Workout | null>(null);
  exercises = signal<SessionExercise[]>([]);
  sets = signal<WorkoutSet[]>([]);
  currentIndex = signal(0);

  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);
  finishing = signal(false);
  cancelling = signal(false);

  // Inputs for the next set being logged.
  weight = signal<number | null>(null);
  reps = signal<number | null>(null);
  rpe = signal<number | null>(null);

  elapsed = signal('00:00');
  private timer?: ReturnType<typeof setInterval>;

  currentExercise = computed<SessionExercise | null>(
    () => this.exercises()[this.currentIndex()] ?? null,
  );

  currentSets = computed(() => {
    const ex = this.currentExercise();
    if (!ex) return [];
    return this.sets()
      .filter((s) => s.exercise_id === ex.exerciseId)
      .sort((a, b) => a.set_number - b.set_number);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (!id) {
      this.error.set('Entrenamiento no encontrado');
      this.loading.set(false);
      return;
    }
    this.workoutId.set(id);
    this.loadWorkout(id);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private loadWorkout(id: string): void {
    this.workoutsService.getById(id).subscribe({
      next: (workout) => {
        this.workout.set(workout);
        this.sets.set(workout.workout_sets ?? []);
        this.startTimer(workout.started_at);
        if (workout.routine_id) {
          this.loadRoutineExercises(workout.routine_id);
        } else {
          this.exercises.set(this.exercisesFromSets(workout.workout_sets ?? []));
          this.loading.set(false);
        }
      },
      error: (err) => {
        this.error.set('No se pudo cargar el entrenamiento');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  private loadRoutineExercises(routineId: string): void {
    this.routinesService.getById(routineId).subscribe({
      next: (routine) => {
        const list = (routine.routine_exercises ?? [])
          .slice()
          .sort((a, b) => a.order_index - b.order_index)
          .map<SessionExercise>((re) => ({
            exerciseId: re.exercise_id,
            name: re.exercise?.name ?? 'Ejercicio',
            muscleGroup: re.exercise?.muscle_group ?? '',
            targetSets: re.target_sets,
            targetReps: re.target_reps,
          }));
        this.exercises.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        // Routine missing/deleted — fall back to whatever sets exist.
        this.exercises.set(this.exercisesFromSets(this.sets()));
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  /** Build a minimal exercise list from logged sets (free / orphan workouts). */
  private exercisesFromSets(sets: WorkoutSet[]): SessionExercise[] {
    const seen = new Map<string, SessionExercise>();
    for (const s of sets) {
      if (!seen.has(s.exercise_id)) {
        seen.set(s.exercise_id, {
          exerciseId: s.exercise_id,
          name: s.exercise?.name ?? 'Ejercicio',
          muscleGroup: s.exercise?.muscle_group ?? '',
          targetSets: null,
          targetReps: null,
        });
      }
    }
    return [...seen.values()];
  }

  private startTimer(startedAt: string): void {
    const start = new Date(startedAt).getTime();
    const tick = () => {
      const secs = Math.max(0, Math.floor((Date.now() - start) / 1000));
      const m = Math.floor(secs / 60)
        .toString()
        .padStart(2, '0');
      const s = (secs % 60).toString().padStart(2, '0');
      this.elapsed.set(`${m}:${s}`);
    };
    tick();
    this.timer = setInterval(tick, 1000);
  }

  prevExercise(): void {
    if (this.currentIndex() > 0) this.currentIndex.update((i) => i - 1);
  }

  nextExercise(): void {
    if (this.currentIndex() < this.exercises().length - 1) {
      this.currentIndex.update((i) => i + 1);
    }
  }

  completeSet(): void {
    const ex = this.currentExercise();
    const id = this.workoutId();
    if (!ex || !id || this.saving()) return;
    if (this.reps() == null && this.weight() == null) return;

    this.saving.set(true);
    const setNumber = this.currentSets().length + 1;
    this.workoutsService
      .addSet(id, {
        exerciseId: ex.exerciseId,
        setNumber,
        ...(this.reps() != null ? { reps: this.reps()! } : {}),
        ...(this.weight() != null ? { weightKg: this.weight()! } : {}),
        ...(this.rpe() != null ? { rpe: this.rpe()! } : {}),
      })
      .subscribe({
        next: (created) => {
          this.sets.update((list) => [...list, created]);
          this.reps.set(null);
          this.rpe.set(null);
          this.saving.set(false);
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set('No se pudo guardar la serie');
          console.error(err);
        },
      });
  }

  removeSet(set: WorkoutSet): void {
    const id = this.workoutId();
    if (!id) return;
    this.workoutsService.removeSet(id, set.id).subscribe({
      next: () => this.sets.update((list) => list.filter((s) => s.id !== set.id)),
      error: (err) => console.error(err),
    });
  }

  finishWorkout(): void {
    const id = this.workoutId();
    const workout = this.workout();
    if (!id || this.finishing()) return;
    this.finishing.set(true);
    const finishedAt = new Date();
    const durationSeconds = workout
      ? Math.max(0, Math.round((finishedAt.getTime() - new Date(workout.started_at).getTime()) / 1000))
      : undefined;
    this.workoutsService
      .update(id, { finishedAt: finishedAt.toISOString(), durationSeconds })
      .subscribe({
        next: () => {
          this.finishing.set(false);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.finishing.set(false);
          this.error.set('No se pudo finalizar el entrenamiento');
          console.error(err);
        },
      });
  }

  cancelWorkout(): void {
    const id = this.workoutId();
    if (!id || this.cancelling()) return;
    const confirmed = confirm('¿Cancelar el entrenamiento? No se guardará ningún progreso.');
    if (!confirmed) return;
    this.cancelling.set(true);
    this.workoutsService.remove(id).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.router.navigate(['/routines']);
      },
      error: (err) => {
        this.cancelling.set(false);
        this.error.set('No se pudo cancelar el entrenamiento');
        console.error(err);
      },
    });
  }

  rpeColor(rpe: number | null): string {
    if (!rpe) return 'var(--dme-text-mute)';
    if (rpe >= 9) return 'var(--dme-coral)';
    if (rpe >= 8) return 'var(--dme-amber)';
    return 'var(--dme-mint)';
  }
}
