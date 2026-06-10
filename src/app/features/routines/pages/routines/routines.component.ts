import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DsBadgeComponent } from '../../../../shared/components/ds-badge/ds-badge.component';
import { DsButtonComponent } from '../../../../shared/components/ds-button/ds-button.component';
import { DsCardComponent } from '../../../../shared/components/ds-card/ds-card.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { RoutinesService } from '../../../../core/api/routines.service';
import { WorkoutsService } from '../../../../core/api/workouts.service';
import { Routine } from '../../../../core/api/models';

@Component({
  selector: 'app-routines',
  standalone: true,
  imports: [CommonModule, DsBadgeComponent, DsButtonComponent, DsCardComponent, DsIconComponent],
  templateUrl: './routines.component.html',
  styleUrl: './routines.component.scss',
})
export class RoutinesComponent implements OnInit {
  private routinesService = inject(RoutinesService);
  private workoutsService = inject(WorkoutsService);
  private router = inject(Router);

  filters = ['Todas', 'PPL', 'Full Body', 'Arnold', 'Accesorios'];
  activeFilter = 0;

  routines = signal<Routine[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  startingId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadRoutines();
  }

  private loadRoutines(): void {
    this.loading.set(true);
    this.routinesService.getAll().subscribe({
      next: (data) => {
        this.routines.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudieron cargar las rutinas');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  /** FAB → open the builder in create mode. */
  createRoutine(): void {
    this.router.navigate(['/routines/builder']);
  }

  /** Tapping a card → open the builder in edit mode. */
  editRoutine(routine: Routine): void {
    this.router.navigate(['/routines/builder'], {
      queryParams: { id: routine.id },
    });
  }

  /** ▶ button → start a workout session from this routine. */
  startWorkout(routine: Routine, event: Event): void {
    event.stopPropagation();
    if (this.startingId()) return;
    this.startingId.set(routine.id);
    this.workoutsService
      .create({ name: routine.name, routineId: routine.id })
      .subscribe({
        next: (workout) => {
          this.startingId.set(null);
          this.router.navigate(['/workout/active'], {
            queryParams: { id: workout.id },
          });
        },
        error: (err) => {
          this.startingId.set(null);
          this.error.set('No se pudo iniciar el entrenamiento');
          console.error(err);
        },
      });
  }

  deleteRoutine(routine: Routine, event: Event): void {
    event.stopPropagation();
    const ok = confirm(`¿Eliminar la rutina "${routine.name}"?`);
    if (!ok) return;
    this.routinesService.remove(routine.id).subscribe({
      next: () => {
        this.routines.update((list) => list.filter((r) => r.id !== routine.id));
      },
      error: (err) => {
        this.error.set('No se pudo eliminar la rutina');
        console.error(err);
      },
    });
  }

  exerciseCount(routine: Routine): number {
    return routine.routine_exercises?.length ?? 0;
  }

  toneForIndex(i: number): string {
    const tones = ['mint', 'violet', 'amber', 'coral', 'mint'];
    return tones[i % tones.length];
  }

  toneColor(tone: string): string {
    return (
      ({
        mint: 'var(--dme-mint)',
        violet: 'var(--dme-violet)',
        amber: 'var(--dme-amber)',
        coral: 'var(--dme-coral)',
      } as Record<string, string>)[tone] ?? 'var(--dme-mint)'
    );
  }

  toneBg(tone: string): string {
    return (
      ({
        mint: 'var(--dme-mint-soft)',
        violet: 'rgba(155,140,255,0.14)',
        amber: 'rgba(255,183,77,0.14)',
        coral: 'rgba(255,107,91,0.14)',
      } as Record<string, string>)[tone] ?? 'var(--dme-mint-soft)'
    );
  }
}
