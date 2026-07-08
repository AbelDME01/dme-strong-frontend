import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DsIconComponent } from '../ds-icon/ds-icon.component';
import { ExercisesService } from '../../../core/api/exercises.service';
import { Exercise } from '../../../core/api/models';

const MUSCLE_GROUP_OPTIONS = [
  { value: 'chest', label: 'Pecho' },
  { value: 'back', label: 'Espalda' },
  { value: 'legs', label: 'Piernas' },
  { value: 'shoulders', label: 'Hombros' },
  { value: 'arms', label: 'Brazos' },
  { value: 'core', label: 'Core' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'other', label: 'Otro' },
] as const;

/**
 * Bottom-sheet picker to add an exercise from the catalog or quickly create a
 * custom one. Shared between the routine builder and the active workout: the
 * host owns the catalog data and decides what to do with the chosen exercise.
 */
@Component({
  selector: 'app-exercise-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, DsIconComponent],
  templateUrl: './exercise-picker.component.html',
  styleUrl: './exercise-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExercisePickerComponent {
  private exercisesService = inject(ExercisesService);

  /** Full exercise catalog to search within. */
  catalog = input.required<Exercise[]>();
  /** Ids already added by the host, hidden from the results. */
  excludeIds = input<readonly string[]>([]);

  /** Emits the chosen exercise, whether picked from the catalog or created. */
  selected = output<Exercise>();
  /** Emits when the picker should be dismissed. */
  closed = output<void>();

  readonly muscleGroupOptions = MUSCLE_GROUP_OPTIONS;

  query = signal('');
  customFormOpen = signal(false);
  customName = signal('');
  customMuscleGroup = signal<string>('other');
  creatingCustom = signal(false);
  customError = signal<string | null>(null);

  filteredCatalog = computed(() => {
    const q = this.query().trim().toLowerCase();
    const excluded = new Set(this.excludeIds());
    return this.catalog().filter(
      (ex) =>
        !excluded.has(ex.id) &&
        (q === '' ||
          ex.name.toLowerCase().includes(q) ||
          ex.muscle_group.toLowerCase().includes(q)),
    );
  });

  select(exercise: Exercise): void {
    this.selected.emit(exercise);
  }

  openCustomForm(): void {
    this.customName.set(this.query().trim());
    this.customMuscleGroup.set('other');
    this.customError.set(null);
    this.customFormOpen.set(true);
  }

  closeCustomForm(): void {
    this.customFormOpen.set(false);
    this.customError.set(null);
  }

  createCustomExercise(): void {
    const name = this.customName().trim();
    if (!name || this.creatingCustom()) return;
    this.creatingCustom.set(true);
    this.customError.set(null);
    this.exercisesService
      .create({ name, muscleGroup: this.customMuscleGroup(), isPublic: false })
      .subscribe({
        next: (created) => {
          this.creatingCustom.set(false);
          this.customFormOpen.set(false);
          this.select(created);
        },
        error: () => {
          this.customError.set('No se pudo crear el ejercicio');
          this.creatingCustom.set(false);
        },
      });
  }
}
