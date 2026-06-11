import { Component, computed, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { Subject } from 'rxjs';
import { DsButtonComponent } from '../../shared/components/ds-button/ds-button.component';
import { DsIconComponent } from '../../shared/components/ds-icon/ds-icon.component';
import { ExercisesService } from '../../core/api/exercises.service';
import { RoutinesService } from '../../core/api/routines.service';
import { WorkoutsService } from '../../core/api/workouts.service';
import { Exercise, Routine } from '../../core/api/models';

interface SearchResult {
  type: 'exercise' | 'routine';
  id: string;
  name: string;
  sub: string;
}

interface Notification {
  icon: string;
  title: string;
  time: string;
}

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, DsButtonComponent, DsIconComponent],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss',
})
export class TopBarComponent {
  private router = inject(Router);
  private exercisesService = inject(ExercisesService);
  private routinesService = inject(RoutinesService);
  private workoutsService = inject(WorkoutsService);

  query = signal('');
  results = signal<SearchResult[]>([]);
  showDropdown = signal(false);
  searching = signal(false);
  startingWorkout = signal(false);
  notificationsOpen = signal(false);
  hasUnread = signal(true);

  notifications: Notification[] = [
    { icon: 'trophy', title: 'Nuevo récord en Press Banca', time: 'hace 2 h' },
    { icon: 'dumbbell', title: 'Entreno de Pecho completado', time: 'hace 1 d' },
    { icon: 'star', title: '¡7 días seguidos entrenando!', time: 'hace 3 d' },
  ];

  private search$ = new Subject<string>();
  private routineCache: Routine[] = [];

  constructor() {
    this.routinesService.getAll().subscribe({
      next: (r) => (this.routineCache = r),
      error: () => {},
    });

    this.search$.pipe(
      debounceTime(280),
      distinctUntilChanged(),
      switchMap((q) => {
        const trimmed = q.trim();
        if (!trimmed) return of(null);
        this.searching.set(true);
        return this.exercisesService.getAll({ search: trimmed });
      }),
    ).subscribe({
      next: (exercises) => {
        if (!exercises) {
          this.results.set([]);
          this.searching.set(false);
          return;
        }
        const q = this.query().toLowerCase();
        const exRows: SearchResult[] = exercises.slice(0, 5).map((e: Exercise) => ({
          type: 'exercise',
          id: e.id,
          name: e.name,
          sub: e.muscle_group ?? 'Ejercicio',
        }));
        const routineRows: SearchResult[] = this.routineCache
          .filter((r) => r.name.toLowerCase().includes(q))
          .slice(0, 3)
          .map((r) => ({
            type: 'routine',
            id: r.id,
            name: r.name,
            sub: `${r.routine_exercises?.length ?? 0} ejercicios`,
          }));
        this.results.set([...routineRows, ...exRows]);
        this.searching.set(false);
      },
      error: () => this.searching.set(false),
    });
  }

  onQueryChange(q: string): void {
    this.query.set(q);
    this.showDropdown.set(q.trim().length > 0);
    this.search$.next(q);
  }

  selectResult(r: SearchResult): void {
    this.showDropdown.set(false);
    this.query.set('');
    if (r.type === 'exercise') {
      this.router.navigate(['/history/exercise', r.id]);
    } else {
      this.router.navigate(['/routines/builder'], { queryParams: { id: r.id } });
    }
  }

  closeDropdown(): void {
    this.showDropdown.set(false);
  }

  toggleNotifications(): void {
    const opening = !this.notificationsOpen();
    this.notificationsOpen.set(opening);
    if (opening) this.hasUnread.set(false);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showDropdown.set(false);
    this.notificationsOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.showDropdown.set(false);
    this.notificationsOpen.set(false);
    this.query.set('');
  }

  startWorkout(): void {
    if (this.startingWorkout()) return;
    this.startingWorkout.set(true);
    this.workoutsService.create({ name: 'Entreno libre' }).subscribe({
      next: (workout) => {
        this.startingWorkout.set(false);
        this.router.navigate(['/workout/active'], { queryParams: { id: workout.id } });
      },
      error: (err) => {
        this.startingWorkout.set(false);
        console.error('Error al iniciar entreno libre:', err);
      },
    });
  }
}
