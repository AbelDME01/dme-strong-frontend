import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { DsButtonComponent } from '../../../../shared/components/ds-button/ds-button.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { DsSkeletonComponent } from '../../../../shared/components/ds-skeleton/ds-skeleton.component';
import { ExercisePickerComponent } from '../../../../shared/components/exercise-picker/exercise-picker.component';
import {
  RoutineExerciseInput,
  RoutinePayload,
  RoutinesService,
} from '../../../../core/api/routines.service';
import { ExercisesService } from '../../../../core/api/exercises.service';
import { Exercise } from '../../../../core/api/models';

/** A draft exercise row being edited inside the builder. */
interface ExerciseDraft {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  targetSets: number;
  targetReps: number;
  targetWeight: number | null;
  restSeconds: number | null;
}

@Component({
  selector: 'app-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DsButtonComponent,
    DsIconComponent,
    DsSkeletonComponent,
    ExercisePickerComponent,
  ],
  templateUrl: './builder.component.html',
  styleUrl: './builder.component.scss',
})
export class BuilderComponent implements OnInit {
  private routinesService = inject(RoutinesService);
  private exercisesService = inject(ExercisesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  routineId = signal<string | null>(null);
  name = signal('');
  description = signal('');
  exercises = signal<ExerciseDraft[]>([]);

  catalog = signal<Exercise[]>([]);
  pickerOpen = signal(false);

  saving = signal(false);
  error = signal<string | null>(null);

  isEdit = computed(() => this.routineId() !== null);
  canSave = computed(() => this.name().trim().length > 0 && !this.saving());

  chosenExerciseIds = computed(() => this.exercises().map((e) => e.exerciseId));

  loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');

    if (id) {
      this.routineId.set(id);
      this.loading.set(true);
      forkJoin({
        catalog: this.exercisesService.getAll(),
        routine: this.routinesService.getById(id),
      }).subscribe({
        next: ({ catalog, routine }) => {
          this.catalog.set(catalog);
          this.loading.set(false);
          this.name.set(routine.name);
          this.description.set(routine.description ?? '');
          const catalogMap = new Map(catalog.map((e) => [e.id, e]));
          const drafts = (routine.routine_exercises ?? [])
            .slice()
            .sort((a, b) => a.order_index - b.order_index)
            .map<ExerciseDraft>((re) => {
              const ex = re.exercise ?? catalogMap.get(re.exercise_id);
              return {
                exerciseId: re.exercise_id,
                name: ex?.name ?? re.exercise_id,
                muscleGroup: ex?.muscle_group ?? '',
                targetSets: re.target_sets ?? 3,
                targetReps: re.target_reps ?? 10,
                targetWeight: re.target_weight,
                restSeconds: re.rest_seconds,
              };
            });
          this.exercises.set(drafts);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set('No se pudo cargar la rutina');
          console.error(err);
        },
      });
    } else {
      this.exercisesService.getAll().subscribe({
        next: (data) => this.catalog.set(data),
        error: (err) => console.error('No se pudo cargar el catálogo', err),
      });
    }
  }

  addExercise(ex: Exercise): void {
    this.catalog.update((list) =>
      list.some((c) => c.id === ex.id) ? list : [...list, ex],
    );
    this.exercises.update((list) => [
      ...list,
      {
        exerciseId: ex.id,
        name: ex.name,
        muscleGroup: ex.muscle_group,
        targetSets: 3,
        targetReps: 10,
        targetWeight: null,
        restSeconds: 90,
      },
    ]);
    this.pickerOpen.set(false);
  }

  removeExercise(index: number): void {
    this.exercises.update((list) => list.filter((_, i) => i !== index));
  }

  moveUp(index: number): void {
    if (index === 0) return;
    this.swap(index, index - 1);
  }

  moveDown(index: number): void {
    if (index === this.exercises().length - 1) return;
    this.swap(index, index + 1);
  }

  private swap(a: number, b: number): void {
    this.exercises.update((list) => {
      const copy = [...list];
      [copy[a], copy[b]] = [copy[b], copy[a]];
      return copy;
    });
  }

  setSets(index: number, value: number): void {
    this.patch(index, { targetSets: Math.max(0, value || 0) });
  }

  setReps(index: number, value: number): void {
    this.patch(index, { targetReps: Math.max(0, value || 0) });
  }

  private patch(index: number, change: Partial<ExerciseDraft>): void {
    this.exercises.update((list) =>
      list.map((e, i) => (i === index ? { ...e, ...change } : e)),
    );
  }

  private buildPayload(): RoutinePayload {
    const exercises: RoutineExerciseInput[] = this.exercises().map((e, i) => ({
      exerciseId: e.exerciseId,
      orderIndex: i,
      targetSets: e.targetSets,
      targetReps: e.targetReps,
      ...(e.targetWeight != null ? { targetWeight: e.targetWeight } : {}),
      ...(e.restSeconds != null ? { restSeconds: e.restSeconds } : {}),
    }));
    const description = this.description().trim();
    return {
      name: this.name().trim(),
      ...(description ? { description } : {}),
      exercises,
    };
  }

  save(): void {
    if (!this.canSave()) return;
    this.saving.set(true);
    this.error.set(null);
    const payload = this.buildPayload();
    const id = this.routineId();
    const request$ = id
      ? this.routinesService.update(id, payload)
      : this.routinesService.create(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/routines']);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set('No se pudo guardar la rutina');
        console.error(err);
      },
    });
  }
}
